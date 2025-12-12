import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Truck,
    Container,
    Globe,
    MapPin,
    ShieldCheck,
    Plus,
    RefreshCw,
    FileText
} from "lucide-react";
import { useTransitShipments, useTransitStats } from "@/hooks/useTransit";
import { CreateGDDialog } from "./CreateGDDialog";
import { TransitDetailsSheet } from "./TransitDetailsSheet";

export default function TransitDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);

    // Fetch Data
    const { data: stats } = useTransitStats();
    const { data: shipments, isLoading } = useTransitShipments(
        activeTab === "overview" ? undefined : { type: activeTab === 'att' ? 'afghan_transit' : activeTab === 'transshipment' ? 'transshipment' : 'local_transit' }
    );

    const metrics = [
        {
            title: "Total Active Shipments",
            value: String(stats?.total || 0),
            change: 0,
            changeLabel: "vs last week",
            icon: <Container className="w-5 h-5" />,
            iconColor: "bg-blue-100 text-blue-600"
        },
        {
            title: "Afghan Transit (ATT)",
            value: String(stats?.att || 0),
            change: 0,
            changeLabel: "active GDs",
            icon: <Globe className="w-5 h-5" />,
            iconColor: "bg-orange-100 text-orange-600"
        },
        {
            title: "At Border (Torkham/Chaman)",
            value: String(stats?.at_border || 0),
            change: 0,
            changeLabel: "waiting crossing",
            icon: <MapPin className="w-5 h-5" />,
            iconColor: "bg-red-100 text-red-600"
        },
        {
            title: "Customs Hold",
            value: String(stats?.delayed || 0),
            change: 0,
            changeLabel: "requires attention",
            icon: <ShieldCheck className="w-5 h-5" />,
            iconColor: "bg-yellow-100 text-yellow-600"
        }
    ];

    return (
        <DashboardLayout>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Transit Trade & Logistics</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage Transshipment, Afghan Transit (ATT), and Local Bonded Movements.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                        <Plus className="w-4 h-4" /> New GD Entry
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {metrics.map((m, i) => <MetricCard key={i} {...m} delay={i * 0.1} />)}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview" className="gap-2"><Truck className="w-4 h-4" /> All Shipments</TabsTrigger>
                    <TabsTrigger value="att" className="gap-2"><Globe className="w-4 h-4" /> Afghan Transit (ATT)</TabsTrigger>
                    <TabsTrigger value="transshipment" className="gap-2"><Container className="w-4 h-4" /> Transshipment</TabsTrigger>
                    <TabsTrigger value="local" className="gap-2"><MapPin className="w-4 h-4" /> Local Bonded</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Consignments</CardTitle>
                            <CardDescription>Real-time status of cargo across Pakistan corridors.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>GD Number</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Container / Carrier</TableHead>
                                        <TableHead>Route</TableHead>
                                        <TableHead>Current Location</TableHead>
                                        <TableHead>WeBOC Status</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                                        </TableRow>
                                    ) : shipments?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No active shipments found.</TableCell>
                                        </TableRow>
                                    ) : (
                                        shipments?.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{s.gd_number}</span>
                                                        <span className="text-xs text-muted-foreground">{s.customer_name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">{s.type.replace('_', ' ')}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col text-sm">
                                                        <span>{s.container_no}</span>
                                                        <span className="text-xs text-muted-foreground">{s.carrier_name || 'Unassigned'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{s.route_name || 'Direct'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <MapPin className="w-3 h-3 text-red-500" />
                                                        {s.current_location}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={s.weboc_status === 'Gate Out Confirmed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}>
                                                        {s.weboc_status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedShipmentId(s.id)}>
                                                        <FileText className="w-4 h-4 mr-1" /> Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <CreateGDDialog open={isCreateOpen} onOpenChange={setCreateOpen} />
            <TransitDetailsSheet shipmentId={selectedShipmentId} onClose={() => setSelectedShipmentId(null)} />
        </DashboardLayout>
    );
}
