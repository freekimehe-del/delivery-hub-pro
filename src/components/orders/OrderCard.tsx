import { motion } from "framer-motion";
import {
  Package,
  MapPin,
  Clock,
  User,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  trackingNumber: string;
  status: "pending" | "dispatched" | "in-progress" | "delivered" | "cancelled";
  customer: string;
  pickup: string;
  dropoff: string;
  driver?: string;
  eta?: string;
  createdAt: string;
}

const statusConfig = {
  pending: { label: "Pending", variant: "pending" as const, color: "border-l-fleet-yellow" },
  dispatched: { label: "Dispatched", variant: "info" as const, color: "border-l-primary" },
  "in-progress": { label: "In Progress", variant: "in-progress" as const, color: "border-l-primary" },
  delivered: { label: "Delivered", variant: "success" as const, color: "border-l-fleet-green" },
  cancelled: { label: "Cancelled", variant: "destructive" as const, color: "border-l-destructive" },
};

interface OrderCardProps {
  order: Order;
  index: number;
  onViewDetails?: () => void;
}

export function OrderCard({ order, index, onViewDetails }: OrderCardProps) {
  const config = statusConfig[order.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4",
        config.color
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-medium">{order.trackingNumber}</span>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{order.customer}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem>Track Order</DropdownMenuItem>
              <DropdownMenuItem>Assign Driver</DropdownMenuItem>
              <DropdownMenuItem>Edit Order</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Route Info */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-fleet-green" />
              <div className="w-0.5 h-8 bg-border" />
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Pickup</p>
                <p className="text-sm font-medium truncate">{order.pickup}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dropoff</p>
                <p className="text-sm font-medium truncate">{order.dropoff}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {order.driver && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {order.driver}
              </div>
            )}
            {order.eta && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                ETA: {order.eta}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={onViewDetails}>
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
