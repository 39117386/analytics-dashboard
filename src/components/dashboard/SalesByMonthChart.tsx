import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesByMonthPoint = {
  monthName: string;
  sales: number;
};

type SalesByMonthChartProps = {
  data: SalesByMonthPoint[];
};

export function SalesByMonthChart({ data }: SalesByMonthChartProps) {
  return (
    <div className="xl:col-span-2 overflow-hidden p-6">
      <h2 className="mb-4 truncate text-lg font-semibold text-slate-100">Ventas por Mes</h2>
      <div className="h-72 overflow-hidden p-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="monthName" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [
                `$${Number(value ?? 0).toLocaleString("es-ES")}`,
                "Ventas",
              ]}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
