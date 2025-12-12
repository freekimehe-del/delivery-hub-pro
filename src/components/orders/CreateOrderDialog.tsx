import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Package } from "lucide-react";
import { useOrderMutations } from "@/hooks/useOrders";
import { toast } from "sonner";

interface OrderItemInput {
    sku: string;
    quantity: number;
}

interface CreateOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Mock Products for selection
const AVAILABLE_PRODUCTS = [
    { id: 'SKU-001', name: 'Wireless Mouse', price: 25.00 },
    { id: 'SKU-002', name: 'Ergonomic Chair', price: 150.00 },
    { id: 'SKU-003', name: 'Monitor Stand', price: 45.00 },
    { id: 'SKU-004', name: 'USB-C Cable', price: 12.00 },
];

export function CreateOrderDialog({ open, onOpenChange }: CreateOrderDialogProps) {
    const { createOrder } = useOrderMutations();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        customer_id: '',
        warehouse_id: 'WH-001',
        line1: '',
        city: '',
        state: '',
        priority: 'normal'
    });

    const [items, setItems] = useState<OrderItemInput[]>([{ sku: '', quantity: 1 }]);

    const handleAddItem = () => {
        setItems([...items, { sku: '', quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof OrderItemInput, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customer_id) return toast.error("Please select a customer");
        if (items.some(i => !i.sku || i.quantity < 1)) return toast.error("Please fill in valid items");

        setLoading(true);
        try {
            await createOrder.mutateAsync({
                customer_id: formData.customer_id,
                warehouse_id: formData.warehouse_id,
                shipping_address: {
                    line1: formData.line1,
                    city: formData.city,
                    state: formData.state
                },
                priority: formData.priority as any,
                expected_delivery: new Date(Date.now() + 86400000 * 3).toISOString(), // Mock 3 days out
                items: items.map(i => ({
                    sku: i.sku,
                    quantity: Number(i.quantity),
                    name: "", // handled by backend
                    unit_price: 0, // handled by backend
                    total_price: 0 // handled by backend
                }))
            });
            onOpenChange(false);
            // Reset form
            setFormData({ customer_id: '', warehouse_id: 'WH-001', line1: '', city: '', state: '', priority: 'normal' });
            setItems([{ sku: '', quantity: 1 }]);
        } catch (err) {
            // Error handled by mutation
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                    <DialogDescription>
                        Enter order details to initiate processing. Inventory will be reserved immediately.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Customer</Label>
                            <Select
                                value={formData.customer_id}
                                onValueChange={(v) => setFormData({ ...formData, customer_id: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CUST-001">Global Traders</SelectItem>
                                    <SelectItem value="CUST-002">Tech Imports Ltd</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(v) => setFormData({ ...formData, priority: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2 border p-3 rounded-md bg-muted/20">
                        <Label className="flex items-center gap-2 font-semibold">
                            <Package className="w-4 h-4" /> Order Items
                        </Label>
                        <div className="space-y-3 mt-2">
                            {items.map((item, index) => (
                                <div key={index} className="flex gap-3 items-end">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-xs">Product / SKU</Label>
                                        <Select
                                            value={item.sku}
                                            onValueChange={(v) => updateItem(index, 'sku', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {AVAILABLE_PRODUCTS.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.name} (${p.price})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <Label className="text-xs">Qty</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive/80"
                                        onClick={() => handleRemoveItem(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="mt-2 w-full gap-2 border-dashed">
                            <Plus className="w-4 h-4" /> Add Another Item
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Shipping Address</Label>
                        <Input
                            placeholder="Street Address"
                            value={formData.line1}
                            onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                            className="mb-2"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                placeholder="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            />
                            <Input
                                placeholder="State/Province"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="gap-2">
                            {loading && <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />}
                            Create Order
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
