import { useState } from "react";
import { Car, Plus, Map, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FleetDashboardCard } from "./FleetDashboardCard";
import { Badge } from "@/components/ui/badge";
import { useVehicleStats } from "@/hooks/useFleetStats";
import { AddVehicleDialog } from "./AddVehicleDialog";
import { toast } from "sonner";

interface VehiclesCardProps {
  isPulsing?: boolean;
  delay?: number;
}

export function VehiclesCard({ isPulsing, delay = 0 }: VehiclesCardProps) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useVehicleStats();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const quickActions = [
    {
      label: "Add Vehicle",
      icon: <Plus className="w-3 h-3" />,
      onClick: () => setAddDialogOpen(true),
    },
    {
      label: "Fleet Map",
      icon: <Map className="w-3 h-3" />,
      onClick: () => toast.info("Opening fleet map..."),
    },
    {
      label: "Report",
      icon: <FileText className="w-3 h-3" />,
      onClick: () => toast.info("Generating vehicle report..."),
    },
  ];

  const metrics = [
    {
      label: "Active",
      value: stats?.activeVehicles || 0,
      color: "text-fleet-green",
    },
    {
      label: "In Transit",
      value: stats?.inTransit || 0,
      color: "text-primary",
    },
    {
      label: "Idle",
      value: stats?.idleVehicles || 0,
      color: "text-muted-foreground",
    },
    {
      label: "Maintenance",
      value: stats?.inMaintenance || 0,
      color: "text-fleet-orange",
    },
  ];

  const chartComponent = stats?.statusBreakdown && stats.statusBreakdown.length > 0 && (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={stats.statusBreakdown}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={50}
            paddingAngle={2}
            dataKey="value"
          >
            {stats.statusBreakdown.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number, name: string) => [`${value} vehicles`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <>
      <FleetDashboardCard
        title="Vehicles"
        icon={<Car className="w-6 h-6" />}
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
        count={stats?.totalVehicles || 0}
        countLabel="total fleet"
        badge={
          <Badge variant="success" className="animate-pulse-slow">
            {stats?.utilizationRate || 0}% utilized
          </Badge>
        }
        metrics={metrics}
        chart={chartComponent}
        quickActions={quickActions}
        onViewDetails={() => navigate("/fleet")}
        isLoading={isLoading}
        isPulsing={isPulsing}
        delay={delay}
      />
      <AddVehicleDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  );
}
