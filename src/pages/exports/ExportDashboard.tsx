
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Ship, FileText, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ExportDashboard() {
    const [stats, setStats] = useState({
        active_bookings: 0,
        gate_in: 0,
        pending_gds: 0,
        docs_completed: 0
    });
    const [recentBookings, setRecentBookings] = useState<any[]>([]);

    useEffect(() => {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        // Fetch Stats
        fetch(`${apiUrl}/api/exports/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));

        // Fetch Recent Bookings
        fetch(`${apiUrl}/api/exports/bookings`)
            .then(res => res.json())
            .then(data => {
                const recent = (data.bookings || []).slice(-5).reverse();
                setRecentBookings(recent);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Export Operations</h1>
                    <p className="text-muted-foreground">Manage Bookings, Gate Passes, and Export Documentation</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link to="/exports/bookings">New Booking (CRO)</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link to="/logistics/customs/compliance">Generate Gate Pass</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                        <Ship className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_bookings}</div>
                        <p className="text-xs text-muted-foreground">Space booked with lines</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gate In</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.gate_in}</div>
                        <p className="text-xs text-muted-foreground">Containers inside terminal</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending GDs</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending_gds}</div>
                        <p className="text-xs text-muted-foreground text-orange-500">Awaiting Customs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Docs Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.docs_completed}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Bookings (CRO)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentBookings.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No recent bookings</p>
                            ) : (
                                recentBookings.map((bk) => (
                                    <div key={bk.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-semibold">{bk.id}</p>
                                            <p className="text-sm text-gray-500">{bk.carrier} - {bk.vessel}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded ${bk.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {bk.status}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">{bk.containers} Cont.</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Gate Passes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="font-semibold">GP-{900 + i}</p>
                                        <p className="text-sm text-gray-500">Vehicle: TLA-{100 + i}</p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Entered</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
