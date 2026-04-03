type DashboardHeaderProps = {
  yearFilter: number;
  yearOptions: number[];
  onYearChange: (year: number) => void;
};

export function DashboardHeader({
  yearFilter,
  yearOptions,
  onYearChange,
}: DashboardHeaderProps) {
  return (
    <header className="text-center">
      <h1 className="text-3xl font-bold">Dashboard de Ventas</h1>
      <p className="mt-1 text-center text-sm text-slate-400">
        Año seleccionado: {yearFilter}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {yearOptions.map((year) => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={`rounded-xl px-8 py-3 text-xl font-bold transition ${
              yearFilter === year
                ? "scale-110 bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/30"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </header>
  );
}
