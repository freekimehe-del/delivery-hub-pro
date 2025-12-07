import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type RouteStatus = "planned" | "in_progress" | "completed" | "cancelled";

export interface Route {
  id: string;
  route_number: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: RouteStatus;
  planned_start: string | null;
  actual_start: string | null;
  planned_end: string | null;
  actual_end: string | null;
  total_distance: number | null;
  total_stops: number;
  completed_stops: number;
  optimization_score: number | null;
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
  stops?: RouteStop[];
}

export interface RouteStop {
  id: string;
  route_id: string;
  order_id: string;
  stop_number: number;
  stop_type: string;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  estimated_departure: string | null;
  actual_departure: string | null;
  status: string;
  wait_time_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    tracking_number: string;
    dropoff_address: string;
    dropoff_contact_name: string | null;
    status: string;
    customer?: {
      company_name: string;
    } | null;
  } | null;
}

export function useRoutes(statusFilter?: RouteStatus | RouteStatus[]) {
  return useQuery({
    queryKey: ["routes", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("routes")
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
      return data as Route[];
    },
  });
}

export function useRoute(routeId: string | null) {
  return useQuery({
    queryKey: ["route", routeId],
    queryFn: async () => {
      if (!routeId) return null;

      const { data: route, error: routeError } = await supabase
        .from("routes")
        .select(`
          *,
          driver:drivers(id, profile:profiles(full_name, phone)),
          vehicle:vehicles(id, name, license_plate)
        `)
        .eq("id", routeId)
        .single();

      if (routeError) throw routeError;

      const { data: stops, error: stopsError } = await supabase
        .from("route_stops")
        .select(`
          *,
          order:orders(
            id, 
            tracking_number, 
            dropoff_address, 
            dropoff_contact_name, 
            status,
            customer:customers(company_name)
          )
        `)
        .eq("route_id", routeId)
        .order("stop_number", { ascending: true });

      if (stopsError) throw stopsError;

      return { ...route, stops } as Route;
    },
    enabled: !!routeId,
  });
}

export function useRouteStats() {
  return useQuery({
    queryKey: ["route-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("routes")
        .select("status, total_stops, completed_stops");

      if (error) throw error;

      const stats = {
        planned: 0,
        in_progress: 0,
        completed: 0,
        total_stops: 0,
        completed_stops: 0,
      };

      data.forEach((route) => {
        if (route.status === "planned") stats.planned++;
        else if (route.status === "in_progress") stats.in_progress++;
        else if (route.status === "completed") stats.completed++;
        stats.total_stops += route.total_stops || 0;
        stats.completed_stops += route.completed_stops || 0;
      });

      return stats;
    },
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeData: {
      driver_id?: string;
      vehicle_id?: string;
      planned_start?: string;
      planned_end?: string;
      notes?: string;
      order_ids?: string[];
    }) => {
      const { order_ids, ...routeFields } = routeData;

      const { data: route, error: routeError } = await supabase
        .from("routes")
        .insert({
          route_number: `RT${Date.now()}`,
          status: "planned",
          total_stops: order_ids?.length || 0,
          completed_stops: 0,
          ...routeFields,
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Create route stops if order IDs provided
      if (order_ids && order_ids.length > 0) {
        const stops = order_ids.map((orderId, index) => ({
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
        const { error: ordersError } = await supabase
          .from("orders")
          .update({ route_id: route.id })
          .in("id", order_ids);

        if (ordersError) throw ordersError;
      }

      return route;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route-stats"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Route created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create route: " + error.message);
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Route> & { id: string }) => {
      const { data, error } = await supabase
        .from("routes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route", data.id] });
      queryClient.invalidateQueries({ queryKey: ["route-stats"] });
      toast.success("Route updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update route: " + error.message);
    },
  });
}

export function useStartRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (routeId: string) => {
      const { data, error } = await supabase
        .from("routes")
        .update({
          status: "in_progress",
          actual_start: new Date().toISOString(),
        })
        .eq("id", routeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route-stats"] });
      toast.success("Route started");
    },
    onError: (error) => {
      toast.error("Failed to start route: " + error.message);
    },
  });
}

export function useCompleteStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stopId,
      routeId,
    }: {
      stopId: string;
      routeId: string;
    }) => {
      // Update stop status
      const { error: stopError } = await supabase
        .from("route_stops")
        .update({
          status: "completed",
          actual_arrival: new Date().toISOString(),
          actual_departure: new Date().toISOString(),
        })
        .eq("id", stopId);

      if (stopError) throw stopError;

      // Increment completed stops on route
      const { data: route, error: routeError } = await supabase
        .from("routes")
        .select("completed_stops, total_stops")
        .eq("id", routeId)
        .single();

      if (routeError) throw routeError;

      const newCompletedStops = (route.completed_stops || 0) + 1;
      const isRouteComplete = newCompletedStops >= (route.total_stops || 0);

      const { error: updateError } = await supabase
        .from("routes")
        .update({
          completed_stops: newCompletedStops,
          ...(isRouteComplete && {
            status: "completed",
            actual_end: new Date().toISOString(),
          }),
        })
        .eq("id", routeId);

      if (updateError) throw updateError;

      return { stopId, routeId, isRouteComplete };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["routes"] });
      queryClient.invalidateQueries({ queryKey: ["route", data.routeId] });
      queryClient.invalidateQueries({ queryKey: ["route-stats"] });
      toast.success(data.isRouteComplete ? "Route completed!" : "Stop completed");
    },
    onError: (error) => {
      toast.error("Failed to complete stop: " + error.message);
    },
  });
}
