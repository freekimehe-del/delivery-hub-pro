import { Package, Truck, Users, DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { LiveMap } from "@/components/dashboard/LiveMap";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

const metrics = [
  {
    title: "Active Deliveries",
    value: "24",
    change: 12,
    changeLabel: "vs yesterday",
    icon: <Package className="w-5 h-5" />,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "Online Drivers",
    value: "18",
    change: 8,
    changeLabel: "vs yesterday",
    icon: <Users className="w-5 h-5" />,
    iconColor: "bg-fleet-green/10 text-fleet-green",
  },
  {
    title: "Today's Revenue",
    value: "$4,582",
    change: 23,
    changeLabel: "vs yesterday",
    icon: <DollarSign className="w-5 h-5" />,
    iconColor: "bg-fleet-purple/10 text-fleet-purple",
  },
  {
    title: "Fleet Utilization",
    value: "87%",
    change: -3,
    changeLabel: "vs yesterday",
    icon: <Truck className="w-5 h-5" />,
    iconColor: "bg-fleet-orange/10 text-fleet-orange",
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening with your fleet today.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Map and Chart */}
        <div className="xl:col-span-2 space-y-6">
          <LiveMap />
          <RevenueChart />
        </div>

        {/* Right Column - Activity and Actions */}
        <div className="space-y-6">
          <ActivityFeed />
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
}
