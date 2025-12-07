import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Truck,
  Ship,
  Plane,
  Train,
  MapPin,
  Clock,
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
import { AddShipmentDialog } from "./AddShipmentDialog";
import { Tables } from "@/integrations/supabase/types";

const transportIcons = {
  truck: Truck,
  sea: Ship,
  air: Plane,
  rail: Train,
  multi_modal: Package,
};

const statusColors = {
  quotation: "bg-gray-500/10 text-gray-600",
  booked: "bg-blue-500/10 text-blue-600",
  dispatched: "bg-yellow-500/10 text-yellow-600",
  in_transit: "bg-purple-500/10 text-purple-600",
  arrived: "bg-orange-500/10 text-orange-600",
  cleared: "bg-green-500/10 text-green-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-red-500/10 text-red-600",
};

export function AllShipmentsTab() {
  const [shipments, setShipments] = useState<Tables<"shipments">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Tables<"shipments"> | undefined>();
  const { toast } = useToast();

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select(`
          *,
          customers:customer_id (
            company_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast({
        title: "Error",
        description: "Failed to load shipments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleEdit = (shipment: Tables<"shipments">) => {
    setEditingShipment(shipment);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingShipment(undefined);
  };

  const handleSuccess = () => {
    fetchShipments();
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.shipment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customers?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.origin_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.destination_city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTransportIcon = (mode: string) => {
    const Icon = transportIcons[mode as keyof typeof transportIcons] || Package;
    return <Icon className="w-4 h-4" />;
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
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Shipment Directory</h3>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : `${shipments.length} shipments total`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shipments..."
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
              New Shipment
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Shipment</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Transport</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading shipments...
                </TableCell>
              </TableRow>
            ) : filteredShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No shipments found
                </TableCell>
              </TableRow>
            ) : (
              filteredShipments.map((shipment, index) => (
                <motion.tr
                  key={shipment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{shipment.shipment_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {shipment.cargo_description || "No description"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {shipment.customers?.company_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      {shipment.origin_city} → {shipment.destination_city}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTransportIcon(shipment.transport_mode)}
                      <span className="text-sm capitalize">
                        {shipment.transport_mode.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[shipment.status as keyof typeof statusColors] || statusColors.quotation}>
                      {shipment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </div>
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
                        <DropdownMenuItem onClick={() => handleEdit(shipment)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Shipment
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
        <span>Showing {filteredShipments.length} shipments</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      <AddShipmentDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        shipment={editingShipment}
        onSuccess={handleSuccess}
      />
    </motion.div>
  );
}