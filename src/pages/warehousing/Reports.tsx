import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useWarehouses, useGatePasses, useInventory } from "@/hooks/useWarehouse";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollText, ArrowUpRight, ArrowDownRight, Warehouse } from "lucide-react";

export default function WarehouseReports() {
    const { data: warehouses } = useWarehouses();
    const { data: inventory } = useInventory();
    const { data: passes } = useGatePasses(50); // Fetch more for stats

    // Calculate Stats
    const totalCapacity = warehouses?.reduce((sum, w) => sum + Number(w.capacity_sqft || 0), 0) || 0;
    const bondedCount = warehouses?.filter(w => w.is_bonded).length || 0;
    const totalItems = inventory?.reduce((sum, i) => sum + Number(i.quantity_on_hand), 0) || 0;

    const inwardPasses = passes?.filter(p => p.type === 'inward').length || 0;
    const outwardPasses = passes?.filter(p => p.type === 'outward').length || 0;

    return (
        <DashboardLayout>
            <div className="flex items-center gap-2 mb-6">
                <ScrollText className="w-6 h-6 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Warehouse Analytics</h1>
                    <p className="text-muted-foreground">Operational insights and utilization reports.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Capacity</CardDescription>
                        <CardTitle className="text-2xl">{totalCapacity.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">sqft</span></CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Facilities</CardDescription>
                        <CardTitle className="text-2xl">{warehouses?.length || 0} <span className="text-sm font-normal text-muted-foreground">({bondedCount} Bonded)</span></CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Inventory Items</CardDescription>
                        <CardTitle className="text-2xl">{totalItems.toLocaleString()}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Recent Movements</CardDescription>
                        <CardTitle className="text-2xl">{(passes?.length || 0)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Movement Distribution</CardTitle>
                        <CardDescription>Inward vs Outward Gate Passes (Recent)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-around py-8">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto mb-2">
                                    <ArrowDownRight className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold">{inwardPasses}</div>
                                <div className="text-muted-foreground text-sm">Inward</div>
                            </div>
                            <div className="h-16 w-px bg-border"></div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mx-auto mb-2">
                                    <ArrowUpRight className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold">{outwardPasses}</div>
                                <div className="text-muted-foreground text-sm">Outward</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Facility Utilization</CardTitle>
                        <CardDescription>Capacity breakdown by warehouse</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {warehouses?.slice(0, 5).map(w => (
                            <div key={w.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Warehouse className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">{w.name}</span>
                                </div>
                                <span className="text-sm text-muted-foreground">{w.capacity_sqft?.toLocaleString()} sqft</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
