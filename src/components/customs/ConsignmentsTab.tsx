import { useState } from "react";
import { useConsignments, type Consignment, type ConsignmentStatus, type ConsignmentType } from "@/hooks/useCustoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter, FileDown, Eye } from "lucide-react";
import { AddConsignmentDialog } from "./AddConsignmentDialog";
import { ConsignmentDetailsSheet } from "./ConsignmentDetailsSheet";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatCurrency";

const statusConfig: Record<ConsignmentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  cleared: { label: "Cleared", variant: "default" },
  held: { label: "Held", variant: "destructive" },
  released: { label: "Released", variant: "default" },
  bonded: { label: "Bonded", variant: "outline" },
  auctioned: { label: "Auctioned", variant: "secondary" },
};

const typeConfig: Record<ConsignmentType, { label: string; color: string }> = {
  import: { label: "Import", color: "text-blue-600" },
  export: { label: "Export", color: "text-green-600" },
  transit: { label: "Transit", color: "text-orange-600" },
  temporary_import: { label: "Temp Import", color: "text-purple-600" },
};

export function ConsignmentsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment | null>(null);
  const { data: consignments, isLoading } = useConsignments();

  const filteredConsignments = consignments?.filter(c =>
    c.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.goods_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.importer_exporter_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Use centralized formatter
  // (formatCurrency returns a string like "PKR 1,234")

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Consignments</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search consignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <FileDown className="h-4 w-4" />
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Consignment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Importer/Exporter</TableHead>
                  <TableHead>Goods</TableHead>
                  <TableHead>HS Code</TableHead>
                  <TableHead>Declared Value</TableHead>
                  <TableHead>Total Duty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsignments?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No consignments found. Create your first consignment to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConsignments?.map((consignment) => (
                    <TableRow key={consignment.id}>
                      <TableCell className="font-mono text-sm">
                        {consignment.tracking_number}
                      </TableCell>
                      <TableCell>
                        <span className={typeConfig[consignment.consignment_type].color}>
                          {typeConfig[consignment.consignment_type].label}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-32 truncate">
                        {consignment.importer_exporter_name}
                      </TableCell>
                      <TableCell className="max-w-40 truncate">
                        {consignment.goods_description}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {consignment.hs_codes?.code || "-"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(consignment.declared_value, consignment.currency || "PKR")}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(consignment.total_duty_amount, consignment.currency || "PKR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[consignment.status].variant}>
                          {statusConfig[consignment.status].label}
                        </Badge>
                        {consignment.requires_urgent_release && (
                          <Badge variant="destructive" className="ml-1">Urgent</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {consignment.arrival_date 
                          ? format(new Date(consignment.arrival_date), "dd MMM yyyy")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedConsignment(consignment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddConsignmentDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      
      <ConsignmentDetailsSheet 
        consignment={selectedConsignment} 
        onClose={() => setSelectedConsignment(null)} 
      />
    </>
  );
}
