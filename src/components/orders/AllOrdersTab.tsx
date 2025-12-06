import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Grid3X3,
  List,
  Plus,
  RefreshCw,
  Download,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders, OrderStatus } from "@/hooks/useOrders";
import { useValidateOrders } from "@/hooks/useWorkflow";
import { OrderCard } from "./OrderCard";
import { AddOrderDialog } from "./AddOrderDialog";
import { OrderDetailsSheet } from "./OrderDetailsSheet";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const statusFilters = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "en_route_pickup", label: "En Route Pickup" },
  { value: "picked_up", label: "Picked Up" },
  { value: "en_route_delivery", label: "En Route Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export function AllOrdersTab() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedForValidation, setSelectedForValidation] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const { data: orders, isLoading, refetch } = useOrders(
    statusFilter === "all" ? undefined : (statusFilter as OrderStatus)
  );
  const validateOrders = useValidateOrders();

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.dropoff_address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const pendingOrders = filteredOrders?.filter((o) => o.status === "pending") || [];

  const handleSelectForValidation = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedForValidation([...selectedForValidation, orderId]);
    } else {
      setSelectedForValidation(selectedForValidation.filter((id) => id !== orderId));
    }
  };

  const handleValidateSelected = () => {
    if (selectedForValidation.length === 0) {
      toast.error("Select at least one order to validate");
      return;
    }
    validateOrders.mutate(selectedForValidation, {
      onSuccess: () => {
        setSelectedForValidation([]);
        setIsSelecting(false);
      },
    });
  };

  const handleValidateAll = () => {
    const pendingIds = pendingOrders.map((o) => o.id);
    if (pendingIds.length === 0) {
      toast.error("No pending orders to validate");
      return;
    }
    validateOrders.mutate(pendingIds);
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Validation Actions */}
          {pendingOrders.length > 0 && (
            <>
              {isSelecting ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSelecting(false);
                      setSelectedForValidation([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleValidateSelected}
                    disabled={
                      selectedForValidation.length === 0 || validateOrders.isPending
                    }
                    className="gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Validate ({selectedForValidation.length})
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSelecting(true)}
                  >
                    Select to Validate
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleValidateAll}
                    disabled={validateOrders.isPending}
                    className="gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Validate All ({pendingOrders.length})
                  </Button>
                </>
              )}
            </>
          )}

          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
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
          <Button variant="gradient" className="gap-2" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1"
          )}
        >
          {filteredOrders?.map((order, index) => (
            <div key={order.id} className="relative">
              {isSelecting && order.status === "pending" && (
                <div className="absolute top-3 left-3 z-10">
                  <Checkbox
                    checked={selectedForValidation.includes(order.id)}
                    onCheckedChange={(checked) =>
                      handleSelectForValidation(order.id, checked as boolean)
                    }
                  />
                </div>
              )}
              <OrderCard
                order={{
                  id: order.id,
                  trackingNumber: order.tracking_number,
                  status: order.status.replace(/_/g, "-") as any,
                  customer: order.customer?.company_name || "Unknown Customer",
                  pickup: order.pickup_address,
                  dropoff: order.dropoff_address,
                  driver: order.driver?.profile?.full_name || undefined,
                  eta: order.estimated_delivery_time
                    ? new Date(order.estimated_delivery_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : undefined,
                  createdAt: new Date(order.created_at).toLocaleString(),
                }}
                index={index}
                onViewDetails={() => setSelectedOrderId(order.id)}
              />
            </div>
          ))}
        </div>
      )}

      {filteredOrders?.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredOrders?.length || 0} orders</span>
      </div>

      {/* Dialogs */}
      <AddOrderDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
      <OrderDetailsSheet
        orderId={selectedOrderId}
        open={!!selectedOrderId}
        onOpenChange={(open) => !open && setSelectedOrderId(null)}
      />
    </div>
  );
}
