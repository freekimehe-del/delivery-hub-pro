import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useInventory, useWarehouses, useWarehouseMutations } from "@/hooks/useWarehouse";
import { Box, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function WarehouseInventory() {
    const [warehouseFilter, setWarehouseFilter] = useState("all");
    const { data: inventory, isLoading } = useInventory(warehouseFilter === "all" ? undefined : warehouseFilter);
    const { data: warehouses } = useWarehouses();
    const { addInventory } = useWarehouseMutations();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    // Form
    const [newItem, setNewItem] = useState({
        warehouse_id: '',
        description: '',
        quantity_on_hand: 0,
        unit: 'units'
    });

    const filteredInventory = inventory?.filter(item =>
        item.description.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = async () => {
        if (!newItem.warehouse_id) return;
        await addInventory.mutateAsync({
            ...newItem,
            quantity_on_hand: Number(newItem.quantity_on_hand)
        });
        setOpen(false);
        setNewItem({ warehouse_id: '', description: '', quantity_on_hand: 0, unit: 'units' });
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        Inventory Management
                    </h1>
                    <p className="text-muted-foreground">Track stock levels across all facilities.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" /> Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Warehouse</Label>
                                    <Select value={newItem.warehouse_id} onValueChange={v => setNewItem({ ...newItem, warehouse_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Facility" /></SelectTrigger>
                                        <SelectContent>
                                            {warehouses?.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} placeholder="Item name / SKU" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input type="number" value={newItem.quantity_on_hand} onChange={e => setNewItem({ ...newItem, quantity_on_hand: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unit</Label>
                                        <Input value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} placeholder="kg, pcs, box" />
                                    </div>
                                </div>
                                <Button onClick={handleAdd} className="w-full">Save Item</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Box className="w-5 h-5 text-primary" /> Current Stock
                        </CardTitle>
                        <div className="flex gap-2">
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search items..."
                                    className="pl-8 h-9"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                                <SelectTrigger className="w-[180px] h-9">
                                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder="Filter Warehouse" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Warehouses</SelectItem>
                                    {warehouses?.map(w => (
                                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Warehouse</TableHead>
                                <TableHead className="text-right">On Hand</TableHead>
                                <TableHead className="text-right">Unit</TableHead>
                                <TableHead className="text-right">Received</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : filteredInventory?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.description}</TableCell>
                                    <TableCell className="text-muted-foreground">{item.warehouse?.name}</TableCell>
                                    <TableCell className="text-right font-mono">{item.quantity_on_hand}</TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs uppercase">{item.unit}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{new Date(item.received_date).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                            {filteredInventory?.length === 0 && (
                                <TableRow><TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No inventory found matching criteria.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
