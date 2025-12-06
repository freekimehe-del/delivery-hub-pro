import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "dispatched" 
  | "driver_accepted" 
  | "en_route_pickup" 
  | "arrived_pickup" 
  | "picked_up" 
  | "en_route_delivery" 
  | "arrived_delivery" 
  | "delivered" 
  | "failed" 
  | "cancelled" 
  | "rescheduled";

export type ServiceType = "express" | "same_day" | "standard" | "economy";

export interface Order {
  id: string;
  tracking_number: string;
  status: OrderStatus;
  service_type: ServiceType;
  priority: number | null;
  customer_id: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  route_id: string | null;
  dispatch_batch_id: string | null;
  pickup_address: string;
  pickup_city: string | null;
  pickup_state: string | null;
  pickup_postal_code: string | null;
  pickup_contact_name: string | null;
  pickup_contact_phone: string | null;
  pickup_instructions: string | null;
  pickup_coordinates: { lat: number; lng: number } | null;
  pickup_window_start: string | null;
  pickup_window_end: string | null;
  dropoff_address: string;
  dropoff_city: string | null;
  dropoff_state: string | null;
  dropoff_postal_code: string | null;
  dropoff_contact_name: string | null;
  dropoff_contact_phone: string | null;
  dropoff_instructions: string | null;
  dropoff_coordinates: { lat: number; lng: number } | null;
  delivery_window_start: string | null;
  delivery_window_end: string | null;
  package_type: string | null;
  package_weight: number | null;
  package_dimensions: { length: number; width: number; height: number } | null;
  package_count: number | null;
  is_fragile: boolean | null;
  requires_signature: boolean | null;
  estimated_pickup_time: string | null;
  actual_pickup_time: string | null;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  estimated_distance: number | null;
  actual_distance: number | null;
  base_rate: number | null;
  distance_charge: number | null;
  surcharges: number | null;
  total_amount: number | null;
  currency: string | null;
  pod_type: string | null;
  pod_signature_url: string | null;
  pod_photo_urls: string[] | null;
  pod_recipient_name: string | null;
  pod_notes: string | null;
  pod_captured_at: string | null;
  notes: string | null;
  failure_reason: string | null;
  cancellation_reason: string | null;
  customer_reference: string | null;
  external_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Joined data
  customer?: {
    id: string;
    company_name: string;
    email: string;
    phone: string | null;
  } | null;
  driver?: {
    id: string;
    profile?: {
      full_name: string | null;
      phone: string | null;
    } | null;
  } | null;
  vehicle?: {
    id: string;
    name: string;
    license_plate: string;
  } | null;
}

export function useOrders(statusFilter?: OrderStatus | OrderStatus[]) {
  return useQuery({
    queryKey: ["orders", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(`
          *,
          customer:customers(id, company_name, email, phone),
          driver:drivers(id, profile:profiles(full_name, phone)),
          vehicle:vehicles(id, name, license_plate)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter) {
        if (Array.isArray(statusFilter)) {
          query = query.in("status", statusFilter);
        } else {
          query = query.eq("status", statusFilter);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customers(id, company_name, email, phone),
          driver:drivers(id, profile:profiles(full_name, phone)),
          vehicle:vehicles(id, name, license_plate)
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data as Order;
    },
    enabled: !!orderId,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: ["order-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("status");

      if (error) throw error;

      const stats = {
        pending: 0,
        dispatched: 0,
        in_transit: 0,
        delivered: 0,
        failed: 0,
        total: data.length,
      };

      data.forEach((order) => {
        if (order.status === "pending" || order.status === "confirmed") {
          stats.pending++;
        } else if (order.status === "dispatched" || order.status === "driver_accepted") {
          stats.dispatched++;
        } else if (
          ["en_route_pickup", "arrived_pickup", "picked_up", "en_route_delivery", "arrived_delivery"].includes(order.status)
        ) {
          stats.in_transit++;
        } else if (order.status === "delivered") {
          stats.delivered++;
        } else if (order.status === "failed" || order.status === "cancelled") {
          stats.failed++;
        }
      });

      return stats;
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: Partial<Order>) => {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          tracking_number: `FB${Date.now()}`,
          pickup_address: orderData.pickup_address || "",
          dropoff_address: orderData.dropoff_address || "",
          status: "pending",
          service_type: orderData.service_type || "standard",
          ...orderData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Order created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create order: " + error.message);
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Order> & { id: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", data.id] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Order updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });
}

export function useDispatchOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      driverId,
      vehicleId,
    }: {
      orderId: string;
      driverId: string;
      vehicleId?: string;
    }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          driver_id: driverId,
          vehicle_id: vehicleId,
          status: "dispatched",
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Order dispatched successfully");
    },
    onError: (error) => {
      toast.error("Failed to dispatch order: " + error.message);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
      notes,
    }: {
      orderId: string;
      status: OrderStatus;
      notes?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (status === "picked_up") {
        updateData.actual_pickup_time = new Date().toISOString();
      } else if (status === "delivered") {
        updateData.actual_delivery_time = new Date().toISOString();
      }

      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Order status updated");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });
}

export function useCapturePOD() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      recipientName,
      signatureUrl,
      photoUrls,
      notes,
    }: {
      orderId: string;
      recipientName: string;
      signatureUrl?: string;
      photoUrls?: string[];
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          pod_recipient_name: recipientName,
          pod_signature_url: signatureUrl,
          pod_photo_urls: photoUrls,
          pod_notes: notes,
          pod_captured_at: new Date().toISOString(),
          actual_delivery_time: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Proof of delivery captured");
    },
    onError: (error) => {
      toast.error("Failed to capture POD: " + error.message);
    },
  });
}
