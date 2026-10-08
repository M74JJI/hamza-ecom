"use client";

import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleDollarSign, PackageCheck, ReceiptText, Users } from "lucide-react";

const COLORS = ["#171717", "#525252", "#737373", "#a3a3a3", "#d4d4d4"];
const tooltip = { backgroundColor: "#171717", border: "0", borderRadius: "6px", color: "#fff", fontSize: "12px" };
const axis = { fontSize: 11, fill: "#737373" };

export function StatsGrid({ stats }: any) {
  const cards = [
    { label: "Revenue", value: `${stats.revenue.toLocaleString()} MAD`, change: stats.growth.revenue, icon: CircleDollarSign },
    { label: "Orders", value: stats.orders.toLocaleString(), change: stats.growth.orders, icon: ReceiptText },
    { label: "Customers", value: stats.customers.toLocaleString(), change: stats.growth.customers, icon: Users },
    { label: "Average order", value: `${stats.avgOrder.toFixed(2)} MAD`, change: stats.growth.avgOrder, icon: PackageCheck },
  ];
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map(({ label, value, change, icon: Icon }) => <div key={label} className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs font-medium text-neutral-500">{label}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">{value}</p></div>
        <div className="rounded-md bg-neutral-100 p-2 text-neutral-600"><Icon className="h-4 w-4" /></div>
      </div>
      <p className={`mt-4 text-xs font-medium ${String(change).startsWith("-") ? "text-red-700" : "text-emerald-700"}`}>{change} <span className="font-normal text-neutral-400">vs previous period</span></p>
    </div>)}
  </div>;
}

export function SalesOverTime({ data }: { data: any[] }) {
  return <ChartCard title="Sales over time" subtitle="Revenue by order date">
    <ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ left: 0, right: 12 }}>
      <CartesianGrid vertical={false} stroke="#eeeeee" /><XAxis dataKey="date" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} width={48} />
      <Tooltip contentStyle={tooltip} formatter={(value) => [`${Number(value).toFixed(2)} MAD`, "Revenue"]} />
      <Line type="monotone" dataKey="total" stroke="#171717" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#171717" }} />
    </LineChart></ResponsiveContainer>
  </ChartCard>;
}

export function OrdersByStatus({ data }: { data: any[] }) {
  return <ChartCard title="Orders by status" subtitle="Current order distribution">
    <div className="grid h-full grid-cols-[1fr_140px] items-center gap-3">
      <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="count" nameKey="status" innerRadius={58} outerRadius={85} paddingAngle={2}>{data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltip} /></PieChart></ResponsiveContainer>
      <div className="space-y-2">{data.map((item, i) => <div key={item.status} className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-neutral-600"><i className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{formatLabel(item.status)}</span><strong>{item.count}</strong></div>)}</div>
    </div>
  </ChartCard>;
}

export function TopProducts({ data }: { data: any[] }) {
  return <ChartCard title="Top products" subtitle="Units sold in selected period">
    <ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: 5, right: 16 }}>
      <CartesianGrid horizontal={false} stroke="#eeeeee" /><XAxis type="number" tick={axis} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="title" tick={axis} width={100} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={tooltip} /><Bar dataKey="qty" fill="#404040" radius={[0, 3, 3, 0]} />
    </BarChart></ResponsiveContainer>
  </ChartCard>;
}

export function OrdersByCity({ data }: { data: any[] }) {
  return <ChartCard title="Orders by city" subtitle="Delivery demand by location">
    <ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ left: 0, right: 12 }}>
      <CartesianGrid vertical={false} stroke="#eeeeee" /><XAxis dataKey="city" tick={axis} axisLine={false} tickLine={false} /><YAxis tick={axis} axisLine={false} tickLine={false} width={32} />
      <Tooltip contentStyle={tooltip} /><Bar dataKey="count" fill="#404040" radius={[3, 3, 0, 0]} />
    </BarChart></ResponsiveContainer>
  </ChartCard>;
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-lg border border-neutral-200 bg-white p-5">
    <h3 className="font-semibold text-neutral-950">{title}</h3><p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
    <div className="mt-5 h-64">{children}</div>
  </section>;
}

function formatLabel(value: string) { return value.charAt(0) + value.slice(1).toLowerCase(); }
