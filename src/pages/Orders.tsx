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
  FileDown,
  Plus,
  Loader2
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
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
import { useOrders } from "@/hooks/useOrders";
import { AllOrdersTab } from "@/components/orders/AllOrdersTab";
import { CreateOrderDialog } from "@/components/orders/CreateOrderDialog"; // We'll create this next

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const { data, isLoading } = useOrders();
  const [isCreateOpen, setCreateOpen] = useState(false);

  const stats = data?.stats || { total: 0, pending: 0, dispatch: 0, in_transit: 0, delivered: 0 };
  const orders = data?.orders || [];

  const handleExportExcel = () => {
    if (!orders.length) return;
    exportToExcel(orders.map(o => ({
      ID: o.order_number,
      Customer: o.customer_id,
      Status: o.status,
      Amount: o.total_amount,
      Date: new Date(o.created_at).toLocaleDateString()
    })), "Orders_Report", "Orders");
  };

  const metrics = [
    {
      title: "Pending Orders",
      value: String(stats.pending),
      change: 0,
      changeLabel: "vs yesterday",
      icon: <Clock className="w-5 h-5" />,
      iconColor: "bg-fleet-yellow/10 text-fleet-yellow",
    },
    {
      title: "Ready for Dispatch",
      value: String(stats.dispatch),
      change: 0,
      changeLabel: "vs yesterday",
      icon: <Send className="w-5 h-5" />,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "In Transit",
      value: String(stats.in_transit),
      change: 0,
      changeLabel: "active trips",
      icon: <Truck className="w-5 h-5" />,
      iconColor: "bg-fleet-purple/10 text-fleet-purple",
    },
    {
      title: "Delivered (Total)",
      value: String(stats.delivered),
      change: 0,
      changeLabel: "all time",
      icon: <CheckCircle className="w-5 h-5" />,
      iconColor: "bg-fleet-green/10 text-fleet-green",
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground mt-1">
            End-to-end order lifecycle from creation to proof of delivery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Order
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Export Current View</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              {/* <TabsTrigger value="routes" className="gap-2">
                <Route className="w-4 h-4" />
                <span className="hidden sm:inline">Routes</span>
              </TabsTrigger> */}
              <TabsTrigger value="pod" className="gap-2">
                <FileSignature className="w-4 h-4" />
                <span className="hidden sm:inline">Delivered / POD</span>
                <span className="sm:hidden">POD</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
            ) : (
              <>
                <TabsContent value="all" className="mt-0">
                  <AllOrdersTab orders={orders} />
                </TabsContent>
                <TabsContent value="dispatch" className="mt-0">
                  <AllOrdersTab orders={orders.filter(o => ['ready_for_dispatch', 'processing'].includes(o.status))} />
                </TabsContent>
                <TabsContent value="pod" className="mt-0">
                  <AllOrdersTab orders={orders.filter(o => o.status === 'delivered')} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </motion.div>

      <CreateOrderDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
    </DashboardLayout>
  );
}
