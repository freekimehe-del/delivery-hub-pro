import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LineItem {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
}

export default function CreateBill() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [vendorId, setVendorId] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }
    ]);

    // Mock Vendors
    const [vendors, setVendors] = useState<any[]>([]);

    useEffect(() => {
        async function loadVendors() {
            setVendors([
                { id: 'v1', vendor_name: 'Metro Logistics Supply' },
                { id: 'v2', vendor_name: 'Shell Pakistan' },
                { id: 'v3', vendor_name: 'Port Qasim Authority' }
            ]);
        }
        loadVendors();
    }, []);

    const handleAddItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...lineItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setLineItems(newItems);
    };

    const calculateTotals = () => {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
        const tax = lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price * (item.tax_rate / 100)), 0);
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        const payload = {
            vendor_id: vendorId,
            bill_date: billDate,
            due_date: dueDate,
            reference_number: referenceNumber,
            notes,
            line_items: lineItems
        };

        try {
            const resp = await fetch(`${apiUrl}/api/finance/bills`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                toast({
                    title: "Bill Recorded",
                    description: "The vendor bill has been successfully saved.",
                });
                navigate('/finance/bills');
            } else {
                const err = await resp.json();
                throw new Error(err.error || 'Failed to create bill');
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Enter Vendor Bill</h1>
                        <p className="text-muted-foreground">Record a new payable bill from a vendor</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vendor & Dates */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Vendor</Label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={vendorId}
                                    onChange={(e) => setVendorId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.vendor_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Reference # (Invoice No.)</Label>
                                <Input
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    placeholder="e.g. INV-998877"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bill Date</Label>
                                <Input
                                    type="date"
                                    value={billDate}
                                    onChange={(e) => setBillDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-semibold mb-4">Expense Details</h3>
                        <div className="space-y-4">
                            {lineItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                                    <div className="col-span-5 space-y-1">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            placeholder="Expense description"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs">Qty</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs">Price</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={item.unit_price}
                                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <Label className="text-xs">Tax %</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={item.tax_rate}
                                            onChange={(e) => handleItemChange(index, 'tax_rate', parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleRemoveItem(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={handleAddItem} className="w-full border-dashed">
                                <Plus className="w-4 h-4 mr-2" /> Add Expense Item
                            </Button>
                        </div>

                        {/* Totals */}
                        <div className="mt-8 flex justify-end">
                            <div className="w-64 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal:</span>
                                    <span>PKR {totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax:</span>
                                    <span>PKR {totals.tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                                    <span>Total Payable:</span>
                                    <span>PKR {totals.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-2">
                        <Label>Notes</Label>
                        <textarea
                            className="w-full min-h-[100px] p-2 border rounded-md"
                            placeholder="Approver notes or additional info..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Save Bill'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
