import Link from "next/link";

export function AdminHeaderClient({ user, stats }: { user: any; stats: { revenue: string; pending: string; orders: number; products: number; growth: string } }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-neutral-500">ADMINISTRATION</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">Signed in as {user?.email}</p>
        </div>
        <dl className="grid grid-cols-4 divide-x divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
          <div className="px-4 py-2"><dt className="text-[10px] uppercase tracking-wide text-neutral-500">Revenue</dt><dd className="mt-1 text-sm font-semibold text-neutral-950">{stats.revenue} MAD</dd></div>
          <div className="px-4 py-2"><dt className="text-[10px] uppercase tracking-wide text-neutral-500">Pending</dt><dd className="mt-1 text-sm font-semibold text-neutral-950">{stats.pending} MAD</dd></div>
          <div className="px-4 py-2"><dt className="text-[10px] uppercase tracking-wide text-neutral-500">Orders</dt><dd className="mt-1 text-sm font-semibold text-neutral-950">{stats.orders}</dd></div>
          <div className="px-4 py-2"><dt className="text-[10px] uppercase tracking-wide text-neutral-500">Products</dt><dd className="mt-1 text-sm font-semibold text-neutral-950">{stats.products}</dd></div>
        </dl>
        <Link href="/" className="hz-secondary-button hidden xl:inline-flex">View store</Link>
      </div>
    </header>
  );
}
