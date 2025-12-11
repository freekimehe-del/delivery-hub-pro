import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Container, Wrench, RefreshCw, Plus, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";  // Assuming Textarea exists or use Input for notes

const Containers: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [containers, setContainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedContainer, setSelectedContainer] = useState<any>(null);
    const [formData, setFormData] = useState({
        container_number: "",
        size: "40ft",
        type: "standard",
        status: "available",
        current_location: "",
        condition: "",
        notes: ""
    });

    const resetForm = () => {
        setFormData({
            container_number: "",
            size: "40ft",
            type: "standard",
            status: "available",
            current_location: "",
            condition: "",
            notes: ""
        });
    };

    async function loadData() {
        try {
            // Fetch Inventory
            const { data, error } = await supabase
                .from('container_inventory' as any)
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                // Auto seed if empty for demo
                seedContainers();
                return;
            }

            setContainers(data);

            // Calculate Stats
            const total = data.length;
            const available = data.filter((c: any) => c.status === 'available').length;
            const maintenance = data.filter((c: any) => c.status === 'maintenance').length;
            setStats({ total, available, maintenance });

        } catch (e) {
            console.error(e);
        }
    }

    async function seedContainers() {
        const mocks = [
            { container_number: 'MSKU-102938', size: '40ft', type: 'standard', status: 'available', location: 'Port of Karachi', condition: 'good' },
            { container_number: 'MSKU-998877', size: '20ft', type: 'standard', status: 'in_use', location: 'En Route to Lahore', condition: 'good' },
            { container_number: 'CMAU-554433', size: '40ft', type: 'reefer', status: 'maintenance', location: 'Repair Yard', condition: 'damaged' },
            { container_number: 'HLCU-112233', size: '45ft', type: 'high_cube', status: 'available', location: 'Port of Bin Qasim', condition: 'good' },
        ];
        await supabase.from('container_inventory' as any).insert(mocks);
        loadData();
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('container_inventory' as any)
                .insert([{
                    container_number: formData.container_number,
                    size: formData.size,
                    type: formData.type,
                    status: formData.status,
                    current_location: formData.current_location,
                    // condition: formData.condition, // Ensure these columns exist in DB or add to Select
                }]);

            if (error) throw error;
            setIsCreateOpen(false);
            resetForm();
            loadData();
        } catch (e: any) {
            alert("Error creating container: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedContainer) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('container_inventory' as any)
                .update({
                    container_number: formData.container_number,
                    size: formData.size,
                    type: formData.type,
                    status: formData.status,
                    current_location: formData.current_location,
                })
                .eq('id', selectedContainer.id);

            if (error) throw error;
            setIsEditOpen(false);
            setSelectedContainer(null);
            loadData();
        } catch (e: any) {
            alert("Error updating container: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this container record?")) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('container_inventory' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadData();
        } catch (e: any) {
            alert("Error deleting container: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (container: any) => {
        setSelectedContainer(container);
        setFormData({
            container_number: container.container_number,
            size: container.size,
            type: container.type,
            status: container.status,
            current_location: container.current_location || container.location || "",
            condition: container.condition || "",
            notes: container.notes || ""
        });
        setIsEditOpen(true);
    };

    const openView = (container: any) => {
        setSelectedContainer(container);
        setIsViewOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Empty Container Management</h1>
                    <p className="text-muted-foreground">Track empty container returns and maintenance lifecycle.</p>
                </div>
                <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Empty Container
                </Button>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded shadow border flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Pool</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <Container className="text-blue-500" />
                    </div>
                    <div className="bg-white p-4 rounded shadow border flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Available</p>
                            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                        </div>
                        <RefreshCw className="text-green-500" />
                    </div>
                    <div className="bg-white p-4 rounded shadow border flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">In Maintenance</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
                        </div>
                        <Wrench className="text-orange-500" />
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {containers.map((c) => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    <button onClick={() => openView(c)} className="text-blue-600 hover:underline">
                                        {c.container_number || c.id}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.type} - {c.size}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'available' ? 'bg-green-100 text-green-800' :
                                        c.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.current_location || c.location || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openView(c)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openEdit(c)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-red-600 focus:text-red-600">
                                                <Trash className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Valid Container</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="c-number" className="text-right">Container ID</Label>
                            <Input id="c-number" value={formData.container_number} onChange={(e) => setFormData({ ...formData, container_number: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="c-type" className="text-right">Type</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="reefer">Reefer</SelectItem>
                                    <SelectItem value="open_top">Open Top</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="c-size" className="text-right">Size</Label>
                            <Select value={formData.size} onValueChange={(v) => setFormData({ ...formData, size: v })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="20ft">20ft</SelectItem>
                                    <SelectItem value="40ft">40ft</SelectItem>
                                    <SelectItem value="45ft">45ft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="c-status" className="text-right">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="in_use">In Use</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="c-location" className="text-right">Location</Label>
                            <Input id="c-location" value={formData.current_location} onChange={(e) => setFormData({ ...formData, current_location: e.target.value })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreate} disabled={loading}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Container</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Container ID</Label>
                            <Input value={formData.container_number} onChange={(e) => setFormData({ ...formData, container_number: e.target.value })} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="e-type" className="text-right">Type</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="reefer">Reefer</SelectItem>
                                    <SelectItem value="open_top">Open Top</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="e-size" className="text-right">Size</Label>
                            <Select value={formData.size} onValueChange={(v) => setFormData({ ...formData, size: v })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="20ft">20ft</SelectItem>
                                    <SelectItem value="40ft">40ft</SelectItem>
                                    <SelectItem value="45ft">45ft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Status</Label>
                            <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="in_use">In Use</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Location</Label>
                            <Input value={formData.current_location} onChange={(e) => setFormData({ ...formData, current_location: e.target.value })} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={loading}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Return Dialog */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Return Container: {selectedContainer?.container_number}</DialogTitle>
                    </DialogHeader>
                    {selectedContainer && (
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 text-blue-800 rounded mb-4">
                                <p className="text-sm font-semibold">Ready for Return?</p>
                                <p className="text-xs">Confirming return will stop detention clock.</p>
                            </div>

                            <div className="grid gap-4">
                                <Label>Return Location</Label>
                                <Input
                                    placeholder="e.g. Port of Karachi"
                                    onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                                />
                                <Label>Condition</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select Condition" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="good">Good</SelectItem>
                                        <SelectItem value="damaged">Damaged</SelectItem>
                                        <SelectItem value="needs_cleaning">Needs Cleaning</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewOpen(false)}>Cancel</Button>
                        <Button
                            onClick={async () => {
                                setLoading(true);
                                const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
                                try {
                                    const res = await fetch(`${apiUrl}/api/containers/return`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            container_id: selectedContainer.id,
                                            location: formData.current_location,
                                            condition: formData.condition || 'good',
                                            return_date: new Date().toISOString()
                                        })
                                    });
                                    const json = await res.json();

                                    if (json.ok) {
                                        if (json.charges && json.charges.total_amount > 0) {
                                            alert(`Detention Charged: $${json.charges.total_amount} (${json.charges.detention_days} days overdue)`);
                                        } else {
                                            alert("Container Returned. No Detention Charges.");
                                        }
                                        setIsViewOpen(false);
                                        loadData();
                                    } else {
                                        alert("Error: " + json.error);
                                    }
                                } catch (e: any) {
                                    alert("Failed to process return");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                        >
                            Confirm Return
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default Containers;
