"use client";

import { useEffect, useMemo, useState } from "react";
import { ForecastChart } from "@/components/ForecastChart";
import { KpiGrid } from "@/components/dashboard/KpiGrid";

type ForecastRawPoint = {
  ds: string;
  y?: number | null;
  yhat?: number | null;
  yhat_lower?: number | null;
  yhat_upper?: number | null;
  type?: "historical" | "forecast";
  actual?: number | null;
};

type ForecastPoint = {
  ds: string;
  date: Date;
  label: string;
  isForecast: boolean;
  actual: number | null;
  forecast: number | null;
  yhatLower: number | null;
  yhatUpper: number | null;
  uncertaintyBase: number | null;
  uncertaintyBand: number | null;
};

const monthFormatter = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function getConfidenceLabel(avgBandRatio: number | null) {
  if (avgBandRatio === null) return "Unknown";
  if (avgBandRatio <= 0.18) return "High";
  if (avgBandRatio <= 0.35) return "Medium";
  return "Low";
}

function mapForecastData(rows: ForecastRawPoint[]): ForecastPoint[] {
  return rows
    .map((row) => {
      const date = new Date(`${row.ds}T00:00:00`);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      const isForecast = row.type === "forecast";
      const actual =
        typeof row.actual === "number" && Number.isFinite(row.actual)
          ? row.actual
          : typeof row.y === "number" && Number.isFinite(row.y)
            ? row.y
            : !isForecast && Number.isFinite(row.yhat)
              ? row.yhat
              : null;
      const forecast =
        typeof row.yhat === "number" && Number.isFinite(row.yhat) && isForecast
          ? row.yhat
          : null;
      const lower =
        typeof row.yhat_lower === "number" && Number.isFinite(row.yhat_lower)
          ? row.yhat_lower
          : null;
      const upper =
        typeof row.yhat_upper === "number" && Number.isFinite(row.yhat_upper)
          ? row.yhat_upper
          : null;

      return {
        ds: row.ds,
        date,
        label: monthFormatter.format(date),
        isForecast,
        actual,
        forecast,
        yhatLower: isForecast ? lower : null,
        yhatUpper: isForecast ? upper : null,
        uncertaintyBase: isForecast ? lower : null,
        uncertaintyBand:
          isForecast && lower !== null && upper !== null ? upper - lower : null,
      };
    })
    .filter((row): row is ForecastPoint => row !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export default function ForecastPage() {
  const [rows, setRows] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/data/forecast.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`No se pudo cargar el forecast (${res.status})`);
        }

        return res.json();
      })
      .then((data: ForecastRawPoint[]) => {
        if (!active) return;
        setRows(mapForecastData(data));
        setLoading(false);
      })
      .catch((fetchError: Error) => {
        if (!active) return;
        setError(fetchError.message);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const historicalRows = useMemo(
    () => rows.filter((row) => !row.isForecast && row.actual !== null),
    [rows]
  );
  const forecastRows = useMemo(
    () => rows.filter((row) => row.isForecast && row.forecast !== null),
    [rows]
  );

  const nextPrediction = forecastRows[0] ?? null;
  const nextPredictionValue = nextPrediction?.forecast ?? null;
  const lastHistoricalValue =
    historicalRows[historicalRows.length - 1]?.actual ?? null;
  const averageBandRatio = useMemo(() => {
    if (!forecastRows.length) return null;

    const ratios = forecastRows
      .map((row) => {
        if (
          row.forecast === null ||
          row.forecast <= 0 ||
          row.yhatLower === null ||
          row.yhatUpper === null
        ) {
          return null;
        }

        return (row.yhatUpper - row.yhatLower) / row.forecast;
      })
      .filter((ratio): ratio is number => ratio !== null);

    if (!ratios.length) return null;
    return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
  }, [forecastRows]);

  const confidenceLabel = getConfidenceLabel(averageBandRatio);
  const growth =
    nextPredictionValue !== null &&
    lastHistoricalValue !== null &&
    lastHistoricalValue !== 0
      ? ((nextPredictionValue - lastHistoricalValue) / lastHistoricalValue) * 100
      : null;
  const splitLabel = nextPrediction?.label;

  const kpis = [
    {
      label: "Next prediction",
      value:
        nextPredictionValue !== null
          ? currencyFormatter.format(nextPredictionValue)
          : "N/D",
      color: "text-amber-300",
      icon: "🔮",
    },
    {
      label: "Growth",
      value: growth !== null ? `${growth.toFixed(1)}%` : "N/D",
      color:
        growth !== null && growth >= 0 ? "text-emerald-300" : "text-rose-300",
      icon: growth !== null && growth >= 0 ? "📈" : "📉",
    },
    {
      label: "Periods",
      value: forecastRows.length.toLocaleString("es-ES"),
      color: "text-cyan-300",
      icon: "🗓️",
    },
    {
      label: "Confidence",
      value: confidenceLabel,
      color:
        confidenceLabel === "High"
          ? "text-emerald-300"
          : confidenceLabel === "Medium"
            ? "text-amber-300"
            : "text-rose-300",
      icon: "🎯",
    },
  ];

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <p className="text-slate-400">Loading forecast</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <p className="text-red-400">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[2rem] bg-slate-900/75 p-8 shadow-2xl shadow-black/10 ring-1 ring-white/8">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">
                Forecast
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                Sales forecast
              </h1>
            </div>

            <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(34,211,238,0.08))] p-6 ring-1 ring-amber-300/15">
              <p className="text-sm text-amber-100/80">Next prediction</p>
              <p className="mt-3 text-sm text-slate-300">
                {nextPrediction?.label ?? "Next month"}
              </p>
              <p className="mt-2 text-5xl font-semibold tracking-tight text-white">
                {nextPredictionValue !== null
                  ? currencyFormatter.format(nextPredictionValue)
                  : "N/D"}
              </p>
            </div>
          </div>
        </section>

        <KpiGrid items={kpis} />

        <ForecastChart data={rows} splitLabel={splitLabel} />

        <section className="rounded-3xl bg-slate-900/65 p-6 shadow-xl shadow-black/10 ring-1 ring-white/8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-amber-300/70">
                Forecast
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">Next prediction</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">{nextPrediction?.label ?? "N/D"}</p>
              <p className="mt-2 text-4xl font-semibold text-amber-300">
                {nextPredictionValue !== null
                  ? currencyFormatter.format(nextPredictionValue)
                  : "N/D"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
