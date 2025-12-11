
import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Ship, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ImportDashboard() {
    const [stats, setStats] = useState({
        open_indents: 0,
        on_water: 0,
        customs_holding: 0,
        duty_payable: 0
    });
    const [recentIndents, setRecentIndents] = useState<any[]>([]);

    useEffect(() => {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        // Fetch Stats
        fetch(`${apiUrl}/api/imports/stats`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));

        // Fetch Recent Indents
        fetch(`${apiUrl}/api/imports/indents`)
            .then(res => res.json())
            .then(data => {
                // Take last 5 and reverse to show newest first
                const recent = (data.indents || []).slice(-5).reverse();
                setRecentIndents(recent);
            })
            .catch(err => console.error(err));
    }, []);

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Import Operations</h1>
                    <p className="text-muted-foreground">Manage Indents, Shipments, and Customs Clearance</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link to="/imports/indents">New Indent</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Indents</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.open_indents}</div>
                        <p className="text-xs text-muted-foreground">Waiting for shipment</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Water</CardTitle>
                        <Ship className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.on_water}</div>
                        <p className="text-xs text-muted-foreground">Arriving in &lt; 7 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customs Holding</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customs_holding}</div>
                        <p className="text-xs text-muted-foreground text-red-500">Action Required</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Duty Payable</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs {(stats.duty_payable / 1000000).toFixed(1)}M</div>
                        <p className="text-xs text-muted-foreground">Due this week</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Indents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentIndents.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No recent indents</p>
                            ) : (
                                recentIndents.map((indent) => (
                                    <div key={indent.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-semibold">{indent.id}</p>
                                            <p className="text-sm text-gray-500">Supplier: {indent.supplier}</p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded ${indent.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {indent.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Arrivals this Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="font-semibold">BL-KHI-{800 + i}</p>
                                        <p className="text-sm text-gray-500">Vessel: MSC RANIA</p>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">ETA: Dec 15</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
