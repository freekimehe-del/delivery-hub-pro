import { useState } from "react";
import { motion } from "framer-motion";
import {
  Route,
  MapPin,
  Clock,
  Play,
  Check,
  RefreshCw,
  Plus,
  Navigation,
  Flag,
  Circle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useRoutes,
  useRoute,
  useRouteStats,
  useCreateRoute,
  useStartRoute,
  useCompleteStop,
} from "@/hooks/useRoutes";
import { useOrders } from "@/hooks/useOrders";
import { useDriversWithVehicles } from "@/hooks/useDriversWithVehicles";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  planned: { label: "Planned", color: "bg-yellow-500/10 text-yellow-600", icon: <Clock className="w-3 h-3" /> },
  in_progress: { label: "In Progress", color: "bg-blue-500/10 text-blue-600", icon: <Play className="w-3 h-3" /> },
  completed: { label: "Completed", color: "bg-green-500/10 text-green-600", icon: <Check className="w-3 h-3" /> },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600", icon: <Circle className="w-3 h-3" /> },
};

export function RoutesTab() {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const { data: routes, isLoading: loadingRoutes } = useRoutes();
  const { data: routeDetails } = useRoute(selectedRouteId);
  const { data: stats } = useRouteStats();
  const { data: dispatchedOrders } = useOrders(["dispatched", "driver_accepted"]);
  const { data: drivers } = useDriversWithVehicles();

  const createRoute = useCreateRoute();
  const startRoute = useStartRoute();
  const completeStop = useCompleteStop();

  const handleCreateRoute = () => {
    if (!selectedDriver || selectedOrders.length === 0) {
      toast.error("Select a driver and at least one order");
      return;
    }

    const driver = drivers?.find((d) => d.id === selectedDriver);

    createRoute.mutate({
      driver_id: selectedDriver,
      vehicle_id: driver?.vehicle_id || undefined,
      planned_start: new Date().toISOString(),
      order_ids: selectedOrders,
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setSelectedDriver("");
        setSelectedOrders([]);
      },
    });
  };

  const handleStartRoute = (routeId: string) => {
    startRoute.mutate(routeId);
  };

  const handleCompleteStop = (stopId: string, routeId: string) => {
    completeStop.mutate({ stopId, routeId });
  };

  const progressPercent = routeDetails
    ? (routeDetails.completed_stops / Math.max(routeDetails.total_stops, 1)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Planned Routes</p>
                <p className="text-2xl font-bold">{stats?.planned || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Navigation className="w-5 h-5 text-blue-600" />
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
                <Flag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats?.completed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stops</p>
                <p className="text-2xl font-bold">
                  {stats?.completed_stops || 0}/{stats?.total_stops || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Routes List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Routes</CardTitle>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Create Route
          </Button>
        </CardHeader>
        <CardContent>
          {loadingRoutes ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : routes?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Route className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No routes created</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes?.map((route) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">
                          {route.route_number}
                        </span>
                        <Badge className={statusConfig[route.status]?.color}>
                          {statusConfig[route.status]?.icon}
                          <span className="ml-1">{statusConfig[route.status]?.label}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {route.driver?.profile?.full_name || "Unassigned"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {route.completed_stops}/{route.total_stops} stops
                      </span>
                    </div>
                    <Progress
                      value={(route.completed_stops / Math.max(route.total_stops, 1)) * 100}
                    />
                  </div>
                  {route.vehicle && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {route.vehicle.name} • {route.vehicle.license_plate}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Route Details Sheet */}
      <Sheet open={!!selectedRouteId} onOpenChange={(open) => !open && setSelectedRouteId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              {routeDetails?.route_number}
            </SheetTitle>
          </SheetHeader>
          
          {routeDetails && (
            <div className="mt-6 space-y-6">
              {/* Route Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={statusConfig[routeDetails.status]?.color}>
                    {statusConfig[routeDetails.status]?.label}
                  </Badge>
                  {routeDetails.status === "planned" && (
                    <Button
                      size="sm"
                      onClick={() => handleStartRoute(routeDetails.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start Route
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Driver</p>
                    <p className="font-medium">{routeDetails.driver?.profile?.full_name || "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Vehicle</p>
                    <p className="font-medium">{routeDetails.vehicle?.license_plate || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Route Progress</span>
                    <span className="font-medium">{progressPercent.toFixed(0)}%</span>
                  </div>
                  <Progress value={progressPercent} />
                </div>
              </div>

              {/* Stops */}
              <div>
                <h4 className="font-medium mb-3">Route Stops</h4>
                <div className="space-y-3">
                  {routeDetails.stops?.map((stop, index) => (
                    <div
                      key={stop.id}
                      className="flex items-start gap-3 p-3 border border-border rounded-lg"
                    >
                      <div className="flex flex-col items-center">
                        {stop.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                        )}
                        {index < (routeDetails.stops?.length || 0) - 1 && (
                          <div className="w-0.5 h-8 bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">
                            {stop.order?.tracking_number}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {stop.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {stop.order?.dropoff_address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {stop.order?.customer?.company_name}
                        </p>
                        {stop.status === "pending" && routeDetails.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => handleCompleteStop(stop.id, routeDetails.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Complete Stop
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Route Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Route</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                        {driver.profile?.full_name || driver.employee_id}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Orders ({selectedOrders.length})</label>
              <div className="max-h-[200px] overflow-y-auto border border-border rounded-lg p-2 space-y-2">
                {dispatchedOrders?.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded"
                  >
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOrders([...selectedOrders, order.id]);
                        } else {
                          setSelectedOrders(selectedOrders.filter((id) => id !== order.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-mono">{order.tracking_number}</p>
                      <p className="text-xs text-muted-foreground">{order.dropoff_address}</p>
                    </div>
                  </div>
                ))}
                {(!dispatchedOrders || dispatchedOrders.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No dispatched orders available
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoute} disabled={createRoute.isPending}>
              {createRoute.isPending ? "Creating..." : "Create Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
