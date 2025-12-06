import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Fuel,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Truck,
  User,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useFuelRecords, useFuelMutations, FuelRecord } from "@/hooks/useFuel";
import { AddFuelDialog } from "./AddFuelDialog";
import { FuelDetailsSheet } from "./FuelDetailsSheet";

const fuelTypeLabels: Record<string, string> = {
  gasoline: "Gasoline",
  diesel: "Diesel",
  electric: "Electric",
  hybrid: "Hybrid",
  cng: "CNG",
  lpg: "LPG",
};

export function FuelTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null);

  const { data: records, isLoading } = useFuelRecords();
  const { deleteFuelRecord } = useFuelMutations();

  const filteredRecords = records?.filter((record) => {
    const matchesSearch =
      record.vehicle?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vehicle?.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.station_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFuelType = fuelTypeFilter === "all" || record.fuel_type === fuelTypeFilter;
    return matchesSearch && matchesFuelType;
  });

  // Calculate summary stats
  const totalGallons = records?.reduce((sum, r) => sum + Number(r.quantity_gallons), 0) || 0;
  const totalCost = records?.reduce((sum, r) => sum + Number(r.total_cost || 0), 0) || 0;
  const avgMpg =
    records?.filter((r) => r.mpg).reduce((sum, r, _, arr) => sum + Number(r.mpg) / arr.length, 0) ||
    0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-fleet-purple/10">
            <Fuel className="w-5 h-5 text-fleet-purple" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Fuel Records</h2>
            <p className="text-sm text-muted-foreground">{records?.length || 0} total records</p>
          </div>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Fuel Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground">Total Gallons</p>
          <p className="text-2xl font-bold">{totalGallons.toFixed(1)}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground">Total Cost</p>
          <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-sm text-muted-foreground">Average MPG</p>
          <p className="text-2xl font-bold">{avgMpg.toFixed(1)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Fuel Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="gasoline">Gasoline</SelectItem>
            <SelectItem value="diesel">Diesel</SelectItem>
            <SelectItem value="electric">Electric</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="cng">CNG</SelectItem>
            <SelectItem value="lpg">LPG</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Fuel Type</TableHead>
              <TableHead>Gallons</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>MPG</TableHead>
              <TableHead>Station</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRecords?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No fuel records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords?.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedRecord(record)}
                >
                  <TableCell>
                    <span className="text-sm">
                      {format(new Date(record.fueled_at), "MMM d, yyyy")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {record.vehicle ? (
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-muted">
                          <Truck className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{record.vehicle.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.vehicle.license_plate}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.driver?.profile?.full_name ? (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{record.driver.profile.full_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{fuelTypeLabels[record.fuel_type]}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{Number(record.quantity_gallons).toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">${Number(record.total_cost || 0).toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    {record.mpg ? (
                      <div className="flex items-center gap-1">
                        {Number(record.mpg) >= avgMpg ? (
                          <TrendingUp className="w-3 h-3 text-fleet-green" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-fleet-orange" />
                        )}
                        <span className="font-medium">{Number(record.mpg).toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm truncate max-w-[150px] block">
                      {record.station_name || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {record.anomaly_flag && (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedRecord(record)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFuelRecord.mutate(record.id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddFuelDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <FuelDetailsSheet
        record={selectedRecord}
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      />
    </motion.div>
  );
}
