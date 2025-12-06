import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  User,
  Truck,
  Clock,
  Phone,
  FileSignature,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { WorkflowActions } from "./WorkflowActions";
import { format } from "date-fns";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  confirmed: { label: "Confirmed", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  dispatched: { label: "Dispatched", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  driver_accepted: { label: "Driver Accepted", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  en_route_pickup: { label: "En Route to Pickup", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  arrived_pickup: { label: "Arrived at Pickup", color: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  picked_up: { label: "Picked Up", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  en_route_delivery: { label: "En Route to Delivery", color: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  arrived_delivery: { label: "Arrived at Delivery", color: "bg-lime-500/10 text-lime-600 border-lime-500/20" },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  failed: { label: "Failed", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  cancelled: { label: "Cancelled", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
  rescheduled: { label: "Rescheduled", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
};

interface OrderDetailsSheetProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsSheet({ orderId, open, onOpenChange }: OrderDetailsSheetProps) {
  const { data: order, isLoading } = useOrder(orderId);

  if (!order && !isLoading) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Details
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : order ? (
          <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div>
                <span className="font-mono text-lg font-bold">
                  {order.tracking_number}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusConfig[order.status]?.color}>
                    {statusConfig[order.status]?.label}
                  </Badge>
                  <Badge variant="outline">{order.service_type}</Badge>
                </div>
              </div>
              
              {/* Workflow Actions */}
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <WorkflowActions order={order} />
              </div>
            </div>

            {/* Customer & Driver */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> Customer
                </p>
                <p className="font-medium">{order.customer?.company_name || "Unknown"}</p>
                {order.customer?.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    {order.customer.phone}
                  </p>
                )}
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Driver
                </p>
                <p className="font-medium">
                  {order.driver?.profile?.full_name || "Unassigned"}
                </p>
                {order.vehicle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.vehicle.license_plate}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Route */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Route</h4>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="w-0.5 flex-1 bg-border min-h-[40px]" />
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Pickup</p>
                    <p className="font-medium">{order.pickup_address}</p>
                    {order.pickup_city && (
                      <p className="text-sm text-muted-foreground">
                        {order.pickup_city}, {order.pickup_state} {order.pickup_postal_code}
                      </p>
                    )}
                    {order.pickup_contact_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <User className="w-3 h-3 inline mr-1" />
                        {order.pickup_contact_name}
                        {order.pickup_contact_phone && ` • ${order.pickup_contact_phone}`}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dropoff</p>
                    <p className="font-medium">{order.dropoff_address}</p>
                    {order.dropoff_city && (
                      <p className="text-sm text-muted-foreground">
                        {order.dropoff_city}, {order.dropoff_state} {order.dropoff_postal_code}
                      </p>
                    )}
                    {order.dropoff_contact_name && (
                      <p className="text-sm text-muted-foreground mt-1">
                        <User className="w-3 h-3 inline mr-1" />
                        {order.dropoff_contact_name}
                        {order.dropoff_contact_phone && ` • ${order.dropoff_contact_phone}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Package Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Package Details</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p className="font-medium">{order.package_type || "N/A"}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <p className="text-muted-foreground text-xs">Weight</p>
                  <p className="font-medium">{order.package_weight ? `${order.package_weight} lbs` : "N/A"}</p>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <p className="text-muted-foreground text-xs">Count</p>
                  <p className="font-medium">{order.package_count || 1}</p>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                {order.is_fragile && (
                  <span className="text-yellow-600 flex items-center gap-1">
                    ⚠️ Fragile
                  </span>
                )}
                {order.requires_signature && (
                  <span className="text-primary flex items-center gap-1">
                    <FileSignature className="w-3 h-3" />
                    Signature Required
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Created
                  </span>
                  <span>{format(new Date(order.created_at), "MMM d, yyyy h:mm a")}</span>
                </div>
                {order.actual_pickup_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Picked Up
                    </span>
                    <span>{format(new Date(order.actual_pickup_time), "MMM d, yyyy h:mm a")}</span>
                  </div>
                )}
                {order.actual_delivery_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Delivered
                    </span>
                    <span>{format(new Date(order.actual_delivery_time), "MMM d, yyyy h:mm a")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* POD Info */}
            {order.pod_captured_at && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <FileSignature className="w-4 h-4" />
                    Proof of Delivery
                  </h4>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-600 font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Delivered Successfully
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Received by: {order.pod_recipient_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.pod_captured_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {order.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {order.notes}
                  </p>
                </div>
              </>
            )}

            {/* Pricing */}
            {order.total_amount && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Pricing</h4>
                  <div className="space-y-1 text-sm">
                    {order.base_rate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Rate</span>
                        <span>${order.base_rate.toFixed(2)}</span>
                      </div>
                    )}
                    {order.distance_charge && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distance Charge</span>
                        <span>${order.distance_charge.toFixed(2)}</span>
                      </div>
                    )}
                    {order.surcharges && order.surcharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Surcharges</span>
                        <span>${order.surcharges.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${order.total_amount.toFixed(2)} {order.currency}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
