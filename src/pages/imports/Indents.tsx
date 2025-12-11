
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Filter, FileDown } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Indents() {
    const [indents, setIndents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        supplier: '',
        origin: '',
        items: '',
        value: ''
    });

    const [searchQuery, setSearchQuery] = useState("");

    const filteredIndents = indents.filter(indent =>
        (indent.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (indent.origin || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(indent.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        loadIndents();
    }, []);

    async function loadIndents() {
        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/imports/indents`);
            if (res.ok) {
                const data = await res.json();
                setIndents(data.indents || []);
            }
        } catch (e) {
            console.error("Failed to load indents", e);
        } finally {
            setLoading(false);
        }
    }

    const handleExportExcel = () => {
        exportToExcel(indents, 'Indents_Report', 'Indents');
    };

    const handleExportPDF = () => {
        const columns = [
            { header: 'Indent #', key: 'id' },
            { header: 'Supplier', key: 'supplier' },
            { header: 'Origin', key: 'origin' },
            { header: 'Items', key: 'items' },
            { header: 'Value', key: 'value' },
            { header: 'Status', key: 'status' },
            { header: 'Date', key: 'date' },
        ];
        exportToPDF(indents, columns, 'Purchase Indents Report', 'Indents_Report');
    };

    const handleRowExportPDF = (indent: any) => {
        const columns = [
            { header: 'Indent #', key: 'id' },
            { header: 'Supplier', key: 'supplier' },
            { header: 'Origin', key: 'origin' },
            { header: 'Items', key: 'items' },
            { header: 'Value', key: 'value' },
            { header: 'Status', key: 'status' },
            { header: 'Date', key: 'date' },
        ];
        exportToPDF([indent], columns, `Purchase Indent ${indent.id}`, `Indent_${indent.id}`);
    };

    async function handleCreate() {
        if (!formData.supplier || !formData.value) {
            toast.error("Please fill required fields");
            return;
        }

        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/imports/indents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Indent Created Successfully");
                setIsOpen(false);
                setFormData({ supplier: '', origin: '', items: '', value: '' });
                loadIndents();
            } else {
                toast.error("Failed to create indent");
            }
        } catch (e) {
            toast.error("Error creating indent");
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Purchase Indents</h1>
                    <p className="text-muted-foreground">Track international purchase orders and shipments.</p>
                </div>

                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <FileDown className="h-4 w-4" /> Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> New Indent
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Purchase Indent</DialogTitle>
                                <DialogDescription>Register a new international purchase order.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="supplier" className="text-right">Supplier</Label>
                                    <Input id="supplier" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="origin" className="text-right">Origin</Label>
                                    <Input id="origin" value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="items" className="text-right">Items</Label>
                                    <Input id="items" value={formData.items} onChange={e => setFormData({ ...formData, items: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="value" className="text-right">Value ($)</Label>
                                    <Input id="value" type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate}>Create Indent</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search indents..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Indent #</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead>Origin</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Value ($)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>

                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : filteredIndents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">No indents found.</TableCell>
                                    </TableRow>
                                ) : filteredIndents.map((indent) => (
                                    <TableRow key={indent.id}>
                                        <TableCell className="font-medium">{indent.id}</TableCell>
                                        <TableCell>{indent.supplier}</TableCell>
                                        <TableCell>{indent.origin}</TableCell>
                                        <TableCell>{indent.items}</TableCell>
                                        <TableCell>{indent.value?.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${indent.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {indent.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{indent.date}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm">View</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRowExportPDF(indent)}
                                                    title="Export PDF"
                                                >
                                                    <FileDown className="h-4 w-4 text-blue-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
