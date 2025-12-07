import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
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
import { useMaintenance, useMaintenanceMutations, MaintenanceRecord } from "@/hooks/useMaintenance";
import { AddMaintenanceDialog } from "./AddMaintenanceDialog";
import { MaintenanceDetailsSheet } from "./MaintenanceDetailsSheet";

const statusConfig = {
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", icon: Calendar, className: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", icon: Wrench, className: "bg-fleet-orange/10 text-fleet-orange" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-fleet-green/10 text-fleet-green" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

const priorityConfig = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-primary/10 text-primary" },
  high: { label: "High", className: "bg-fleet-orange/10 text-fleet-orange" },
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive" },
};

const typeConfig = {
  scheduled: "Scheduled",
  repair: "Repair",
  inspection: "Inspection",
  recall: "Recall",
  emergency: "Emergency",
};

export function MaintenanceTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);

  const { data: records, isLoading } = useMaintenance();
  const { deleteMaintenance } = useMaintenanceMutations();

  const filteredRecords = records?.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vehicle?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vehicle?.license_plate?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || record.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
          <div className="p-2 rounded-lg bg-fleet-orange/10">
            <Wrench className="w-5 h-5 text-fleet-orange" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Maintenance Records</h2>
            <p className="text-sm text-muted-foreground">
              {records?.length || 0} total records
            </p>
          </div>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Title</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredRecords?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No maintenance records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords?.map((record) => {
                const status = statusConfig[record.status];
                const priority = priorityConfig[record.priority];
                const StatusIcon = status.icon;

                return (
                  <TableRow
                    key={record.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedRecord(record)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.title}</p>
                        {record.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {record.description}
                          </p>
                        )}
                      </div>
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
                      <span className="text-sm">{typeConfig[record.maintenance_type]}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priority.className}>
                        {priority.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1 ${status.className}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.scheduled_date ? (
                        <span className="text-sm">
                          {format(new Date(record.scheduled_date), "MMM d, yyyy")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.total_cost ? (
                        <span className="font-medium">${record.total_cost.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
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
                              deleteMaintenance.mutate(record.id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AddMaintenanceDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <MaintenanceDetailsSheet
        record={selectedRecord}
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      />
    </motion.div>
  );
}
