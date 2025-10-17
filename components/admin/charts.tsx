// components/admin/charts.tsx
'use client';

import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, AreaChart, Area, PieChart, Pie,
  PieLabelRenderProps
} from "recharts";
import { TrendingUp, Users, ShoppingCart, DollarSign, Sparkles, Activity, Package, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#22d3ee', '#6366f1', '#f43f5e', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'];

// Fixed tooltip styles with proper white text
const chartTooltipStyle = {
  backgroundColor: 'rgba(17, 24, 39, 0.95)',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#ffffff',
  fontSize: '12px',
  padding: '12px 16px',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
};

// Custom Tooltip Component for better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={chartTooltipStyle} className="font-medium">
        <p className="text-white mb-2">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Pie Charts
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={chartTooltipStyle} className="font-medium">
        <p className="text-white mb-1">{payload[0].name}</p>
        <p className="text-white">{`Count: ${payload[0].value} orders`}</p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bar Charts
const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={chartTooltipStyle} className="font-medium">
        <p className="text-white mb-2">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-white">
            {`${entry.name}: ${entry.value} ${entry.name === 'qty' ? 'units' : 'orders'}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface StatsGridProps {
  stats: { revenue: number; orders: number; customers: number; avgOrder: number };
}


export function StatsGrid({ stats }: any) {
  const statCards = [
    {
      label: "Total Revenue",
      value: `MAD ${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      change: stats.growth.revenue,
      trend:
        stats.growth.revenue.startsWith("+") ||
        stats.growth.revenue === "New"
          ? "up"
          : "down",
      color: "from-emerald-500 to-cyan-500",
      bgColor: "from-emerald-500/10 to-cyan-500/10",
    },
    {
      label: "Total Orders",
      value: stats.orders.toLocaleString(),
      icon: ShoppingCart,
      change: stats.growth.orders,
      trend:
        stats.growth.orders.startsWith("+") ||
        stats.growth.orders === "New"
          ? "up"
          : "down",
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-500/10 to-indigo-500/10",
    },
    {
      label: "Customers",
      value: stats.customers.toLocaleString(),
      icon: Users,
      change: stats.growth.customers,
      trend:
        stats.growth.customers.startsWith("+") ||
        stats.growth.customers === "New"
          ? "up"
          : "down",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-500/10 to-pink-500/10",
    },
    {
      label: "Avg. Order Value",
      value: `MAD ${stats.avgOrder.toFixed(2)}`,
      icon: TrendingUp,
      change: stats.growth.avgOrder,
      trend:
        stats.growth.avgOrder.startsWith("+") ||
        stats.growth.avgOrder === "New"
          ? "up"
          : "down",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-500/10 to-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="relative group"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl blur-xl`}
          />

          <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </p>
                <div className="flex items-center space-x-1">
                  <TrendingUp
                    className={`w-4 h-4 ${
                      stat.trend === "up"
                        ? "text-emerald-500"
                        : "text-red-500 rotate-180"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      stat.trend === "up"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    from last period
                  </span>
                </div>
              </div>

              <motion.div
                className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-20"
              initial={{ scaleX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface ChartProps {
  data: any[];
}

export function SalesOverTime({ data }: ChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      whileHover={{ scale: 1.01 }}
      className="relative group"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <Activity className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Sales Over Time</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days performance</p>
            </div>
          </div>
          <motion.select 
            whileHover={{ scale: 1.02 }}
            className="text-sm bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
          >
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
          </motion.select>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="salesStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
                horizontal={true}
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="url(#salesStroke)"
                strokeWidth={3}
                fill="url(#salesGradient)"
                dot={{ fill: '#22d3ee', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

type OrderStatusData = {
  status: string;
  count: number;
};

export function OrdersByStatus({ data }: { data: OrderStatusData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="relative group"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl blur-xl" />

      <div className="relative rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <Package className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                Orders by Status
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Current order distribution
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                nameKey="status"
               label={({ name, value, percent }: PieLabelRenderProps) =>
  typeof name === "string" && typeof value === "number"
    ? `${name} ${(Number(percent) * 100).toFixed(0)}%`
    : ""
}

                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>

              <Tooltip content={<PieTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "20px",
                  color: "#6b7280",
                }}
                iconSize={10}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}


export function TopProducts({ data }: ChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className="relative group"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Top Products</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Best selling items</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
                horizontal={true} 
                vertical={false} 
              />
              <XAxis 
                type="number" 
                tick={{ fontSize: 11, fill: '#6b7280' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="title" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar 
                dataKey="qty" 
                radius={[0, 4, 4, 0]} 
                animationDuration={800}
                background={{ fill: 'rgba(255,255,255,0.05)', radius: 4 }}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={index} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

export function OrdersByCity({ data }: ChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.01 }}
      className="relative group"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl blur-xl" />
      
      <div className="relative rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <MapPin className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Orders by City</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Geographic distribution</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 20, right: 20 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255,255,255,0.1)" 
                vertical={false}
              />
              <XAxis 
                dataKey="city" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={60}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6b7280' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar 
                dataKey="count" 
                radius={[4, 4, 0, 0]} 
                animationDuration={800}
                background={{ fill: 'rgba(255,255,255,0.05)', radius: 4 }}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={index} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}