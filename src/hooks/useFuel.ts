import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FuelRecord {
  id: string;
  vehicle_id: string | null;
  driver_id: string | null;
  fuel_type: "gasoline" | "diesel" | "electric" | "hybrid" | "cng" | "lpg";
  quantity_gallons: number;
  price_per_gallon: number;
  total_cost: number | null;
  odometer_reading: number;
  previous_odometer: number | null;
  miles_driven: number | null;
  mpg: number | null;
  full_tank: boolean | null;
  station_name: string | null;
  station_location: string | null;
  fuel_card_used: boolean | null;
  receipt_url: string | null;
  anomaly_flag: boolean | null;
  anomaly_reason: string | null;
  notes: string | null;
  fueled_at: string;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    name: string;
    license_plate: string;
  } | null;
  driver?: {
    id: string;
    profile: {
      full_name: string | null;
    } | null;
  } | null;
}

export function useFuelRecords() {
  return useQuery({
    queryKey: ["fuel_records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fuel_records")
        .select(`
          *,
          vehicle:vehicles(id, name, license_plate),
          driver:drivers(id, profile:profiles(full_name))
        `)
        .order("fueled_at", { ascending: false });

      if (error) throw error;
      return data as FuelRecord[];
    },
  });
}

export function useFuelByVehicle(vehicleId: string | null) {
  return useQuery({
    queryKey: ["fuel_records", "vehicle", vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const { data, error } = await supabase
        .from("fuel_records")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("fueled_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId,
  });
}

export function useLastFuelRecord(vehicleId: string | null) {
  return useQuery({
    queryKey: ["fuel_records", "last", vehicleId],
    queryFn: async () => {
      if (!vehicleId) return null;
      const { data, error } = await supabase
        .from("fuel_records")
        .select("odometer_reading")
        .eq("vehicle_id", vehicleId)
        .order("fueled_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId,
  });
}

export function useFuelMutations() {
  const queryClient = useQueryClient();

  const createFuelRecord = useMutation({
    mutationFn: async (record: {
      vehicle_id: string;
      driver_id?: string;
      fuel_type: string;
      quantity_gallons: number;
      price_per_gallon: number;
      odometer_reading: number;
      previous_odometer?: number;
      full_tank?: boolean;
      station_name?: string;
      station_location?: string;
      fuel_card_used?: boolean;
      notes?: string;
      fueled_at?: string;
    }) => {
      const { data, error } = await supabase
        .from("fuel_records")
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel_records"] });
      toast.success("Fuel record added");
    },
    onError: (error) => {
      toast.error("Failed to add fuel record: " + error.message);
    },
  });

  const updateFuelRecord = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      anomaly_flag?: boolean;
      anomaly_reason?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("fuel_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel_records"] });
      toast.success("Fuel record updated");
    },
    onError: (error) => {
      toast.error("Failed to update fuel record: " + error.message);
    },
  });

  const deleteFuelRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fuel_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fuel_records"] });
      toast.success("Fuel record deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete fuel record: " + error.message);
    },
  });

  return {
    createFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
  };
}
