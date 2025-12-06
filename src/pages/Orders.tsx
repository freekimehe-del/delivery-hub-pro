import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Send,
  Route,
  FileSignature,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllOrdersTab } from "@/components/orders/AllOrdersTab";
import { DispatchTab } from "@/components/orders/DispatchTab";
import { RoutesTab } from "@/components/orders/RoutesTab";
import { ProofOfDeliveryTab } from "@/components/orders/ProofOfDeliveryTab";
import { WorkflowPipeline } from "@/components/orders/WorkflowPipeline";
import { ExceptionPanel } from "@/components/orders/ExceptionPanel";
import { useOrderStats } from "@/hooks/useOrders";
import { WorkflowStage } from "@/hooks/useWorkflow";

const stageToTab: Record<WorkflowStage, string> = {
  all_orders: "all",
  dispatch: "dispatch",
  routes: "routes",
  pod: "pod",
};

const tabToStage: Record<string, WorkflowStage> = {
  all: "all_orders",
  dispatch: "dispatch",
  routes: "routes",
  pod: "pod",
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const { data: stats } = useOrderStats();

  const handleStageClick = (stage: WorkflowStage) => {
    setActiveTab(stageToTab[stage]);
  };

  const metrics = [
    {
      title: "Pending Orders",
      value: String(stats?.pending || 0),
      change: -5,
      changeLabel: "vs yesterday",
      icon: <Clock className="w-5 h-5" />,
      iconColor: "bg-fleet-yellow/10 text-fleet-yellow",
    },
    {
      title: "Dispatched",
      value: String(stats?.dispatched || 0),
      change: 18,
      changeLabel: "vs yesterday",
      icon: <Send className="w-5 h-5" />,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "In Transit",
      value: String(stats?.in_transit || 0),
      change: 12,
      changeLabel: "vs yesterday",
      icon: <Truck className="w-5 h-5" />,
      iconColor: "bg-fleet-purple/10 text-fleet-purple",
    },
    {
      title: "Delivered Today",
      value: String(stats?.delivered || 0),
      change: 8,
      changeLabel: "vs yesterday",
      icon: <CheckCircle className="w-5 h-5" />,
      iconColor: "bg-fleet-green/10 text-fleet-green",
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-muted-foreground mt-1">
          End-to-end order lifecycle from creation to proof of delivery.
        </p>
      </div>

      {/* Workflow Pipeline */}
      <WorkflowPipeline
        activeStage={tabToStage[activeTab]}
        onStageClick={handleStageClick}
      />

      {/* Exception Panel */}
      <div className="mb-6">
        <ExceptionPanel />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-4 border-b border-border">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl">
              <TabsTrigger value="all" className="gap-2">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">All Orders</span>
                <span className="sm:hidden">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="dispatch" className="gap-2">
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Dispatch</span>
                <span className="sm:hidden">Dispatch</span>
              </TabsTrigger>
              <TabsTrigger value="routes" className="gap-2">
                <Route className="w-4 h-4" />
                <span className="hidden sm:inline">Routes</span>
                <span className="sm:hidden">Routes</span>
              </TabsTrigger>
              <TabsTrigger value="pod" className="gap-2">
                <FileSignature className="w-4 h-4" />
                <span className="hidden sm:inline">Proof of Delivery</span>
                <span className="sm:hidden">POD</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            <TabsContent value="all" className="mt-0">
              <AllOrdersTab />
            </TabsContent>
            <TabsContent value="dispatch" className="mt-0">
              <DispatchTab />
            </TabsContent>
            <TabsContent value="routes" className="mt-0">
              <RoutesTab />
            </TabsContent>
            <TabsContent value="pod" className="mt-0">
              <ProofOfDeliveryTab />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
