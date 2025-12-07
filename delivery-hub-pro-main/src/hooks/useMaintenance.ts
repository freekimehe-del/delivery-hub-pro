import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string | null;
  reported_by_driver_id: string | null;
  maintenance_type: "scheduled" | "repair" | "inspection" | "recall" | "emergency";
  status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string | null;
  triggered_by: "manual" | "mileage" | "time" | "driver_report" | "fuel_anomaly" | "diagnostic";
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  odometer_at_service: number | null;
  labor_cost: number | null;
  parts_cost: number | null;
  total_cost: number | null;
  vendor_name: string | null;
  technician_name: string | null;
  work_performed: string | null;
  parts_used: unknown[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    name: string;
    license_plate: string;
  } | null;
  reported_by?: {
    id: string;
    profile: {
      full_name: string | null;
    } | null;
  } | null;
}

export function useMaintenance() {
  return useQuery({
    queryKey: ["maintenance_records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select(`
          *,
          vehicle:vehicles(id, name, license_plate),
          reported_by:drivers!reported_by_driver_id(id, profile:profiles(full_name))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MaintenanceRecord[];
    },
  });
}

export function useMaintenanceByVehicle(vehicleId: string | null) {
  return useQuery({
    queryKey: ["maintenance_records", "vehicle", vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId,
  });
}

export function useMaintenanceMutations() {
  const queryClient = useQueryClient();

  const createMaintenance = useMutation({
    mutationFn: async (record: {
      vehicle_id: string;
      maintenance_type: string;
      priority: string;
      title: string;
      description?: string;
      scheduled_date?: string;
      triggered_by?: string;
      vendor_name?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_records"] });
      toast.success("Maintenance record created");
    },
    onError: (error) => {
      toast.error("Failed to create maintenance record: " + error.message);
    },
  });

  const updateMaintenance = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      status?: string;
      started_at?: string;
      completed_at?: string;
      labor_cost?: number;
      parts_cost?: number;
      work_performed?: string;
      technician_name?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_records"] });
      toast.success("Maintenance record updated");
    },
    onError: (error) => {
      toast.error("Failed to update maintenance record: " + error.message);
    },
  });

  const deleteMaintenance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("maintenance_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_records"] });
      toast.success("Maintenance record deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete maintenance record: " + error.message);
    },
  });

  return {
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
  };
}
