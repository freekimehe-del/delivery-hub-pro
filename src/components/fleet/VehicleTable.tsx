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

interface Vehicle {
  id: string;
  name: string;
  type: string;
  driver: string;
  status: "active" | "idle" | "maintenance" | "offline";
  location: string;
  lastUpdated: string;
  mileage: number;
}

const vehicles: Vehicle[] = [
  {
    id: "veh_001",
    name: "Truck-001",
    type: "Heavy Truck",
    driver: "John Doe",
    status: "active",
    location: "Downtown, NYC",
    lastUpdated: "2 min ago",
    mileage: 45230,
  },
  {
    id: "veh_002",
    name: "Van-003",
    type: "Delivery Van",
    driver: "Sarah Miller",
    status: "active",
    location: "Brooklyn, NYC",
    lastUpdated: "5 min ago",
    mileage: 32100,
  },
  {
    id: "veh_003",
    name: "Truck-007",
    type: "Medium Truck",
    driver: "Mike Ross",
    status: "maintenance",
    location: "Service Center",
    lastUpdated: "1 hour ago",
    mileage: 78500,
  },
  {
    id: "veh_004",
    name: "Van-012",
    type: "Delivery Van",
    driver: "Lisa Kim",
    status: "active",
    location: "Manhattan, NYC",
    lastUpdated: "1 min ago",
    mileage: 18900,
  },
  {
    id: "veh_005",
    name: "Truck-015",
    type: "Heavy Truck",
    driver: "Tom Brown",
    status: "idle",
    location: "Warehouse A",
    lastUpdated: "30 min ago",
    mileage: 56700,
  },
  {
    id: "veh_006",
    name: "Van-018",
    type: "Delivery Van",
    driver: "Unassigned",
    status: "offline",
    location: "Depot",
    lastUpdated: "2 hours ago",
    mileage: 41200,
  },
];

const statusConfig = {
  active: { label: "Active", variant: "success" as const },
  idle: { label: "Idle", variant: "warning" as const },
  maintenance: { label: "Maintenance", variant: "info" as const },
  offline: { label: "Offline", variant: "offline" as const },
};

type SortField = "name" | "driver" | "status" | "mileage";
type SortDirection = "asc" | "desc";

export function VehicleTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
        vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (sortField === "mileage") {
        return (a.mileage - b.mileage) * modifier;
      }
      return a[sortField].localeCompare(b[sortField]) * modifier;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
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
            <Button variant="gradient" className="gap-2">
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
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("driver")}
              >
                <div className="flex items-center gap-1">
                  Driver <SortIcon field="driver" />
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
              <TableHead>Location</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("mileage")}
              >
                <div className="flex items-center gap-1">
                  Mileage <SortIcon field="mileage" />
                </div>
              </TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((vehicle, index) => (
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
                      <p className="text-xs text-muted-foreground">{vehicle.type}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      vehicle.driver === "Unassigned" && "text-muted-foreground italic"
                    )}
                  >
                    {vehicle.driver}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[vehicle.status].variant}>
                    {statusConfig[vehicle.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    {vehicle.location}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {vehicle.mileage.toLocaleString()} mi
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {vehicle.lastUpdated}
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
                      <DropdownMenuItem className="text-destructive">
                        Remove Vehicle
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
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
  );
}
