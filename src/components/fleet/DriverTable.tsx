import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Plus,
  Users,
  ChevronDown,
  ChevronUp,
  Car,
  Phone,
  Mail,
  Star,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useDriversWithVehicles } from "@/hooks/useDriversWithVehicles";
import { useDeleteDriver, useToggleDriverOnline } from "@/hooks/useDriversMutations";
import { AddDriverDialog } from "./AddDriverDialog";
import { AssignVehicleDialog } from "./AssignVehicleDialog";
import { DriverDetailsSheet } from "./DriverDetailsSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, isAfter, addDays } from "date-fns";
import type { DriverStatus } from "@/hooks/useDrivers";

const statusConfig: Record<DriverStatus, { label: string; variant: "success" | "warning" | "info" | "destructive" | "offline" }> = {
  active: { label: "Active", variant: "success" },
  pending: { label: "Pending", variant: "info" },
  suspended: { label: "Suspended", variant: "destructive" },
  inactive: { label: "Inactive", variant: "offline" },
};

type SortField = "employee_id" | "status" | "rating" | "total_deliveries";
type SortDirection = "asc" | "desc";

export function DriverTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("employee_id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const { data: drivers = [], isLoading, error } = useDriversWithVehicles();
  const deleteDriver = useDeleteDriver();
  const toggleOnline = useToggleDriverOnline();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getDriverName = (driver: typeof drivers[0]) => {
    return driver.profile?.full_name || driver.employee_id || "Unknown Driver";
  };

  const getDriverInitials = (driver: typeof drivers[0]) => {
    const name = getDriverName(driver);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLicenseStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const warningDate = addDays(today, 30);

    if (expiry < today) return "expired";
    if (expiry <= warningDate) return "expiring";
    return "valid";
  };

  const filteredDrivers = drivers
    .filter((driver) => {
      const name = getDriverName(driver).toLowerCase();
      const email = driver.profile?.email?.toLowerCase() || "";
      const employeeId = driver.employee_id?.toLowerCase() || "";
      const license = driver.license_number?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query) || employeeId.includes(query) || license.includes(query);
    })
    .sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (sortField === "rating" || sortField === "total_deliveries") {
        return ((a[sortField] || 0) - (b[sortField] || 0)) * modifier;
      }
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const handleOpenDetails = (driverId: string) => {
    setSelectedDriverId(driverId);
    setDetailsSheetOpen(true);
  };

  const handleOpenAssign = (driverId: string) => {
    setSelectedDriverId(driverId);
    setAssignDialogOpen(true);
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
        <p className="text-destructive">Failed to load drivers. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-xl border border-border shadow-sm"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-fleet-green/10">
                <Users className="w-5 h-5 text-fleet-green" />
              </div>
              <div>
                <h3 className="font-semibold">Fleet Drivers</h3>
                <p className="text-xs text-muted-foreground">
                  {drivers.length} drivers registered
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search drivers..."
                  className="pl-9 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="gradient" className="gap-2" onClick={() => setAddDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Driver</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Driver</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("employee_id")}
                >
                  <div className="flex items-center gap-1">
                    Employee ID <SortIcon field="employee_id" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status <SortIcon field="status" />
                  </div>
                </TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>License</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("rating")}
                >
                  <div className="flex items-center gap-1">
                    Rating <SortIcon field="rating" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("total_deliveries")}
                >
                  <div className="flex items-center gap-1">
                    Deliveries <SortIcon field="total_deliveries" />
                  </div>
                </TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredDrivers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No drivers found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setAddDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first driver
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrivers.map((driver, index) => {
                  const licenseStatus = getLicenseStatus(driver.license_expiry);

                  return (
                    <motion.tr
                      key={driver.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={driver.profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-fleet-green/10 text-fleet-green text-sm font-medium">
                                {getDriverInitials(driver)}
                              </AvatarFallback>
                            </Avatar>
                            {driver.is_online && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-fleet-green rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{getDriverName(driver)}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {driver.profile?.email && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                                      <Mail className="w-3 h-3" />
                                      <span className="truncate max-w-[120px]">{driver.profile.email}</span>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>{driver.profile.email}</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-muted-foreground">
                          {driver.employee_id || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusConfig[driver.status]?.variant || "offline"}>
                            {statusConfig[driver.status]?.label || driver.status}
                          </Badge>
                          {driver.is_online && (
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="flex items-center gap-1 text-xs text-fleet-green">
                                  <MapPin className="w-3 h-3" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Currently online</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {driver.vehicle ? (
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{driver.vehicle.name}</p>
                              <p className="text-xs text-muted-foreground">{driver.vehicle.license_plate}</p>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-primary"
                            onClick={() => handleOpenAssign(driver.id)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Assign
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {driver.license_number || "—"}
                          </span>
                          {licenseStatus && (
                            <Tooltip>
                              <TooltipTrigger>
                                {licenseStatus === "expired" ? (
                                  <XCircle className="w-4 h-4 text-destructive" />
                                ) : licenseStatus === "expiring" ? (
                                  <AlertTriangle className="w-4 h-4 text-fleet-orange" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 text-fleet-green" />
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {licenseStatus === "expired"
                                  ? "License expired"
                                  : licenseStatus === "expiring"
                                  ? `Expires ${format(new Date(driver.license_expiry!), "MMM d, yyyy")}`
                                  : `Valid until ${format(new Date(driver.license_expiry!), "MMM d, yyyy")}`}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-fleet-yellow fill-fleet-yellow" />
                          <span className="font-medium">{driver.rating?.toFixed(1) || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {driver.total_deliveries?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetails(driver.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenAssign(driver.id)}>
                              {driver.vehicle ? "Change Vehicle" : "Assign Vehicle"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleOnline.mutate({ id: driver.id, isOnline: !driver.is_online })
                              }
                            >
                              {driver.is_online ? "Set Offline" : "Set Online"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View Schedule</DropdownMenuItem>
                            <DropdownMenuItem>View Deliveries</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteDriver.mutate(driver.id)}
                            >
                              Remove Driver
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredDrivers.length} of {drivers.length} drivers
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </motion.div>

      <AddDriverDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <AssignVehicleDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        driverId={selectedDriverId}
      />
      <DriverDetailsSheet
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        driverId={selectedDriverId}
      />
    </>
  );
}
