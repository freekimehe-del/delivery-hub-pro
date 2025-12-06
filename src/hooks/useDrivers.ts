import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DriverStatus = "pending" | "active" | "suspended" | "inactive";

export interface Driver {
  id: string;
  profile_id: string | null;
  vehicle_id: string | null;
  employee_id: string | null;
  license_number: string | null;
  license_expiry: string | null;
  status: DriverStatus;
  is_online: boolean;
  current_location: { lat: number; lng: number } | null;
  last_location_update: string | null;
  rating: number | null;
  total_deliveries: number | null;
  on_time_rate: number | null;
  shift_start: string | null;
  shift_end: string | null;
  created_at: string;
  updated_at: string;
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Driver[];
    },
  });
}

export function useDriverStats() {
  return useQuery({
    queryKey: ["driver-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("status, is_online, license_expiry, rating");

      if (error) throw error;

      const drivers = data || [];
      const today = new Date();
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const totalDrivers = drivers.length;
      const activeDrivers = drivers.filter((d) => d.status === "active").length;
      const onlineDrivers = drivers.filter((d) => d.is_online).length;
      const expiringLicenses = drivers.filter((d) => {
        if (!d.license_expiry) return false;
        const expiryDate = new Date(d.license_expiry);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
      }).length;
      const expiredLicenses = drivers.filter((d) => {
        if (!d.license_expiry) return false;
        return new Date(d.license_expiry) < today;
      }).length;
      const averageRating =
        drivers.reduce((acc, d) => acc + (d.rating || 0), 0) / Math.max(totalDrivers, 1);

      return {
        totalDrivers,
        activeDrivers,
        onlineDrivers,
        assignedDrivers: drivers.filter((d) => d.status === "active" && d.is_online).length,
        availableDrivers: activeDrivers - onlineDrivers,
        expiringLicenses,
        expiredLicenses,
        averageRating: averageRating.toFixed(1),
        complianceRate: totalDrivers > 0 
          ? Math.round(((totalDrivers - expiredLicenses) / totalDrivers) * 100)
          : 100,
      };
    },
  });
}
