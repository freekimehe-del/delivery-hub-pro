import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type DispatchBatchStatus = "pending" | "dispatched" | "in_progress" | "completed";

export interface DispatchBatch {
  id: string;
  batch_number: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: DispatchBatchStatus;
  priority: string;
  total_orders: number;
  dispatched_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
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
  orders?: {
    id: string;
    order_id: string;
    sequence_number: number;
    order?: {
      id: string;
      tracking_number: string;
      status: string;
      pickup_address: string;
      dropoff_address: string;
      customer?: {
        company_name: string;
      } | null;
    };
  }[];
}

export function useDispatchBatches(statusFilter?: DispatchBatchStatus | DispatchBatchStatus[]) {
  return useQuery({
    queryKey: ["dispatch-batches", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("dispatch_batches")
        .select(`
          *,
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
      return data as DispatchBatch[];
    },
  });
}

export function useDispatchBatch(batchId: string | null) {
  return useQuery({
    queryKey: ["dispatch-batch", batchId],
    queryFn: async () => {
      if (!batchId) return null;

      const { data: batch, error: batchError } = await supabase
        .from("dispatch_batches")
        .select(`
          *,
          driver:drivers(id, profile:profiles(full_name, phone)),
          vehicle:vehicles(id, name, license_plate)
        `)
        .eq("id", batchId)
        .single();

      if (batchError) throw batchError;

      const { data: batchOrders, error: ordersError } = await supabase
        .from("dispatch_batch_orders")
        .select(`
          id,
          order_id,
          sequence_number,
          order:orders(
            id,
            tracking_number,
            status,
            pickup_address,
            dropoff_address,
            customer:customers(company_name)
          )
        `)
        .eq("dispatch_batch_id", batchId)
        .order("sequence_number", { ascending: true });

      if (ordersError) throw ordersError;

      return { ...batch, orders: batchOrders } as DispatchBatch;
    },
    enabled: !!batchId,
  });
}

export function useDispatchStats() {
  return useQuery({
    queryKey: ["dispatch-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatch_batches")
        .select("status, total_orders");

      if (error) throw error;

      const stats = {
        pending: 0,
        dispatched: 0,
        in_progress: 0,
        completed: 0,
        total_orders: 0,
      };

      data.forEach((batch) => {
        if (batch.status === "pending") stats.pending++;
        else if (batch.status === "dispatched") stats.dispatched++;
        else if (batch.status === "in_progress") stats.in_progress++;
        else if (batch.status === "completed") stats.completed++;
        stats.total_orders += batch.total_orders || 0;
      });

      return stats;
    },
  });
}

export function useCreateDispatchBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchData: {
      driver_id?: string;
      vehicle_id?: string;
      priority?: string;
      notes?: string;
      order_ids: string[];
    }) => {
      const { order_ids, ...batchFields } = batchData;

      // Create dispatch batch
      const { data: batch, error: batchError } = await supabase
        .from("dispatch_batches")
        .insert({
          batch_number: `DSP${Date.now()}`,
          status: "pending",
          total_orders: order_ids.length,
          ...batchFields,
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Create batch order links
      const batchOrders = order_ids.map((orderId, index) => ({
        dispatch_batch_id: batch.id,
        order_id: orderId,
        sequence_number: index + 1,
      }));

      const { error: linksError } = await supabase
        .from("dispatch_batch_orders")
        .insert(batchOrders);

      if (linksError) throw linksError;

      // Update orders with dispatch batch ID and status
      const { error: ordersError } = await supabase
        .from("orders")
        .update({
          dispatch_batch_id: batch.id,
          driver_id: batchData.driver_id,
          vehicle_id: batchData.vehicle_id,
        })
        .in("id", order_ids);

      if (ordersError) throw ordersError;

      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-batches"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Dispatch batch created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create dispatch batch: " + error.message);
    },
  });
}

export function useDispatchBatchAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      batchId,
      action,
    }: {
      batchId: string;
      action: "dispatch" | "start" | "complete" | "cancel";
    }) => {
      let updateData: Record<string, unknown> = {};

      switch (action) {
        case "dispatch":
          updateData = {
            status: "dispatched",
            dispatched_at: new Date().toISOString(),
          };
          break;
        case "start":
          updateData = { status: "in_progress" };
          break;
        case "complete":
          updateData = {
            status: "completed",
            completed_at: new Date().toISOString(),
          };
          break;
        case "cancel":
          updateData = { status: "pending" };
          break;
      }

      const { data, error } = await supabase
        .from("dispatch_batches")
        .update(updateData)
        .eq("id", batchId)
        .select()
        .single();

      if (error) throw error;

      // Update order statuses if dispatching
      if (action === "dispatch") {
        const { data: batchOrders } = await supabase
          .from("dispatch_batch_orders")
          .select("order_id")
          .eq("dispatch_batch_id", batchId);

        if (batchOrders && batchOrders.length > 0) {
          const orderIds = batchOrders.map((bo) => bo.order_id);
          await supabase
            .from("orders")
            .update({ status: "dispatched" })
            .in("id", orderIds);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-batches"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success("Dispatch batch updated");
    },
    onError: (error) => {
      toast.error("Failed to update batch: " + error.message);
    },
  });
}

export function useAutoDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: {
      priority_filter?: ("express" | "same_day" | "standard" | "economy")[];
      max_orders_per_batch?: number;
    }) => {
      // Get pending orders
      let query = supabase
        .from("orders")
        .select("id, priority, service_type, dropoff_coordinates")
        .eq("status", "pending")
        .is("dispatch_batch_id", null);

      if (options.priority_filter && options.priority_filter.length > 0) {
        query = query.in("service_type", options.priority_filter);
      }

      const { data: pendingOrders, error: ordersError } = await query;

      if (ordersError) throw ordersError;

      if (!pendingOrders || pendingOrders.length === 0) {
        throw new Error("No pending orders to dispatch");
      }

      // Get available drivers
      const { data: availableDrivers, error: driversError } = await supabase
        .from("drivers")
        .select("id, vehicle_id")
        .eq("status", "active")
        .eq("is_online", true);

      if (driversError) throw driversError;

      if (!availableDrivers || availableDrivers.length === 0) {
        throw new Error("No available drivers");
      }

      // Simple auto-dispatch: distribute orders among drivers
      const maxOrders = options.max_orders_per_batch || 5;
      const batches: { driver_id: string; vehicle_id?: string; order_ids: string[] }[] = [];

      let orderIndex = 0;
      for (const driver of availableDrivers) {
        if (orderIndex >= pendingOrders.length) break;

        const driverOrders = pendingOrders.slice(orderIndex, orderIndex + maxOrders);
        if (driverOrders.length > 0) {
          batches.push({
            driver_id: driver.id,
            vehicle_id: driver.vehicle_id || undefined,
            order_ids: driverOrders.map((o) => o.id),
          });
          orderIndex += driverOrders.length;
        }
      }

      // Create batches
      for (const batch of batches) {
        const { data: newBatch, error: batchError } = await supabase
          .from("dispatch_batches")
          .insert({
            batch_number: `DSP${Date.now()}`,
            driver_id: batch.driver_id,
            vehicle_id: batch.vehicle_id,
            status: "dispatched",
            total_orders: batch.order_ids.length,
            dispatched_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (batchError) throw batchError;

        // Create batch order links
        const batchOrders = batch.order_ids.map((orderId, index) => ({
          dispatch_batch_id: newBatch.id,
          order_id: orderId,
          sequence_number: index + 1,
        }));

        await supabase.from("dispatch_batch_orders").insert(batchOrders);

        // Update orders
        await supabase
          .from("orders")
          .update({
            dispatch_batch_id: newBatch.id,
            driver_id: batch.driver_id,
            vehicle_id: batch.vehicle_id,
            status: "dispatched",
          })
          .in("id", batch.order_ids);
      }

      return { batchesCreated: batches.length, ordersDispatched: orderIndex };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["dispatch-batches"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-stats"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-stats"] });
      toast.success(
        `Auto-dispatch complete: ${data.batchesCreated} batches, ${data.ordersDispatched} orders`
      );
    },
    onError: (error) => {
      toast.error("Auto-dispatch failed: " + error.message);
    },
  });
}
