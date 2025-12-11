import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useWarehouses, useGatePasses, useWarehouseMutations } from "@/hooks/useWarehouse";
import { Warehouse, Truck, ArrowLeftRight, CheckCircle, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WarehouseDashboard() {
    const { data: warehouses, isLoading: whLoading } = useWarehouses();
    const { data: passes, isLoading: passLoading } = useGatePasses();
    const { createGatePass } = useWarehouseMutations();
    const [open, setOpen] = useState(false);

    // Form State
    const [newPass, setNewPass] = useState({
        type: 'inward',
        warehouse_id: '',
        driver_name: '',
        vehicle_number: '',
    });

    const handleCreate = async () => {
        if (!newPass.warehouse_id) return;

        await createGatePass.mutateAsync({
            pass_number: `GP-${newPass.type === 'inward' ? 'IN' : 'OUT'}-${Math.floor(Math.random() * 10000)}`,
            ...newPass,
            status: 'issued'
        });
        setOpen(false);
        setNewPass({ type: 'inward', warehouse_id: '', driver_name: '', vehicle_number: '' });
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        Warehouse Operations
                    </h1>
                    <p className="text-muted-foreground">Manage facilities and gate control.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <ArrowLeftRight className="w-4 h-4 mr-2" /> Issue Gate Pass
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Issue New Gate Pass</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={newPass.type} onValueChange={v => setNewPass({ ...newPass, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="inward">Inward (Arrival)</SelectItem>
                                        <SelectItem value="outward">Outward (Dispatch)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Warehouse</Label>
                                <Select value={newPass.warehouse_id} onValueChange={v => setNewPass({ ...newPass, warehouse_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Facility" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses?.map(w => (
                                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Driver Name</Label>
                                    <Input value={newPass.driver_name} onChange={e => setNewPass({ ...newPass, driver_name: e.target.value })} placeholder="e.g. Ali Khan" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Vehicle No.</Label>
                                    <Input value={newPass.vehicle_number} onChange={e => setNewPass({ ...newPass, vehicle_number: e.target.value })} placeholder="ABC-123" />
                                </div>
                            </div>
                            <Button onClick={handleCreate} className="w-full mt-2">Generate Pass</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Warehouse Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {whLoading ? [1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />) : warehouses?.map(wh => (
                    <Card key={wh.id} className="hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                            <div className={`p-2 rounded-lg ${wh.is_bonded ? 'bg-purple-100 text-purple-700' : 'bg-muted text-muted-foreground'}`}>
                                <Warehouse className="w-5 h-5" />
                            </div>
                            {wh.is_bonded && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">Bonded</span>}
                        </CardHeader>
                        <CardContent>
                            <h3 className="font-semibold text-lg mb-1">{wh.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                                <MapPin className="w-3 h-3" /> {wh.location || 'No location set'}
                            </div>
                            <div className="flex justify-between text-sm border-t pt-3">
                                <div className="text-muted-foreground">Capacity</div>
                                <div className="font-medium">{wh.capacity_sqft?.toLocaleString()} sqft</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Gate Passes */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Recent Gate Passes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Pass #</th>
                                    <th className="px-4 py-3 text-left font-medium">Type</th>
                                    <th className="px-4 py-3 text-left font-medium">Driver / Vehicle</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {passes?.map(pass => (
                                    <tr key={pass.id}>
                                        <td className="px-4 py-3 font-mono font-medium">{pass.pass_number}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium ${pass.type === 'inward' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                {pass.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{pass.driver_name} ({pass.vehicle_number})</td>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" /> {pass.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">
                                            {new Date(pass.issue_date || pass.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {(!passes || passes.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No gate passes issued yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
