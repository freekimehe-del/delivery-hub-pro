import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

const shipmentSchema = z.object({
  customer_id: z.string().optional(),
  shipment_number: z.string().min(1, "Shipment number is required"),
  origin_address: z.string().min(1, "Origin address is required"),
  origin_city: z.string().min(1, "Origin city is required"),
  origin_country: z.string().min(1, "Origin country is required"),
  destination_address: z.string().min(1, "Destination address is required"),
  destination_city: z.string().min(1, "Destination city is required"),
  destination_country: z.string().min(1, "Destination country is required"),
  transport_mode: z.enum(["truck", "sea", "air", "rail", "multi_modal"]),
  service_type: z.enum(["express", "same_day", "standard", "economy"]),
  cargo_description: z.string().optional(),
  cargo_type: z.string().optional(),
  weight_kg: z.number().optional(),
  volume_cbm: z.number().optional(),
  package_count: z.number().optional(),
  declared_value: z.number().optional(),
  currency: z.string().optional(),
  insurance_required: z.boolean().optional(),
  insurance_value: z.number().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  special_instructions: z.string().optional(),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

interface AddShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment?: Tables<"shipments">;
  onSuccess?: () => void;
}

export function AddShipmentDialog({
  open,
  onOpenChange,
  shipment,
  onSuccess,
}: AddShipmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Tables<"customers">[]>([]);
  const { toast } = useToast();

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      customer_id: shipment?.customer_id || "",
      shipment_number: shipment?.shipment_number || `SHIP-${Date.now()}`,
      origin_address: shipment?.origin_address || "",
      origin_city: shipment?.origin_city || "",
      origin_country: shipment?.origin_country || "",
      destination_address: shipment?.destination_address || "",
      destination_city: shipment?.destination_city || "",
      destination_country: shipment?.destination_country || "",
      transport_mode: shipment?.transport_mode || "truck",
      service_type: shipment?.service_type || "standard",
      cargo_description: shipment?.cargo_description || "",
      cargo_type: shipment?.cargo_type || "",
      weight_kg: shipment?.weight_kg || undefined,
      volume_cbm: shipment?.volume_cbm || undefined,
      package_count: shipment?.package_count || undefined,
      declared_value: shipment?.declared_value || undefined,
      currency: shipment?.currency || "PKR",
      insurance_required: shipment?.insurance_required || false,
      insurance_value: shipment?.insurance_value || undefined,
      priority: shipment?.priority || "medium",
      special_instructions: shipment?.special_instructions || "",
    },
  });

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, company_name")
        .order("company_name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  const onSubmit = async (data: ShipmentFormData) => {
    setIsLoading(true);
    try {
      const shipmentData = {
        ...data,
        status: shipment ? shipment.status : "quotation",
        created_by: "current_user", // In a real app, get from auth
      };

      if (shipment) {
        // Update existing shipment
        const { error } = await supabase
          .from("shipments")
          .update(shipmentData)
          .eq("id", shipment.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Shipment updated successfully",
        });
      } else {
        // Create new shipment
        const { error } = await supabase
          .from("shipments")
          .insert([shipmentData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Shipment created successfully",
        });
      }

      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving shipment:", error);
      toast({
        title: "Error",
        description: "Failed to save shipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {shipment ? "Edit Shipment" : "Create New Shipment"}
          </DialogTitle>
          <DialogDescription>
            {shipment
              ? "Update the shipment details below."
              : "Enter the shipment information to create a new shipment."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shipment_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipment Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="SHIP-123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="transport_mode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transport Mode *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transport mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="sea">Sea Freight</SelectItem>
                          <SelectItem value="air">Air Cargo</SelectItem>
                          <SelectItem value="rail">Rail Transport</SelectItem>
                          <SelectItem value="multi_modal">Multi-Modal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="service_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="express">Express</SelectItem>
                          <SelectItem value="same_day">Same Day</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="economy">Economy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Origin Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Origin Details</h3>

              <FormField
                control={form.control}
                name="origin_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter origin address"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origin_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="origin_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Destination Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Destination Details</h3>

              <FormField
                control={form.control}
                name="destination_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter destination address"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destination_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Cargo Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Cargo Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cargo_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Describe the cargo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cargo_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., General, Hazardous, Perishable" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volume_cbm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (CBM)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="package_count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
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
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
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
                      <FormControl>
                        <Input placeholder="PKR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="insurance_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Insurance Required</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("insurance_required") && (
                <FormField
                  control={form.control}
                  name="insurance_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="special_instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter any special handling instructions"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : shipment ? "Update Shipment" : "Create Shipment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}