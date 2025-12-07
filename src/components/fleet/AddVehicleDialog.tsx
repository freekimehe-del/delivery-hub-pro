import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Car, FileText, Shield, Wrench, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateVehicle, CreateVehicleData } from "@/hooks/useVehicles";
import { cn } from "@/lib/utils";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, title: "Basic Info", icon: Car },
  { id: 2, title: "Registration", icon: FileText },
  { id: 3, title: "Acquisition", icon: CreditCard },
  { id: 4, title: "Insurance", icon: Shield },
  { id: 5, title: "Telematics", icon: Wrench },
];

const vehicleTypes = [
  "van",
  "truck",
  "car",
  "motorcycle",
  "bicycle",
  "heavy_truck",
  "trailer",
];

const fuelTypes = ["gasoline", "diesel", "electric", "hybrid", "cng", "lpg"];

const conditions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
];

export function AddVehicleDialog({ open, onOpenChange }: AddVehicleDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateVehicleData>({
    name: "",
    license_plate: "",
    vehicle_type: "van",
    vin: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    fuel_type: "gasoline",
    mileage: 0,
    capacity_weight: undefined,
    capacity_volume: undefined,
    registration_expiry: "",
    insurance_expiry: "",
    acquisition_type: "purchase",
    acquisition_date: "",
    acquisition_cost: undefined,
    lease_end_date: "",
    monthly_lease_cost: undefined,
    warranty_expiry: "",
    telematics_device_id: "",
    fuel_card_number: "",
    notes: "",
    condition: "excellent",
    purchase_vendor: "",
    insurance_provider: "",
    insurance_policy_number: "",
  });

  const createVehicle = useCreateVehicle();

  const updateField = (field: keyof CreateVehicleData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Clean up empty strings to undefined
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== "" && v !== undefined)
    ) as CreateVehicleData;

    await createVehicle.mutateAsync(cleanedData);
    onOpenChange(false);
    setCurrentStep(1);
    setFormData({
      name: "",
      license_plate: "",
      vehicle_type: "van",
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.license_plate && formData.vehicle_type;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Add New Vehicle</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1",
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Vehicle Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Truck-001"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                      <Select
                        value={formData.vehicle_type}
                        onValueChange={(v) => updateField("vehicle_type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        placeholder="e.g., Ford"
                        value={formData.make}
                        onChange={(e) => updateField("make", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        placeholder="e.g., Transit"
                        value={formData.model}
                        onChange={(e) => updateField("model", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => updateField("year", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        placeholder="e.g., White"
                        value={formData.color}
                        onChange={(e) => updateField("color", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuel_type">Fuel Type</Label>
                      <Select
                        value={formData.fuel_type}
                        onValueChange={(v) => updateField("fuel_type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(v: any) => updateField("condition", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditions.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity_weight">Capacity (kg)</Label>
                      <Input
                        id="capacity_weight"
                        type="number"
                        placeholder="e.g., 1500"
                        value={formData.capacity_weight || ""}
                        onChange={(e) =>
                          updateField("capacity_weight", e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity_volume">Volume (m³)</Label>
                      <Input
                        id="capacity_volume"
                        type="number"
                        placeholder="e.g., 12"
                        value={formData.capacity_volume || ""}
                        onChange={(e) =>
                          updateField("capacity_volume", e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="license_plate">License Plate *</Label>
                      <Input
                        id="license_plate"
                        placeholder="e.g., ABC-1234"
                        value={formData.license_plate}
                        onChange={(e) => updateField("license_plate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vin">VIN (Vehicle ID Number)</Label>
                      <Input
                        id="vin"
                        placeholder="17-character VIN"
                        value={formData.vin}
                        onChange={(e) => updateField("vin", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registration_expiry">Registration Expiry</Label>
                      <Input
                        id="registration_expiry"
                        type="date"
                        value={formData.registration_expiry}
                        onChange={(e) => updateField("registration_expiry", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileage">Current Mileage</Label>
                      <Input
                        id="mileage"
                        type="number"
                        placeholder="e.g., 45000"
                        value={formData.mileage || ""}
                        onChange={(e) =>
                          updateField("mileage", e.target.value ? parseInt(e.target.value) : 0)
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acquisition_type">Acquisition Type</Label>
                      <Select
                        value={formData.acquisition_type}
                        onValueChange={(v: any) => updateField("acquisition_type", v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase">Purchase</SelectItem>
                          <SelectItem value="lease">Lease</SelectItem>
                          <SelectItem value="rental">Rental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acquisition_date">Acquisition Date</Label>
                      <Input
                        id="acquisition_date"
                        type="date"
                        value={formData.acquisition_date}
                        onChange={(e) => updateField("acquisition_date", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acquisition_cost">
                        {formData.acquisition_type === "purchase" ? "Purchase Price" : "Total Cost"}
                      </Label>
                      <Input
                        id="acquisition_cost"
                        type="number"
                        placeholder="e.g., 35000"
                        value={formData.acquisition_cost || ""}
                        onChange={(e) =>
                          updateField("acquisition_cost", e.target.value ? parseFloat(e.target.value) : undefined)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase_vendor">Vendor/Dealer</Label>
                      <Input
                        id="purchase_vendor"
                        placeholder="e.g., City Motors"
                        value={formData.purchase_vendor}
                        onChange={(e) => updateField("purchase_vendor", e.target.value)}
                      />
                    </div>
                  </div>
                  {formData.acquisition_type === "lease" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monthly_lease_cost">Monthly Lease Cost</Label>
                        <Input
                          id="monthly_lease_cost"
                          type="number"
                          placeholder="e.g., 750"
                          value={formData.monthly_lease_cost || ""}
                          onChange={(e) =>
                            updateField("monthly_lease_cost", e.target.value ? parseFloat(e.target.value) : undefined)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lease_end_date">Lease End Date</Label>
                        <Input
                          id="lease_end_date"
                          type="date"
                          value={formData.lease_end_date}
                          onChange={(e) => updateField("lease_end_date", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                    <Input
                      id="warranty_expiry"
                      type="date"
                      value={formData.warranty_expiry}
                      onChange={(e) => updateField("warranty_expiry", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance_provider">Insurance Provider</Label>
                      <Input
                        id="insurance_provider"
                        placeholder="e.g., State Farm"
                        value={formData.insurance_provider}
                        onChange={(e) => updateField("insurance_provider", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance_policy_number">Policy Number</Label>
                      <Input
                        id="insurance_policy_number"
                        placeholder="e.g., POL-123456"
                        value={formData.insurance_policy_number}
                        onChange={(e) => updateField("insurance_policy_number", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance_expiry">Insurance Expiry Date</Label>
                    <Input
                      id="insurance_expiry"
                      type="date"
                      value={formData.insurance_expiry}
                      onChange={(e) => updateField("insurance_expiry", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telematics_device_id">Telematics Device ID</Label>
                      <Input
                        id="telematics_device_id"
                        placeholder="e.g., GPS-001234"
                        value={formData.telematics_device_id}
                        onChange={(e) => updateField("telematics_device_id", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuel_card_number">Fuel Card Number</Label>
                      <Input
                        id="fuel_card_number"
                        placeholder="e.g., FC-789012"
                        value={formData.fuel_card_number}
                        onChange={(e) => updateField("fuel_card_number", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this vehicle..."
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between border-t border-border mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep < 5 ? (
              <Button
                onClick={() => setCurrentStep((p) => p + 1)}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleSubmit}
                disabled={!canProceed() || createVehicle.isPending}
              >
                {createVehicle.isPending ? "Adding..." : "Add Vehicle"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
