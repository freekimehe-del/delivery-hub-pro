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
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, name, next_service_due, last_service_date, status, mileage")
        .order("next_service_due", { ascending: true });

      if (error) throw error;

      const vehicles = data || [];
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Upcoming maintenance (due within 30 days)
      const upcomingMaintenance = vehicles.filter((v) => {
        if (!v.next_service_due) return false;
        const dueDate = new Date(v.next_service_due);
        return dueDate > today && dueDate <= thirtyDaysFromNow;
      });

      // Overdue maintenance
      const overdueMaintenance = vehicles.filter((v) => {
        if (!v.next_service_due) return false;
        return new Date(v.next_service_due) < today;
      });

      // Urgent (due within 7 days)
      const urgentMaintenance = vehicles.filter((v) => {
        if (!v.next_service_due) return false;
        const dueDate = new Date(v.next_service_due);
        return dueDate > today && dueDate <= sevenDaysFromNow;
      });

      // Recent maintenance (vehicles that were recently serviced)
      const recentMaintenance = vehicles
        .filter((v) => v.last_service_date)
        .sort((a, b) => new Date(b.last_service_date!).getTime() - new Date(a.last_service_date!).getTime())
        .slice(0, 5);

      // Simulated maintenance cost this month
      const maintenanceCostThisMonth = Math.floor(Math.random() * 5000) + 2000;
      const maintenanceCostLastMonth = Math.floor(Math.random() * 5000) + 2000;

      return {
        upcomingCount: upcomingMaintenance.length,
        overdueCount: overdueMaintenance.length,
        urgentCount: urgentMaintenance.length,
        upcomingMaintenance: upcomingMaintenance.slice(0, 5),
        overdueMaintenance,
        recentMaintenance,
        maintenanceCostThisMonth,
        maintenanceCostLastMonth,
        costChange: maintenanceCostLastMonth > 0
          ? Math.round(((maintenanceCostThisMonth - maintenanceCostLastMonth) / maintenanceCostLastMonth) * 100)
          : 0,
        inMaintenanceNow: vehicles.filter((v) => v.status === "maintenance").length,
      };
    },
    refetchInterval: 30000,
  });
}

export function useFuelStats() {
  return useQuery({
    queryKey: ["fuel-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, name, fuel_type, mileage");

      if (error) throw error;

      const vehicles = data || [];
      const totalVehicles = vehicles.length;

      // Simulated fuel data (in a real app, this would come from a fuel_logs table)
      const fuelConsumptionThisMonth = Math.floor(Math.random() * 2000) + 3000; // gallons
      const fuelConsumptionLastMonth = Math.floor(Math.random() * 2000) + 3000;
      const avgFuelPrice = 3.45; // per gallon
      const fuelCostThisMonth = fuelConsumptionThisMonth * avgFuelPrice;
      const fuelCostLastMonth = fuelConsumptionLastMonth * avgFuelPrice;

      // Average fuel efficiency
      const avgMPG = 18.5 + Math.random() * 4;
      const avgMPGLastMonth = 17.5 + Math.random() * 4;

      // Fuel type breakdown
      const fuelTypeBreakdown = vehicles.reduce((acc, v) => {
        const type = v.fuel_type || "gasoline";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Vehicles needing refuel (simulated - low fuel alert)
      const needsRefuel = Math.floor(totalVehicles * 0.15);

      // Sparkline data for the last 7 days
      const sparklineData = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        consumption: Math.floor(Math.random() * 300) + 400,
        cost: Math.floor(Math.random() * 1000) + 1400,
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
        avgMPGChange: ((avgMPG - avgMPGLastMonth) / avgMPGLastMonth * 100).toFixed(1),
        needsRefuel,
        fuelTypeBreakdown,
        sparklineData,
        totalVehicles,
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
