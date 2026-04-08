from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
import pandas as pd

try:
    from prophet import Prophet
except ImportError as exc:  # pragma: no cover
    raise SystemExit(
        "Prophet is not installed. Run `pip install prophet pandas numpy` first."
    ) from exc


@dataclass
class ModelMetrics:
    mae: float
    rmse: float
    growth_pct_next_period: float | None
    avg_band_ratio: float | None
    confidence: str
    changepoint_prior_scale: float
    seasonality_prior_scale: float
    seasonality_mode: str
    log_transform: bool


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a stable monthly sales forecast for the Next.js dashboard."
    )
    parser.add_argument(
        "--input-csv",
        default="public/data/sales_data_sample.csv",
        help="Path to the raw sales CSV.",
    )
    parser.add_argument(
        "--output-json",
        default="public/data/forecast.json",
        help="Path to the exported forecast JSON.",
    )
    parser.add_argument(
        "--output-metadata",
        default="public/data/forecast_metadata.json",
        help="Path to the exported forecast metadata JSON.",
    )
    parser.add_argument(
        "--periods",
        type=int,
        default=6,
        help="Number of future monthly periods to forecast.",
    )
    parser.add_argument(
        "--log-transform",
        action="store_true",
        help="Apply log1p transform before training and expm1 after prediction.",
    )
    return parser.parse_args()


