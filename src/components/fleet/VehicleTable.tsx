import { useState } from "react";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Plus,
  Car,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useVehicles, useDeleteVehicle, Vehicle, VehicleStatus } from "@/hooks/useVehicles";
import { AddVehicleDialog } from "./AddVehicleDialog";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<VehicleStatus, { label: string; variant: "success" | "warning" | "info" | "offline" }> = {
  active: { label: "Active", variant: "success" },
  idle: { label: "Idle", variant: "info" },
  maintenance: { label: "Maintenance", variant: "warning" },
  offline: { label: "Offline", variant: "offline" },
};

type SortField = "name" | "vehicle_type" | "status" | "mileage";
type SortDirection = "asc" | "desc";

export function VehicleTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { data: vehicles = [], isLoading, error } = useVehicles();
  const deleteVehicle = useDeleteVehicle();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredVehicles = vehicles
    .filter(
      (vehicle) =>
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.make?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (sortField === "mileage") {
        return ((a.mileage || 0) - (b.mileage || 0)) * modifier;
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

  const formatVehicleType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
        <p className="text-destructive">Failed to load vehicles. Please try again.</p>
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
              <div className="p-2 rounded-lg bg-primary/10">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Fleet Vehicles</h3>
                <p className="text-xs text-muted-foreground">
                  {vehicles.length} vehicles total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
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
                <span className="hidden sm:inline">Add Vehicle</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Vehicle <SortIcon field="name" />
                  </div>
                </TableHead>
                <TableHead>Asset Code</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("vehicle_type")}
                >
                  <div className="flex items-center gap-1">
                    Type <SortIcon field="vehicle_type" />
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
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("mileage")}
                >
                  <div className="flex items-center gap-1">
                    Mileage <SortIcon field="mileage" />
                  </div>
                </TableHead>
                <TableHead>License Plate</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No vehicles found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setAddDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add your first vehicle
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <motion.tr
                    key={vehicle.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Car className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{vehicle.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {vehicle.make && vehicle.model
                              ? `${vehicle.make} ${vehicle.model}`
                              : vehicle.year
                              ? `${vehicle.year}`
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-muted-foreground">
                        {vehicle.asset_code || "—"}
                      </span>
                    </TableCell>
                    <TableCell>{formatVehicleType(vehicle.vehicle_type)}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[vehicle.status]?.variant || "offline"}>
                        {statusConfig[vehicle.status]?.label || vehicle.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {vehicle.mileage?.toLocaleString() || 0} mi
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {vehicle.license_plate}
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Vehicle</DropdownMenuItem>
                          <DropdownMenuItem>Assign Driver</DropdownMenuItem>
                          <DropdownMenuItem>Track Location</DropdownMenuItem>
                          <DropdownMenuItem>Schedule Maintenance</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteVehicle.mutate(vehicle.id)}
                          >
                            Remove Vehicle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
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

      <AddVehicleDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  );
}
