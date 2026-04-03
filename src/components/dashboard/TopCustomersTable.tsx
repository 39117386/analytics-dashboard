type TopCustomer = {
  customerName: string;
  sales: number;
};

type TopCustomersTableProps = {
  customers: TopCustomer[];
};

export function TopCustomersTable({ customers }: TopCustomersTableProps) {
  return (
    <section>
      <h2 className="mb-4 truncate text-lg font-semibold text-slate-100">Top 5 Clientes</h2>
      <div className="overflow-hidden p-6">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-700 text-slate-400">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Ventas</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr
                key={customer.customerName}
                className={index % 2 === 0 ? "bg-slate-900" : "bg-slate-950"}
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">{customer.customerName}</td>
                <td className="px-4 py-2">
                  ${customer.sales.toLocaleString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
