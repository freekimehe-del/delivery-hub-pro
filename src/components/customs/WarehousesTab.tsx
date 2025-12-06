import { useState } from "react";
import { useWarehouses, type Warehouse, type WarehouseType, type WarehouseLicenseStatus } from "@/hooks/useCustoms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Warehouse as WarehouseIcon, MapPin, Calendar, Shield } from "lucide-react";
import { AddWarehouseDialog } from "./AddWarehouseDialog";
import { format, differenceInDays } from "date-fns";

const typeConfig: Record<WarehouseType, { label: string; color: string }> = {
  private_bonded: { label: "Private Bonded", color: "bg-blue-100 text-blue-800" },
  public_bonded: { label: "Public Bonded", color: "bg-green-100 text-green-800" },
  manufacturing_bond: { label: "Manufacturing Bond", color: "bg-purple-100 text-purple-800" },
};

const statusConfig: Record<WarehouseLicenseStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  suspended: { label: "Suspended", variant: "destructive" },
  expired: { label: "Expired", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

export function WarehousesTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: warehouses, isLoading } = useWarehouses();

  const filteredWarehouses = warehouses?.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "-";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getLicenseExpiryWarning = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    if (daysUntilExpiry < 0) return { text: "Expired", variant: "destructive" as const };
    if (daysUntilExpiry <= 30) return { text: `${daysUntilExpiry} days left`, variant: "destructive" as const };
    if (daysUntilExpiry <= 90) return { text: `${daysUntilExpiry} days left`, variant: "secondary" as const };
    return null;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bonded Warehouses</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warehouses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Warehouse
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : filteredWarehouses?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <WarehouseIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No warehouses found</p>
              <p className="text-sm">Add your first bonded warehouse to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWarehouses?.map((warehouse) => {
                const expiryWarning = getLicenseExpiryWarning(warehouse.license_expiry_date);
                return (
                  <Card key={warehouse.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm text-muted-foreground">{warehouse.code}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${typeConfig[warehouse.warehouse_type].color}`}>
                              {typeConfig[warehouse.warehouse_type].label}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg">{warehouse.name}</h3>
                        </div>
                        <Badge variant={statusConfig[warehouse.license_status].variant}>
                          {statusConfig[warehouse.license_status].label}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{warehouse.address}, {warehouse.city}</span>
                        </div>

                        {warehouse.license_number && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Shield className="h-4 w-4" />
                            <span>License: {warehouse.license_number}</span>
                          </div>
                        )}

                        {warehouse.license_expiry_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Expires: {format(new Date(warehouse.license_expiry_date), "dd MMM yyyy")}
                            </span>
                            {expiryWarning && (
                              <Badge variant={expiryWarning.variant} className="text-xs">
                                {expiryWarning.text}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Capacity</p>
                          <p className="font-medium">
                            {warehouse.capacity_sqft ? `${warehouse.capacity_sqft.toLocaleString()} sq ft` : "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bank Guarantee</p>
                          <p className="font-medium">{formatCurrency(warehouse.bank_guarantee_amount)}</p>
                        </div>
                      </div>

                      {/* Compliance indicators */}
                      <div className="flex gap-2 mt-3">
                        {warehouse.fire_safety_certificate && (
                          <Badge variant="outline" className="text-xs">
                            Fire Safety ✓
                          </Badge>
                        )}
                        {warehouse.site_plan_url && (
                          <Badge variant="outline" className="text-xs">
                            Site Plan ✓
                          </Badge>
                        )}
                        {warehouse.bank_guarantee_amount && (
                          <Badge variant="outline" className="text-xs">
                            Bank Guarantee ✓
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddWarehouseDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </>
  );
}
