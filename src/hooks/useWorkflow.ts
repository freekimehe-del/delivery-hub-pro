import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrderStatus } from "./useOrders";

// Workflow stage definitions
export type WorkflowStage = "all_orders" | "dispatch" | "routes" | "pod";

export interface WorkflowTransition {
  from: OrderStatus[];
  to: OrderStatus;
  stage: WorkflowStage;
  action: string;
}

// Define valid workflow transitions
export const WORKFLOW_TRANSITIONS: WorkflowTransition[] = [
  // Stage 1: All Orders → Dispatch
  { from: ["pending"], to: "confirmed", stage: "all_orders", action: "validate" },
  { from: ["confirmed"], to: "dispatched", stage: "dispatch", action: "dispatch" },
  
  // Stage 2: Dispatch → Routes
  { from: ["dispatched"], to: "driver_accepted", stage: "dispatch", action: "driver_accept" },
  { from: ["driver_accepted"], to: "en_route_pickup", stage: "routes", action: "start_pickup" },
  
  // Stage 3: Routes (Pickup)
  { from: ["en_route_pickup"], to: "arrived_pickup", stage: "routes", action: "arrive_pickup" },
  { from: ["arrived_pickup"], to: "picked_up", stage: "routes", action: "complete_pickup" },
  
  // Stage 3: Routes (Delivery)
  { from: ["picked_up"], to: "en_route_delivery", stage: "routes", action: "start_delivery" },
  { from: ["en_route_delivery"], to: "arrived_delivery", stage: "routes", action: "arrive_delivery" },
  
  // Stage 4: POD
  { from: ["arrived_delivery"], to: "delivered", stage: "pod", action: "complete_delivery" },
  
  // Exception paths
  { from: ["en_route_delivery", "arrived_delivery"], to: "failed", stage: "pod", action: "fail_delivery" },
  { from: ["failed"], to: "rescheduled", stage: "all_orders", action: "reschedule" },
];

// Order status to stage mapping
export const STATUS_TO_STAGE: Record<OrderStatus, WorkflowStage> = {
  pending: "all_orders",
  confirmed: "all_orders",
  dispatched: "dispatch",
  driver_accepted: "dispatch",
  en_route_pickup: "routes",
  arrived_pickup: "routes",
  picked_up: "routes",
  en_route_delivery: "routes",
  arrived_delivery: "routes",
  delivered: "pod",
  failed: "pod",
  cancelled: "all_orders",
  rescheduled: "all_orders",
};

// Exception types
export type ExceptionType = 
  | "address_invalid"
  | "recipient_unavailable"
  | "item_damaged"
  | "vehicle_breakdown"
  | "traffic_delay"
  | "weather_delay"
  | "customer_refused"
  | "wrong_address"
  | "access_denied"
  | "other";

export interface WorkflowException {
  id: string;
  order_id: string;
  type: ExceptionType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  resolution_status: "open" | "in_progress" | "resolved" | "escalated";
  resolution_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

// Get next valid status transitions
export function getNextTransitions(currentStatus: OrderStatus): WorkflowTransition[] {
  return WORKFLOW_TRANSITIONS.filter(t => t.from.includes(currentStatus));
}

// Get current stage for an order
export function getOrderStage(status: OrderStatus): WorkflowStage {
  return STATUS_TO_STAGE[status];
}

// Workflow stats per stage
export interface WorkflowStats {
  all_orders: { total: number; pending: number; confirmed: number; exceptions: number };
  dispatch: { total: number; dispatched: number; accepted: number; exceptions: number };
  routes: { total: number; in_transit: number; at_stop: number; exceptions: number };
  pod: { total: number; delivered: number; failed: number; pending_pod: number };
}

export function useWorkflowStats() {
  return useQuery({
    queryKey: ["workflow-stats"],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("status, failure_reason");

      if (error) throw error;

      const stats: WorkflowStats = {
        all_orders: { total: 0, pending: 0, confirmed: 0, exceptions: 0 },
        dispatch: { total: 0, dispatched: 0, accepted: 0, exceptions: 0 },
        routes: { total: 0, in_transit: 0, at_stop: 0, exceptions: 0 },
        pod: { total: 0, delivered: 0, failed: 0, pending_pod: 0 },
      };

      orders.forEach((order) => {
        const stage = STATUS_TO_STAGE[order.status as OrderStatus];

        switch (order.status) {
          case "pending":
            stats.all_orders.total++;
            stats.all_orders.pending++;
            break;
          case "confirmed":
            stats.all_orders.total++;
            stats.all_orders.confirmed++;
            break;
          case "dispatched":
            stats.dispatch.total++;
            stats.dispatch.dispatched++;
            break;
          case "driver_accepted":
            stats.dispatch.total++;
            stats.dispatch.accepted++;
            break;
          case "en_route_pickup":
          case "picked_up":
          case "en_route_delivery":
            stats.routes.total++;
            stats.routes.in_transit++;
            break;
          case "arrived_pickup":
          case "arrived_delivery":
            stats.routes.total++;
            stats.routes.at_stop++;
            break;
          case "delivered":
            stats.pod.total++;
            stats.pod.delivered++;
            break;
          case "failed":
            stats.pod.total++;
            stats.pod.failed++;
            break;
          case "rescheduled":
            stats.all_orders.total++;
            stats.all_orders.exceptions++;
            break;
        }
      });

      return stats;
    },
  });
}

