'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { downloadCSV } from "@/lib/export-csv";
import { DateRangePicker } from "../ui/date-range-picker";

export function DashboardHeaderClient({ user, stats, from, to,exportButton }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [date, setDate] = useState<DateRange | undefined>({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const handleApply = (range: DateRange | undefined) => {
    if (!range?.from || !range?.to) return;
    const params = new URLSearchParams(searchParams);
    params.set("from", format(range.from, "yyyy-MM-dd"));
    params.set("to", format(range.to, "yyyy-MM-dd"));
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleExport = async () => {
    await downloadCSV(from, to);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
      {/* Left side - same as before */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-2">
          Welcome back, {user?.name || "Admin"} — select a date range below.
        </p>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Date Range Picker */}
        <motion.div whileHover={{ scale: 1.02 }}>
     <DateRangePicker
  value={date as any}
  onChange={(r: any) => setDate(r)}
  onApply={(r: any) => handleApply(r)}
/>
        </motion.div>

        {/* Export */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-300"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </motion.button>
      </div>
    </div>
  );
}
