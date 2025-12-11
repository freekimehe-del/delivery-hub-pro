import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRightLeft, ArrowDownToLine, Truck, Scan, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function StockMovement() {
    const [skus, setSkus] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [type, setType] = useState('RECEIPT');
    const [formData, setFormData] = useState({
        sku: '',
        qty: '',
        warehouse_id: 'WH-001', // Default for now
        ref: '',
        zone: '',
        bin: ''
    });

    useEffect(() => {
        // Fetch SKUs for dropdown
        const fetchItems = async () => {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            try {
                const res = await fetch(`${apiUrl}/api/inventory/items`);
                if (res.ok) setSkus(await res.json());
            } catch (e) {
                console.error(e);
            }
        };
        fetchItems();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        try {
            const res = await fetch(`${apiUrl}/api/inventory/movements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    sku: formData.sku,
                    qty: Number(formData.qty),
                    warehouse_id: formData.warehouse_id,
                    ref: formData.ref,
                    location: formData.zone ? { zone: formData.zone, bin: formData.bin, rack: 'R1' } : null
                })
            });

            if (res.ok) {
                toast.success("Stock movement recorded successfully");
                setFormData({ ...formData, qty: '', ref: '' }); // Reset partial
            } else {
                toast.error("Failed to record movement");
            }
        } catch (error) {
            toast.error("Error submitting form");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Stock Operations</h1>
                    <p className="text-muted-foreground">Execute Goods Receipt, Picking, and Transfers.</p>
                </div>

                <Tabs defaultValue="RECEIPT" onValueChange={setType} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="RECEIPT">
                            <ArrowDownToLine className="mr-2 h-4 w-4" /> Goods Receipt (GRN)
                        </TabsTrigger>
                        <TabsTrigger value="PICK">
                            <Truck className="mr-2 h-4 w-4" /> Outbound Picking
                        </TabsTrigger>
                        <TabsTrigger value="TRANSFER">
                            <ArrowRightLeft className="mr-2 h-4 w-4" /> Internal Transfer
                        </TabsTrigger>
                    </TabsList>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Scan className="h-5 w-5" />
                                {type === 'RECEIPT' ? 'Inbound Entry' : type === 'PICK' ? 'Pick List Execution' : 'Stock Transfer'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Select Item (SKU)</Label>
                                        <Select value={formData.sku} onValueChange={v => setFormData({ ...formData, sku: v })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Search SKU..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {skus.map(item => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.name} ({item.id})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Reference # (PO/Order)</Label>
                                        <Input
                                            placeholder={type === 'RECEIPT' ? "PO-123456" : "ORD-987654"}
                                            value={formData.ref}
                                            onChange={e => setFormData({ ...formData, ref: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Warehouse</Label>
                                        <Select value={formData.warehouse_id} onValueChange={v => setFormData({ ...formData, warehouse_id: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WH-001">Main Warehouse (Karachi)</SelectItem>
                                                <SelectItem value="WH-002">Regional Hub (Lahore)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.qty}
                                            onChange={e => setFormData({ ...formData, qty: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {type === 'RECEIPT' && (
                                    <div className="pt-4 border-t">
                                        <h3 className="text-sm font-medium mb-4">Put-away Strategy</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Zone</Label>
                                                <Input
                                                    placeholder="e.g. A, B, Bulk"
                                                    value={formData.zone}
                                                    onChange={e => setFormData({ ...formData, zone: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Bin Usage</Label>
                                                <Input
                                                    placeholder="e.g. B-01-05"
                                                    value={formData.bin}
                                                    onChange={e => setFormData({ ...formData, bin: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                            System suggested: Zone A, Rack 3 based on item category.
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto">
                                        {loading ? "Processing..." : "Confirm & Update Inventory"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
