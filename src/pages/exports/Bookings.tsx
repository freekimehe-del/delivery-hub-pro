
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

export default function Bookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        carrier: '',
        vessel: '',
        etd: '',
        containers: ''
    });

    const [searchQuery, setSearchQuery] = useState("");

    const filteredBookings = bookings.filter(bk =>
        (bk.carrier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bk.vessel || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(bk.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/exports/bookings`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data.bookings || []);
            }
        } catch (e) {
            console.error("Failed to load bookings", e);
        } finally {
            setLoading(false);
        }
    }

    const handleExportExcel = () => {
        exportToExcel(bookings, 'Bookings_Report', 'Bookings');
    };

    const handleExportPDF = () => {
        const columns = [
            { header: 'Booking #', key: 'id' },
            { header: 'Carrier', key: 'carrier' },
            { header: 'Vessel', key: 'vessel' },
            { header: 'ETD', key: 'etd' },
            { header: 'Containers', key: 'containers' },
            { header: 'Status', key: 'status' }
        ];
        exportToPDF(bookings, columns, 'Export Bookings Report', 'Bookings_Report');
    };

    const handleRowExportPDF = (bk: any) => {
        const columns = [
            { header: 'Booking #', key: 'id' },
            { header: 'Carrier', key: 'carrier' },
            { header: 'Vessel', key: 'vessel' },
            { header: 'ETD', key: 'etd' },
            { header: 'Containers', key: 'containers' },
            { header: 'Status', key: 'status' }
        ];
        exportToPDF([bk], columns, `Booking ${bk.id}`, `Booking_${bk.id}`);
    };

    async function handleCreate() {
        if (!formData.carrier || !formData.containers) {
            toast.error("Please fill required fields");
            return;
        }

        try {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/exports/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success("Booking Created Successfully");
                setIsOpen(false);
                setFormData({ carrier: '', vessel: '', etd: '', containers: '' });
                loadBookings();
            } else {
                toast.error("Failed to create booking");
            }
        } catch (e) {
            toast.error("Error creating booking");
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Export Bookings</h1>
                    <p className="text-muted-foreground">Manage Cargo Rolling Orders (CRO) and Carrier Space.</p>
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
                                <Plus className="h-4 w-4" /> New Booking
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>New Export Booking</DialogTitle>
                                <DialogDescription>Request specific container rolling (CRO).</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="carrier" className="text-right">Line/Carrier</Label>
                                    <Input id="carrier" value={formData.carrier} onChange={e => setFormData({ ...formData, carrier: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="vessel" className="text-right">Vessel</Label>
                                    <Input id="vessel" value={formData.vessel} onChange={e => setFormData({ ...formData, vessel: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="etd" className="text-right">ETD</Label>
                                    <Input id="etd" type="date" value={formData.etd} onChange={e => setFormData({ ...formData, etd: e.target.value })} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="containers" className="text-right">Containers</Label>
                                    <Input id="containers" type="number" value={formData.containers} onChange={e => setFormData({ ...formData, containers: e.target.value })} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreate}>Create Booking</Button>
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
                                placeholder="Search bookings..."
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
                                    <TableHead>Booking #</TableHead>
                                    <TableHead>Line / Carrier</TableHead>
                                    <TableHead>Vessel</TableHead>
                                    <TableHead>ETD (Karachi)</TableHead>
                                    <TableHead>Containers</TableHead>
                                    <TableHead>Status</TableHead>

                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : filteredBookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No bookings found.</TableCell>
                                    </TableRow>
                                ) : filteredBookings.map((bk) => (
                                    <TableRow key={bk.id}>
                                        <TableCell className="font-medium">{bk.id}</TableCell>
                                        <TableCell>{bk.carrier}</TableCell>
                                        <TableCell>{bk.vessel}</TableCell>
                                        <TableCell>{bk.etd}</TableCell>
                                        <TableCell>{bk.containers}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bk.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {bk.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm">View</Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRowExportPDF(bk)}
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
