import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FleetDashboard } from "@/components/fleet/FleetDashboard";
import { VehicleTable } from "@/components/fleet/VehicleTable";
import { DriverTable } from "@/components/fleet/DriverTable";
import { MaintenanceTable } from "@/components/fleet/MaintenanceTable";
import { FuelTable } from "@/components/fleet/FuelTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FleetStats {
  total_vehicles?: number;
  available_vehicles?: number;
  maintenance?: number;
  stats?: {
    total?: number;
  };
}

export default function Fleet() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<FleetStats | null>(null);

  useEffect(() => {
    async function load() {
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
      try {
        const resp = await fetch(`${apiUrl}/api/fleet/stats`);
        if (resp.ok) {
          const json = await resp.json();
          setStats(json.stats);
        }
      } catch (e) {
        // Ignore errors
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage your vehicles, drivers, and maintenance schedules.
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">
            Overview
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-background">
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="drivers" className="data-[state=active]:bg-background">
            Drivers
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="data-[state=active]:bg-background">
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="fuel" className="data-[state=active]:bg-background">
            Fuel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Fleet Dashboard - passing props if FleetDashboard accepts them, 
              otherwise assuming it might be a mock, but we can pass data down if we refactor FleetDashboard.
              For now, let's assume FleetDashboard is self-contained or we replace it with metrics cards here. 
              Actually, let's inject a new metrics overview above the original dashboard or replace it.
          */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Vehicles</h3>
              <p className="text-2xl font-bold">{stats?.total_vehicles || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Available</h3>
              <div className="flex items-center mt-1">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                <p className="text-2xl font-bold">{stats?.available_vehicles || 0}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">In Maintenance</h3>
              <div className="flex items-center mt-1">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                <p className="text-2xl font-bold">{stats?.maintenance || 0}</p>
              </div>
            </div>
          </div>

          {/* Fleet Dashboard (Original) */}
          <FleetDashboard />

          {/* Alerts Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="bg-fleet-orange/5 border border-fleet-orange/20 rounded-xl p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-fleet-orange/10 shrink-0">
                <AlertTriangle className="w-5 h-5 text-fleet-orange" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-fleet-orange">Maintenance Alerts</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  4 vehicles require maintenance attention. Truck-007 is due for oil change,
                  Van-003 needs tire replacement.
                </p>
              </div>
              <button className="text-sm font-medium text-fleet-orange hover:underline whitespace-nowrap">
                View All
              </button>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="vehicles">
          <VehicleTable />
        </TabsContent>

        <TabsContent value="drivers">
          <DriverTable />
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceTable />
        </TabsContent>

        <TabsContent value="fuel">
          <FuelTable />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
