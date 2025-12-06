import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DriverStatus } from "./useDrivers";

export interface CreateDriverData {
  employee_id?: string;
  license_number?: string;
  license_expiry?: string;
  status?: DriverStatus;
  shift_start?: string;
  shift_end?: string;
  profile_id?: string;
  vehicle_id?: string;
}

export interface UpdateDriverData extends Partial<CreateDriverData> {
  is_online?: boolean;
  rating?: number;
  total_deliveries?: number;
  on_time_rate?: number;
}

export function useCreateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDriverData) => {
      const { data: driver, error } = await supabase
        .from("drivers")
        .insert({
          ...data,
          status: data.status || "pending",
        })
        .select()
        .single();

      if (error) throw error;
      return driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver-stats"] });
      toast.success("Driver added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add driver: ${error.message}`);
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDriverData }) => {
      const { data: driver, error } = await supabase
        .from("drivers")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver-stats"] });
      toast.success("Driver updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update driver: ${error.message}`);
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver-stats"] });
      toast.success("Driver removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove driver: ${error.message}`);
    },
  });
}

export function useAssignVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ driverId, vehicleId }: { driverId: string; vehicleId: string | null }) => {
      const { data: driver, error } = await supabase
        .from("drivers")
        .update({ vehicle_id: vehicleId })
        .eq("id", driverId)
        .select()
        .single();

      if (error) throw error;
      return driver;
    },
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success(vehicleId ? "Vehicle assigned successfully" : "Vehicle unassigned");
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign vehicle: ${error.message}`);
    },
  });
}

export function useToggleDriverOnline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isOnline }: { id: string; isOnline: boolean }) => {
      const { data: driver, error } = await supabase
        .from("drivers")
        .update({ is_online: isOnline })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return driver;
    },
    onSuccess: (_, { isOnline }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["driver-stats"] });
      toast.success(isOnline ? "Driver is now online" : "Driver is now offline");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update driver status: ${error.message}`);
    },
  });
}
