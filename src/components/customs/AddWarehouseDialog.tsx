import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateWarehouse, type WarehouseType } from "@/hooks/useCustoms";
import { Loader2, Warehouse, FileText, Shield } from "lucide-react";

const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  warehouse_type: z.enum(["private_bonded", "public_bonded", "manufacturing_bond"]),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().optional(),
  capacity_sqft: z.coerce.number().optional(),
  capacity_weight_kg: z.coerce.number().optional(),
  license_number: z.string().optional(),
  license_issue_date: z.string().optional(),
  license_expiry_date: z.string().optional(),
  bank_guarantee_amount: z.coerce.number().optional(),
  bank_guarantee_expiry: z.string().optional(),
  fire_safety_certificate: z.string().optional(),
  fire_safety_expiry: z.string().optional(),
  owner_name: z.string().optional(),
  owner_contact: z.string().optional(),
  notes: z.string().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface AddWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, title: "Basic Info", icon: Warehouse },
  { id: 2, title: "Licensing", icon: FileText },
  { id: 3, title: "Compliance", icon: Shield },
];

export function AddWarehouseDialog({ open, onOpenChange }: AddWarehouseDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const createWarehouse = useCreateWarehouse();

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      warehouse_type: "private_bonded",
    },
  });

  const onSubmit = async (data: WarehouseFormData) => {
    try {
      await createWarehouse.mutateAsync(data as any);
      onOpenChange(false);
      form.reset();
      setCurrentStep(1);
    } catch (error) {
      console.error("Failed to create warehouse:", error);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bonded Warehouse</DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="warehouse_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="private_bonded">Private Bonded Warehouse</SelectItem>
                          <SelectItem value="public_bonded">Public Bonded Warehouse</SelectItem>
                          <SelectItem value="manufacturing_bond">Manufacturing Bond (SME)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warehouse Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter warehouse name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="capacity_sqft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity (sq ft)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Square footage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity_weight_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight Capacity (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Weight capacity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="owner_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Owner/Operator name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="owner_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Licensing */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="license_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Customs warehouse license number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="license_issue_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Issue Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="license_expiry_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bank_guarantee_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Guarantee Amount (PKR)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bank_guarantee_expiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Guarantee Expiry</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Compliance */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="fire_safety_certificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fire Safety Certificate Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Certificate number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fire_safety_expiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fire Safety Certificate Expiry</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any additional compliance notes or requirements" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-2">Required Documents (per Warehousing Rules):</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Site plan with dimensions and layout</li>
                    <li>Bank certificate for financial guarantee</li>
                    <li>Fire safety NOC from local authority</li>
                    <li>Ownership/lease documents</li>
                    <li>Business registration certificate</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < steps.length ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={createWarehouse.isPending}>
                  {createWarehouse.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Warehouse
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
