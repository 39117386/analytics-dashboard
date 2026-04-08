"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardChartPoint = {
  label: string;
  sales: number;
};

type DashboardChartProps = {
  data: DashboardChartPoint[];
};

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function DashboardChart({ data }: DashboardChartProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/10">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
          Ventas historicas
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Evolucion mensual de ventas
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Serie historica agregada por mes a partir del CSV original.
        </p>
      </div>

      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 12, left: 8, bottom: 8 }}>
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
              formatter={(value) => [
                currencyFormatter.format(Number(value ?? 0)),
                "Ventas historicas",
              ]}
            />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="sales"
              name="Historical"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#67e8f9" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
