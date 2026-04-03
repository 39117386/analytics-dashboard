"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DealSizeChart } from "@/components/dashboard/DealSizeChart";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { ProductLineChart } from "@/components/dashboard/ProductLineChart";
import { SalesByMonthChart } from "@/components/dashboard/SalesByMonthChart";
import { TopCustomersTable } from "@/components/dashboard/TopCustomersTable";
import type { SalesRow } from "@/components/dashboard/types";

const YEAR_OPTIONS = [2003, 2004, 2005];
const DEAL_COLORS: Record<string, string> = {
  Small: "#22c55e",
  Medium: "#f59e0b",
  Large: "#ef4444",
  Unknown: "#6b7280",
};

export default function Page() {
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [yearFilter, setYearFilter] = useState<number>(2003);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/sales_data_sample.csv")
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const rows = result.data as Record<string, string>[];
            const parsed: SalesRow[] = rows
              .map((row) => {
                const sales = parseFloat(row.SALES || "");
                if (isNaN(sales)) return null;
                return {
                  orderNumber: row.ORDERNUMBER || "",
                  quantityOrdered: parseInt(row.QUANTITYORDERED || "0", 10) || 0,
                  priceEach: parseFloat(row.PRICEEACH || "0") || 0,
                  sales,
                  orderDate: row.ORDERDATE || "",
                  status: row.STATUS || "",
                  qtrId: parseInt(row.QTR_ID || "0", 10) || 0,
                  monthId: parseInt(row.MONTH_ID || "0", 10) || 0,
                  yearId: parseInt(row.YEAR_ID || "0", 10) || 0,
                  productLine: row.PRODUCTLINE || "Unknown",
                  country: row.COUNTRY || "Unknown",
                  dealSize: row.DEALSIZE || "Unknown",
                  customerName: row.CUSTOMERNAME || "Unknown",
                };
              })
              .filter((r): r is SalesRow => r !== null);
            setRows(parsed);
            setLoading(false);
          },
          error: (err: Error) => {
            setError(err.message);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredRows = useMemo(
    () => rows.filter((r) => r.yearId === yearFilter),
    [rows, yearFilter]
  );

  const totalSales = useMemo(
    () => filteredRows.reduce((sum, r) => sum + r.sales, 0),
    [filteredRows]
  );
  const totalOrders = useMemo(
    () => new Set(filteredRows.map((r) => r.orderNumber)).size,
    [filteredRows]
  );
  const avgTicket = totalOrders ? totalSales / totalOrders : 0;

  const salesByCountry = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) =>
      map.set(r.country, (map.get(r.country) || 0) + r.sales)
    );
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredRows]);

  const countryTop = salesByCountry.length ? salesByCountry[0][0] : "N/A";

  const salesByMonth = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) => {
      const key = `${r.yearId}-${String(r.monthId).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + r.sales);
    });
    return Array.from(map.entries())
      .map(([key, value]) => {
        const [year, month] = key.split("-").map(Number);
        const date = new Date(year, month - 1);
        const monthName = date.toLocaleString("es-ES", { month: "short" });
        return {
          monthName: `${monthName}`,
          sales: Math.round(value),
          y: year,
          m: month,
        };
      })
      .sort((a, b) => a.y - b.y || a.m - b.m);
  }, [filteredRows]);

  const salesByProductLine = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) =>
      map.set(r.productLine, (map.get(r.productLine) || 0) + r.sales)
    );
    return Array.from(map.entries())
      .map(([name, sales]) => ({ name, sales: Math.round(sales) }))
      .sort((a, b) => b.sales - a.sales);
  }, [filteredRows]);

  const dealSizeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) =>
      map.set(r.dealSize, (map.get(r.dealSize) || 0) + r.sales)
    );
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRows]);

  const topCustomers = useMemo(() => {
    const map = new Map<string, number>();
    filteredRows.forEach((r) =>
      map.set(r.customerName, (map.get(r.customerName) || 0) + r.sales)
    );
    return Array.from(map.entries())
      .map(([customerName, sales]) => ({
        customerName,
        sales: Math.round(sales),
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredRows]);

  if (loading)
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-lg text-slate-400">Cargando datos...</p>
      </main>
    );

  if (error)
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-red-400">Error: {error}</p>
      </main>
    );

  const kpis = [
    {
      label: "Total de Ventas",
      value: `$${totalSales.toLocaleString("es-ES")}`,
      color: "text-cyan-300",
    },
    {
      label: "Cantidad de Órdenes",
      value: totalOrders,
      color: "text-indigo-300",
    },
    {
      label: "Ticket Promedio",
      value: `$${Math.round(avgTicket).toLocaleString("es-ES")}`,
      color: "text-emerald-300",
    },
    {
      label: "País con más ventas",
      value: countryTop,
      color: "text-amber-300",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        <div className="overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <DashboardHeader
            yearFilter={yearFilter}
            yearOptions={YEAR_OPTIONS}
            onYearChange={setYearFilter}
          />
        </div>
        <div className="overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <KpiGrid items={kpis} />
        </div>
        <div className="overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <SalesByMonthChart data={salesByMonth} />
            <DealSizeChart data={dealSizeDistribution} colors={DEAL_COLORS} />
          </section>
        </div>
        <div className="overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <ProductLineChart data={salesByProductLine} />
        </div>
        <div className="overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <TopCustomersTable customers={topCustomers} />
        </div>
      </div>
    </main>
  );
}
