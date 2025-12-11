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
  Search,
  Plus,
  Filter,
  FileDown,
} from "lucide-react";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import { AllOrdersTab } from "@/components/orders/AllOrdersTab";
import { DispatchTab } from "@/components/orders/DispatchTab";
import { RoutesTab } from "@/components/orders/RoutesTab";
import { ProofOfDeliveryTab } from "@/components/orders/ProofOfDeliveryTab";
import { WorkflowPipeline } from "@/components/orders/WorkflowPipeline";
import { ExceptionPanel } from "@/components/orders/ExceptionPanel";
import { useOrderStats } from "@/hooks/useOrders";
import { WorkflowStage } from "@/hooks/useWorkflow";

interface OrderMetrics {
  pending?: number;
  dispatched?: number;
  in_transit?: number;
  delivered?: number;
}

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
  const [metricsData, setMetricsData] = useState<OrderMetrics | null>(null);

  useEffect(() => {
    async function load() {
      const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
      try {
        const resp = await fetch(`${apiUrl}/api/orders`);
        if (resp.ok) {
          const json = await resp.json();
          setMetricsData(json.stats);
        }
      } catch (e) {
        // Ignore errors
      }
    }
    load();
  }, []);

  const handleStageClick = (stage: WorkflowStage) => {
    setActiveTab(stageToTab[stage]);
  };

  const getExportData = () => {
    // Mock export data logic - ideally fetches from the child components or central store
    if (activeTab === 'all') return [{ id: 'ORD-001', customer: 'TechCorp', amount: 5000, status: 'Pending' }];
    if (activeTab === 'dispatch') return [{ id: 'ORD-002', vehicle: 'Truck-1', driver: 'Ali', status: 'Dispatched' }];
    return [];
  };

  const handleExportExcel = () => {
    exportToExcel(getExportData(), `Orders_${activeTab}`, activeTab);
  };

  const handleExportPDF = () => {
    const data = getExportData();
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).map(k => ({ header: k.toUpperCase(), key: k }));
    exportToPDF(data, headers, `Orders Report - ${activeTab}`, `Orders_${activeTab}`);
  };

  const metrics = [
    {
      title: "Pending Orders",
      value: String(metricsData?.pending || 0),
      change: 0,
      changeLabel: "vs yesterday",
      icon: <Clock className="w-5 h-5" />,
      iconColor: "bg-fleet-yellow/10 text-fleet-yellow",
    },
    {
      title: "Dispatched",
      value: String(metricsData?.dispatched || 0),
      change: 0,
      changeLabel: "vs yesterday",
      icon: <Send className="w-5 h-5" />,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "In Transit",
      value: String(metricsData?.in_transit || 0),
      change: 0,
      changeLabel: "vs yesterday",
      icon: <Truck className="w-5 h-5" />,
      iconColor: "bg-fleet-purple/10 text-fleet-purple",
    },
    {
      title: "Delivered Today",
      value: String(metricsData?.delivered || 0),
      change: 0,
      changeLabel: "vs yesterday",
      icon: <CheckCircle className="w-5 h-5" />,
      iconColor: "bg-fleet-green/10 text-fleet-green",
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground mt-1">
            End-to-end order lifecycle from creation to proof of delivery.
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
