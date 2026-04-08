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
  const lastHistorical = historicalRows[historicalRows.length - 1] ?? null;
  const lastHistoricalValue = lastHistorical?.actual ?? null;
  const nextPredictionValue = nextPrediction?.forecast ?? null;
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
      label: "Next month prediction",
      value: nextPredictionValue !== null
        ? currencyFormatter.format(nextPredictionValue)
        : "N/D",
      color: "text-amber-300",
    },
    {
      label: "Growth vs last actual",
      value: growth !== null ? `${growth.toFixed(1)}%` : "N/D",
      color: growth !== null && growth >= 0 ? "text-emerald-300" : "text-rose-300",
    },
    {
      label: "Forecast periods",
      value: forecastRows.length.toLocaleString("es-ES"),
      color: "text-cyan-300",
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
    },
  ];

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <p className="text-slate-400">Cargando modelo de forecast...</p>
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
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/10">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-300/80">
            Forecast
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Predictive Sales Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Vista predictiva basada en `forecast.json`, con datos ordenados por
            fecha, historico integrado, linea de prediccion y banda de
            incertidumbre.
          </p>
        </section>

        <KpiGrid items={kpis} />

        <ForecastChart data={rows} splitLabel={splitLabel} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/10">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/70">
              Historical anchor
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Ventas historicas
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              El ultimo dato real sirve como referencia antes del cambio hacia la
              proyeccion futura.
            </p>
            <div className="mt-6 rounded-2xl border border-cyan-400/15 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">{lastHistorical?.label ?? "N/D"}</p>
              <p className="mt-2 text-3xl font-semibold text-cyan-300">
                {lastHistoricalValue !== null
                  ? currencyFormatter.format(lastHistoricalValue)
                  : "N/D"}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/10">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300/70">
              Forward view
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Prediccion futura
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Primer punto proyectado con rango esperado segun el modelo.
            </p>
            <div className="mt-6 rounded-2xl border border-amber-400/15 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">{nextPrediction?.label ?? "N/D"}</p>
              <p className="mt-2 text-3xl font-semibold text-amber-300">
                {nextPredictionValue !== null
                  ? currencyFormatter.format(nextPredictionValue)
                  : "N/D"}
              </p>
              <p className="mt-3 text-sm text-slate-400">
                Range:{" "}
                {nextPrediction?.yhatLower !== null &&
                nextPrediction?.yhatUpper !== null
                  ? `${currencyFormatter.format(
                      nextPrediction.yhatLower
                    )} to ${currencyFormatter.format(nextPrediction.yhatUpper)}`
                  : "N/D"}
              </p>
            </div>
          </section>
        </div>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/10">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
              Model notes
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Forecast based on trend + seasonality decomposition
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              El dashboard espera una serie limpia y ordenada por fecha, donde
              el historico usa `y` y el forecast usa `yhat`, `yhat_lower` y
              `yhat_upper`. La visualizacion separa ambas fases con una linea
              vertical y usa la amplitud del intervalo como senal simple de
              confianza.
            </p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/10">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
              Confidence details
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Model stability
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Average prediction band:
              {" "}
              {averageBandRatio !== null
                ? `${(averageBandRatio * 100).toFixed(1)}%`
                : "N/D"}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Confidence indicator:
              {" "}
              <span className="font-semibold text-slate-200">{confidenceLabel}</span>
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Bandas mas angostas suelen indicar un forecast mas estable; si la
              amplitud crece demasiado o aparecen negativos, conviene revisar
              limpieza de datos, regularizacion y validacion del modelo.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
