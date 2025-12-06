import { useState } from "react";
import { format } from "date-fns";
import {
  Wrench,
  Truck,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle2,
  Play,
  XCircle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceRecord, useMaintenanceMutations } from "@/hooks/useMaintenance";

interface MaintenanceDetailsSheetProps {
  record: MaintenanceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", className: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", className: "bg-fleet-orange/10 text-fleet-orange" },
  completed: { label: "Completed", className: "bg-fleet-green/10 text-fleet-green" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
};

const priorityConfig = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-primary/10 text-primary" },
  high: { label: "High", className: "bg-fleet-orange/10 text-fleet-orange" },
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive" },
};

export function MaintenanceDetailsSheet({
  record,
  open,
  onOpenChange,
}: MaintenanceDetailsSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [laborCost, setLaborCost] = useState("");
  const [partsCost, setPartsCost] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [technicianName, setTechnicianName] = useState("");

  const { updateMaintenance } = useMaintenanceMutations();

  if (!record) return null;

  const status = statusConfig[record.status];
  const priority = priorityConfig[record.priority];

  const handleStatusChange = (newStatus: string) => {
    const updates: Record<string, unknown> = { id: record.id, status: newStatus };
    if (newStatus === "in_progress") {
      updates.started_at = new Date().toISOString();
    } else if (newStatus === "completed") {
      updates.completed_at = new Date().toISOString();
    }
    updateMaintenance.mutate(updates as Parameters<typeof updateMaintenance.mutate>[0]);
  };

  const handleSaveCosts = () => {
    updateMaintenance.mutate(
      {
        id: record.id,
        labor_cost: laborCost ? parseFloat(laborCost) : undefined,
        parts_cost: partsCost ? parseFloat(partsCost) : undefined,
        work_performed: workPerformed || undefined,
        technician_name: technicianName || undefined,
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fleet-orange/10">
              <Wrench className="w-5 h-5 text-fleet-orange" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-left">{record.title}</SheetTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {record.maintenance_type} Maintenance
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status & Priority */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
            <Badge variant="outline" className={priority.className}>
              {priority.label} Priority
            </Badge>
          </div>

          {/* Quick Actions */}
          {record.status !== "completed" && record.status !== "cancelled" && (
            <div className="flex gap-2">
              {record.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("scheduled")}
                  disabled={updateMaintenance.isPending}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              )}
              {(record.status === "pending" || record.status === "scheduled") && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={updateMaintenance.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Work
                </Button>
              )}
              {record.status === "in_progress" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("completed")}
                  disabled={updateMaintenance.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => handleStatusChange("cancelled")}
                disabled={updateMaintenance.isPending}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          <Separator />

          {/* Vehicle Info */}
          {record.vehicle && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-background">
                <Truck className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{record.vehicle.name}</p>
                <p className="text-sm text-muted-foreground">
                  {record.vehicle.license_plate}
                </p>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Scheduled
              </p>
              <p className="text-sm font-medium">
                {record.scheduled_date
                  ? format(new Date(record.scheduled_date), "MMM d, yyyy")
                  : "-"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Triggered By
              </p>
              <p className="text-sm font-medium capitalize">{record.triggered_by}</p>
            </div>
            {record.started_at && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="text-sm font-medium">
                  {format(new Date(record.started_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            )}
            {record.completed_at && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm font-medium">
                  {format(new Date(record.completed_at), "MMM d, yyyy h:mm a")}
                </p>
              </div>
            )}
          </div>

          {record.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{record.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Costs Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Costs
              </p>
              {!isEditing && record.status !== "completed" && (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="labor">Labor Cost</Label>
                    <Input
                      id="labor"
                      type="number"
                      value={laborCost}
                      onChange={(e) => setLaborCost(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parts">Parts Cost</Label>
                    <Input
                      id="parts"
                      type="number"
                      value={partsCost}
                      onChange={(e) => setPartsCost(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="technician">Technician</Label>
                  <Input
                    id="technician"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    placeholder="Technician name"
                  />
                </div>
                <div>
                  <Label htmlFor="work">Work Performed</Label>
                  <Textarea
                    id="work"
                    value={workPerformed}
                    onChange={(e) => setWorkPerformed(e.target.value)}
                    placeholder="Describe the work done..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveCosts} disabled={updateMaintenance.isPending}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Labor</p>
                  <p className="font-medium">${record.labor_cost?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Parts</p>
                  <p className="font-medium">${record.parts_cost?.toFixed(2) || "0.00"}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold text-primary">
                    ${record.total_cost?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Vendor & Notes */}
          {(record.vendor_name || record.technician_name || record.work_performed) && (
            <>
              <Separator />
              <div className="space-y-3">
                {record.vendor_name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Vendor / Shop</p>
                    <p className="text-sm font-medium">{record.vendor_name}</p>
                  </div>
                )}
                {record.technician_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{record.technician_name}</p>
                  </div>
                )}
                {record.work_performed && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Work Performed</p>
                    <p className="text-sm">{record.work_performed}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {record.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Notes</p>
                <p className="text-sm text-muted-foreground">{record.notes}</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
