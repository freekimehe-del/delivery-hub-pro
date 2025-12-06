import { Fuel, Plus, FileBarChart, Target, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { FleetDashboardCard } from "./FleetDashboardCard";
import { Badge } from "@/components/ui/badge";
import { useFuelStats } from "@/hooks/useFleetStats";
import { toast } from "sonner";

interface FuelCardProps {
  isPulsing?: boolean;
  delay?: number;
}

export function FuelCard({ isPulsing, delay = 0 }: FuelCardProps) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useFuelStats();

  const quickActions = [
    {
      label: "Add Record",
      icon: <Plus className="w-3 h-3" />,
      onClick: () => toast.info("Opening fuel record form..."),
    },
    {
      label: "Report",
      icon: <FileBarChart className="w-3 h-3" />,
      onClick: () => toast.info("Generating fuel report..."),
    },
    {
      label: "Targets",
      icon: <Target className="w-3 h-3" />,
      onClick: () => toast.info("Opening efficiency targets..."),
    },
  ];

  const metrics = [
    {
      label: "Avg MPG",
      value: stats?.avgMPG || "0",
      change: stats?.avgMPGChange ? parseFloat(stats.avgMPGChange) : undefined,
      color: "text-fleet-green",
    },
    {
      label: "Consumption",
      value: `${((stats?.fuelConsumptionThisMonth || 0) / 1000).toFixed(1)}k gal`,
      change: stats?.consumptionChange,
      color: "text-foreground",
    },
    {
      label: "Cost (MTD)",
      value: `$${((stats?.fuelCostThisMonth || 0) / 1000).toFixed(1)}k`,
      change: stats?.costChange,
      color: "text-foreground",
    },
    {
      label: "Low Fuel",
      value: stats?.needsRefuel || 0,
      color: stats?.needsRefuel && stats.needsRefuel > 0 ? "text-fleet-orange" : "text-muted-foreground",
    },
  ];

  const chartComponent = stats?.sparklineData && (
    <div className="h-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={stats.sparklineData}>
          <defs>
            <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--fleet-purple))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--fleet-purple))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" hide />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [
              name === "consumption" ? `${value} gal` : `$${value}`,
              name === "consumption" ? "Consumption" : "Cost",
            ]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Area
            type="monotone"
            dataKey="consumption"
            stroke="hsl(var(--fleet-purple))"
            strokeWidth={2}
            fill="url(#fuelGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center mt-1">
        Last 7 days consumption
      </p>
    </div>
  );

  return (
    <FleetDashboardCard
      title="Fuel"
      icon={<Fuel className="w-6 h-6" />}
      iconColor="text-fleet-purple"
      iconBgColor="bg-fleet-purple/10"
      count={`${stats?.avgMPG || 0} MPG`}
      countLabel="average"
      badge={
        stats?.needsRefuel && stats.needsRefuel > 0 ? (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {stats.needsRefuel} need fuel
          </Badge>
        ) : (
          <Badge variant="success">All fueled</Badge>
        )
      }
      metrics={metrics}
      chart={chartComponent}
      quickActions={quickActions}
      onViewDetails={() => navigate("/fleet")}
      isLoading={isLoading}
      isPulsing={isPulsing}
      delay={delay}
    />
  );
}