// Advance order to next stage with validation
export function useAdvanceWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      targetStatus,
      notes,
    }: {
      orderId: string;
      targetStatus: OrderStatus;
      notes?: string;
    }) => {
      // Get current order status
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      if (orderError) throw orderError;

      const currentStatus = order.status as OrderStatus;
      const validTransitions = getNextTransitions(currentStatus);
      const isValid = validTransitions.some((t) => t.to === targetStatus);

      if (!isValid) {
        throw new Error(
          `Invalid transition from ${currentStatus} to ${targetStatus}`
        );
      }

      // Build update data based on target status
      const updateData: Record<string, unknown> = { status: targetStatus };

      if (targetStatus === "picked_up") {
        updateData.actual_pickup_time = new Date().toISOString();
      } else if (targetStatus === "delivered") {
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
      queryClient.invalidateQueries({ queryKey: ["workflow-stats"] });
      toast.success("Order advanced to next stage");
    },
    onError: (error) => {
      toast.error("Failed to advance workflow: " + error.message);
    },
  });
}

// Bulk validate orders (Stage 1 → Ready for Dispatch)
export function useValidateOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const results = [];

      for (const orderId of orderIds) {
        // Validate order has required fields
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError) {
          results.push({ orderId, success: false, error: orderError.message });
          continue;
        }

        // Validation checks
        const issues: string[] = [];
        if (!order.pickup_address) issues.push("Missing pickup address");
        if (!order.dropoff_address) issues.push("Missing delivery address");
        if (!order.customer_id) issues.push("Missing customer");

        if (issues.length > 0) {
          results.push({ orderId, success: false, error: issues.join(", ") });
          continue;
        }

        // Update status to confirmed
        const { error: updateError } = await supabase
          .from("orders")
          .update({ status: "confirmed" })
          .eq("id", orderId);

        if (updateError) {
          results.push({ orderId, success: false, error: updateError.message });
        } else {
          results.push({ orderId, success: true });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-stats"] });

      if (failed > 0) {
        toast.warning(`${successful} orders validated, ${failed} failed`);
      } else {
        toast.success(`${successful} orders validated and ready for dispatch`);
      }
    },
    onError: (error) => {
      toast.error("Validation failed: " + error.message);
    },
  });
}

// Report exception
export function useReportException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      type,
      description,
      severity = "medium",
    }: {
      orderId: string;
      type: ExceptionType;
      description: string;
      severity?: "low" | "medium" | "high" | "critical";
    }) => {
      // Update order with failure reason and status
      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "failed",
          failure_reason: `[${type}] ${description}`,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["workflow-stats"] });
      toast.warning("Exception reported");
    },
    onError: (error) => {
      toast.error("Failed to report exception: " + error.message);
    },
  });
}

// Reschedule failed order
export function useRescheduleOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      newDeliveryWindow,
      notes,
    }: {
      orderId: string;
      newDeliveryWindow?: { start: string; end: string };
      notes?: string;
    }) => {
      const updateData: Record<string, unknown> = {
        status: "rescheduled",
        failure_reason: null,
      };

      if (newDeliveryWindow) {
        updateData.delivery_window_start = newDeliveryWindow.start;
        updateData.delivery_window_end = newDeliveryWindow.end;
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
      queryClient.invalidateQueries({ queryKey: ["workflow-stats"] });
      toast.success("Order rescheduled");
    },
    onError: (error) => {
      toast.error("Failed to reschedule: " + error.message);
    },
  });
}

// Auto-handoff from dispatch to route
export function useAutoCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (batchId: string) => {
      // Get batch with orders
      const { data: batchOrders, error: batchError } = await supabase
        .from("dispatch_batch_orders")
        .select("order_id")
        .eq("dispatch_batch_id", batchId);

      if (batchError) throw batchError;

      const { data: batch, error: getBatchError } = await supabase
        .from("dispatch_batches")
        .select("driver_id, vehicle_id")
        .eq("id", batchId)
        .single();

      if (getBatchError) throw getBatchError;

      const orderIds = batchOrders.map((bo) => bo.order_id);

      // Create route
      const { data: route, error: routeError } = await supabase
        .from("routes")
        .insert({
          route_number: `RT${Date.now()}`,
          driver_id: batch.driver_id,
          vehicle_id: batch.vehicle_id,
          status: "planned",
          total_stops: orderIds.length,
          completed_stops: 0,
          planned_start: new Date().toISOString(),
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Create stops
      const stops = orderIds.map((orderId, index) => ({
        route_id: route.id,
        order_id: orderId,
        stop_number: index + 1,
        status: "pending",
      }));

      const { error: stopsError } = await supabase
        .from("route_stops")
        .insert(stops);

      if (stopsError) throw stopsError;

      // Update orders with route_id
      await supabase.from("orders").update({ route_id: route.id }).in("id", orderIds);

      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Route created from dispatch batch");
    },
    onError: (error) => {
      toast.error("Failed to create route: " + error.message);
    },
  });
}
