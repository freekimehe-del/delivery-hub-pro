import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Save, Truck, User, MapPin, Calendar, Clock, Plus, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function TripPlanner() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [stops, setStops] = useState<{ location: string, type: string }[]>([]);
    const [newStop, setNewStop] = useState({ location: "", type: "pickup" });

    const { data: resources } = useQuery({
        queryKey: ['fleet-resources'],
        queryFn: async () => {
            const [vParams, dParams] = await Promise.all([
                fetch('http://localhost:4000/api/fleet/vehicles').then(r => r.json()),
                fetch('http://localhost:4000/api/fleet/drivers').then(r => r.json())
            ]);
            return { vehicles: vParams, drivers: dParams };
        }
    });

    const [formData, setFormData] = useState({
        vehicle_id: "",
        driver_id: "",
        origin: "",
        destination: "",
        start_time: "",
        instructions: ""
    });

    const handleAddStop = () => {
        if (newStop.location) {
            setStops([...stops, { ...newStop }]);
            setNewStop({ location: "", type: "pickup" });
        }
    };

    const handleRemoveStop = (index: number) => {
        const newStops = [...stops];
        newStops.splice(index, 1);
        setStops(newStops);
    };

    const createTrip = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('http://localhost:4000/api/fleet/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create trip");
            }
            return res.json();
        },
        onSuccess: (data) => {
            // Add stops if any
            if (stops.length > 0 && data.trip?.id) {
                Promise.all(stops.map((stop, idx) =>
                    fetch(`http://localhost:4000/api/fleet/trips/${data.trip.id}/stops`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            location_name: stop.location,
                            stop_type: stop.type,
                            sequence_number: idx + 1
                        })
                    })
                )).then(() => {
                    toast.success("Trip created with itinerary!");
                    navigate('/fleet/trip-management');
                });
            } else {
                toast.success("Trip created successfully!");
                navigate('/fleet/trip-management');
            }
            queryClient.invalidateQueries({ queryKey: ['fleet-trips'] });
        },
        onError: (err: any) => {
            toast.error(err.message);
        }
    });

    const isFormValid = formData.vehicle_id && formData.driver_id && formData.origin && formData.destination;

    return (
        <div className="flex h-screen bg-neutral-50/50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-[280px]">
                <header className="h-16 border-b bg-white flex items-center gap-4 px-6 shrink-0 z-30">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/fleet/trip-management')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-xl font-bold text-slate-900">Plan New Trip</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Form */}
                        <Card className="md:col-span-2 border-slate-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Trip Details</CardTitle>
                                <CardDescription>Configure resources and timeline</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Vehicle</Label>
                                        <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Vehicle" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(resources?.vehicles || []).filter((v: any) => v.status === 'available').map((v: any) => (
                                                    <SelectItem key={v.id} value={v.id}>
                                                        {v.plate} ({v.status})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Driver</Label>
                                        <Select value={formData.driver_id} onValueChange={(v) => setFormData({ ...formData, driver_id: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Driver" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(resources?.drivers || []).filter((d: any) => d.status === 'available').map((d: any) => (
                                                    <SelectItem key={d.id} value={d.id}>
                                                        {d.name} ({d.status})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Origin Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                placeholder="e.g. Warehouse A"
                                                value={formData.origin}
                                                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Destination</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                className="pl-9"
                                                placeholder="e.g. Customer Site B"
                                                value={formData.destination}
                                                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes / Instructions</Label>
                                    <Textarea
                                        placeholder="Special handling instructions..."
                                        value={formData.instructions}
                                        onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column: Itinerary Builder */}
                        <div className="space-y-6">
                            <Card className="border-slate-100 shadow-sm h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle>Route Itinerary</CardTitle>
                                    <CardDescription>Add intermediate stops</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex gap-2 mb-4">
                                        <Input
                                            placeholder="Stop location..."
                                            value={newStop.location}
                                            onChange={(e) => setNewStop({ ...newStop, location: e.target.value })}
                                        />
                                        <Button size="icon" variant="outline" onClick={handleAddStop}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                                        {/* Origin Node */}
                                        <div className="flex items-center gap-3 opacity-70">
                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                            <span className="text-sm font-medium">{formData.origin || "Origin"}</span>
                                        </div>

                                        {/* Stops */}
                                        {stops.map((stop, i) => (
                                            <div key={i} className="flex items-center gap-3 pl-1">
                                                <div className="w-px h-6 bg-slate-300 absolute -mt-8 ml-0.5" />
                                                <div className="w-1.5 h-1.5 rounded-full border border-blue-500 bg-white z-10" />
                                                <div className="flex-1 bg-white border rounded px-3 py-2 text-sm flex justify-between items-center shadow-sm">
                                                    <span>{stop.location}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => handleRemoveStop(i)}>
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Destination Node */}
                                        <div className="flex items-center gap-3 opacity-70">
                                            <div className="w-px h-6 bg-slate-300 absolute -mt-8 ml-1.5" />
                                            <div className="w-2 h-2 rounded-full bg-blue-600 z-10" />
                                            <span className="text-sm font-medium text-blue-700">{formData.destination || "Destination"}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 border-t bg-slate-50/50">
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        disabled={!isFormValid || createTrip.isPending}
                                        onClick={() => createTrip.mutate(formData)}
                                    >
                                        {createTrip.isPending ? "Saving..." : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" /> Confirm Trip
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
