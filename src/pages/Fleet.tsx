import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, FileDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FleetDashboard } from "@/components/fleet/FleetDashboard";
import { VehicleTable } from "@/components/fleet/VehicleTable";
import { DriverTable } from "@/components/fleet/DriverTable";
import { MaintenanceTable } from "@/components/fleet/MaintenanceTable";
import { FuelTable } from "@/components/fleet/FuelTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";

export default function Fleet() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname.includes("/fleet/vehicles")) setActiveTab("vehicles");
    else if (location.pathname.includes("/fleet/drivers")) setActiveTab("drivers");
    else if (location.pathname.includes("/fleet/maintenance")) setActiveTab("maintenance");
    else if (location.pathname.includes("/fleet/fuel")) setActiveTab("fuel");
    else setActiveTab("overview");
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    switch (value) {
      case "vehicles": navigate("/fleet/vehicles"); break;
      case "drivers": navigate("/fleet/drivers"); break;
      case "maintenance": navigate("/fleet/maintenance"); break;
      case "fuel": navigate("/fleet/fuel"); break;
      default: navigate("/fleet");
    }
  };


  // Mock data getters (in real app, these would come from the child components or central store)
  const getExportData = () => {
    // Logic to get data based on active tab
    // For now, using placeholders to demonstrate functionality
    if (activeTab === 'vehicles') return [{ id: 'V001', plate: 'K-1234', type: 'Truck', status: 'Active' }];
    if (activeTab === 'drivers') return [{ id: 'D001', name: 'Ahmed', license: 'L-999', status: 'On Trip' }];
    return [];
  };

  const handleExportExcel = () => {
    const data = getExportData();
    if (data.length === 0) {
      toast.info("No data to export for this view or view not supported.");
      return;
    }
    exportToExcel(data, `${activeTab}_Report`, activeTab);
  };

  const handleExportPDF = () => {
    const data = getExportData();
    if (data.length === 0) {
      toast.info("No data to export for this view or view not supported.");
      return;
    }
    // Simple dynamic columns
    const headers = Object.keys(data[0]).map(k => ({ header: k.toUpperCase(), key: k }));
    exportToPDF(data, headers, `${activeTab.toUpperCase()} Report`, `${activeTab}_Report`);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your vehicles, drivers, and maintenance schedules.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Export Current View</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
