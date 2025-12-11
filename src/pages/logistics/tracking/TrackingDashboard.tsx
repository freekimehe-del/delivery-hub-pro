import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Truck, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function TrackingDashboard() {
    const navigate = useNavigate();
    const [trackingId, setTrackingId] = useState("");
    const [stats, setStats] = useState({
        active_shipments: 0,
        delayed_shipments: 0,
        start_of_day_delivered: 0
    });

    useEffect(() => {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        fetch(`${apiUrl}/api/tracking/analytics`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackingId.trim()) {
            navigate(`/logistics/tracking/${trackingId.trim()}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-fade-in">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-800 to-indigo-600 p-8 -mx-6 -mt-6 rounded-b-[3rem] shadow-2xl mb-2 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10 w-full max-w-3xl">
                        <h1 className="text-3xl font-bold tracking-tight mb-3">Shipment Tracking</h1>
                        <p className="text-indigo-100 mb-6 max-w-md">
                            Real-time visibility across all logistics operations. Track containers, trucks, and parcels.
                        </p>

                        {/* Integrated Search within Hero */}
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-5 w-5 text-indigo-200" />
                                <Input
                                    placeholder="Enter Tracking ID (e.g., TRK-DEMO-001)"
                                    className="pl-10 h-11 bg-transparent text-white placeholder:text-indigo-200 border-0 focus-visible:ring-0 focus-visible:bg-white/10 transition-all font-medium"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    // Handle enter key form submission manually since we removed the form wrapper for styling
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                                />
                            </div>
                            <Button
                                size="lg"
                                className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold h-11 px-8 rounded-xl shadow-lg"
                                onClick={handleSearch}
                            >
                                Track Now
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-3 px-2 -mt-12 relative z-20">
                    <Card className="border-0 shadow-lg shadow-blue-900/10 bg-white card-hover group cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Active Shipments</CardTitle>
                            <div className="p-3 bg-blue-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <Truck className="h-5 w-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{stats.active_shipments}</div>
                            <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-1 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                Currently in transit
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-red-900/10 bg-white card-hover group cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Delayed</CardTitle>
                            <div className="p-3 bg-red-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{stats.delayed_shipments}</div>
                            <div className="mt-2 flex items-center text-xs text-red-600 font-medium bg-red-50 w-fit px-2 py-1 rounded-full">
                                Attention required
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-green-900/10 bg-white card-hover group cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Delivered Today</CardTitle>
                            <div className="p-3 bg-green-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{stats.start_of_day_delivered}</div>
                            <div className="mt-2 flex items-center text-xs text-slate-500 font-medium bg-slate-50 w-fit px-2 py-1 rounded-full">
                                Successfully completed
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
