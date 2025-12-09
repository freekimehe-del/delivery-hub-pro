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

export default function CreateInvoice() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [customerId, setCustomerId] = useState('');
    const [shipmentId, setShipmentId] = useState(''); // New: Link to shipment
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }
    ]);

    // Data State
    const [customers, setCustomers] = useState<any[]>([]);
    const [shipments, setShipments] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            // Load Customers
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            try {
                const req = await fetch(`${apiUrl}/api/finance/customers`);
                if (req.ok) {
                    const data = await req.json();
                    setCustomers(data.customers || []);
                }
            } catch (e) {
                console.error('Failed to load customers', e);
            }

            // Load Unbilled Shipments
            try {
                const resp = await fetch(`${apiUrl}/api/finance/shipments/unbilled`);
                if (resp.ok) {
                    const data = await resp.json();
                    setShipments(data.shipments || []);
                }
            } catch (e) {
                console.error('Failed to load shipments', e);
            }
        }
        loadData();
    }, []);

    const handleShipmentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        setShipmentId(selectedId);

        const shipment = shipments.find(s => s.id === selectedId);
        if (shipment) {
            // Auto-fill logic
            // Auto-fill logic
            if (customers.length > 0) {
                setCustomerId(customers[0].id); // Auto-select first customer for demo
            }
            setNotes(`Invoice for Shipment Ref: ${shipment.shipment_ref} (${shipment.origin} - ${shipment.destination})`);

            // Auto-calculate freight (Mock logic)
            setLineItems([
                {
                    description: `Freight Charges - ${shipment.mode?.toUpperCase() || 'Standard'}`,
                    quantity: 1,
                    unit_price: 15000, // Mock rate
                    tax_rate: 13
                }
            ]);
        }
    };

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
            customer_id: customerId,
            shipment_id: shipmentId || null,
            invoice_date: invoiceDate,
            due_date: dueDate,
            notes,
            line_items: lineItems
        };

        try {
            const resp = await fetch(`${apiUrl}/api/finance/invoices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                toast({
                    title: "Invoice Created",
                    description: "The invoice has been successfully generated.",
                });
                navigate('/finance/invoices');
            } else {
                const err = await resp.json();
                throw new Error(err.error || 'Failed to create invoice');
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
                        <h1 className="text-2xl font-bold tracking-tight">Create New Invoice</h1>
                        <p className="text-muted-foreground">Issue a new invoice to a customer</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Shipment Link */}
                    <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-2">Import from Logistics</h3>
                        <div className="space-y-2">
                            <Label className="text-blue-800">Select Unbilled Shipment (Optional)</Label>
                            <select
                                className="w-full p-2 border border-blue-200 rounded-md bg-white"
                                value={shipmentId}
                                onChange={handleShipmentSelect}
                            >
                                <option value="">-- Manual Invoice (No Shipment) --</option>
                                {shipments.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.shipment_ref || s.id} - {s.origin} to {s.destination} ({s.status})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-blue-600">Selecting a shipment will auto-fill customer and standard freight charges.</p>
                        </div>
                    </div>

                    {/* Customer & Dates */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Customer</Label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                    required
                                >
                                    <option value="">Select Customer</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.customer_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Invoice Date</Label>
                                <Input
                                    type="date"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
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
                        <h3 className="font-semibold mb-4">Line Items</h3>
                        <div className="space-y-4">
                            {lineItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-lg">
                                    <div className="col-span-5 space-y-1">
                                        <Label className="text-xs">Description</Label>
                                        <Input
                                            value={item.description}
                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                            placeholder="Item description"
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
                                <Plus className="w-4 h-4 mr-2" /> Add Item
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
                                    <span>Total:</span>
                                    <span>PKR {totals.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-2">
                        <Label>Notes / Terms</Label>
                        <textarea
                            className="w-full min-h-[100px] p-2 border rounded-md"
                            placeholder="Enter payment terms or notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Invoice'}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
