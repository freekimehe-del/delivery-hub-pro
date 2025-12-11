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

export default function Fleet() {
  const [activeTab, setActiveTab] = useState("overview");

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
          {/* Fleet Dashboard */}
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
