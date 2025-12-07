import { motion } from "framer-motion";
import { Package, Truck, Users, Route, FileText, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const actions: QuickAction[] = [
  {
    icon: Package,
    label: "New Order",
    description: "Create delivery order",
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
  },
  {
    icon: Route,
    label: "Plan Route",
    description: "Optimize delivery route",
    color: "text-fleet-green",
    bgColor: "bg-fleet-green/10 hover:bg-fleet-green/20",
  },
  {
    icon: Truck,
    label: "Add Vehicle",
    description: "Register new vehicle",
    color: "text-fleet-purple",
    bgColor: "bg-fleet-purple/10 hover:bg-fleet-purple/20",
  },
  {
    icon: Users,
    label: "Add Driver",
    description: "Onboard new driver",
    color: "text-fleet-orange",
    bgColor: "bg-fleet-orange/10 hover:bg-fleet-orange/20",
  },
  {
    icon: FileText,
    label: "Generate Invoice",
    description: "Create customer invoice",
    color: "text-fleet-yellow",
    bgColor: "bg-fleet-yellow/10 hover:bg-fleet-yellow/20",
  },
  {
    icon: Calculator,
    label: "Get Quote",
    description: "Calculate shipping cost",
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
  },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card rounded-xl border border-border p-4 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg gradient-primary">
          <Package className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">Quick Actions</h3>
          <p className="text-xs text-muted-foreground">Common operations</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.05 * index }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "p-4 rounded-xl transition-all duration-200 text-left group",
              action.bgColor
            )}
          >
            <action.icon className={cn("w-5 h-5 mb-2", action.color)} />
            <p className="text-sm font-medium">{action.label}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
