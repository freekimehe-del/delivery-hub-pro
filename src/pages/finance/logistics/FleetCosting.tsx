import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Fuel, Wrench, Plus, DollarSign, Truck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface FleetCost {
    id: string;
    date: string;
    vehicle_id: string;
    vehicle_plate: string;
    type: 'fuel' | 'maintenance' | 'other';
    amount: number;
    description: string;
    recorded_by: string;
}

export default function FleetCosting() {
    const { toast } = useToast();
    const [costs, setCosts] = useState<FleetCost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [vehicleId, setVehicleId] = useState('');
    const [type, setType] = useState('fuel');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchCosts();
    }, []);

    const fetchCosts = async () => {
        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const resp = await fetch(`${apiUrl}/api/finance/fleet-costs`);
            if (resp.ok) {
                const data = await resp.json();
                setCosts(data.costs || []);
            }
        } catch (error) {
            console.error('Failed to fetch costs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const resp = await fetch(`${apiUrl}/api/finance/fleet-costs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicle_id: vehicleId || 'v1', // Mock default
                    type,
                    amount: parseFloat(amount),
                    description
                })
            });

            if (resp.ok) {
                toast({ title: "Cost Recorded", description: "Expense added to fleet records." });
                setIsDialogOpen(false);
                setAmount('');
                setDescription('');
                fetchCosts();
            }
        } catch (error) {
            toast({ title: "Error", variant: "destructive", description: "Failed to record cost" });
        }
    };

    const totalFuel = costs.filter(c => c.type === 'fuel').reduce((sum, c) => sum + c.amount, 0);
    const totalMaint = costs.filter(c => c.type === 'maintenance').reduce((sum, c) => sum + c.amount, 0);

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Fleet Costing</h1>
                        <p className="text-muted-foreground">Track fuel, maintenance, and vehicle operating expenses.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> Record Expense</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Record New Expense</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Vehicle Plate / ID</Label>
                                    <Input placeholder="e.g. K-1234" value={vehicleId} onChange={e => setVehicleId(e.target.value)} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <select className="w-full p-2 border rounded-md" value={type} onChange={e => setType(e.target.value)}>
                                            <option value="fuel">Fuel</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Amount (PKR)</Label>
                                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input placeholder="Detail..." value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                                <Button type="submit" className="w-full">Save Record</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fuel Cost</CardTitle>
                            <Fuel className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">PKR {totalFuel.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
                            <Wrench className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">PKR {totalMaint.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cost per km (Avg)</CardTitle>
                            <Truck className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">PKR 45.2</div>
                            <p className="text-xs text-muted-foreground">Estimated based on total mileage</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 font-medium grid grid-cols-12 gap-4 text-sm text-gray-500">
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Vehicle</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2 text-right">Amount</div>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading records...</div>
                    ) : costs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No records found.</div>
                    ) : (
                        <div className="divide-y">
                            {costs.map((c) => (
                                <div key={c.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors">
                                    <div className="col-span-2 text-sm">{c.date}</div>
                                    <div className="col-span-2 font-medium">{c.vehicle_plate || c.vehicle_id}</div>
                                    <div className="col-span-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.type === 'fuel' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {c.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="col-span-4 text-sm text-gray-600 truncate">{c.description}</div>
                                    <div className="col-span-2 text-right font-bold">PKR {c.amount.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
