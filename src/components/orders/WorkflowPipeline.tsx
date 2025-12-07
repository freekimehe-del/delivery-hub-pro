import { motion } from "framer-motion";
import { Package, Send, Route, FileSignature, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkflowStats, WorkflowStage } from "@/hooks/useWorkflow";
import { Badge } from "@/components/ui/badge";

interface WorkflowPipelineProps {
  activeStage: WorkflowStage;
  onStageClick: (stage: WorkflowStage) => void;
}

const stages = [
  {
    id: "all_orders" as WorkflowStage,
    label: "All Orders",
    shortLabel: "Orders",
    icon: Package,
    description: "Order intake & validation",
  },
  {
    id: "dispatch" as WorkflowStage,
    label: "Dispatch",
    shortLabel: "Dispatch",
    icon: Send,
    description: "Assignment & allocation",
  },
  {
    id: "routes" as WorkflowStage,
    label: "Routes",
    shortLabel: "Routes",
    icon: Route,
    description: "Planning & execution",
  },
  {
    id: "pod" as WorkflowStage,
    label: "Proof of Delivery",
    shortLabel: "POD",
    icon: FileSignature,
    description: "Verification & completion",
  },
];

export function WorkflowPipeline({ activeStage, onStageClick }: WorkflowPipelineProps) {
  const { data: stats } = useWorkflowStats();

  const getStageStats = (stageId: WorkflowStage) => {
    if (!stats) return { count: 0, exceptions: 0 };
    
    switch (stageId) {
      case "all_orders":
        return {
          count: stats.all_orders.total,
          exceptions: stats.all_orders.exceptions,
        };
      case "dispatch":
        return {
          count: stats.dispatch.total,
          exceptions: stats.dispatch.exceptions,
        };
      case "routes":
        return {
          count: stats.routes.total,
          exceptions: stats.routes.exceptions,
        };
      case "pod":
        return {
          count: stats.pod.total,
          exceptions: stats.pod.failed,
        };
      default:
        return { count: 0, exceptions: 0 };
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Workflow Pipeline</h3>
        <Badge variant="outline" className="text-xs">
          Sequential Flow
        </Badge>
      </div>
      
      <div className="flex items-center justify-between gap-2">
        {stages.map((stage, index) => {
          const isActive = activeStage === stage.id;
          const stageStats = getStageStats(stage.id);
          const StageIcon = stage.icon;
          const activeIndex = stages.findIndex((s) => s.id === activeStage);
          const isPast = index < activeIndex;
          const isFuture = index > activeIndex;

          return (
            <div key={stage.id} className="flex items-center flex-1">
              <motion.button
                onClick={() => onStageClick(stage.id)}
                className={cn(
                  "flex-1 relative p-3 rounded-lg border transition-all duration-200",
                  "hover:shadow-md cursor-pointer",
                  isActive
                    ? "bg-primary/10 border-primary shadow-sm"
                    : isPast
                    ? "bg-muted/50 border-border"
                    : "bg-card border-border hover:border-muted-foreground/30"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isPast
                        ? "bg-muted-foreground/20 text-muted-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <StageIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium text-sm truncate",
                          isActive ? "text-primary" : "text-foreground"
                        )}
                      >
                        <span className="hidden md:inline">{stage.label}</span>
                        <span className="md:hidden">{stage.shortLabel}</span>
                      </span>
                      {stageStats.count > 0 && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            isActive && "bg-primary/20 text-primary"
                          )}
                        >
                          {stageStats.count}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground hidden lg:block truncate">
                      {stage.description}
                    </p>
                  </div>
                  {stageStats.exceptions > 0 && (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-xs font-medium">{stageStats.exceptions}</span>
                    </div>
                  )}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeStage"
                    className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>

              {/* Connector Arrow */}
              {index < stages.length - 1 && (
                <div className="px-1 hidden sm:block">
                  <ChevronRight
                    className={cn(
                      "w-5 h-5",
                      index < activeIndex
                        ? "text-muted-foreground"
                        : "text-muted-foreground/30"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
