import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface QuickAction {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface FleetDashboardCardProps {
  title: string;
  icon: ReactNode;
  iconColor: string;
  iconBgColor: string;
  count?: string | number;
  countLabel?: string;
  badge?: ReactNode;
  metrics?: Array<{
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    color?: string;
  }>;
  chart?: ReactNode;
  quickActions?: QuickAction[];
  onViewDetails?: () => void;
  isLoading?: boolean;
  isPulsing?: boolean;
  delay?: number;
  children?: ReactNode;
}

export function FleetDashboardCard({
  title,
  icon,
  iconColor,
  iconBgColor,
  count,
  countLabel,
  badge,
  metrics = [],
  chart,
  quickActions = [],
  onViewDetails,
  isLoading = false,
  isPulsing = false,
  delay = 0,
  children,
}: FleetDashboardCardProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col",
        isPulsing && "ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-xl", iconBgColor)}>
            <div className={iconColor}>{icon}</div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {count !== undefined && (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight">{count}</span>
                {countLabel && (
                  <span className="text-xs text-muted-foreground">{countLabel}</span>
                )}
              </div>
            )}
          </div>
        </div>
        {badge}
      </div>

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-lg font-semibold", metric.color)}>
                  {metric.value}
                </span>
                {metric.change !== undefined && (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      metric.change > 0 ? "text-fleet-green" : metric.change < 0 ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Area */}
      {chart && <div className="mb-4 flex-1">{chart}</div>}

      {/* Children (custom content) */}
      {children && <div className="mb-4 flex-1">{children}</div>}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="text-xs gap-1.5"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* View Details Button */}
      {onViewDetails && (
        <div className="mt-auto pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-between group"
            onClick={onViewDetails}
          >
            <span>View Details</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
