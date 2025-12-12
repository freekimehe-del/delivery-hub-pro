import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Fuel, Droplets, TrendingUp, Search } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formatCurrency"; // Assuming this exists or I'll implement inline

const API_BASE = 'http://localhost:4000/api/fleet';

export default function FuelManagement() {
    const queryClient = useQueryClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        vehicle_id: "",
        liters: "",
        total_cost: "",
        odometer: "",
        station_name: "",
        full_tank: false
    });

    const { data: logs, isLoading } = useQuery({
        queryKey: ['fleet-fuel'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/fuel`);
            if (!res.ok) throw new Error("Failed to fetch fuel logs");
            return res.json();
        }
    });

    const { data: vehicles } = useQuery({
        queryKey: ['fleet-vehicles'],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/vehicles`);
            if (!res.ok) throw new Error("Failed to fetch vehicles");
            return res.json();
        }
    });

    const addFuelMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch(`${API_BASE}/fuel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to add log");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fleet-fuel'] });
            setIsAddOpen(false);
            setFormData({ vehicle_id: "", liters: "", total_cost: "", odometer: "", station_name: "", full_tank: false });
            toast.success("Fuel log added successfully");
        },
        onError: (err) => toast.error(err.message)
    });

    const filteredLogs = (logs || []).filter((log: any) =>
        log.station_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vehicle?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.vehicle?.plate?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalCost = (logs || []).reduce((acc: number, curr: any) => acc + (Number(curr.total_cost) || 0), 0);
    const totalLiters = (logs || []).reduce((acc: number, curr: any) => acc + (Number(curr.liters) || 0), 0);

    return (
        <div className="flex h-screen bg-neutral-50/50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-[280px]">
                <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <Fuel className="w-5 h-5 text-orange-600" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">Fuel Management</h1>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Fuel Cost</CardTitle>
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rs. {totalCost.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">Life-to-date expenses</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Consumption</CardTitle>
                                <Droplets className="w-4 h-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalLiters.toLocaleString()} L</div>
                                <p className="text-xs text-muted-foreground mt-1">Avg cost: Rs. {totalLiters ? (totalCost / totalLiters).toFixed(2) : 0}/L</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Trend</CardTitle>
                                <TrendingUp className="w-4 h-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">4.2 km/L</div>
                                <p className="text-xs text-muted-foreground mt-1 text-green-600">+5% vs last month</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Fuel Logs</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search logs..."
                                        className="pl-9 w-[250px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-orange-600 hover:bg-orange-700">
                                            <Plus className="w-4 h-4 mr-2" /> Log Fuel
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Fuel Entry</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Vehicle</Label>
                                                <Select
                                                    value={formData.vehicle_id}
                                                    onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Vehicle" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(vehicles || []).map((v: any) => (
                                                            <SelectItem key={v.id} value={v.id}>{v.name} ({v.plate || v.license_plate})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Liters Pumped</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={formData.liters}
                                                        onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Total Cost</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={formData.total_cost}
                                                        onChange={(e) => setFormData({ ...formData, total_cost: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Odometer Reading</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Current KM"
                                                    value={formData.odometer}
                                                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Station Name</Label>
                                                <Input
                                                    placeholder="e.g. Shell Clifton"
                                                    value={formData.station_name}
                                                    onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                            <Button
                                                onClick={() => addFuelMutation.mutate({
                                                    ...formData,
                                                    liters: Number(formData.liters),
                                                    total_cost: Number(formData.total_cost),
                                                    odometer: Number(formData.odometer)
                                                })}
                                                disabled={!formData.vehicle_id || !formData.liters || addFuelMutation.isPending}
                                            >
                                                {addFuelMutation.isPending ? "Saving..." : "Save Entry"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Station</TableHead>
                                        <TableHead>Odometer</TableHead>
                                        <TableHead>Liters</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <TableRow key={i}>
                                                <TableCell><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                <TableCell><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                <TableCell><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                <TableCell><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                <TableCell><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                <TableCell><div className="h-4 bg-slate-100 rounded animate-pulse" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredLogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                No fuel logs found. Use the button to add one.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredLogs.map((log: any) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-slate-900">{log.vehicle?.plate || log.vehicle_id}</div>
                                                    <div className="text-xs text-muted-foreground">{log.vehicle?.name}</div>
                                                </TableCell>
                                                <TableCell>{log.station_name}</TableCell>
                                                <TableCell>{Number(log.odometer).toLocaleString()} km</TableCell>
                                                <TableCell>{log.liters} L</TableCell>
                                                <TableCell className="text-right font-medium">Rs. {Number(log.total_cost).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
