import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useCreateDriver, CreateDriverData } from "@/hooks/useDriversMutations";
import { cn } from "@/lib/utils";
import type { DriverStatus } from "@/hooks/useDrivers";

interface AddDriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, title: "Basic Info", icon: Users },
  { id: 2, title: "License", icon: FileText },
  { id: 3, title: "Schedule", icon: Clock },
];

const statusOptions: { value: DriverStatus; label: string }[] = [
  { value: "pending", label: "Pending Approval" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function AddDriverDialog({ open, onOpenChange }: AddDriverDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateDriverData>({
    employee_id: "",
    license_number: "",
    license_expiry: "",
    status: "pending",
    shift_start: "",
    shift_end: "",
  });

  const createDriver = useCreateDriver();

  const updateField = (field: keyof CreateDriverData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Clean up empty strings
    const cleanedData = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== "" && v !== undefined)
    ) as CreateDriverData;

    await createDriver.mutateAsync(cleanedData);
    onOpenChange(false);
    setCurrentStep(1);
    setFormData({
      employee_id: "",
      license_number: "",
      license_expiry: "",
      status: "pending",
      shift_start: "",
      shift_end: "",
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.employee_id;
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl">Add New Driver</DialogTitle>
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
                  <div className="space-y-2">
                    <Label htmlFor="employee_id">Employee ID *</Label>
                    <Input
                      id="employee_id"
                      placeholder="e.g., DRV-001"
                      value={formData.employee_id}
                      onChange={(e) => updateField("employee_id", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Unique identifier for this driver
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v: DriverStatus) => updateField("status", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_number">License Number</Label>
                    <Input
                      id="license_number"
                      placeholder="e.g., DL-12345678"
                      value={formData.license_number}
                      onChange={(e) => updateField("license_number", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_expiry">License Expiry Date</Label>
                    <Input
                      id="license_expiry"
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) => updateField("license_expiry", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shift_start">Shift Start</Label>
                      <Input
                        id="shift_start"
                        type="time"
                        value={formData.shift_start?.slice(0, 5) || ""}
                        onChange={(e) =>
                          updateField("shift_start", e.target.value ? `${e.target.value}:00` : "")
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift_end">Shift End</Label>
                      <Input
                        id="shift_end"
                        type="time"
                        value={formData.shift_end?.slice(0, 5) || ""}
                        onChange={(e) =>
                          updateField("shift_end", e.target.value ? `${e.target.value}:00` : "")
                        }
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Define the default working hours for this driver. This helps with scheduling
                    and compliance tracking.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {currentStep < steps.length ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed()}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleSubmit}
                disabled={createDriver.isPending}
              >
                {createDriver.isPending ? "Adding..." : "Add Driver"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
