import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Plus, Search, MapPin, Calendar, Truck, User, ArrowRight,
    Play, AlertCircle, CheckCircle2, CloudFog, Navigation
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ActiveTripsMap } from "@/components/fleet/ActiveTripsMap";
import { useQuery } from "@tanstack/react-query";

interface Trip {
    id: string;
    trip_number: string;
    vehicle_id: string;
    driver_id: string;
    origin_location: string;
    destination_location: string;
    start_time: string;
    status: 'planned' | 'dispatched' | 'in_transit' | 'delayed' | 'completed' | 'cancelled';
    total_distance_km: number;
    vehicle?: { plate?: string; type?: string };
    driver?: { name?: string };
    stops_count?: number;
}

export default function TripManagement() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: tripsData, isLoading } = useQuery({
        queryKey: ['fleet-trips'],
        queryFn: async () => {
            const res = await fetch('http://localhost:4000/api/fleet/trips');
            if (!res.ok) throw new Error("Failed to fetch trips");
            return res.json();
        }
    });

    const trips: Trip[] = tripsData?.trips || [];

    const filteredTrips = trips.filter(t =>
        t.trip_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.destination_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'planned': return <Badge variant="outline" className="bg-slate-100 text-slate-700">Planned</Badge>;
            case 'dispatched': return <Badge className="bg-blue-500">Dispatched</Badge>;
            case 'in_transit': return <Badge className="bg-indigo-500 animate-pulse">In Transit</Badge>;
            case 'delayed': return <Badge variant="destructive">Delayed</Badge>;
            case 'completed': return <Badge className="bg-green-600">Completed</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="flex h-screen bg-neutral-50/50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-[280px]">
                {/* Header */}
                <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        <Navigation className="w-8 h-8 text-blue-600 bg-blue-50 p-1.5 rounded-lg" />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Trip Management</h1>
                            <p className="text-xs text-muted-foreground">Plan, Track and Optimize Transport</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2">
                            <Calendar className="w-4 h-4" /> Schedule
                        </Button>
                        <Button onClick={() => navigate('/fleet/trip-management/new')} className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-900/20">
                            <Plus className="w-4 h-4" /> Plan New Trip
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Active Trips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                                    {trips.filter(t => t.status === 'in_transit').length}
                                    <Truck className="w-4 h-4 text-blue-400" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">+2 from yesterday</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Dispatch</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-700 flex items-center gap-2">
                                    {trips.filter(t => t.status === 'planned' || t.status === 'dispatched').length}
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Next 24 Hours</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Delayed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                                    {trips.filter(t => t.status === 'delayed').length}
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Avg Delay: 45m</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-100 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Completed (Week)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                                    {trips.filter(t => t.status === 'completed').length}
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">On-Time Rate: 94%</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Map & List Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Active Tracking Map */}
                        <ActiveTripsMap className="xl:col-span-3 h-[400px]" trips={trips.filter(t => t.status === 'in_transit' || t.status === 'dispatched')} />

                        {/* Recent Trips Table */}
                        <div className="xl:col-span-3">
                            <Card className="border-slate-100 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>All Trips</CardTitle>
                                        <CardDescription>Manage and monitor all transport activities</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search trips..."
                                                className="pl-9 w-[250px]"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Button variant="outline">Filter</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Trip ID</TableHead>
                                                <TableHead>Route</TableHead>
                                                <TableHead>Driver & Vehicle</TableHead>
                                                <TableHead>Schedule</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                [1, 2, 3].map(i => (
                                                    <TableRow key={i}>
                                                        <TableCell><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                        <TableCell><div className="h-4 w-48 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                        <TableCell><div className="h-4 w-32 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                        <TableCell><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                        <TableCell><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></TableCell>
                                                        <TableCell><div className="h-4 w-8 bg-slate-100 rounded animate-pulse ml-auto" /></TableCell>
                                                    </TableRow>
                                                ))
                                            ) : filteredTrips.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                        No trips found. Create one to get started.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredTrips.map((trip) => (
                                                    <TableRow key={trip.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/fleet/trip-management/${trip.id}`)}>
                                                        <TableCell className="font-medium text-blue-600">
                                                            {trip.trip_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                                                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                                                                    {trip.origin_location}
                                                                </div>
                                                                <div className="h-4 border-l ml-1 border-dashed border-slate-300" />
                                                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                                    {trip.destination_location}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                                    <User className="w-4 h-4 text-slate-500" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-slate-900">{trip.driver?.name || "Unassigned"}</p>
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                        <Truck className="w-3 h-3" />
                                                                        {trip.vehicle?.plate || "No Vehicle"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {new Date(trip.start_time).toLocaleDateString()}
                                                                <span className="block text-xs text-muted-foreground">
                                                                    {new Date(trip.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(trip.status)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                                Details <ArrowRight className="w-4 h-4 ml-1" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
