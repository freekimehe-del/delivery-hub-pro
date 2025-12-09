import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, Clock, Truck, DollarSign } from 'lucide-react';

interface Settlement {
    id: string;
    driver_id: string;
    driver_name: string;
    trip_count: number;
    total_km: number;
    base_pay: number;
    allowance: number;
    deductions: number;
    total_payable: number;
    status: 'pending' | 'processed';
}

export default function DriverSettlements() {
    const { toast } = useToast();
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async () => {
        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const resp = await fetch(`${apiUrl}/api/finance/settlements`);
            if (resp.ok) {
                const data = await resp.json();
                setSettlements(data.settlements || []);
            }
        } catch (error) {
            console.error('Failed to fetch settlements', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (id: string) => {
        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const resp = await fetch(`${apiUrl}/api/finance/settlements/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settlement_id: id })
            });

            if (resp.ok) {
                toast({
                    title: "Settlement Processed",
                    description: "Payment has been authorized and recorded in AP.",
                });
                // Refresh list
                fetchSettlements();
            } else {
                throw new Error('Processing failed');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to process settlement.",
                variant: "destructive"
            });
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Driver Settlements</h1>
                    <p className="text-muted-foreground">Manage driver trip payments, allowances, and deductions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{settlements.filter(s => s.status === 'pending').length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Payable</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                PKR {settlements.reduce((sum, s) => sum + (s.status === 'pending' ? s.total_payable : 0), 0).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                            <Truck className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Set(settlements.map(s => s.driver_id)).size}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 font-medium grid grid-cols-12 gap-4 text-sm text-gray-500">
                        <div className="col-span-3">Driver Name</div>
                        <div className="col-span-1 text-center">Trips</div>
                        <div className="col-span-2 text-center">Total Km</div>
                        <div className="col-span-2 text-right">Base Pay</div>
                        <div className="col-span-2 text-right">Total Payable</div>
                        <div className="col-span-2 text-center">Action</div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading settlements...</div>
                    ) : settlements.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No pending settlements found.</div>
                    ) : (
                        <div className="divide-y">
                            {settlements.map((settlement) => (
                                <div key={settlement.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors">
                                    <div className="col-span-3 font-medium text-gray-900">
                                        {settlement.driver_name}
                                        <div className="text-xs text-muted-foreground">ID: {settlement.driver_id}</div>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <Badge variant="secondary">{settlement.trip_count}</Badge>
                                    </div>
                                    <div className="col-span-2 text-center text-sm">
                                        {settlement.total_km.toLocaleString()} km
                                    </div>
                                    <div className="col-span-2 text-right text-sm">
                                        PKR {settlement.base_pay.toLocaleString()}
                                    </div>
                                    <div className="col-span-2 text-right font-bold text-green-700">
                                        PKR {settlement.total_payable.toLocaleString()}
                                        <div className="text-xs font-normal text-muted-foreground">
                                            + {settlement.allowance.toLocaleString()} (Allw)
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        {settlement.status === 'pending' ? (
                                            <Button size="sm" onClick={() => handleProcess(settlement.id)}>
                                                Approve & Pay
                                            </Button>
                                        ) : (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Paid
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
