import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  Search,
  Filter,
  Plus,
  Grid3X3,
  List,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const orders = [
  {
    id: "ord_001",
    trackingNumber: "FB123456",
    status: "in-progress" as const,
    customer: "Acme Corporation",
    pickup: "123 Main St, New York, NY",
    dropoff: "456 Oak Ave, Brooklyn, NY",
    driver: "John D.",
    eta: "2:30 PM",
    createdAt: "2024-01-15 09:30 AM",
  },
  {
    id: "ord_002",
    trackingNumber: "FB123457",
    status: "pending" as const,
    customer: "Tech Solutions Inc.",
    pickup: "789 Pine St, Manhattan, NY",
    dropoff: "321 Elm St, Queens, NY",
    createdAt: "2024-01-15 10:15 AM",
  },
  {
    id: "ord_003",
    trackingNumber: "FB123458",
    status: "dispatched" as const,
    customer: "Global Imports LLC",
    pickup: "555 Market St, Bronx, NY",
    dropoff: "888 Broadway, Manhattan, NY",
    driver: "Sarah M.",
    eta: "3:45 PM",
    createdAt: "2024-01-15 08:00 AM",
  },
  {
    id: "ord_004",
    trackingNumber: "FB123459",
    status: "delivered" as const,
    customer: "Quick Retail Co.",
    pickup: "100 Commerce Dr, Staten Island, NY",
    dropoff: "200 Trade Ave, Brooklyn, NY",
    driver: "Mike R.",
    createdAt: "2024-01-15 07:00 AM",
  },
  {
    id: "ord_005",
    trackingNumber: "FB123460",
    status: "pending" as const,
    customer: "Fresh Foods Market",
    pickup: "333 Farm Rd, Long Island, NY",
    dropoff: "444 Store Ln, Manhattan, NY",
    createdAt: "2024-01-15 11:00 AM",
  },
  {
    id: "ord_006",
    trackingNumber: "FB123461",
    status: "in-progress" as const,
    customer: "Office Supplies Direct",
    pickup: "222 Industrial Blvd, Jersey City, NJ",
    dropoff: "111 Business Park, Manhattan, NY",
    driver: "Lisa K.",
    eta: "4:00 PM",
    createdAt: "2024-01-15 09:00 AM",
  },
];

const metrics = [
  {
    title: "Pending Orders",
    value: "12",
    change: -5,
    changeLabel: "vs yesterday",
    icon: <Clock className="w-5 h-5" />,
    iconColor: "bg-fleet-yellow/10 text-fleet-yellow",
  },
  {
    title: "In Progress",
    value: "24",
    change: 18,
    changeLabel: "vs yesterday",
    icon: <Truck className="w-5 h-5" />,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "Completed Today",
    value: "45",
    change: 12,
    changeLabel: "vs yesterday",
    icon: <CheckCircle className="w-5 h-5" />,
    iconColor: "bg-fleet-green/10 text-fleet-green",
  },
  {
    title: "Total Orders",
    value: "81",
    change: 8,
    changeLabel: "vs yesterday",
    icon: <Package className="w-5 h-5" />,
    iconColor: "bg-fleet-purple/10 text-fleet-purple",
  },
];

export default function Orders() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      order.status === activeTab ||
      (activeTab === "active" && ["pending", "dispatched", "in-progress"].includes(order.status));
    return matchesSearch && matchesTab;
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all delivery orders.
          </p>
        </div>
        <Button variant="gradient" className="gap-2">
          <Plus className="w-4 h-4" />
          New Order
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.title} {...metric} delay={index * 0.1} />
        ))}
      </div>

      {/* Orders Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-card rounded-xl border border-border shadow-sm"
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="active" className="gap-1.5">
                  Active
                  <Badge variant="info" className="ml-1 px-1.5 py-0">
                    36
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9 w-full lg:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <div className="hidden sm:flex items-center border border-border rounded-lg p-0.5">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon-sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="p-4">
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1"
            )}
          >
            {filteredOrders.map((order, index) => (
              <OrderCard key={order.id} order={order} index={index} />
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredOrders.length} orders</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
