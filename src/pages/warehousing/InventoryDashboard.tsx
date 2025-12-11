import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Package, AlertTriangle, TrendingUp, DollarSign,
    ArrowRight, Activity, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InventoryStats {
    metrics: {
        total_skus: number;
        stock_value: number;
        turnover_rate: number;
        low_stock_alerts: number;
    };
    top_movers: Array<{ sku: string; name: string; sold: number }>;
    recent_movements: Array<{ id: string; type: string; sku: string; qty: number; date: string }>;
}

export default function InventoryDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            try {
                const res = await fetch(`${apiUrl}/api/inventory/dashboard`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch inventory stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <DashboardLayout>Loading...</DashboardLayout>;
    if (!stats) return <DashboardLayout>Error loading dashboard</DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 animate-fade-in">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-800 to-emerald-600 p-8 -mx-6 -mt-6 rounded-b-[3rem] shadow-2xl mb-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Inventory Overview</h1>
                        <p className="text-emerald-50 max-w-xl">
                            Real-time intelligence on stock levels, valuation, and warehouse movements.
                        </p>
                    </div>
                    <div className="flex gap-3 relative z-10">
                        <Button
                            variant="secondary"
                            className="bg-white/10 text-white hover:bg-white/20 border-0"
                            onClick={() => navigate('/warehousing/inventory')}
                        >
                            View All Items
                        </Button>
                        <Button
                            className="bg-white text-emerald-900 hover:bg-emerald-50 shadow-glow font-semibold"
                            onClick={() => navigate('/warehousing/movements')}
                        >
                            <TrendingUp className="w-4 h-4 mr-2" /> Record Movement
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-2">
                    <Card className="border-0 shadow-lg shadow-emerald-900/5 bg-white/80 backdrop-blur card-hover group cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Stock Value</CardTitle>
                            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                <DollarSign className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">${stats.metrics.stock_value.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">Across all warehouses</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-blue-900/5 bg-white/80 backdrop-blur card-hover group cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Active SKUs</CardTitle>
                            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                <Package className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{stats.metrics.total_skus}</div>
                            <p className="text-xs text-muted-foreground mt-1">Unique items managed</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-orange-900/5 bg-white/80 backdrop-blur card-hover group cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Low Stock Alerts</CardTitle>
                            <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-orange-600">{stats.metrics.low_stock_alerts}</div>
                            <p className="text-xs text-muted-foreground mt-1">Items below safety stock</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg shadow-purple-900/5 bg-white/80 backdrop-blur card-hover group cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Turnover Rate</CardTitle>
                            <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800">{stats.metrics.turnover_rate}</div>
                            <p className="text-xs text-muted-foreground mt-1">Monthly average</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Top Movers */}
                    <Card className="col-span-4 border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden glass">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Top Moving Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="">
                                {stats.top_movers.map((item, i) => (
                                    <div key={item.sku} className="flex items-center p-4 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-50">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold shadow-sm">
                                            {i + 1}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-semibold text-slate-800 leading-none">{item.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{item.sku}</p>
                                        </div>
                                        <div className="ml-auto font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm">
                                            +{item.sold} units
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="col-span-3 border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden glass">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-slate-500" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[400px] overflow-y-auto">
                                {stats.recent_movements.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No recent movements</div>
                                ) : (
                                    stats.recent_movements.map((move) => (
                                        <div key={move.id} className="flex items-center p-4 border-b last:border-0 border-slate-50 hover:bg-slate-50/80 transition-colors group">
                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-110 
                                                ${move.type === 'RECEIPT' ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-700' :
                                                    move.type === 'PICK' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'}`}>
                                                {move.type === 'RECEIPT' ? <ArrowRight className="h-4 w-4 rotate-90" /> :
                                                    move.type === 'PICK' ? <ArrowRight className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                            </div>
                                            <div className="ml-4 space-y-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 leading-none capitalize truncate">
                                                    {move.type.replace('_', ' ').toLowerCase()}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                    {move.sku}
                                                </p>
                                            </div>
                                            <div className="ml-auto text-right">
                                                <div className="text-sm font-bold text-slate-700">{Math.abs(move.qty)}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {new Date(move.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
