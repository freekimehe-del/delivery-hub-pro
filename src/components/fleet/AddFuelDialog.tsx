import { useState, useEffect } from "react";
import { CalendarIcon, Fuel } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useVehicles } from "@/hooks/useVehicles";
import { useDriversWithVehicles } from "@/hooks/useDriversWithVehicles";
import { useFuelMutations, useLastFuelRecord } from "@/hooks/useFuel";
import { cn } from "@/lib/utils";

interface AddFuelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFuelDialog({ open, onOpenChange }: AddFuelDialogProps) {
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [fuelType, setFuelType] = useState("gasoline");
  const [quantityGallons, setQuantityGallons] = useState("");
  const [pricePerGallon, setPricePerGallon] = useState("");
  const [odometerReading, setOdometerReading] = useState("");
  const [fullTank, setFullTank] = useState(true);
  const [stationName, setStationName] = useState("");
  const [stationLocation, setStationLocation] = useState("");
  const [fuelCardUsed, setFuelCardUsed] = useState(false);
  const [fueledAt, setFueledAt] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  const { data: vehicles } = useVehicles();
  const { data: driversData } = useDriversWithVehicles();
  const { data: lastFuelRecord } = useLastFuelRecord(vehicleId || null);
  const { createFuelRecord } = useFuelMutations();

  // Calculate total cost
  const totalCost =
    quantityGallons && pricePerGallon
      ? (parseFloat(quantityGallons) * parseFloat(pricePerGallon)).toFixed(2)
      : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !quantityGallons || !pricePerGallon || !odometerReading) return;

    createFuelRecord.mutate(
      {
        vehicle_id: vehicleId,
        driver_id: driverId || undefined,
        fuel_type: fuelType,
        quantity_gallons: parseFloat(quantityGallons),
        price_per_gallon: parseFloat(pricePerGallon),
        odometer_reading: parseInt(odometerReading),
        previous_odometer: lastFuelRecord?.odometer_reading || undefined,
        full_tank: fullTank,
        station_name: stationName || undefined,
        station_location: stationLocation || undefined,
        fuel_card_used: fuelCardUsed,
        fueled_at: fueledAt.toISOString(),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setVehicleId("");
    setDriverId("");
    setFuelType("gasoline");
    setQuantityGallons("");
    setPricePerGallon("");
    setOdometerReading("");
    setFullTank(true);
    setStationName("");
    setStationLocation("");
    setFuelCardUsed(false);
    setFueledAt(new Date());
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-fleet-purple/10">
              <Fuel className="w-5 h-5 text-fleet-purple" />
            </div>
            <div>
              <DialogTitle>Add Fuel Record</DialogTitle>
              <DialogDescription>Log a new fuel purchase for a vehicle.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="vehicle">Vehicle *</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} ({vehicle.license_plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="driver">Driver</Label>
              <Select value={driverId} onValueChange={setDriverId}>
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Select driver (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {driversData?.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.profile?.full_name || "Unknown Driver"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fuelType">Fuel Type</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger id="fuelType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="cng">CNG</SelectItem>
                  <SelectItem value="lpg">LPG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fueled At</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(fueledAt, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fueledAt}
                    onSelect={(date) => date && setFueledAt(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="quantity">Gallons *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={quantityGallons}
                onChange={(e) => setQuantityGallons(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price per Gallon *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={pricePerGallon}
                onChange={(e) => setPricePerGallon(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="col-span-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-primary">${totalCost}</p>
            </div>

            <div className="col-span-2">
              <Label htmlFor="odometer">Odometer Reading *</Label>
              <Input
                id="odometer"
                type="number"
                value={odometerReading}
                onChange={(e) => setOdometerReading(e.target.value)}
                placeholder="Current mileage"
                required
              />
              {lastFuelRecord && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last reading: {lastFuelRecord.odometer_reading.toLocaleString()} miles
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="station">Station Name</Label>
              <Input
                id="station"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="e.g., Shell, BP"
              />
            </div>

            <div>
              <Label htmlFor="location">Station Location</Label>
              <Input
                id="location"
                value={stationLocation}
                onChange={(e) => setStationLocation(e.target.value)}
                placeholder="City, State"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="fullTank" className="cursor-pointer">
                Full Tank
              </Label>
              <Switch id="fullTank" checked={fullTank} onCheckedChange={setFullTank} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <Label htmlFor="fuelCard" className="cursor-pointer">
                Fuel Card Used
              </Label>
              <Switch id="fuelCard" checked={fuelCardUsed} onCheckedChange={setFuelCardUsed} />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !vehicleId ||
                !quantityGallons ||
                !pricePerGallon ||
                !odometerReading ||
                createFuelRecord.isPending
              }
            >
              {createFuelRecord.isPending ? "Adding..." : "Add Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
