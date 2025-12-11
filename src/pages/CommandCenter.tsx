
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useWarehouses, useGatePasses } from "@/hooks/useWarehouse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Truck, Anchor, Warehouse, DollarSign, Camera, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClearanceJobs } from "@/hooks/useCustoms";
import { useInvoices } from "@/hooks/useInvoices";
import { useShipments } from "@/hooks/useShipments";

export default function CommandCenter() {
    const { data: warehouses, isLoading: l1, error: e1 } = useWarehouses();
    const { data: passes, isLoading: l2, error: e2 } = useGatePasses();
    const { data: clearanceJobs, isLoading: l3, error: e3 } = useClearanceJobs();
    const { data: invoices, isLoading: l4, error: e4 } = useInvoices();
    const { data: shipments, isLoading: l5, error: e5 } = useShipments();

    const isLoading = l1 || l2 || l3 || l4 || l5;
    const error = e1 || e2 || e3 || e4 || e5;

    if (error) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center text-red-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                    <h2 className="text-xl font-bold">Error Loading Dashboard</h2>
                    <p className="mb-4">{error.message}</p>
                    <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </DashboardLayout>
        );
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading Dashboard Data...</span>
                </div>
            </DashboardLayout>
        );
    }

    // Real Stats
    const stats = {
        customs: {
            pending: clearanceJobs?.filter((j: any) => j.status === 'draft' || j.status === 'gd_filed').length || 0,
            held: clearanceJobs?.filter((j: any) => j.status === 'examination').length || 0
        },
        logistics: {
            inTransit: shipments?.filter((s: any) => s.status === 'in_transit' || s.status === 'shipped').length || 0,
            delayed: shipments?.filter((s: any) => s.status === 'delayed' || s.status === 'exception').length || 0
        },
        finance: {
            unpaidInvoices: invoices?.filter((i: any) => i.payment_status === 'unpaid').length || 0,
            revenue: invoices?.reduce((acc: number, curr: any) => acc + (Number(curr.total_amount) || 0), 0) || 0
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Operations Command Center</h1>
                    <p className="text-muted-foreground">Unified view of Logistics, Customs, and Warehousing.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Activity className="w-4 h-4" /> System Health: 98%
                    </Button>
                </div>
            </div>

            {/* High Level KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Anchor className="w-4 h-4" /> Active Clearances
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customs.pending}</div>
                        <p className="text-xs text-muted-foreground">{stats.customs.held} held by customs</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Truck className="w-4 h-4" /> Bonded Transit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.logistics.inTransit}</div>
                        <p className="text-xs text-muted-foreground">{stats.logistics.delayed} shipments delayed</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Warehouse className="w-4 h-4" /> Warehouse Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{passes?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">Gate moves today</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Pending Invoices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.finance.unpaidInvoices}</div>
                        <p className="text-xs text-muted-foreground">Est. Value: PKR {(stats.finance.revenue / 1000).toFixed(0)}k</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Surveillance & Warehouse Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="w-5 h-5" /> Warehouse Surveillance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {warehouses?.slice(0, 2).map(w => (
                                    <div key={w.id} className="border rounded-lg overflow-hidden bg-black/5 relative group">
                                        <div className="aspect-video flex items-center justify-center bg-gray-900 text-gray-500">
                                            {w.is_bonded ? (
                                                <div className="text-center">
                                                    <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <span className="text-xs">Live Feed: {w.name}</span>
                                                    <Badge variant="destructive" className="absolute top-2 right-2 animate-pulse">REC</Badge>
                                                </div>
                                            ) : (
                                                <span className="text-xs">Offline</span>
                                            )}
                                        </div>
                                        <div className="p-3 bg-white border-t flex justify-between items-center">
                                            <span className="font-semibold text-sm">{w.name}</span>
                                            <Button size="sm" variant="ghost">View Log</Button>
                                        </div>
                                    </div>
                                ))}
                                {(!warehouses || warehouses.length === 0) && (
                                    <div className="col-span-2 text-center py-8 text-muted-foreground">No cameras configured.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-yellow-900">Customs Hold: GD-2025-882</h4>
                                        <p className="text-sm text-yellow-700">Shipment pending physical examination at KICT.</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="ml-auto border-yellow-200 text-yellow-700 hover:bg-yellow-100">Resolve</Button>
                                </div>
                                {/* More alerts could go here */}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar: Recent Activity Feed */}
                <div className="space-y-6">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Live Activity Stream</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative border-l border-muted ml-3 space-y-6 pb-4">
                                <div className="ml-6 relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                                    <p className="text-sm font-medium">New GD Filed: IMP-KHI-004</p>
                                    <p className="text-xs text-muted-foreground">2 mins ago • Clearing Agent</p>
                                </div>
                                <div className="ml-6 relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white" />
                                    <p className="text-sm font-medium">Gate Pass Issued: GP-IN-992</p>
                                    <p className="text-xs text-muted-foreground">15 mins ago • Warehouse Staff</p>
                                </div>
                                <div className="ml-6 relative">
                                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-green-500 ring-4 ring-white" />
                                    <p className="text-sm font-medium">Payment Received: INV-2024-001</p>
                                    <p className="text-xs text-muted-foreground">1 hour ago • Finance</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
