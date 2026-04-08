"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { DashboardChart } from "@/components/DashboardChart";
import { KpiGrid } from "@/components/dashboard/KpiGrid";

type SalesRow = {
  sales: number;
  monthId: number;
  yearId: number;
  orderNumber: string;
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

export default function DashboardPage() {
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/data/sales_data_sample.csv")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`No se pudo cargar el CSV (${res.status})`);
        }
        return res.text();
      })
      .then((text) => {
        if (!active) return;

        Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const parsedRows = result.data
              .map((row) => {
                const sales = Number.parseFloat(row.SALES ?? "");
                const monthId = Number.parseInt(row.MONTH_ID ?? "", 10);
                const yearId = Number.parseInt(row.YEAR_ID ?? "", 10);

                if (
                  !Number.isFinite(sales) ||
                  !Number.isFinite(monthId) ||
                  !Number.isFinite(yearId)
                ) {
                  return null;
                }

                return {
                  sales,
                  monthId,
                  yearId,
                  orderNumber: row.ORDERNUMBER ?? "",
                };
              })
              .filter((row): row is SalesRow => row !== null);

            setRows(parsedRows);
            setLoading(false);
          },
          error: (parseError: Error) => {
            setError(parseError.message);
            setLoading(false);
          },
        });
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

  const monthlyData = useMemo(() => {
    const grouped = new Map<string, number>();

    rows.forEach((row) => {
      const key = `${row.yearId}-${String(row.monthId).padStart(2, "0")}`;
      grouped.set(key, (grouped.get(key) ?? 0) + row.sales);
    });

    return Array.from(grouped.entries())
      .map(([key, sales]) => {
        const [year, month] = key.split("-").map(Number);
        const date = new Date(year, month - 1, 1);

        return {
          key,
          date,
          label: monthFormatter.format(date),
          sales: Math.round(sales),
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [rows]);

  const totalSales = useMemo(
    () => rows.reduce((sum, row) => sum + row.sales, 0),
    [rows]
  );
  const totalOrders = useMemo(
    () => new Set(rows.map((row) => row.orderNumber)).size,
    [rows]
  );
  const averageMonthlySales = useMemo(() => {
    if (!monthlyData.length) return 0;
    return monthlyData.reduce((sum, item) => sum + item.sales, 0) / monthlyData.length;
  }, [monthlyData]);
  const bestMonth = monthlyData.reduce<(typeof monthlyData)[number] | null>(
    (best, item) => {
      if (!best || item.sales > best.sales) return item;
      return best;
    },
    null
  );

  const kpis = [
    {
      label: "Total sales",
      value: currencyFormatter.format(totalSales),
      color: "text-cyan-300",
    },
    {
      label: "Orders",
      value: totalOrders.toLocaleString("es-ES"),
      color: "text-indigo-300",
    },
    {
      label: "Avg monthly sales",
      value: currencyFormatter.format(averageMonthlySales),
      color: "text-emerald-300",
    },
    {
      label: "Best month",
      value: bestMonth?.label ?? "N/D",
      color: "text-amber-300",
    },
  ];

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-6">
        <p className="text-slate-400">Cargando ventas historicas...</p>
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
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
            Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Historical Sales Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Resumen ejecutivo de ventas historicas basado en el CSV original,
            con agregacion mensual 
          </p>
        </section>

        <KpiGrid items={kpis} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <DashboardChart data={monthlyData} />

          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/10">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
              Summary
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Sales by month
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Ranking rapido de los meses con mejor volumen de ventas.
            </p>

            <div className="mt-6 space-y-3">
              {monthlyData
                .slice()
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 6)
                .map((item, index) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/70 px-4 py-3"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Top {index + 1}
                      </p>
                      <p className="mt-1 font-medium text-slate-100">{item.label}</p>
                    </div>
                    <p className="text-sm font-semibold text-cyan-300">
                      {currencyFormatter.format(item.sales)}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
