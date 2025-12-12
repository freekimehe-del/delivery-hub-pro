import { useState } from "react";
import {
  Package,
  Search,
  Grid3X3,
  List,
  RefreshCw,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

interface AllOrdersTabProps {
  orders: Order[];
}

export function AllOrdersTab({ orders }: AllOrdersTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForValidation, setSelectedForValidation] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ready_for_dispatch': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'dispatched': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'in_transit': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID or Customer..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <div className="border rounded-md flex p-1 ml-2">
            <Button size="icon-sm" variant={viewMode === 'list' ? 'default' : 'ghost'} onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
            <Button size="icon-sm" variant={viewMode === 'grid' ? 'default' : 'ghost'} onClick={() => setViewMode('grid')}>
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredOrders?.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-muted">
          <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No orders found matching your criteria</p>
        </div>
      ) : (
        <div className={cn("grid gap-4", viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
          {filteredOrders.map((order) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={order.id}
              className="group bg-card hover:bg-muted/30 border border-border rounded-xl p-4 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{order.order_number}</span>
                    <Badge variant="outline" className={cn("capitalize", getStatusColor(order.status))}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm gap-4">
                    <span>{order.customer_id}</span>
                    <span>•</span>
                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">${Number(order.total_amount).toLocaleString()}</span>
                  <div className="text-xs text-muted-foreground mt-1">{order.payment_status}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="w-4 h-4" />
                  <span>{order.items.length} Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)} units)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{order.shipping_address?.city || 'No Address'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button variant="ghost" size="sm">View Details</Button>
                {order.status === 'pending' && <Button size="sm">Process</Button>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
