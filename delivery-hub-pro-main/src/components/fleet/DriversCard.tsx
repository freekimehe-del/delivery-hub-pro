import { Users, UserPlus, Calendar, ShieldCheck, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FleetDashboardCard } from "./FleetDashboardCard";
import { Badge } from "@/components/ui/badge";
import { useDriverStats } from "@/hooks/useDrivers";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface DriversCardProps {
  isPulsing?: boolean;
  delay?: number;
}

export function DriversCard({ isPulsing, delay = 0 }: DriversCardProps) {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDriverStats();

  const quickActions = [
    {
      label: "Assign Driver",
      icon: <UserPlus className="w-3 h-3" />,
      onClick: () => toast.info("Opening driver assignment..."),
    },
    {
      label: "Schedule",
      icon: <Calendar className="w-3 h-3" />,
      onClick: () => toast.info("Opening schedule view..."),
    },
    {
      label: "Compliance",
      icon: <ShieldCheck className="w-3 h-3" />,
      onClick: () => toast.info("Opening compliance dashboard..."),
    },
  ];

  const metrics = [
    {
      label: "Available",
      value: stats?.availableDrivers || 0,
      color: "text-fleet-green",
    },
    {
      label: "On Duty",
      value: stats?.onlineDrivers || 0,
      color: "text-primary",
    },
    {
      label: "Rating",
      value: `${stats?.averageRating || 0}★`,
      color: "text-fleet-yellow",
    },
    {
      label: "Active",
      value: stats?.activeDrivers || 0,
      color: "text-muted-foreground",
    },
  ];

  const hasLicenseAlerts = (stats?.expiringLicenses || 0) + (stats?.expiredLicenses || 0) > 0;

  return (
    <FleetDashboardCard
      title="Drivers"
      icon={<Users className="w-6 h-6" />}
      iconColor="text-fleet-green"
      iconBgColor="bg-fleet-green/10"
      count={stats?.totalDrivers || 0}
      countLabel="registered"
      badge={
        hasLicenseAlerts ? (
          <Badge variant="warning" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {(stats?.expiringLicenses || 0) + (stats?.expiredLicenses || 0)} alerts
          </Badge>
        ) : (
          <Badge variant="success">All compliant</Badge>
        )
      }
      metrics={metrics}
      quickActions={quickActions}
      onViewDetails={() => navigate("/fleet")}
      isLoading={isLoading}
      isPulsing={isPulsing}
      delay={delay}
    >
      {/* Compliance Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Compliance Rate</span>
          <span className="font-medium">{stats?.complianceRate || 0}%</span>
        </div>
        <Progress value={stats?.complianceRate || 0} className="h-2" />
        
        {/* License Alerts */}
        {(stats?.expiringLicenses || 0) > 0 && (
          <div className="flex items-center gap-2 text-xs text-fleet-orange bg-fleet-orange/10 rounded-lg p-2">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>{stats?.expiringLicenses} license(s) expiring in 30 days</span>
          </div>
        )}
        
        {(stats?.expiredLicenses || 0) > 0 && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg p-2">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span>{stats?.expiredLicenses} license(s) expired</span>
          </div>
        )}
      </div>
    </FleetDashboardCard>
  );
}
