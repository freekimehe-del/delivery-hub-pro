import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  FileSignature,
  MapPin,
  User,
  Package,
  RefreshCw,
  Eye,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOrders, useOrder } from "@/hooks/useOrders";
import { format } from "date-fns";

const podStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  delivered: { label: "Completed", color: "bg-green-500/10 text-green-600", icon: <CheckCircle className="w-3 h-3" /> },
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600", icon: <Clock className="w-3 h-3" /> },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-600", icon: <XCircle className="w-3 h-3" /> },
};

export function ProofOfDeliveryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "delivered" | "pending" | "failed">("all");

  const { data: allOrders, isLoading } = useOrders();
  const { data: orderDetails } = useOrder(selectedOrderId);

  // Filter orders that have reached delivery stage or are delivered
  const deliveryOrders = allOrders?.filter((order) => {
    const isDeliveryStage = [
      "en_route_delivery",
      "arrived_delivery",
      "delivered",
      "failed",
    ].includes(order.status);

    const matchesSearch =
      order.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "delivered" && order.status === "delivered") ||
      (filter === "pending" && ["en_route_delivery", "arrived_delivery"].includes(order.status)) ||
      (filter === "failed" && order.status === "failed");

    return isDeliveryStage && matchesSearch && matchesFilter;
  });

  const stats = {
    total: deliveryOrders?.length || 0,
    completed: deliveryOrders?.filter((o) => o.status === "delivered" && o.pod_captured_at).length || 0,
    pending: deliveryOrders?.filter((o) => ["en_route_delivery", "arrived_delivery"].includes(o.status)).length || 0,
    failed: deliveryOrders?.filter((o) => o.status === "failed").length || 0,
  };

  const getPodStatus = (order: typeof allOrders extends (infer T)[] | undefined ? T : never) => {
    if (order.status === "delivered" && order.pod_captured_at) return "delivered";
    if (order.status === "failed") return "failed";
    return "pending";
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">POD Captured</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending POD</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Failed Deliveries</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking # or customer..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(["all", "delivered", "pending", "failed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* POD Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Proof of Delivery Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : deliveryOrders?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSignature className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No delivery records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Delivery Address</TableHead>
                    <TableHead>POD Status</TableHead>
                    <TableHead>Captured At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryOrders?.map((order) => {
                    const status = getPodStatus(order);
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">
                          {order.tracking_number}
                        </TableCell>
                        <TableCell>{order.customer?.company_name || "Unknown"}</TableCell>
                        <TableCell>{order.driver?.profile?.full_name || "Unassigned"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {order.dropoff_address}
                        </TableCell>
                        <TableCell>
                          <Badge className={podStatusConfig[status]?.color}>
                            {podStatusConfig[status]?.icon}
                            <span className="ml-1">{podStatusConfig[status]?.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.pod_captured_at
                            ? format(new Date(order.pod_captured_at), "MMM d, yyyy h:mm a")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrderId(order.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* POD Details Sheet */}
      <Sheet open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5" />
              Proof of Delivery Details
            </SheetTitle>
          </SheetHeader>

          {orderDetails && (
            <div className="mt-6 space-y-6">
              {/* Order Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-medium">
                    {orderDetails.tracking_number}
                  </span>
                  <Badge
                    className={
                      podStatusConfig[getPodStatus(orderDetails as any)]?.color
                    }
                  >
                    {podStatusConfig[getPodStatus(orderDetails as any)]?.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> Customer
                    </p>
                    <p className="font-medium">{orderDetails.customer?.company_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <User className="w-3 h-3" /> Driver
                    </p>
                    <p className="font-medium">
                      {orderDetails.driver?.profile?.full_name || "Unassigned"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground flex items-center gap-1 text-sm">
                    <MapPin className="w-3 h-3" /> Delivery Address
                  </p>
                  <p className="font-medium">{orderDetails.dropoff_address}</p>
                </div>
              </div>

              {/* POD Details */}
              {orderDetails.pod_captured_at ? (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="font-medium">POD Information</h4>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Recipient Name</p>
                      <p className="font-medium">{orderDetails.pod_recipient_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Captured At</p>
                      <p className="font-medium">
                        {format(new Date(orderDetails.pod_captured_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>

                  {orderDetails.pod_signature_url && (
                    <div>
                      <p className="text-muted-foreground text-sm flex items-center gap-1 mb-2">
                        <FileSignature className="w-3 h-3" /> Signature
                      </p>
                      <div className="bg-muted rounded-lg p-4">
                        <img
                          src={orderDetails.pod_signature_url}
                          alt="Signature"
                          className="max-h-[100px] mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  {orderDetails.pod_photo_urls && orderDetails.pod_photo_urls.length > 0 && (
                    <div>
                      <p className="text-muted-foreground text-sm flex items-center gap-1 mb-2">
                        <Camera className="w-3 h-3" /> Delivery Photos
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {(orderDetails.pod_photo_urls as string[]).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Delivery photo ${index + 1}`}
                            className="rounded-lg object-cover aspect-square"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {orderDetails.pod_notes && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Delivery Notes</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{orderDetails.pod_notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-t border-border mt-4 pt-4">
                  <FileSignature className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>POD not yet captured</p>
                  <p className="text-sm">Waiting for driver to complete delivery</p>
                </div>
              )}

              {/* Failure Info */}
              {orderDetails.status === "failed" && orderDetails.failure_reason && (
                <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                  <p className="text-red-600 font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Delivery Failed
                  </p>
                  <p className="text-sm mt-1">{orderDetails.failure_reason}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
