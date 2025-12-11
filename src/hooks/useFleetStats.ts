import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useCallback } from "react";

export function useVehicleStats() {
  return useQuery({
    queryKey: ["vehicle-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("status, next_service_due, registration_expiry, insurance_expiry, fuel_type, mileage");

      if (error) throw error;

      const vehicles = data || [];
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const totalVehicles = vehicles.length;
      const activeVehicles = vehicles.filter((v) => v.status === "active").length;
      const idleVehicles = vehicles.filter((v) => v.status === "idle").length;
      const inMaintenance = vehicles.filter((v) => v.status === "maintenance").length;
      const offlineVehicles = vehicles.filter((v) => v.status === "offline").length;

      // Calculate vehicles in transit (active ones for now)
      const inTransit = Math.floor(activeVehicles * 0.7); // Simulated

      // Status breakdown for pie chart
      const statusBreakdown = [
        { name: "Active", value: activeVehicles, color: "hsl(var(--fleet-green))" },
        { name: "Idle", value: idleVehicles, color: "hsl(var(--primary))" },
        { name: "Maintenance", value: inMaintenance, color: "hsl(var(--fleet-orange))" },
        { name: "Offline", value: offlineVehicles, color: "hsl(var(--muted-foreground))" },
      ].filter((s) => s.value > 0);

      return {
        totalVehicles,
        activeVehicles,
        idleVehicles,
        inMaintenance,
        offlineVehicles,
        inTransit,
        statusBreakdown,
        utilizationRate: totalVehicles > 0
          ? Math.round((activeVehicles / totalVehicles) * 100)
          : 0,
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useMaintenanceStats() {
  return useQuery({
    queryKey: ["maintenance-stats"],
    queryFn: async () => {
      // Fetch maintenance records
      const { data: records, error } = await supabase
        .from("maintenance_records")
        .select("*");

      if (error) throw error;

      const now = new Date();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      const upcomingMaintenance = records.filter(r =>
        r.status === 'scheduled' &&
        new Date(r.scheduled_date!).getTime() > now.getTime()
      );

      const overdueMaintenance = records.filter(r =>
        r.status === 'scheduled' &&
        new Date(r.scheduled_date!).getTime() < now.getTime()
      );

      const urgentMaintenance = upcomingMaintenance.filter(r =>
        new Date(r.scheduled_date!).getTime() - now.getTime() < sevenDaysMs
      );

      // Simple cost calc vs last month (mocked slightly if no history)
      const maintenanceCostThisMonth = records
        .filter(r => new Date(r.created_at).getMonth() === now.getMonth())
        .reduce((sum, r) => sum + (r.total_cost || 0), 0);

      const maintenanceCostLastMonth = records
        .filter(r => new Date(r.created_at).getMonth() === now.getMonth() - 1)
        .reduce((sum, r) => sum + (r.total_cost || 0), 0);

      const inMaintenanceNow = records.filter(r => r.status === 'in_progress').length;

      return {
        upcomingCount: upcomingMaintenance.length,
        overdueCount: overdueMaintenance.length,
        urgentCount: urgentMaintenance.length,
        upcomingMaintenance: upcomingMaintenance.slice(0, 5),
        overdueMaintenance,
        recentMaintenance: records.slice(0, 5), // Already ordered by latest if DB query was ordered, else sort
        maintenanceCostThisMonth,
        maintenanceCostLastMonth,
        costChange: maintenanceCostLastMonth > 0
          ? Math.round(((maintenanceCostThisMonth - maintenanceCostLastMonth) / maintenanceCostLastMonth) * 100)
          : 0,
        inMaintenanceNow,
      };
    },
    refetchInterval: 30000,
  });
}

export function useFuelStats() {
  return useQuery({
    queryKey: ["fuel-stats"],
    queryFn: async () => {
      const { data: logs, error } = await supabase
        .from("fuel_records")
        .select("*")
        .order("fueled_at", { ascending: true });

      if (error) throw error;

      const now = new Date();
      const currentMonth = now.getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

      const thisMonthLogs = logs.filter(l => new Date(l.fueled_at).getMonth() === currentMonth);
      const lastMonthLogs = logs.filter(l => new Date(l.fueled_at).getMonth() === lastMonth);

      const fuelConsumptionThisMonth = thisMonthLogs.reduce((sum, l) => sum + (l.quantity_gallons || 0), 0);
      const fuelConsumptionLastMonth = lastMonthLogs.reduce((sum, l) => sum + (l.quantity_gallons || 0), 0);

      const fuelCostThisMonth = thisMonthLogs.reduce((sum, l) => sum + (l.total_cost || 0), 0);
      const fuelCostLastMonth = lastMonthLogs.reduce((sum, l) => sum + (l.total_cost || 0), 0);

      // Average MPG from records that have it calculated
      const recordsWithMPG = logs.filter(l => l.mpg && l.mpg > 0);
      const avgMPG = recordsWithMPG.length > 0
        ? recordsWithMPG.reduce((sum, l) => sum + l.mpg, 0) / recordsWithMPG.length
        : 0;

      // Sparkline (last 7 logs)
      const sparklineData = logs.slice(-7).map((l, i) => ({
        day: i + 1,
        consumption: l.quantity_gallons || 0,
        cost: l.total_cost || 0
      }));

      return {
        fuelConsumptionThisMonth,
        fuelConsumptionLastMonth,
        consumptionChange: fuelConsumptionLastMonth > 0
          ? Math.round(((fuelConsumptionThisMonth - fuelConsumptionLastMonth) / fuelConsumptionLastMonth) * 100)
          : 0,
        fuelCostThisMonth,
        fuelCostLastMonth,
        costChange: fuelCostLastMonth > 0
          ? Math.round(((fuelCostThisMonth - fuelCostLastMonth) / fuelCostLastMonth) * 100)
          : 0,
        avgMPG: avgMPG.toFixed(1),
        avgMPGChange: "0.0",
        needsRefuel: 0, // Need live vehicle telemetry for this
        fuelTypeBreakdown: {}, // Need vehicle join
        sparklineData,
        totalVehicles: 0, // Need vehicle count
      };
    },
    refetchInterval: 30000,
  });
}

// Hook for simulating real-time updates
export function useRealtimeSimulation() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [updatePulse, setUpdatePulse] = useState(false);

  const triggerUpdate = useCallback(() => {
    setLastUpdate(new Date());
    setUpdatePulse(true);
    setTimeout(() => setUpdatePulse(false), 1000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      triggerUpdate();
    }, 30000);

    // Simulate occasional disconnections
    const connectionInterval = setInterval(() => {
      const random = Math.random();
      if (random < 0.05) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 2000);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(connectionInterval);
    };
  }, [triggerUpdate]);

  return { isConnected, lastUpdate, updatePulse, triggerUpdate };
}
