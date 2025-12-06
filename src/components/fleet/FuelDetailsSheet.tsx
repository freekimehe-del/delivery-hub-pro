import { format } from "date-fns";
import {
  Fuel,
  Truck,
  User,
  MapPin,
  Calendar,
  Gauge,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FuelRecord, useFuelMutations } from "@/hooks/useFuel";

interface FuelDetailsSheetProps {
  record: FuelRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fuelTypeLabels: Record<string, string> = {
  gasoline: "Gasoline",
  diesel: "Diesel",
  electric: "Electric",
  hybrid: "Hybrid",
  cng: "CNG",
  lpg: "LPG",
};

export function FuelDetailsSheet({ record, open, onOpenChange }: FuelDetailsSheetProps) {
  const { updateFuelRecord } = useFuelMutations();

  if (!record) return null;

  const handleToggleAnomaly = () => {
    updateFuelRecord.mutate({
      id: record.id,
      anomaly_flag: !record.anomaly_flag,
      anomaly_reason: !record.anomaly_flag ? "Manually flagged for review" : undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fleet-purple/10">
              <Fuel className="w-5 h-5 text-fleet-purple" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-left">Fuel Record</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {format(new Date(record.fueled_at), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Anomaly Alert */}
          {record.anomaly_flag && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Anomaly Detected</p>
                <p className="text-sm text-muted-foreground">
                  {record.anomaly_reason || "This fuel record has been flagged for review."}
                </p>
              </div>
            </div>
          )}

          {/* Cost Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Gallons</p>
              <p className="text-xl font-bold">{Number(record.quantity_gallons).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Price/Gal</p>
              <p className="text-xl font-bold">${Number(record.price_per_gallon).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary">
                ${Number(record.total_cost || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Vehicle Info */}
          {record.vehicle && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-background">
                <Truck className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{record.vehicle.name}</p>
                <p className="text-sm text-muted-foreground">{record.vehicle.license_plate}</p>
              </div>
            </div>
          )}

          {/* Driver Info */}
          {record.driver?.profile?.full_name && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-background">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{record.driver.profile.full_name}</p>
                <p className="text-sm text-muted-foreground">Driver</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Fuel className="w-3 h-3" /> Fuel Type
              </p>
              <p className="text-sm font-medium">{fuelTypeLabels[record.fuel_type]}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Gauge className="w-3 h-3" /> Odometer
              </p>
              <p className="text-sm font-medium">
                {record.odometer_reading.toLocaleString()} miles
              </p>
            </div>
            {record.miles_driven && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Miles Driven</p>
                <p className="text-sm font-medium">
                  {Number(record.miles_driven).toLocaleString()} miles
                </p>
              </div>
            )}
            {record.mpg && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Fuel Efficiency</p>
                <div className="flex items-center gap-1">
                  {Number(record.mpg) >= 20 ? (
                    <TrendingUp className="w-4 h-4 text-fleet-green" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-fleet-orange" />
                  )}
                  <p className="text-sm font-medium">{Number(record.mpg).toFixed(1)} MPG</p>
                </div>
              </div>
            )}
          </div>

          {/* Station Info */}
          {(record.station_name || record.station_location) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Station
                </p>
                {record.station_name && (
                  <p className="text-sm">{record.station_name}</p>
                )}
                {record.station_location && (
                  <p className="text-sm text-muted-foreground">{record.station_location}</p>
                )}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {record.full_tank && (
              <Badge variant="outline" className="gap-1">
                <Fuel className="w-3 h-3" /> Full Tank
              </Badge>
            )}
            {record.fuel_card_used && (
              <Badge variant="outline" className="gap-1">
                <CreditCard className="w-3 h-3" /> Fuel Card
              </Badge>
            )}
          </div>

          {/* Notes */}
          {record.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Notes</p>
                <p className="text-sm text-muted-foreground">{record.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex gap-2">
            <Button
              variant={record.anomaly_flag ? "outline" : "destructive"}
              size="sm"
              onClick={handleToggleAnomaly}
              disabled={updateFuelRecord.isPending}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {record.anomaly_flag ? "Clear Anomaly" : "Flag as Anomaly"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
