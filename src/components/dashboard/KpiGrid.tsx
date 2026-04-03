type KpiCard = {
  label: string;
  value: string | number;
  color: string;
};

type KpiGridProps = {
  items: KpiCard[];
};

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <article
          key={kpi.label}
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center"
        >
          <p className="text-sm text-slate-400">{kpi.label}</p>
          <p className={`mt-1 text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
        </article>
      ))}
    </section>
  );
}
