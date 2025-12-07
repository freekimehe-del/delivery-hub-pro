import { motion } from "framer-motion";
import {
  Users,
  Car,
  Star,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useDriverById } from "@/hooks/useDriversWithVehicles";
import { format, isAfter, addDays } from "date-fns";
import type { DriverStatus } from "@/hooks/useDrivers";

interface DriverDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string | null;
}

const statusConfig: Record<DriverStatus, { label: string; variant: "success" | "warning" | "info" | "destructive" | "offline" }> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "info" },
  suspended: { label: "Suspended", variant: "destructive" },
  inactive: { label: "Inactive", variant: "offline" },
};

export function DriverDetailsSheet({
  open,
  onOpenChange,
  driverId,
}: DriverDetailsSheetProps) {
  const { data: driver, isLoading } = useDriverById(driverId);

  const getDriverName = () => {
    return driver?.profile?.full_name || driver?.employee_id || "Unknown Driver";
  };

  const getDriverInitials = () => {
    const name = getDriverName();
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLicenseStatus = () => {
    if (!driver?.license_expiry) return null;
    const expiry = new Date(driver.license_expiry);
    const today = new Date();
    const warningDate = addDays(today, 30);

    if (expiry < today) return "expired";
    if (expiry <= warningDate) return "expiring";
    return "valid";
  };

  const licenseStatus = getLicenseStatus();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Driver Details</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : driver ? (
          <div className="space-y-6">
            {/* Driver Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={driver.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-fleet-green/10 text-fleet-green text-lg font-medium">
                    {getDriverInitials()}
                  </AvatarFallback>
                </Avatar>
                {driver.is_online && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-fleet-green rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{getDriverName()}</h3>
                  <Badge variant={statusConfig[driver.status]?.variant || "offline"}>
                    {statusConfig[driver.status]?.label || driver.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {driver.employee_id || "No Employee ID"}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-fleet-yellow">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{driver.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>{driver.total_deliveries?.toLocaleString() || 0} deliveries</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="icon">
                <Edit className="w-4 h-4" />
              </Button>
            </motion.div>

            <Separator />

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                {driver.profile?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{driver.profile.email}</span>
                  </div>
                )}
                {driver.profile?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{driver.profile.phone}</span>
                  </div>
                )}
                {!driver.profile?.email && !driver.profile?.phone && (
                  <p className="text-sm text-muted-foreground">No contact information available</p>
                )}
              </div>
            </motion.div>

            {/* Assigned Vehicle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Assigned Vehicle
              </h4>
              {driver.vehicle ? (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Car className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{driver.vehicle.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {driver.vehicle.license_plate} · {driver.vehicle.make} {driver.vehicle.model}
                      </p>
                    </div>
                    <Badge
                      variant={driver.vehicle.status === "active" ? "success" : "warning"}
                      className="ml-auto"
                    >
                      {driver.vehicle.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Car className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No vehicle assigned</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Assign Vehicle
                  </Button>
                </div>
              )}
            </motion.div>

            {/* License & Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                License & Compliance
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">License Number</span>
                  </div>
                  <span className="text-sm font-mono">{driver.license_number || "Not provided"}</span>
                </div>
                {driver.license_expiry && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Expiry Date</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {format(new Date(driver.license_expiry), "MMM d, yyyy")}
                      </span>
                      {licenseStatus === "expired" ? (
                        <XCircle className="w-4 h-4 text-destructive" />
                      ) : licenseStatus === "expiring" ? (
                        <AlertTriangle className="w-4 h-4 text-fleet-orange" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-fleet-green" />
                      )}
                    </div>
                  </div>
                )}
                {licenseStatus === "expired" && (
                  <div className="bg-destructive/10 text-destructive text-sm p-2 rounded-lg">
                    License has expired. Driver cannot be assigned to deliveries.
                  </div>
                )}
                {licenseStatus === "expiring" && (
                  <div className="bg-fleet-orange/10 text-fleet-orange text-sm p-2 rounded-lg">
                    License expires soon. Please renew.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Performance
              </h4>
              <div className="bg-muted/50 rounded-lg p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">On-Time Rate</span>
                    <span className="text-sm font-medium">{driver.on_time_rate?.toFixed(1) || 0}%</span>
                  </div>
                  <Progress value={driver.on_time_rate || 0} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-primary">
                      {driver.total_deliveries?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Deliveries</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-fleet-yellow">
                      <Star className="w-5 h-5 fill-current" />
                      {driver.rating?.toFixed(1) || "N/A"}
                    </div>
                    <p className="text-xs text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Schedule */}
            {(driver.shift_start || driver.shift_end) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Schedule
                </h4>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {driver.shift_start?.slice(0, 5) || "—"} -{" "}
                      {driver.shift_end?.slice(0, 5) || "—"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Driver not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
