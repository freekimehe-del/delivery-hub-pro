import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Truck, Plane, Ship } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CostEstimator() {
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        mode: 'road',
        distance_km: '',
        weight: ''
    });

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const calculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const resp = await fetch(`${apiUrl}/api/finance/rates/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    distance_km: parseFloat(formData.distance_km),
                    weight: parseFloat(formData.weight)
                })
            });

            if (resp.ok) {
                const data = await resp.json();
                setResult(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cost Estimation</h1>
                    <p className="text-muted-foreground">Calculate shipping costs and profitability.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={calculate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Origin</Label>
                                        <Input value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} placeholder="City/Port" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Destination</Label>
                                        <Input value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} placeholder="City/Port" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Mode</Label>
                                    <div className="flex space-x-4">
                                        <Button type="button" variant={formData.mode === 'road' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, mode: 'road' })}>
                                            <Truck className="w-4 h-4 mr-2" /> Road
                                        </Button>
                                        <Button type="button" variant={formData.mode === 'air' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, mode: 'air' })}>
                                            <Plane className="w-4 h-4 mr-2" /> Air
                                        </Button>
                                        <Button type="button" variant={formData.mode === 'sea' ? 'default' : 'outline'} onClick={() => setFormData({ ...formData, mode: 'sea' })}>
                                            <Ship className="w-4 h-4 mr-2" /> Sea
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Distance (km)</Label>
                                        <Input type="number" value={formData.distance_km} onChange={e => setFormData({ ...formData, distance_km: e.target.value })} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weight (kg)</Label>
                                        <Input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} required />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Calculating...' : 'Estimate Cost'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {result && (
                        <Card className="bg-slate-50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="w-5 h-5" /> Cost Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Fuel Cost</span>
                                        <span>PKR {result.breakdown.fuel.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Driver Pay</span>
                                        <span>PKR {result.breakdown.driver.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Maintenance</span>
                                        <span>PKR {result.breakdown.maintenance.toLocaleString()}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold">
                                        <span>Total Operating Cost</span>
                                        <span>PKR {result.breakdown.total_cost.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-lg border space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-600">Suggested Price</span>
                                        <Badge variant="secondary">{result.margin_percent}% Margin</Badge>
                                    </div>
                                    <div className="text-3xl font-bold text-green-700">
                                        PKR {result.suggested_price.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Based on standard internal rate of return policies.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