def load_and_clean_sales(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df["ORDERDATE"] = pd.to_datetime(df["ORDERDATE"], errors="coerce")
    df["SALES"] = pd.to_numeric(df["SALES"], errors="coerce")

    df = df.dropna(subset=["ORDERDATE", "SALES"]).copy()
    df = df[df["SALES"] > 0].copy()

    upper_bound = df["SALES"].quantile(0.95)
    df = df[df["SALES"] <= upper_bound].copy()

    monthly = (
        df.groupby(df["ORDERDATE"].dt.to_period("M"))["SALES"]
        .sum()
        .reset_index()
        .rename(columns={"ORDERDATE": "month", "SALES": "y"})
    )
    monthly["ds"] = monthly["month"].dt.to_timestamp()
    monthly = monthly[["ds", "y"]].sort_values("ds").reset_index(drop=True)
    monthly = monthly.dropna(subset=["ds", "y"])
    return monthly


def split_train_test(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    test_size = max(3, int(np.ceil(len(df) * 0.2)))
    train_size = len(df) - test_size
    if train_size < 12:
        raise ValueError(
            "Not enough monthly history for a robust split. Need at least 15 monthly points."
        )
    return df.iloc[:train_size].copy(), df.iloc[train_size:].copy()


def build_prophet_model(
    changepoint_prior_scale: float,
    seasonality_prior_scale: float,
) -> Prophet:
    return Prophet(
        changepoint_prior_scale=changepoint_prior_scale,
        seasonality_prior_scale=seasonality_prior_scale,
        seasonality_mode="additive",
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        interval_width=0.8,
    )


def invert_transform(series: pd.Series, use_log: bool) -> pd.Series:
    if use_log:
        return np.expm1(series)
    return series


def prepare_training_frame(df: pd.DataFrame, use_log: bool) -> pd.DataFrame:
    frame = df.copy()
    if use_log:
        frame["y"] = np.log1p(frame["y"])
    return frame


def evaluate_candidate(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    cps: float,
    sps: float,
    use_log: bool,
) -> tuple[float, float]:
    model = build_prophet_model(cps, sps)
    model.fit(prepare_training_frame(train_df, use_log))

    future = pd.DataFrame({"ds": test_df["ds"]})
    forecast = model.predict(future)

    yhat = invert_transform(forecast["yhat"], use_log).clip(lower=0)
    actual = test_df["y"].reset_index(drop=True)

    mae = float(np.mean(np.abs(actual - yhat)))
    rmse = float(np.sqrt(np.mean((actual - yhat) ** 2)))
    return mae, rmse


def select_best_params(
    train_df: pd.DataFrame,
    test_df: pd.DataFrame,
    use_log: bool,
) -> tuple[float, float, float, float]:
    candidates = [
        (0.01, 0.1),
        (0.01, 0.5),
        (0.03, 0.5),
        (0.05, 0.5),
        (0.1, 1.0),
    ]

    scored: list[tuple[float, float, float, float]] = []
    for cps, sps in candidates:
        mae, rmse = evaluate_candidate(train_df, test_df, cps, sps, use_log)
        scored.append((rmse, mae, cps, sps))

    scored.sort(key=lambda item: item[0])
    best_rmse, best_mae, best_cps, best_sps = scored[0]
    return best_mae, best_rmse, best_cps, best_sps


def get_confidence(avg_band_ratio: float | None) -> str:
    if avg_band_ratio is None:
        return "Unknown"
    if avg_band_ratio <= 0.18:
        return "High"
    if avg_band_ratio <= 0.35:
        return "Medium"
    return "Low"


def build_export_frame(
    history_df: pd.DataFrame,
    forecast_df: pd.DataFrame,
) -> pd.DataFrame:
    last_historical_ds = history_df["ds"].max()
    full = forecast_df[["ds", "yhat", "yhat_lower", "yhat_upper"]].copy()
    full = full.merge(history_df.rename(columns={"y": "actual"}), on="ds", how="left")
    full = full.sort_values("ds").reset_index(drop=True)

    is_historical = full["ds"] <= last_historical_ds
    full["type"] = np.where(is_historical, "historical", "forecast")
    full["y"] = np.where(is_historical, full["actual"], np.nan)
    full.loc[is_historical, ["yhat", "yhat_lower", "yhat_upper"]] = np.nan
    full.loc[~is_historical, "actual"] = np.nan

    for col in ["y", "yhat", "yhat_lower", "yhat_upper", "actual"]:
        full[col] = full[col].round(2)

    full["ds"] = full["ds"].dt.strftime("%Y-%m-%d")
    return full


def main() -> None:
    args = parse_args()

    project_root = Path(__file__).resolve().parents[1]
    input_csv = (project_root / args.input_csv).resolve()
    output_json = (project_root / args.output_json).resolve()
    output_metadata = (project_root / args.output_metadata).resolve()

    monthly = load_and_clean_sales(input_csv)
    train_df, test_df = split_train_test(monthly)

    mae, rmse, best_cps, best_sps = select_best_params(
        train_df, test_df, args.log_transform
    )

    final_model = build_prophet_model(best_cps, best_sps)
    final_model.fit(prepare_training_frame(monthly, args.log_transform))

    future = final_model.make_future_dataframe(periods=args.periods, freq="MS")
    forecast = final_model.predict(future)

    for col in ["yhat", "yhat_lower", "yhat_upper"]:
        forecast[col] = invert_transform(forecast[col], args.log_transform).clip(lower=0)

    export_frame = build_export_frame(monthly, forecast)
    export_records = export_frame.to_dict(orient="records")

    forecast_only = export_frame[export_frame["type"] == "forecast"].copy()
    avg_band_ratio = None
    if not forecast_only.empty:
        ratios = (
            (forecast_only["yhat_upper"] - forecast_only["yhat_lower"]) / forecast_only["yhat"]
        ).replace([np.inf, -np.inf], np.nan).dropna()
        if not ratios.empty:
            avg_band_ratio = float(ratios.mean())

    next_growth = None
    if not forecast_only.empty:
        next_forecast = float(forecast_only.iloc[0]["yhat"])
        last_actual = float(monthly.iloc[-1]["y"])
        if last_actual > 0:
            next_growth = ((next_forecast - last_actual) / last_actual) * 100

    metrics = ModelMetrics(
        mae=round(mae, 2),
        rmse=round(rmse, 2),
        growth_pct_next_period=round(next_growth, 2) if next_growth is not None else None,
        avg_band_ratio=round(avg_band_ratio, 4) if avg_band_ratio is not None else None,
        confidence=get_confidence(avg_band_ratio),
        changepoint_prior_scale=best_cps,
        seasonality_prior_scale=best_sps,
        seasonality_mode="additive",
        log_transform=args.log_transform,
    )

    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_metadata.parent.mkdir(parents=True, exist_ok=True)

    output_json.write_text(json.dumps(export_records, indent=2), encoding="utf-8")
    output_metadata.write_text(json.dumps(asdict(metrics), indent=2), encoding="utf-8")

    print(f"Saved forecast JSON to: {output_json}")
    print(f"Saved metadata JSON to: {output_metadata}")
    print(
        f"MAE={metrics.mae:.2f} | RMSE={metrics.rmse:.2f} | "
        f"confidence={metrics.confidence} | "
        f"cps={metrics.changepoint_prior_scale} | sps={metrics.seasonality_prior_scale}"
    )


if __name__ == "__main__":
    main()
