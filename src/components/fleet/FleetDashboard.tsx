import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  Calendar, 
  Filter,
  Download,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VehiclesCard } from "./VehiclesCard";
import { DriversCard } from "./DriversCard";
import { MaintenanceCard } from "./MaintenanceCard";
import { FuelCard } from "./FuelCard";
import { useRealtimeSimulation } from "@/hooks/useFleetStats";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type DateRange = "today" | "week" | "month" | "custom";

export function FleetDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [notificationCount, setNotificationCount] = useState(3);
  const { isConnected, lastUpdate, updatePulse, triggerUpdate } = useRealtimeSimulation();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["vehicle-stats"] });
    queryClient.invalidateQueries({ queryKey: ["driver-stats"] });
    queryClient.invalidateQueries({ queryKey: ["maintenance-stats"] });
    queryClient.invalidateQueries({ queryKey: ["fuel-stats"] });
    triggerUpdate();
    toast.success("Dashboard refreshed");
  };

  const handleExport = () => {
    toast.info("Exporting fleet data as CSV...");
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight">Fleet Overview</h2>
          <p className="text-sm text-muted-foreground">
            Real-time insights into your fleet operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Connection Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                  isConnected 
                    ? "bg-fleet-green/10 text-fleet-green" 
                    : "bg-destructive/10 text-destructive"
                )}>
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span className="hidden sm:inline">Live</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span className="hidden sm:inline">Offline</span>
                    </>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Last updated: {format(lastUpdate, "HH:mm:ss")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Date Range Selector */}
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <Calendar className="w-3 h-3 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Button */}
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="w-3 h-3 mr-1.5" />
            <span className="hidden sm:inline">Filter</span>
          </Button>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 relative">
                  <Bell className="w-3.5 h-3.5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{notificationCount} pending notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Export Button */}
          <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
            <Download className="w-3 h-3 mr-1.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Refresh Button */}
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefresh}>
            <RefreshCw className={cn(
              "w-3.5 h-3.5",
              updatePulse && "animate-spin"
            )} />
          </Button>
        </div>
      </motion.div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VehiclesCard isPulsing={updatePulse} delay={0} />
        <DriversCard isPulsing={updatePulse} delay={0.1} />
        <MaintenanceCard isPulsing={updatePulse} delay={0.2} />
        <FuelCard isPulsing={updatePulse} delay={0.3} />
      </div>

      {/* Real-time Update Indicator */}
      {updatePulse && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Updating data...</span>
        </motion.div>
      )}
    </div>
  );
}
