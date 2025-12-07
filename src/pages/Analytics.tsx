import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  Target,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/formatCurrency";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";

const revenueData = [
  { month: "Jan", revenue: 42000, orders: 320 },
  { month: "Feb", revenue: 38000, orders: 290 },
  { month: "Mar", revenue: 51000, orders: 410 },
  { month: "Apr", revenue: 46000, orders: 380 },
  { month: "May", revenue: 62000, orders: 520 },
  { month: "Jun", revenue: 58000, orders: 480 },
];

const deliveryData = [
  { day: "Mon", onTime: 45, late: 3 },
  { day: "Tue", onTime: 52, late: 5 },
  { day: "Wed", onTime: 48, late: 2 },
  { day: "Thu", onTime: 61, late: 4 },
  { day: "Fri", onTime: 55, late: 6 },
  { day: "Sat", onTime: 38, late: 2 },
  { day: "Sun", onTime: 25, late: 1 },
];

const statusData = [
  { name: "Delivered", value: 65, color: "hsl(160, 84%, 39%)" },
  { name: "In Progress", value: 20, color: "hsl(217, 91%, 60%)" },
  { name: "Pending", value: 10, color: "hsl(45, 93%, 47%)" },
  { name: "Cancelled", value: 5, color: "hsl(0, 84%, 60%)" },
];

const metrics = [
  {
    title: "Total Revenue",
    value: "PKR 297K",
    change: 18,
    changeLabel: "vs last period",
    icon: <DollarSign className="w-5 h-5" />,
    iconColor: "bg-fleet-green/10 text-fleet-green",
  },
  {
    title: "Total Orders",
    value: "2,400",
    change: 12,
    changeLabel: "vs last period",
    icon: <Package className="w-5 h-5" />,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "On-Time Rate",
    value: "94.2%",
    change: 2.5,
    changeLabel: "vs last period",
    icon: <Clock className="w-5 h-5" />,
    iconColor: "bg-fleet-purple/10 text-fleet-purple",
  },
  {
    title: "Avg. Delivery Time",
    value: "2.4 hrs",
    change: -8,
    changeLabel: "vs last period",
    icon: <Target className="w-5 h-5" />,
    iconColor: "bg-fleet-orange/10 text-fleet-orange",
  },
];

export default function Analytics() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track performance metrics and business insights.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-fleet-green/10">
                <TrendingUp className="w-4 h-4 text-fleet-green" />
              </div>
              <div>
                <h3 className="font-semibold">Revenue Overview</h3>
                <p className="text-xs text-muted-foreground">Monthly revenue trend</p>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
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
                  }}
                  formatter={(value: number) => [formatCurrency(value, "PKR"), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(160, 84%, 39%)"
                  strokeWidth={2}
                  fill="url(#colorRevenueAnalytics)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Delivery Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Delivery Performance</h3>
                <p className="text-xs text-muted-foreground">On-time vs late deliveries</p>
              </div>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="onTime" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="On Time" />
                <Bar dataKey="late" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Order Status Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-card rounded-xl border border-border p-4 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fleet-purple/10">
              <Package className="w-4 h-4 text-fleet-purple" />
            </div>
            <div>
              <h3 className="font-semibold">Order Status Distribution</h3>
              <p className="text-xs text-muted-foreground">Current order breakdown</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="h-[200px] w-full md:w-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-2xl font-bold">{item.value}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
