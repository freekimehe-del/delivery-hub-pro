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
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateConsignment, useHSCodes, useWarehouses, type ConsignmentType } from "@/hooks/useCustoms";
import { Loader2, Package, FileText, Truck, Warehouse } from "lucide-react";

const consignmentSchema = z.object({
  consignment_type: z.enum(["import", "export", "transit", "temporary_import"]),
  importer_exporter_name: z.string().min(1, "Name is required"),
  importer_exporter_ntn: z.string().optional(),
  import_license_number: z.string().optional(),
  hs_code_id: z.string().optional(),
  goods_description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  quantity_unit: z.string().default("KG"),
  declared_value: z.coerce.number().min(0, "Value must be positive"),
  currency: z.string().default("PKR"),
  country_of_origin: z.string().optional(),
  warehouse_id: z.string().optional(),
  is_perishable: z.boolean().default(false),
  is_life_saving_drug: z.boolean().default(false),
  requires_urgent_release: z.boolean().default(false),
  carnet_number: z.string().optional(),
  vehicle_registration: z.string().optional(),
  bank_guarantee_amount: z.coerce.number().optional(),
  vessel_flight_number: z.string().optional(),
  port_of_origin: z.string().optional(),
  port_of_destination: z.string().optional(),
  arrival_date: z.string().optional(),
  notes: z.string().optional(),
});

type ConsignmentFormData = z.infer<typeof consignmentSchema>;

interface AddConsignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: 1, title: "Basic Info", icon: Package },
  { id: 2, title: "Goods Details", icon: FileText },
  { id: 3, title: "Transport", icon: Truck },
  { id: 4, title: "Warehousing", icon: Warehouse },
];

export function AddConsignmentDialog({ open, onOpenChange }: AddConsignmentDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { data: hsCodes } = useHSCodes();
  const { data: warehouses } = useWarehouses();
  const createConsignment = useCreateConsignment();

  const form = useForm<ConsignmentFormData>({
    resolver: zodResolver(consignmentSchema),
    defaultValues: {
      consignment_type: "import",
      quantity_unit: "KG",
      currency: "PKR",
      is_perishable: false,
      is_life_saving_drug: false,
      requires_urgent_release: false,
    },
  });

  const consignmentType = form.watch("consignment_type");

  const onSubmit = async (data: ConsignmentFormData) => {
    try {
      await createConsignment.mutateAsync(data as any);
      onOpenChange(false);
      form.reset();
      setCurrentStep(1);
    } catch (error) {
      console.error("Failed to create consignment:", error);
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
          <DialogTitle>New Consignment</DialogTitle>
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
                <div className={`w-8 h-0.5 mx-2 ${
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
                  name="consignment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consignment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="import">Import</SelectItem>
                          <SelectItem value="export">Export</SelectItem>
                          <SelectItem value="transit">Transit</SelectItem>
                          <SelectItem value="temporary_import">Temporary Import (Vehicle)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="importer_exporter_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{consignmentType === "export" ? "Exporter" : "Importer"} Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Company or individual name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="importer_exporter_ntn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NTN Number</FormLabel>
                        <FormControl>
                          <Input placeholder="National Tax Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="import_license_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Import License #</FormLabel>
                        <FormControl>
                          <Input placeholder="If applicable" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Goods Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hs_code_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HS Code</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select HS Code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hsCodes?.map((hs) => (
                            <SelectItem key={hs.id} value={hs.id}>
                              {hs.code} - {hs.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goods_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goods Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed description of goods" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="KG">Kilograms (KG)</SelectItem>
                            <SelectItem value="MT">Metric Tons (MT)</SelectItem>
                            <SelectItem value="PCS">Pieces (PCS)</SelectItem>
                            <SelectItem value="CBM">Cubic Meters (CBM)</SelectItem>
                            <SelectItem value="LTR">Liters (LTR)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country_of_origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Origin</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., China" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="declared_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Declared Value</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="is_perishable"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Perishable Goods</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_life_saving_drug"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Life-Saving Drug</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requires_urgent_release"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="!mt-0">Requires Urgent Release</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Transport */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="vessel_flight_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vessel/Flight Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MV COSCO or PK-302" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="port_of_origin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port of Origin</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Shanghai" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="port_of_destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port of Destination</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Karachi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="arrival_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {consignmentType === "temporary_import" && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3">Temporary Import (Vehicle) Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="carnet_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Carnet-de-Passage Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Carnet number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vehicle_registration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Registration</FormLabel>
                              <FormControl>
                                <Input placeholder="Registration number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bank_guarantee_amount"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Bank Guarantee Amount (PKR)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="For extended import duration" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 4: Warehousing */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="warehouse_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonded Warehouse (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse for bonding" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses?.filter(w => w.license_status === "active").map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.code} - {warehouse.name} ({warehouse.warehouse_type.replace("_", " ")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        <Textarea placeholder="Any special instructions or notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <Button type="submit" disabled={createConsignment.isPending}>
                  {createConsignment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Consignment
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
