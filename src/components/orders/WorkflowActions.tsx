import { useState } from "react";
import {
  Check,
  Play,
  AlertTriangle,
  ChevronRight,
  Truck,
  MapPin,
  Package,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Order, OrderStatus, useUpdateOrderStatus } from "@/hooks/useOrders";
import {
  getNextTransitions,
  getOrderStage,
  useAdvanceWorkflow,
  useReportException,
  ExceptionType,
} from "@/hooks/useWorkflow";
import { cn } from "@/lib/utils";

interface WorkflowActionsProps {
  order: Order;
  compact?: boolean;
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  dispatched: "Dispatched",
  driver_accepted: "Driver Accepted",
  en_route_pickup: "En Route to Pickup",
  arrived_pickup: "Arrived at Pickup",
  picked_up: "Picked Up",
  en_route_delivery: "En Route to Delivery",
  arrived_delivery: "Arrived at Delivery",
  delivered: "Delivered",
  failed: "Failed",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
};

const actionIcons: Record<string, React.ReactNode> = {
  validate: <Check className="w-4 h-4" />,
  dispatch: <Truck className="w-4 h-4" />,
  driver_accept: <Check className="w-4 h-4" />,
  start_pickup: <Play className="w-4 h-4" />,
  arrive_pickup: <MapPin className="w-4 h-4" />,
  complete_pickup: <Package className="w-4 h-4" />,
  start_delivery: <Truck className="w-4 h-4" />,
  arrive_delivery: <MapPin className="w-4 h-4" />,
  complete_delivery: <Camera className="w-4 h-4" />,
  fail_delivery: <AlertTriangle className="w-4 h-4" />,
  reschedule: <Play className="w-4 h-4" />,
};

const exceptionOptions: { value: ExceptionType; label: string }[] = [
  { value: "recipient_unavailable", label: "Recipient Unavailable" },
  { value: "address_invalid", label: "Invalid Address" },
  { value: "customer_refused", label: "Customer Refused" },
  { value: "access_denied", label: "Access Denied" },
  { value: "item_damaged", label: "Item Damaged" },
  { value: "other", label: "Other" },
];

export function WorkflowActions({ order, compact = false }: WorkflowActionsProps) {
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);
  const [exceptionType, setExceptionType] = useState<ExceptionType>("other");
  const [exceptionNotes, setExceptionNotes] = useState("");

  const advanceWorkflow = useAdvanceWorkflow();
  const reportException = useReportException();

  const transitions = getNextTransitions(order.status);
  const currentStage = getOrderStage(order.status);

  const handleAdvance = (targetStatus: OrderStatus) => {
    advanceWorkflow.mutate({
      orderId: order.id,
      targetStatus,
    });
  };

  const handleReportException = () => {
    reportException.mutate(
      {
        orderId: order.id,
        type: exceptionType,
        description: exceptionNotes || exceptionType,
      },
      {
        onSuccess: () => {
          setIsExceptionOpen(false);
          setExceptionNotes("");
          setExceptionType("other");
        },
      }
    );
  };

  // Get primary action (most likely next step)
  const primaryTransition = transitions.find(
    (t) => t.action !== "fail_delivery" && t.action !== "reschedule"
  );

  const exceptionTransition = transitions.find(
    (t) => t.action === "fail_delivery"
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {primaryTransition && (
          <Button
            size="sm"
            onClick={() => handleAdvance(primaryTransition.to)}
            disabled={advanceWorkflow.isPending}
          >
            {actionIcons[primaryTransition.action]}
            <span className="ml-1 hidden sm:inline">
              {statusLabels[primaryTransition.to]}
            </span>
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
        {exceptionTransition && (
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/50"
            onClick={() => setIsExceptionOpen(true)}
          >
            <AlertTriangle className="w-4 h-4" />
          </Button>
        )}

        <ExceptionDialog
          open={isExceptionOpen}
          onOpenChange={setIsExceptionOpen}
          order={order}
          exceptionType={exceptionType}
          setExceptionType={setExceptionType}
          exceptionNotes={exceptionNotes}
          setExceptionNotes={setExceptionNotes}
          onSubmit={handleReportException}
          isPending={reportException.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Workflow Actions</p>
        <Badge variant="outline" className="text-xs">
          Stage: {currentStage.replace("_", " ")}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {transitions.map((transition) => (
          <Button
            key={transition.to}
            size="sm"
            variant={transition.action === "fail_delivery" ? "destructive" : "outline"}
            onClick={() => {
              if (transition.action === "fail_delivery") {
                setIsExceptionOpen(true);
              } else {
                handleAdvance(transition.to);
              }
            }}
            disabled={advanceWorkflow.isPending}
            className="gap-1"
          >
            {actionIcons[transition.action]}
            {statusLabels[transition.to]}
          </Button>
        ))}

        {transitions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No actions available for this order status.
          </p>
        )}
      </div>

      <ExceptionDialog
        open={isExceptionOpen}
        onOpenChange={setIsExceptionOpen}
        order={order}
        exceptionType={exceptionType}
        setExceptionType={setExceptionType}
        exceptionNotes={exceptionNotes}
        setExceptionNotes={setExceptionNotes}
        onSubmit={handleReportException}
        isPending={reportException.isPending}
      />
    </div>
  );
}

function ExceptionDialog({
  open,
  onOpenChange,
  order,
  exceptionType,
  setExceptionType,
  exceptionNotes,
  setExceptionNotes,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  exceptionType: ExceptionType;
  setExceptionType: (type: ExceptionType) => void;
  exceptionNotes: string;
  setExceptionNotes: (notes: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Report Delivery Exception
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="font-mono text-sm font-medium">{order.tracking_number}</p>
            <p className="text-sm text-muted-foreground">{order.dropoff_address}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exception Type</label>
            <Select
              value={exceptionType}
              onValueChange={(v) => setExceptionType(v as ExceptionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select exception type" />
              </SelectTrigger>
              <SelectContent>
                {exceptionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Describe the exception..."
              value={exceptionNotes}
              onChange={(e) => setExceptionNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onSubmit} disabled={isPending}>
            {isPending ? "Reporting..." : "Report Exception"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
