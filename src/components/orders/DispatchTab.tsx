import { useState } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Users,
  Package,
  Play,
  Check,
  RefreshCw,
  Zap,
  Plus,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useOrders,
  useDispatchOrder,
} from "@/hooks/useOrders";
import {
  useDispatchBatches,
  useDispatchStats,
  useCreateDispatchBatch,
  useDispatchBatchAction,
  useAutoDispatch,
} from "@/hooks/useDispatch";
import { useDriversWithVehicles } from "@/hooks/useDriversWithVehicles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600" },
  dispatched: { label: "Dispatched", color: "bg-blue-500/10 text-blue-600" },
  in_progress: { label: "In Progress", color: "bg-primary/10 text-primary" },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600" },
};

export function DispatchTab() {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("");

  const { data: pendingOrders, isLoading: loadingOrders } = useOrders([
    "pending",
    "confirmed",
  ]);
  const { data: batches, isLoading: loadingBatches } = useDispatchBatches();
  const { data: stats } = useDispatchStats();
  const { data: drivers } = useDriversWithVehicles();

  const createBatch = useCreateDispatchBatch();
  const batchAction = useDispatchBatchAction();
  const autoDispatch = useAutoDispatch();

  const handleOrderSelect = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  const handleCreateBatch = () => {
    if (selectedOrders.length === 0) {
      toast.error("Select at least one order");
      return;
    }
    setIsCreateBatchOpen(true);
  };

  const handleConfirmBatch = () => {
    if (!selectedDriver) {
      toast.error("Select a driver");
      return;
    }

    const driver = drivers?.find((d) => d.id === selectedDriver);
    
    createBatch.mutate({
      driver_id: selectedDriver,
      vehicle_id: driver?.vehicle_id || undefined,
      order_ids: selectedOrders,
    }, {
      onSuccess: () => {
        setSelectedOrders([]);
        setSelectedDriver("");
        setIsCreateBatchOpen(false);
      },
    });
  };

  const handleAutoDispatch = () => {
    autoDispatch.mutate({
      max_orders_per_batch: 5,
    });
  };

  const handleBatchAction = (batchId: string, action: "dispatch" | "start" | "complete") => {
    batchAction.mutate({ batchId, action });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Batches</p>
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dispatched</p>
                <p className="text-2xl font-bold">{stats?.dispatched || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Play className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats?.in_progress || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats?.completed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Orders Panel */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Orders</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoDispatch}
                disabled={autoDispatch.isPending}
              >
                <Zap className="w-4 h-4 mr-1" />
                Auto Dispatch
              </Button>
              <Button
                size="sm"
                onClick={handleCreateBatch}
                disabled={selectedOrders.length === 0}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Batch ({selectedOrders.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : pendingOrders?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No pending orders</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {pendingOrders?.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) =>
                        handleOrderSelect(order.id, checked as boolean)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {order.tracking_number}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {order.service_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {order.customer?.company_name || "Unknown"}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {order.dropoff_city || "N/A"}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dispatch Batches Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dispatch Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBatches ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : batches?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No dispatch batches</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {batches?.map((batch) => (
                  <motion.div
                    key={batch.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {batch.batch_number}
                          </span>
                          <Badge
                            className={statusConfig[batch.status]?.color}
                          >
                            {statusConfig[batch.status]?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {batch.driver?.profile?.full_name || "Unassigned"} •{" "}
                          {batch.total_orders} orders
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {batch.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBatchAction(batch.id, "dispatch")}
                          >
                            Dispatch
                          </Button>
                        )}
                        {batch.status === "dispatched" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBatchAction(batch.id, "start")}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {batch.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBatchAction(batch.id, "complete")}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                    {batch.vehicle && (
                      <p className="text-xs text-muted-foreground">
                        Vehicle: {batch.vehicle.name} ({batch.vehicle.license_plate})
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Batch Dialog */}
      <Dialog open={isCreateBatchOpen} onOpenChange={setIsCreateBatchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dispatch Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedOrders.length} orders selected
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Driver</label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers
                    ?.filter((d) => d.status === "active")
                    .map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {driver.profile?.full_name || driver.employee_id}
                          {driver.vehicle && (
                            <span className="text-muted-foreground">
                              ({driver.vehicle.license_plate})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateBatchOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBatch} disabled={createBatch.isPending}>
              {createBatch.isPending ? "Creating..." : "Create Batch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
