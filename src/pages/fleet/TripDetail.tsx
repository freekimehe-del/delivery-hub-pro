import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MapPin, Truck, User, Calendar, DollarSign, Fuel, Navigation,
    ArrowLeft, Clock, CheckCircle2, AlertTriangle, PlusCircle
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function TripDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [fuelOpen, setFuelOpen] = useState(false);

    // Forms state
    const [expenseForm, setExpenseForm] = useState({ type: 'food', amount: '', description: '' });
    const [fuelForm, setFuelForm] = useState({ liters: '', cost: '', odometer: '', station: '' });

    const { data: tripData, isLoading } = useQuery({
        queryKey: ['trip', id],
        queryFn: async () => {
            const res = await fetch(`http://localhost:4000/api/fleet/trips/${id}`);
            if (!res.ok) throw new Error("Failed to load trip");
            return res.json();
        }
    });

    const trip = tripData?.trip;

    const updateStatus = useMutation({
        mutationFn: async (status: string) => {
            await fetch(`http://localhost:4000/api/fleet/trips/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trip', id] });
            toast.success("Status updated");
        }
    });

    const addExpense = useMutation({
        mutationFn: async () => {
            await fetch(`http://localhost:4000/api/fleet/trips/${id}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expense_type: expenseForm.type,
                    amount: expenseForm.amount,
                    description: expenseForm.description
                })
            });
        },
        onSuccess: () => {
            setExpenseOpen(false);
            setExpenseForm({ type: 'food', amount: '', description: '' });
            queryClient.invalidateQueries({ queryKey: ['trip', id] });
            toast.success("Expense logged");
        }
    });

    const addFuel = useMutation({
        mutationFn: async () => {
            await fetch(`http://localhost:4000/api/fleet/trips/${id}/fuel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    liters: fuelForm.liters,
                    total_cost: fuelForm.cost,
                    cost_per_liter: Number(fuelForm.cost) / Number(fuelForm.liters),
                    odometer_reading: fuelForm.odometer,
                    station_name: fuelForm.station
                })
            });
        },
        onSuccess: () => {
            setFuelOpen(false);
            setFuelForm({ liters: '', cost: '', odometer: '', station: '' });
            queryClient.invalidateQueries({ queryKey: ['trip', id] });
            toast.success("Fuel log added");
        }
    });

    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading Trip...</div>;
    if (!trip) return <div className="flex items-center justify-center h-screen">Trip not found</div>;

    return (
        <div className="flex h-screen bg-neutral-50/50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-[280px]">
                <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/fleet/trip-management')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                {trip.trip_number}
                                <Badge variant="outline" className="ml-2">{trip.status}</Badge>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {trip.status === 'planned' && (
                            <Button className="bg-blue-600" onClick={() => updateStatus.mutate('dispatched')}>
                                <Navigation className="w-4 h-4 mr-2" /> Dispatch Driver
                            </Button>
                        )}
                        {trip.status === 'dispatched' && (
                            <Button className="bg-indigo-600" onClick={() => updateStatus.mutate('in_transit')}>
                                Start Trip
                            </Button>
                        )}
                        {trip.status === 'in_transit' && (
                            <Button className="bg-green-600" onClick={() => updateStatus.mutate('completed')}>
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Trip
                            </Button>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Resources Card */}
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Resources & Schedule</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                <Truck className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                                                <p className="font-semibold">{trip.vehicle?.plate}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Driver</p>
                                                <p className="font-semibold">{trip.driver?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Initial Start</p>
                                                <p className="font-semibold">{new Date(trip.start_time).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Est. Duration</p>
                                                <p className="font-semibold">4h 30m</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Timeline / Itinerary */}
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Route Timeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative border-l-2 border-slate-200 ml-3 py-2 space-y-8">
                                        {/* Origin */}
                                        <div className="relative pl-8">
                                            <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{trip.origin_location}</span>
                                                <span className="text-xs text-muted-foreground">Origin - {new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        {/* Stops */}
                                        {(trip.stops || []).map((stop: any, idx: number) => (
                                            <div key={stop.id} className="relative pl-8">
                                                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-slate-400 shadow-sm" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800">{stop.location_name}</span>
                                                    <Badge variant="secondary" className="w-fit mt-1 text-[10px] h-5">{stop.stop_type}</Badge>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Destination */}
                                        <div className="relative pl-8">
                                            <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-600 shadow-sm" />
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{trip.destination_location}</span>
                                                <span className="text-xs text-muted-foreground">Destination (Planned)</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Costs & Map */}
                        <div className="space-y-6">
                            <iframe
                                width="100%"
                                height="250"
                                frameBorder="0"
                                src="https://www.openstreetmap.org/export/embed.html?layer=mapnik"
                                className="rounded-xl border border-slate-200 shadow-sm bg-slate-100"
                            />

                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base">Trip Expenses</CardTitle>

                                    <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                <PlusCircle className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Log Expense</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-2">
                                                <div className="space-y-2">
                                                    <Label>Type</Label>
                                                    <Select value={expenseForm.type} onValueChange={(v) => setExpenseForm({ ...expenseForm, type: v })}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="food">Food & Allowance</SelectItem>
                                                            <SelectItem value="toll">Toll Tax</SelectItem>
                                                            <SelectItem value="fine">Traffic Fine</SelectItem>
                                                            <SelectItem value="maintenance">Repair</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Amount</Label>
                                                    <Input type="number" placeholder="0.00" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Input placeholder="Details..." value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={() => addExpense.mutate()}>Save Log</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(trip.expenses || []).length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-2">No expenses logged.</p>
                                    ) : (
                                        (trip.expenses || []).map((exp: any) => (
                                            <div key={exp.id} className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                                                <span className="capitalize text-slate-600">{exp.expense_type}</span>
                                                <span className="font-semibold">Rs. {exp.amount}</span>
                                            </div>
                                        ))
                                    )}
                                    <div className="pt-2 border-t flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>Rs. {(trip.expenses || []).reduce((acc: number, curr: any) => acc + curr.amount, 0)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-base">Fuel Logs</CardTitle>
                                    <Dialog open={fuelOpen} onOpenChange={setFuelOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="h-8 w-8">
                                                <PlusCircle className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Log Refueling</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-2">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Liters</Label>
                                                        <Input type="number" placeholder="0.00" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Total Cost</Label>
                                                        <Input type="number" placeholder="0.00" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Odometer Reading</Label>
                                                    <Input type="number" placeholder="12345" value={fuelForm.odometer} onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Station Name</Label>
                                                    <Input placeholder="Shell, etc." value={fuelForm.station} onChange={(e) => setFuelForm({ ...fuelForm, station: e.target.value })} />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={() => addFuel.mutate()}>Save Log</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(trip.fuel_logs || []).length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-2">No fuel logs.</p>
                                    ) : (
                                        (trip.fuel_logs || []).map((log: any) => (
                                            <div key={log.id} className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0">
                                                <div>
                                                    <p className="font-medium">{log.liters}L <span className="text-muted-foreground text-xs">@ {log.station_name}</span></p>
                                                </div>
                                                <span className="font-semibold">Rs. {log.total_cost}</span>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
