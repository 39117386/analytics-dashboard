import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProductLinePoint = {
  name: string;
  sales: number;
};

type ProductLineChartProps = {
  data: ProductLinePoint[];
};

export function ProductLineChart({ data }: ProductLineChartProps) {
  return (
    <section>
      <h2 className="mb-4 truncate text-lg font-semibold text-slate-100">Ventas por Product Line</h2>
      <div className="h-72 overflow-hidden p-6 pb-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [
                `$${Number(value ?? 0).toLocaleString("es-ES")}`,
                "Ventas",
              ]}
            />
            <Bar dataKey="sales" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
