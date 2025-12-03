import { motion } from "framer-motion";
import { Car, Users, Wrench, Fuel, TrendingUp, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { VehicleTable } from "@/components/fleet/VehicleTable";

const metrics = [
  {
    title: "Total Vehicles",
    value: "42",
    change: 5,
    changeLabel: "this month",
    icon: <Car className="w-5 h-5" />,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "Active Drivers",
    value: "38",
    change: 3,
    changeLabel: "this week",
    icon: <Users className="w-5 h-5" />,
    iconColor: "bg-fleet-green/10 text-fleet-green",
  },
  {
    title: "Due Maintenance",
    value: "4",
    change: -2,
    changeLabel: "vs last week",
    icon: <Wrench className="w-5 h-5" />,
    iconColor: "bg-fleet-orange/10 text-fleet-orange",
  },
  {
    title: "Avg. Fuel Cost",
    value: "$3.45/mi",
    change: -8,
    changeLabel: "this month",
    icon: <Fuel className="w-5 h-5" />,
    iconColor: "bg-fleet-purple/10 text-fleet-purple",
  },
];

export default function Fleet() {
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage your vehicles, drivers, and maintenance schedules.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Alerts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <div className="bg-fleet-orange/5 border border-fleet-orange/20 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-fleet-orange/10 shrink-0">
            <AlertTriangle className="w-5 h-5 text-fleet-orange" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-fleet-orange">Maintenance Alerts</h4>
            <p className="text-sm text-muted-foreground mt-1">
              4 vehicles require maintenance attention. Truck-007 is due for oil change,
              Van-003 needs tire replacement.
            </p>
          </div>
          <button className="text-sm font-medium text-fleet-orange hover:underline whitespace-nowrap">
            View All
          </button>
        </div>
      </motion.div>

      {/* Vehicle Table */}
      <VehicleTable />
    </DashboardLayout>
  );
}
