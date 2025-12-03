import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Activity {
  id: number;
  type: "order" | "delivery" | "driver" | "alert" | "vehicle";
  title: string;
  description: string;
  time: string;
  status?: "success" | "warning" | "pending";
}

const activities: Activity[] = [
  {
    id: 1,
    type: "delivery",
    title: "Order #FB123456 delivered",
    description: "Successfully delivered to 123 Main St",
    time: "2 min ago",
    status: "success",
  },
  {
    id: 2,
    type: "driver",
    title: "Driver assigned",
    description: "John D. assigned to Route #R-2024",
    time: "8 min ago",
  },
  {
    id: 3,
    type: "order",
    title: "New order received",
    description: "Order #FB123457 from Acme Corp",
    time: "15 min ago",
    status: "pending",
  },
  {
    id: 4,
    type: "alert",
    title: "Vehicle maintenance due",
    description: "Truck-007 service scheduled for tomorrow",
    time: "32 min ago",
    status: "warning",
  },
  {
    id: 5,
    type: "delivery",
    title: "Order #FB123452 picked up",
    description: "En route to delivery location",
    time: "45 min ago",
  },
  {
    id: 6,
    type: "vehicle",
    title: "Vehicle online",
    description: "Van-012 is now active",
    time: "1 hour ago",
    status: "success",
  },
];

const iconMap = {
  order: Package,
  delivery: CheckCircle,
  driver: User,
  alert: AlertTriangle,
  vehicle: Truck,
};

const colorMap = {
  order: "bg-primary/10 text-primary",
  delivery: "bg-fleet-green/10 text-fleet-green",
  driver: "bg-fleet-purple/10 text-fleet-purple",
  alert: "bg-fleet-orange/10 text-fleet-orange",
  vehicle: "bg-primary/10 text-primary",
};

export function ActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card rounded-xl border border-border shadow-sm"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Latest operations updates</p>
          </div>
        </div>
        <Badge variant="info">{activities.length} new</Badge>
      </div>

      <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="p-4 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex gap-4">
                <div className={cn("p-2 rounded-lg shrink-0 h-fit", colorMap[activity.type])}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                    {activity.status && (
                      <Badge
                        variant={
                          activity.status === "success"
                            ? "success"
                            : activity.status === "warning"
                            ? "warning"
                            : "pending"
                        }
                        className="shrink-0"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{activity.time}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
