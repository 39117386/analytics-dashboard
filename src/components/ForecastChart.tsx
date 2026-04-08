"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ForecastChartPoint = {
  ds: string;
  label: string;
  actual: number | null;
  forecast: number | null;
  yhatLower: number | null;
  yhatUpper: number | null;
  uncertaintyBase: number | null;
  uncertaintyBand: number | null;
};

type ForecastChartProps = {
  data: ForecastChartPoint[];
  splitLabel?: string;
};

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ForecastChart({ data, splitLabel }: ForecastChartProps) {
  return (
    <section className="rounded-3xl bg-slate-900/70 p-6 shadow-2xl shadow-black/10 ring-1 ring-white/8">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300/70">
            Forecast
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            Historical vs forecast
          </h2>
        </div>
        {splitLabel ? (
          <div
            className="rounded-2xl bg-amber-400/10 px-4 py-2 text-sm text-amber-200 ring-1 ring-amber-400/20"
            title="Forecast starts after the last historical point."
          >
            Start: {splitLabel}
          </div>
        ) : null}
      </div>

      <div className="h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              minTickGap={24}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => currencyFormatter.format(Number(value))}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid rgba(148, 163, 184, 0.18)",
                borderRadius: "1rem",
              }}
              labelStyle={{ color: "#e2e8f0" }}
              cursor={{ stroke: "#475569", strokeDasharray: "4 4" }}
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  actual: "Historical data",
                  forecast: "Forecast",
                  uncertaintyBand: "Expected range",
                };
                return [
                  currencyFormatter.format(Number(value ?? 0)),
                  labels[String(name)] ?? String(name),
                ];
              }}
            />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
            {splitLabel ? (
              <ReferenceLine
                x={splitLabel}
                stroke="#cbd5e1"
                strokeDasharray="5 5"
                ifOverflow="extendDomain"
                label={{
                  value: "Forecast",
                  position: "insideTopRight",
                  fill: "#cbd5e1",
                  fontSize: 12,
                }}
              />
            ) : null}
            <Area
              type="monotone"
              dataKey="uncertaintyBase"
              stackId="uncertainty"
              stroke="none"
              fill="transparent"
              activeDot={false}
              isAnimationActive={false}
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="uncertaintyBand"
              name="Confidence band"
              stackId="uncertainty"
              stroke="none"
              fill="#38bdf8"
              fillOpacity={0.2}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Historical"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={false}
              connectNulls={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#67e8f9" }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#f59e0b"
              strokeWidth={3}
              strokeDasharray="8 6"
              dot={false}
              connectNulls={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#fdba74" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
