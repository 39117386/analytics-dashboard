import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type DealSizeSlice = {
  name: string;
  value: number;
};

type DealSizeChartProps = {
  data: DealSizeSlice[];
  colors: Record<string, string>;
};

export function DealSizeChart({ data, colors }: DealSizeChartProps) {
  return (
    <div className="overflow-hidden p-6">
      <h2 className="mb-4 truncate text-lg font-semibold text-slate-100">Deal Size</h2>
      <div className="h-72 min-h-[300px] overflow-hidden p-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={colors[entry.name] ?? colors.Unknown} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `$${Number(value ?? 0).toLocaleString("es-ES")}`,
                "Ventas",
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
