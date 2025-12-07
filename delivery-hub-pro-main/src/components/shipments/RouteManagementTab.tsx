import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Truck,
  Ship,
  Plane,
  Train,
  Clock,
  Route,
  Edit,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddRouteDialog } from "./AddRouteDialog";
import { Tables } from "@/integrations/supabase/types";

const transportIcons = {
  truck: Truck,
  sea: Ship,
  air: Plane,
  rail: Train,
};

export function RouteManagementTab() {
  const [routes, setRoutes] = useState<Tables<"routes">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Tables<"routes"> | undefined>();
  const { toast } = useToast();

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast({
        title: "Error",
        description: "Failed to load routes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleEdit = (route: Tables<"routes">) => {
    setEditingRoute(route);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRoute(undefined);
  };

  const handleSuccess = () => {
    fetchRoutes();
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.origin_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destination_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.transport_mode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTransportIcon = (mode: string) => {
    const Icon = transportIcons[mode as keyof typeof transportIcons] || Route;
    return <Icon className="w-4 h-4" />;
  };

  const formatDuration = (hours: number | null) => {
    if (!hours) return "N/A";
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${remainingHours}h`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl border border-border shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Route Management</h3>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : `${routes.length} routes total`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search routes..."
                className="pl-9 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button
              variant="gradient"
              size="sm"
              className="gap-1"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Route
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Route Name</TableHead>
              <TableHead>Origin → Destination</TableHead>
              <TableHead>Transport Mode</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading routes...
                </TableCell>
              </TableRow>
            ) : filteredRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No routes found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutes.map((route, index) => (
                <motion.tr
                  key={route.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{route.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {route.origin_country} - {route.destination_country}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{route.origin_city}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span className="font-medium">{route.destination_city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransportIcon(route.transport_mode)}
                      <span className="text-sm capitalize">
                        {route.transport_mode}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {route.distance_km ? `${route.distance_km} km` : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {formatDuration(route.estimated_duration_hours)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={route.is_active ? "success" : "secondary"}>
                      {route.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(route)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Route
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredRoutes.length} routes</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      <AddRouteDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        route={editingRoute}
        onSuccess={handleSuccess}
      />
    </motion.div>
  );
}