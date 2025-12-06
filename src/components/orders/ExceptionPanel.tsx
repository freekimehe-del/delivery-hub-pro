import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Truck,
  Package,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useOrders, Order } from "@/hooks/useOrders";
import { useRescheduleOrder, ExceptionType } from "@/hooks/useWorkflow";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const exceptionTypes: { value: ExceptionType; label: string; icon: React.ReactNode }[] = [
  { value: "address_invalid", label: "Invalid Address", icon: <MapPin className="w-4 h-4" /> },
  { value: "recipient_unavailable", label: "Recipient Unavailable", icon: <User className="w-4 h-4" /> },
  { value: "item_damaged", label: "Item Damaged", icon: <Package className="w-4 h-4" /> },
  { value: "vehicle_breakdown", label: "Vehicle Breakdown", icon: <Truck className="w-4 h-4" /> },
  { value: "traffic_delay", label: "Traffic Delay", icon: <Clock className="w-4 h-4" /> },
  { value: "customer_refused", label: "Customer Refused", icon: <XCircle className="w-4 h-4" /> },
  { value: "wrong_address", label: "Wrong Address", icon: <MapPin className="w-4 h-4" /> },
  { value: "access_denied", label: "Access Denied", icon: <AlertTriangle className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <MessageSquare className="w-4 h-4" /> },
];

const severityColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function ExceptionPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleNotes, setRescheduleNotes] = useState("");

  const { data: failedOrders, isLoading } = useOrders(["failed", "rescheduled"]);
  const rescheduleOrder = useRescheduleOrder();

  const handleReschedule = () => {
    if (!selectedOrder) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const endWindow = new Date(tomorrow);
    endWindow.setHours(17, 0, 0, 0);

    rescheduleOrder.mutate(
      {
        orderId: selectedOrder.id,
        newDeliveryWindow: {
          start: tomorrow.toISOString(),
          end: endWindow.toISOString(),
        },
        notes: rescheduleNotes,
      },
      {
        onSuccess: () => {
          setIsRescheduleOpen(false);
          setSelectedOrder(null);
          setRescheduleNotes("");
        },
      }
    );
  };

  const parseExceptionType = (failureReason: string | null): ExceptionType => {
    if (!failureReason) return "other";
    const match = failureReason.match(/\[(\w+)\]/);
    return (match?.[1] as ExceptionType) || "other";
  };

  const getExceptionSeverity = (order: Order): "low" | "medium" | "high" | "critical" => {
    const type = parseExceptionType(order.failure_reason);
    if (type === "item_damaged" || type === "vehicle_breakdown") return "critical";
    if (type === "address_invalid" || type === "wrong_address") return "high";
    if (type === "recipient_unavailable" || type === "customer_refused") return "medium";
    return "low";
  };

  if (!failedOrders?.length && !isLoading) {
    return null;
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader
        className="cursor-pointer py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-base text-destructive">
                Exception Queue
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {failedOrders?.length || 0} orders require attention
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs">
              {failedOrders?.filter((o) => o.status === "failed").length || 0} failed
            </Badge>
            <Badge variant="outline" className="text-xs">
              {failedOrders?.filter((o) => o.status === "rescheduled").length || 0} rescheduled
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {failedOrders?.map((order) => {
                    const exceptionType = parseExceptionType(order.failure_reason);
                    const exceptionInfo = exceptionTypes.find(
                      (t) => t.value === exceptionType
                    );
                    const severity = getExceptionSeverity(order);

                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              "p-2 rounded-lg border",
                              severityColors[severity]
                            )}
                          >
                            {exceptionInfo?.icon || <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">
                                {order.tracking_number}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn("text-xs", severityColors[severity])}
                              >
                                {severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {exceptionInfo?.label}: {order.failure_reason?.replace(/\[\w+\]\s*/, "")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.customer?.company_name} • {order.dropoff_city || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {order.status === "failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsRescheduleOpen(true);
                              }}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Reschedule
                            </Button>
                          )}
                          {order.status === "rescheduled" && (
                            <Badge variant="secondary" className="text-xs">
                              Rescheduled
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedOrder && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-mono text-sm font-medium">
                  {selectedOrder.tracking_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.dropoff_address}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add notes for rescheduling..."
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
              />
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>New delivery window:</strong> Tomorrow, 9:00 AM - 5:00 PM
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReschedule} disabled={rescheduleOrder.isPending}>
              {rescheduleOrder.isPending ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
