import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    Truck,
    MapPin,
    Calendar,
    User,
    Plus,
    CheckCircle2,
    Clock,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RoutePlanning() {
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [selectedDriver, setSelectedDriver] = useState("");
    const [routeName, setRouteName] = useState("");
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

    const apiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:4000";

    // --- Queries ---
    const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
        queryKey: ["fleet-routes"],
        queryFn: async () => (await fetch(`${apiUrl}/api/fleet/routes`)).json()
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ["fleet-vehicles"],
        queryFn: async () => (await fetch(`${apiUrl}/api/fleet/vehicles`)).json()
    });

    const { data: drivers = [] } = useQuery({
        queryKey: ["fleet-drivers"],
        queryFn: async () => (await fetch(`${apiUrl}/api/fleet/drivers`)).json()
    });

    const { data: orders = [] } = useQuery({
        queryKey: ["fleet-orders"],
        queryFn: async () => (await fetch(`${apiUrl}/api/orders`)).json()
    });

    // --- Mutations ---
    const createRouteMutation = useMutation({
        mutationFn: async (newRoute: any) => {
            const res = await fetch(`${apiUrl}/api/fleet/routes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRoute),
            });
            if (!res.ok) throw new Error("Failed to create route");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fleet-routes"] });
            toast.success("Route created successfully");
            setIsCreateOpen(false);
            // Reset form
            setRouteName("");
            setSelectedVehicle("");
            setSelectedDriver("");
            setSelectedOrders([]);
        },
        onError: () => toast.error("Failed to create route")
    });

    const handleCreateRoute = () => {
        if (!routeName || !selectedVehicle || !selectedDriver) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Map selected order IDs to full stop objects
        const stops = orders
            .filter((o: any) => selectedOrders.includes(o.id))
            .map((o: any) => ({
                order_id: o.id,
                address: o.destination || "Unknown Address", // Fallback if mock data lacks destination
                status: "pending"
            }));

        createRouteMutation.mutate({
            name: routeName,
            vehicle_id: selectedVehicle,
            driver_id: selectedDriver,
            stops
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-700";
            case "in_transit": return "bg-blue-100 text-blue-700";
            case "scheduled": return "bg-yellow-100 text-yellow-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Route Planning</h1>
                    <p className="text-slate-500 mt-1"> optimize deliveries and assign resources.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4" /> Create New Route
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create Delivery Route</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Route Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Morning - Zone A"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Assign Vehicle</Label>
                                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Vehicle" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.filter((v: any) => v.status === 'available').map((v: any) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.plate} ({v.location})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Assign Driver</Label>
                                    <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Driver" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {drivers.filter((d: any) => d.status === 'available').map((d: any) => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Select Orders to Add</Label>
                                <ScrollArea className="h-[200px] border rounded-md p-2">
                                    {orders.length === 0 ? (
                                        <p className="text-sm text-muted-foreground p-2">No active orders available.</p>
                                    ) : (
                                        orders.map((order: any) => (
                                            <div
                                                key={order.id}
                                                className={cn(
                                                    "flex items-center justify-between p-2 rounded-md cursor-pointer mb-1 transition-colors",
                                                    selectedOrders.includes(order.id) ? "bg-blue-50 border-blue-200 border" : "hover:bg-slate-50"
                                                )}
                                                onClick={() => {
                                                    if (selectedOrders.includes(order.id)) {
                                                        setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                                    } else {
                                                        setSelectedOrders([...selectedOrders, order.id]);
                                                    }
                                                }}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{order.tracking_id || order.id}</p>
                                                    <p className="text-xs text-muted-foreground">{order.destination || "Unknown Destination"}</p>
                                                </div>
                                                {selectedOrders.includes(order.id) && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                                            </div>
                                        ))
                                    )}
                                </ScrollArea>
                                <p className="text-xs text-muted-foreground text-right">{selectedOrders.length} orders selected</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateRoute} disabled={createRouteMutation.isPending}>
                                {createRouteMutation.isPending ? "Creating..." : "Create Route"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Routes Grid */}
            {isLoadingRoutes ? (
                <div>Loading routes...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {routes.map((route: any) => (
                        <Card key={route.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold">{route.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" /> {route.date}
                                        </p>
                                    </div>
                                    <Badge variant="secondary" className={getStatusColor(route.status)}>
                                        {route.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Truck className="w-4 h-4" />
                                            <span>{route.vehicle?.plate || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <User className="w-4 h-4" />
                                            <span>{route.driver?.name || 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-3">
                                        <p className="text-sm font-medium mb-2">Stops ({route.stops?.length || 0})</p>
                                        <div className="space-y-2">
                                            {route.stops?.slice(0, 3).map((stop: any, idx: number) => (
                                                <div key={idx} className="flex items-start gap-2 text-sm text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                                    <span className="truncate">{stop.address || `Order ${stop.order_id}`}</span>
                                                </div>
                                            ))}
                                            {route.stops?.length > 3 && (
                                                <p className="text-xs text-muted-foreground pl-5">+{route.stops.length - 3} more stops</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
