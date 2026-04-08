type KpiCard = {
  label: string;
  value: string | number;
  color: string;
  icon?: string;
};

type KpiGridProps = {
  items: KpiCard[];
};

export function KpiGrid({ items }: KpiGridProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => (
        <article
          key={kpi.label}
          className="rounded-3xl bg-slate-900/70 p-5 shadow-xl shadow-black/10 ring-1 ring-white/8"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">{kpi.label}</p>
              <p className={`mt-2 text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
            {kpi.icon ? (
              <span className="text-2xl leading-none" aria-hidden="true">
                {kpi.icon}
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </section>
  );
}
