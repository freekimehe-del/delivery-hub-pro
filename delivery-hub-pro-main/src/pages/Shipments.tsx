import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Truck,
  Ship,
  Plane,
  Train,
  TrendingUp,
  Package,
  MapPin,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllShipmentsTab } from "@/components/shipments/AllShipmentsTab";
import { CarrierManagementTab } from "@/components/shipments/CarrierManagementTab";
import { RouteManagementTab } from "@/components/shipments/RouteManagementTab";

const metrics = [
  {
    title: "Total Shipments",
    value: "1,247",
    change: 15,
    changeLabel: "this month",
    icon: <Package className="w-5 h-5" />,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "Active Routes",
    value: "89",
    change: 8,
    changeLabel: "this month",
    icon: <MapPin className="w-5 h-5" />,
    iconColor: "bg-fleet-green/10 text-fleet-green",
  },
  {
    title: "On-Time Delivery",
    value: "94.2%",
    change: 2.1,
    changeLabel: "vs last month",
    icon: <Clock className="w-5 h-5" />,
    iconColor: "bg-fleet-purple/10 text-fleet-purple",
  },
  {
    title: "Revenue",
    value: "PKR 2.4M",
    change: 18,
    changeLabel: "this month",
    icon: <TrendingUp className="w-5 h-5" />,
    iconColor: "bg-fleet-orange/10 text-fleet-orange",
  },
];

const tabs = [
  { value: "shipments", label: "All Shipments", path: "/shipments", icon: Package },
  { value: "carriers", label: "Carriers", path: "/shipments/carriers", icon: Truck },
  { value: "routes", label: "Routes", path: "/shipments/routes", icon: MapPin },
];

export default function Shipments() {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentTab = () => {
    if (location.pathname === "/shipments/carriers") return "carriers";
    if (location.pathname === "/shipments/routes") return "routes";
    return "shipments";
  };

  const handleTabChange = (value: string) => {
    const tab = tabs.find((t) => t.value === value);
    if (tab) navigate(tab.path);
  };

  const currentTab = getCurrentTab();

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipment Management</h1>
          <p className="text-muted-foreground mt-1">
            Multi-modal transport management for Pak-Afghan transit trade.
          </p>
        </div>
      </div>

      {/* Transport Mode Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Road Transport</p>
              <p className="text-xs text-muted-foreground">Torkham, Chaman routes</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Ship className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Sea Freight</p>
              <p className="text-xs text-muted-foreground">Karachi, Gwadar ports</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Plane className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Air Cargo</p>
              <p className="text-xs text-muted-foreground">International flights</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Train className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Rail Transport</p>
              <p className="text-xs text-muted-foreground">Pakistan Railways</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Tabs Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-6"
      >
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="h-12 p-1 bg-muted/50">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Tab Content */}
      {currentTab === "shipments" && <AllShipmentsTab />}
      {currentTab === "carriers" && <CarrierManagementTab />}
      {currentTab === "routes" && <RouteManagementTab />}
    </DashboardLayout>
  );
}