import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    plate?: string; // Handle both naming conventions
  } | null;
  reported_by?: {
    id: string;
    profile: {
      full_name: string | null;
    } | null;
  } | null;
}

const API_BASE = 'http://localhost:4000/api/fleet';

export function useMaintenance() {
  return useQuery({
    queryKey: ["maintenance_records"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/maintenance`);
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      return data as MaintenanceRecord[];
    },
  });
}

export function useMaintenanceByVehicle(vehicleId: string | null) {
  return useQuery({
    queryKey: ["maintenance_records", "vehicle", vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const res = await fetch(`${API_BASE}/maintenance`); // Filtering client-side for mock
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      return data.filter((r: MaintenanceRecord) => r.vehicle_id === vehicleId);
    },
    enabled: !!vehicleId,
  });
}

export function useMaintenanceMutations() {
  const queryClient = useQueryClient();

  const createMaintenance = useMutation({
    mutationFn: async (record: Partial<MaintenanceRecord>) => {
      const res = await fetch(`${API_BASE}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (!res.ok) throw new Error("Failed to create record");
      return res.json();
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
    mutationFn: async ({ id, ...updates }: any) => {
      const res = await fetch(`${API_BASE}/maintenance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error("Failed to update record");
      return res.json();
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
      const res = await fetch(`${API_BASE}/maintenance/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed to delete record");
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
