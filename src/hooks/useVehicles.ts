import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type VehicleStatus = "active" | "idle" | "maintenance" | "offline";
export type AcquisitionType = "purchase" | "lease" | "rental";
export type VehicleCondition = "excellent" | "good" | "fair" | "poor";

export interface Vehicle {
  id: string;
  name: string;
  asset_code: string | null;
  license_plate: string;
  vin: string | null;
  vehicle_type: string;
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  status: VehicleStatus;
  fuel_type: string | null;
  mileage: number | null;
  capacity_weight: number | null;
  capacity_volume: number | null;
  current_location: { lat: number; lng: number } | null;
  last_location_update: string | null;
  next_service_due: string | null;
  last_service_date: string | null;
  registration_expiry: string | null;
  insurance_expiry: string | null;
  acquisition_type: AcquisitionType | null;
  acquisition_date: string | null;
  acquisition_cost: number | null;
  lease_end_date: string | null;
  monthly_lease_cost: number | null;
  warranty_expiry: string | null;
  telematics_device_id: string | null;
  fuel_card_number: string | null;
  notes: string | null;
  condition: VehicleCondition | null;
  purchase_vendor: string | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleData {
  name: string;
  license_plate: string;
  vehicle_type: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  fuel_type?: string;
  mileage?: number;
  capacity_weight?: number;
  capacity_volume?: number;
  registration_expiry?: string;
  insurance_expiry?: string;
  acquisition_type?: AcquisitionType;
  acquisition_date?: string;
  acquisition_cost?: number;
  lease_end_date?: string;
  monthly_lease_cost?: number;
  warranty_expiry?: string;
  telematics_device_id?: string;
  fuel_card_number?: string;
  notes?: string;
  condition?: VehicleCondition;
  purchase_vendor?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Vehicle[];
    },
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Vehicle | null;
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicle: CreateVehicleData) => {
      const { data, error } = await supabase
        .from("vehicles")
        .insert(vehicle)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add vehicle: " + error.message);
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vehicle> & { id: string }) => {
      const { data, error } = await supabase
        .from("vehicles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update vehicle: " + error.message);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle removed successfully");
    },
    onError: (error) => {
      toast.error("Failed to remove vehicle: " + error.message);
    },
  });
}
