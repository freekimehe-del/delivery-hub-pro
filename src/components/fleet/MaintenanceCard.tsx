import { Wrench, Calendar, ClipboardList, AlertTriangle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FleetDashboardCard } from "./FleetDashboardCard";
import { Badge } from "@/components/ui/badge";
import { useMaintenanceStats } from "@/hooks/useFleetStats";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MaintenanceCardProps {
  isPulsing?: boolean;
  delay?: number;
}

export function MaintenanceCard({ isPulsing, delay = 0 }: MaintenanceCardProps) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useMaintenanceStats();

  const quickActions = [
    {
      label: "Schedule",
      icon: <Calendar className="w-3 h-3" />,
      onClick: () => toast.info("Opening maintenance scheduler..."),
    },
    {
      label: "View Log",
      icon: <ClipboardList className="w-3 h-3" />,
      onClick: () => toast.info("Opening maintenance log..."),
    },
    {
      label: "Request",
      icon: <Wrench className="w-3 h-3" />,
      onClick: () => toast.info("Opening service request form..."),
    },
  ];

  const metrics = [
    {
      label: "Upcoming",
      value: stats?.upcomingCount || 0,
      color: "text-fleet-orange",
    },
    {
      label: "Overdue",
      value: stats?.overdueCount || 0,
      color: "text-destructive",
    },
    {
      label: "In Service",
      value: stats?.inMaintenanceNow || 0,
      color: "text-primary",
    },
    {
      label: "Cost (MTD)",
      value: `$${((stats?.maintenanceCostThisMonth || 0) / 1000).toFixed(1)}k`,
      change: stats?.costChange,
      color: "text-foreground",
    },
  ];

  const hasUrgentAlerts = (stats?.overdueCount || 0) > 0 || (stats?.urgentCount || 0) > 0;

  return (
    <FleetDashboardCard
      title="Maintenance"
      icon={<Wrench className="w-6 h-6" />}
      iconColor="text-fleet-orange"
      iconBgColor="bg-fleet-orange/10"
      count={stats?.upcomingCount || 0}
      countLabel="upcoming"
      badge={
        hasUrgentAlerts ? (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {(stats?.overdueCount || 0) + (stats?.urgentCount || 0)} urgent
          </Badge>
        ) : (
          <Badge variant="success">All clear</Badge>
        )
      }
      metrics={metrics}
      quickActions={quickActions}
      onViewDetails={() => navigate("/fleet")}
      isLoading={isLoading}
      isPulsing={isPulsing}
      delay={delay}
    >
      {/* Upcoming Maintenance List */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Recent History</h4>
        <ScrollArea className="h-28">
          {stats?.recentMaintenance && stats.recentMaintenance.length > 0 ? (
            <div className="space-y-2">
              {stats.recentMaintenance.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2 h-2 rounded-full bg-fleet-green shrink-0" />
                    <span className="font-medium truncate">{vehicle.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                    <Clock className="w-3 h-3" />
                    {vehicle.last_service_date &&
                      formatDistanceToNow(new Date(vehicle.last_service_date), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No recent maintenance records
            </p>
          )}
        </ScrollArea>
      </div>
    </FleetDashboardCard>
  );
}
