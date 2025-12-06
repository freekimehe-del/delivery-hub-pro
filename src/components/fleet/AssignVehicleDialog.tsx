import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAvailableVehicles, useDriverById } from "@/hooks/useDriversWithVehicles";
import { useAssignVehicle } from "@/hooks/useDriversMutations";
import { Skeleton } from "@/components/ui/skeleton";

interface AssignVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driverId: string | null;
}

export function AssignVehicleDialog({
  open,
  onOpenChange,
  driverId,
}: AssignVehicleDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const { data: driver, isLoading: driverLoading } = useDriverById(driverId);
  const { data: vehicles = [], isLoading: vehiclesLoading } = useAvailableVehicles();
  const assignVehicle = useAssignVehicle();

  // Include current vehicle in the list
  const allVehicles = driver?.vehicle
    ? [driver.vehicle, ...vehicles.filter((v) => v.id !== driver.vehicle?.id)]
    : vehicles;

  useEffect(() => {
    if (driver?.vehicle_id) {
      setSelectedVehicleId(driver.vehicle_id);
    } else {
      setSelectedVehicleId(null);
    }
  }, [driver]);

  const filteredVehicles = allVehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vehicle_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async () => {
    if (!driverId) return;

    await assignVehicle.mutateAsync({
      driverId,
      vehicleId: selectedVehicleId,
    });
    onOpenChange(false);
  };

  const handleUnassign = async () => {
    if (!driverId) return;

    await assignVehicle.mutateAsync({
      driverId,
      vehicleId: null,
    });
    setSelectedVehicleId(null);
  };

  const formatVehicleType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const isLoading = driverLoading || vehiclesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">
            {driver?.vehicle ? "Change Vehicle Assignment" : "Assign Vehicle"}
          </DialogTitle>
          <DialogDescription>
            {driver?.vehicle
              ? `Currently assigned: ${driver.vehicle.name} (${driver.vehicle.license_plate})`
              : "Select a vehicle to assign to this driver"}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <Input
            placeholder="Search vehicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
        </div>

        <ScrollArea className="max-h-[300px] px-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No available vehicles found</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {filteredVehicles.map((vehicle, index) => {
                const isSelected = selectedVehicleId === vehicle.id;
                const isCurrentlyAssigned = driver?.vehicle_id === vehicle.id;

                return (
                  <motion.button
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedVehicleId(vehicle.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}
                    >
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{vehicle.name}</p>
                        {isCurrentlyAssigned && (
                          <Badge variant="info" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.license_plate} · {formatVehicleType(vehicle.vehicle_type)}
                      </p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                  </motion.button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-4 border-t flex items-center justify-between gap-2">
          {driver?.vehicle && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleUnassign}
              disabled={assignVehicle.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Unassign
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleAssign}
              disabled={
                !selectedVehicleId ||
                selectedVehicleId === driver?.vehicle_id ||
                assignVehicle.isPending
              }
            >
              {assignVehicle.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Vehicle"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
