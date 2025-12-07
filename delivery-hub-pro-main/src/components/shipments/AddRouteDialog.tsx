import { useState } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

const routeSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  origin_country: z.string().min(1, "Origin country is required"),
  origin_city: z.string().min(1, "Origin city is required"),
  destination_country: z.string().min(1, "Destination country is required"),
  destination_city: z.string().min(1, "Destination city is required"),
  transport_mode: z.enum(["truck", "sea", "air", "rail", "multi_modal"]),
  distance_km: z.number().optional(),
  estimated_duration_hours: z.number().optional(),
  border_crossings: z.string().optional(),
});

type RouteFormData = z.infer<typeof routeSchema>;

interface AddRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: Tables<"routes">;
  onSuccess?: () => void;
}

export function AddRouteDialog({
  open,
  onOpenChange,
  route,
  onSuccess,
}: AddRouteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: route?.name || "",
      origin_country: route?.origin_country || "",
      origin_city: route?.origin_city || "",
      destination_country: route?.destination_country || "",
      destination_city: route?.destination_city || "",
      transport_mode: route?.transport_mode || "truck",
      distance_km: route?.distance_km || undefined,
      estimated_duration_hours: route?.estimated_duration_hours || undefined,
      border_crossings: route?.border_crossings ? JSON.stringify(route.border_crossings) : "",
    },
  });

  const onSubmit = async (data: RouteFormData) => {
    setIsLoading(true);
    try {
      const routeData = {
        ...data,
        border_crossings: data.border_crossings ? JSON.parse(data.border_crossings) : null,
        is_active: route ? route.is_active : true,
      };

      if (route) {
        // Update existing route
        const { error } = await supabase
          .from("routes")
          .update(routeData)
          .eq("id", route.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Route updated successfully",
        });
      } else {
        // Create new route
        const { error } = await supabase
          .from("routes")
          .insert([routeData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Route added successfully",
        });
      }

      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving route:", error);
      toast({
        title: "Error",
        description: "Failed to save route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {route ? "Edit Route" : "Add New Route"}
          </DialogTitle>
          <DialogDescription>
            {route
              ? "Update the route information below."
              : "Enter the route details to add them to your system."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Karachi to Kabul via Torkham" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {/* Origin Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Origin</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origin_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Pakistan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="origin_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin City *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Karachi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Destination Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Destination</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="destination_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination Country *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Afghanistan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination City *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kabul" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Route Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Route Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="distance_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (km)</FormLabel>
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
                  name="estimated_duration_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours)</FormLabel>
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

              <FormField
                control={form.control}
                name="border_crossings"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Border Crossings (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='["Torkham Border", "Spin Boldak"]'
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
                {isLoading ? "Saving..." : route ? "Update Route" : "Add Route"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}