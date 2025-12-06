import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DriverStatus } from "./useDrivers";
import type { Json } from "@/integrations/supabase/types";

export interface DriverWithVehicle {
  id: string;
  profile_id: string | null;
  vehicle_id: string | null;
  employee_id: string | null;
  license_number: string | null;
  license_expiry: string | null;
  status: DriverStatus;
  is_online: boolean | null;
  current_location: Json | null;
  last_location_update: string | null;
  rating: number | null;
  total_deliveries: number | null;
  on_time_rate: number | null;
  shift_start: string | null;
  shift_end: string | null;
  created_at: string;
  updated_at: string;
  vehicle: {
    id: string;
    name: string;
    license_plate: string;
    vehicle_type: string;
    make: string | null;
    model: string | null;
    status: string;
  } | null;
  profile: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
}

export function useDriversWithVehicles() {
  return useQuery({
    queryKey: ["drivers-with-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select(`
          *,
          vehicle:vehicles(id, name, license_plate, vehicle_type, make, model, status),
          profile:profiles(id, full_name, email, phone, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as DriverWithVehicle[];
    },
  });
}

export function useDriverById(id: string | null) {
  return useQuery({
    queryKey: ["driver", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("drivers")
        .select(`
          *,
          vehicle:vehicles(id, name, license_plate, vehicle_type, make, model, status, mileage, fuel_type),
          profile:profiles(id, full_name, email, phone, avatar_url, company_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as DriverWithVehicle;
    },
    enabled: !!id,
  });
}

export function useAvailableVehicles() {
  return useQuery({
    queryKey: ["available-vehicles"],
    queryFn: async () => {
      // Get vehicles that are not assigned to any driver or are in active status
      const { data: assignedVehicleIds, error: driversError } = await supabase
        .from("drivers")
        .select("vehicle_id")
        .not("vehicle_id", "is", null);

      if (driversError) throw driversError;

      const assignedIds = assignedVehicleIds
        .map((d) => d.vehicle_id)
        .filter((id): id is string => id !== null);

      let query = supabase
        .from("vehicles")
        .select("id, name, license_plate, vehicle_type, make, model, status")
        .in("status", ["active", "idle"]);

      if (assignedIds.length > 0) {
        query = query.not("id", "in", `(${assignedIds.join(",")})`);
      }

      const { data, error } = await query.order("name");

      if (error) throw error;
      return data;
    },
  });
}
