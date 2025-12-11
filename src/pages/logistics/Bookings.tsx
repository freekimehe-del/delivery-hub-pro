import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Plus, Package, CheckCircle, Clock, Truck,
    MoreHorizontal, FileText, FileSpreadsheet, Download, Search, Filter, Trash
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Bookings: React.FC = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        active: 0,
        completed: 0
    });
    const [searchQuery, setSearchQuery] = useState("");

    // Delete Dialog State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        setLoading(true);
        // Cast to any to avoid type errors before regen
        const { data, error } = await supabase
            .from('logistics_bookings' as any)
            .select(`
                *,
                customer:customers(name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
        } else if (data) {
            setBookings(data);
            calculateStats(data);
        }
        setLoading(false);
    };

    const calculateStats = (data: any[]) => {
        setStats({
            total: data.length,
            pending: data.filter(b => ['draft', 'pending_approval'].includes(b.status)).length,
            active: data.filter(b => ['approved', 'dispatched', 'in_transit'].includes(b.status)).length,
            completed: data.filter(b => b.status === 'completed' || b.status === 'delivered').length
        });
    };

    const handleCancel = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        setLoading(true);
        const { error } = await supabase
            .from('logistics_bookings' as any)
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (error) {
            console.error(error);
            alert("Error cancelling booking");
        } else {
            loadBookings();
        }
        setLoading(false);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        const { error } = await supabase
            .from('logistics_bookings' as any)
            .delete()
            .eq('id', deleteId);

        if (error) {
            console.error(error);
            alert("Error deleting booking");
        } else {
            loadBookings();
        }
        setLoading(false);
        setDeleteId(null);
    };

    const handleExportSingleExcel = (b: any) => {
        const data = [{
            "Booking ID": b.booking_number,
            "Customer": b.customer?.name,
            "Transport Mode": b.transport_mode,
            "Origin": b.origin_location,
            "Destination": b.destination_location,
            "Status": b.status,
            "Created Date": new Date(b.created_at).toLocaleDateString(),
            "Pickup Date": b.pickup_date || "-",
            "Delivery Date": b.expected_delivery_date || "-"
        }];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Booking Details");
        XLSX.writeFile(wb, `${b.booking_number}_Details.xlsx`);
    };

    const handleExportSinglePDF = (b: any) => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('BOOKING CONFIRMATION', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text(`Booking #: ${b.booking_number}`, 14, 40);
        doc.text(`Date: ${new Date(b.created_at).toLocaleDateString()}`, 14, 48);
        doc.text(`Status: ${b.status.toUpperCase()}`, 14, 56);
        doc.text(`Customer: ${b.customer?.name || "-"}`, 14, 64);

        // Grid for details
        autoTable(doc, {
            startY: 75,
            head: [['Field', 'Value']],
            body: [
                ['Transport Mode', b.transport_mode.toUpperCase()],
                ['Origin', b.origin_location],
                ['Destination', b.destination_location],
                ['Pickup Date', b.pickup_date || "-"],
                ['Est. Delivery', b.expected_delivery_date || "-"]
            ],
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }
        });

        doc.save(`${b.booking_number}.pdf`);
    };

    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(bookings.map(b => ({
            "ID": b.booking_number,
            "Customer": b.customer?.name,
            "Mode": b.transport_mode,
            "Origin": b.origin_location,
            "Destination": b.destination_location,
            "Status": b.status,
            "Created": new Date(b.created_at).toLocaleDateString()
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Bookings");
        XLSX.writeFile(wb, "Logistics_Bookings.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Logistics Bookings Report", 14, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Booking #', 'Customer', 'Mode', 'Route', 'Status']],
            body: bookings.map(b => [
                b.booking_number,
                b.customer?.name || 'N/A',
                b.transport_mode,
                `${b.origin_location} -> ${b.destination_location}`,
                b.status
            ])
        });
        doc.save("Logistics_Bookings.pdf");
    };

    const filteredBookings = bookings.filter(b =>
        b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.origin_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.destination_location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
                        <p className="text-muted-foreground">Manage shipment bookings, tracking, and documentation.</p>
                    </div>
                    <div className="flex gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleExportPDF}>
                                    <FileText className="mr-2 h-4 w-4" /> PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExportExcel}>
                                    <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={() => navigate('/logistics/bookings/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Booking
                        </Button>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                            <h2 className="text-3xl font-bold">{stats.total}</h2>
                        </div>
                        <Package className="h-8 w-8 text-blue-500 opacity-20" />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                            <h2 className="text-3xl font-bold text-orange-600">{stats.pending}</h2>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500 opacity-20" />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Shipments</p>
                            <h2 className="text-3xl font-bold text-blue-600">{stats.active}</h2>
                        </div>
                        <Truck className="h-8 w-8 text-blue-500 opacity-20" />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                            <h2 className="text-3xl font-bold text-green-600">{stats.completed}</h2>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bookings..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Add more filters here if needed: Date Range, Status Dropdown */}
                    <div className="ml-auto">
                        <Button variant="ghost" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Booking List */}
                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        No bookings found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                                            <Link to={`/logistics/bookings/${booking.id}`}>{booking.booking_number}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.customer?.name || "Unknown Customer"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex flex-col">
                                                <span>{booking.origin_location}</span>
                                                <span className="text-xs text-gray-400">to</span>
                                                <span>{booking.destination_location}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm uppercase">
                                            {booking.transport_mode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${['draft', 'pending_approval'].includes(booking.status) ? 'bg-yellow-100 text-yellow-800' :
                                                    ['approved', 'scheduled'].includes(booking.status) ? 'bg-blue-100 text-blue-800' :
                                                        ['completed', 'delivered'].includes(booking.status) ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'}`}>
                                                {booking.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/logistics/bookings/${booking.id}`)}>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/logistics/tracking/${booking.booking_number}`)}>
                                                        <Truck className="mr-2 h-4 w-4" /> Track Shipment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => navigate(`/logistics/bookings/${booking.id}/edit`)}>
                                                        Edit Booking
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleExportSinglePDF(booking)}>
                                                        <FileText className="mr-2 h-4 w-4" /> Export PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleExportSingleExcel(booking)}>
                                                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleCancel(booking.id)} className="text-orange-600">
                                                        Cancel Booking
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDeleteId(booking.id)} className="text-red-600">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the booking
                            and remove all associated data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete Booking
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
};

export default Bookings;
