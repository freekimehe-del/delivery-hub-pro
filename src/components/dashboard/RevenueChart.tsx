import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";

const data = [
  { name: "Mon", revenue: 4200, orders: 24 },
  { name: "Tue", revenue: 3800, orders: 22 },
  { name: "Wed", revenue: 5100, orders: 31 },
  { name: "Thu", revenue: 4600, orders: 28 },
  { name: "Fri", revenue: 6200, orders: 38 },
  { name: "Sat", revenue: 5800, orders: 35 },
  { name: "Sun", revenue: 4100, orders: 25 },
];

export function RevenueChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-card rounded-xl border border-border p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-fleet-green/10">
            <DollarSign className="w-4 h-4 text-fleet-green" />
          </div>
          <div>
            <h3 className="font-semibold">Weekly Revenue</h3>
            <p className="text-xs text-muted-foreground">This week's performance</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-fleet-green text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          +12.5%
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `PKR ${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              itemStyle={{ color: "hsl(var(--muted-foreground))" }}
              formatter={(value: number) => [formatCurrency(value, "PKR"), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
