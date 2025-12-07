import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
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
import { AddCarrierDialog } from "./AddCarrierDialog";
import { Tables } from "@/integrations/supabase/types";

const carrierTypeColors = {
  truck: "bg-blue-500/10 text-blue-600",
  sea: "bg-green-500/10 text-green-600",
  air: "bg-purple-500/10 text-purple-600",
  rail: "bg-orange-500/10 text-orange-600",
};

const statusColors = {
  active: "bg-green-500/10 text-green-600",
  inactive: "bg-gray-500/10 text-gray-600",
  suspended: "bg-red-500/10 text-red-600",
};

export function CarrierManagementTab() {
  const [carriers, setCarriers] = useState<Tables<"carriers">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Tables<"carriers"> | undefined>();
  const { toast } = useToast();

  const fetchCarriers = async () => {
    try {
      const { data, error } = await supabase
        .from("carriers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCarriers(data || []);
    } catch (error) {
      console.error("Error fetching carriers:", error);
      toast({
        title: "Error",
        description: "Failed to load carriers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  const handleEdit = (carrier: Tables<"carriers">) => {
    setEditingCarrier(carrier);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCarrier(undefined);
  };

  const handleSuccess = () => {
    fetchCarriers();
  };

  const filteredCarriers = carriers.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      carrier.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Carrier Management</h3>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : `${carriers.length} carriers total`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search carriers..."
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
              Add Carrier
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Carrier</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading carriers...
                </TableCell>
              </TableRow>
            ) : filteredCarriers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No carriers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCarriers.map((carrier, index) => (
                <motion.tr
                  key={carrier.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{carrier.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {carrier.registration_number || "No registration"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={carrierTypeColors[carrier.type as keyof typeof carrierTypeColors] || carrierTypeColors.truck}>
                      {carrier.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {carrier.phone && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          {carrier.phone}
                        </div>
                      )}
                      {carrier.email && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          {carrier.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {carrier.address && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                        {carrier.address.length > 30
                          ? `${carrier.address.substring(0, 30)}...`
                          : carrier.address}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[carrier.status as keyof typeof statusColors] || statusColors.active}>
                      {carrier.status}
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
                        <DropdownMenuItem onClick={() => handleEdit(carrier)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Carrier
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
        <span>Showing {filteredCarriers.length} carriers</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>

      <AddCarrierDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        carrier={editingCarrier}
        onSuccess={handleSuccess}
      />
    </motion.div>
  );
}