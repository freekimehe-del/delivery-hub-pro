import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Clock, MapPin, Truck, FileText, Download, MoreHorizontal, Printer, Calendar, User, Package } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BookingDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState<any>(null);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('logistics_bookings' as any)
            .select(`
                *,
                customer:customers(name, email, phone)
            `)
            .eq('id', id)
            .single();

        if (data) {
            setBooking(data);
            const { data: itemsData } = await supabase
                .from('booking_items' as any)
                .select('*')
                .eq('booking_id', id);

            if (itemsData) setItems(itemsData);
        }
        setLoading(false);
    };

    const exportPDF = () => {
        if (!booking) return;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text("Booking Confirmation", 14, 20);

        doc.setFontSize(10);
        doc.text(`Booking #: ${booking.booking_number}`, 14, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 35);

        doc.text("Customer:", 14, 45);
        doc.text(booking.customer?.name || "N/A", 14, 50);

        doc.text("Route:", 100, 45);
        doc.text(`${booking.origin_location} -> ${booking.destination_location}`, 100, 50);

        autoTable(doc, {
            startY: 60,
            head: [['Description', 'Qty', 'Weight', 'Volume']],
            body: items.map(i => [i.description, i.quantity, i.weight, i.volume])
        });

        doc.save(`Booking_${booking.booking_number}.pdf`);
    };

    const steps = ['draft', 'pending_approval', 'approved', 'dispatched', 'in_transit', 'delivered', 'completed'];
    const currentStepIndex = booking ? steps.indexOf(booking.status) : 0;

    if (loading) return <DashboardLayout><div>Loading...</div></DashboardLayout>;
    if (!booking) return <DashboardLayout><div>Booking not found</div></DashboardLayout>;

    const handleStatusUpdate = async (newStatus: string) => {
        if (!booking) return;

        const { error } = await supabase
            .from('logistics_bookings' as any)
            .update({ status: newStatus })
            .eq('id', booking.id);

        if (error) {
            console.error(error);
            return;
        }

        // Refresh local state
        setBooking({ ...booking, status: newStatus });
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/logistics/bookings')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold">{booking.booking_number}</h1>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold uppercase">
                                    {booking.status.replace('_', ' ')}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm">Created on {new Date(booking.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportPDF}>
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    Actions <MoreHorizontal className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/logistics/bookings/edit/${id}`)}>
                                    Edit Booking
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate('approved')}>
                                    Approve Booking
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate('dispatched')}>
                                    Dispatch
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => handleStatusUpdate('cancelled')}
                                >
                                    Cancel Booking
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Timeline */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center relative">
                            {/* Line */}
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10" />

                            {steps.map((step, idx) => (
                                <div key={step} className="flex flex-col items-center bg-white px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 
                                        ${idx <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {idx + 1}
                                    </div>
                                    <span className={`text-xs capitalize ${idx <= currentStepIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                                        {step.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Route Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-gray-500" /> Route Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="text-sm text-gray-500 block">Origin</span>
                                    <p className="font-semibold text-lg">{booking.origin_location}</p>
                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                        <Calendar className="h-3 w-3 mr-1" /> Pick-up: {booking.pickup_date || 'Not Scheduled'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 block">Destination</span>
                                    <p className="font-semibold text-lg">{booking.destination_location}</p>
                                    <div className="flex items-center mt-1 text-sm text-gray-600">
                                        <Calendar className="h-3 w-3 mr-1" /> Delivery: {booking.expected_delivery_date || 'Est. TBD'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-gray-500" /> Cargo & Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                                            <th className="text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {items.map((item, i) => (
                                            <tr key={item.id || i}>
                                                <td className="py-2">{item.description}</td>
                                                <td className="py-2">{item.quantity}</td>
                                                <td className="py-2">{item.weight} kg</td>
                                                <td className="py-2">{item.volume} cbm</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-gray-500" /> Customer Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="font-medium">{booking.customer?.name}</p>
                                <p className="text-sm text-gray-500">{booking.customer?.email}</p>
                                <p className="text-sm text-gray-500">{booking.customer?.phone}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-gray-500" /> Transport Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Mode</span>
                                    <span className="font-medium capitalize">{booking.transport_mode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Cargo Type</span>
                                    <span className="font-medium">{booking.cargo_type || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Incoterms</span>
                                    <span className="font-medium">{booking.incoterms || '-'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-500" /> Documents
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-red-500" />
                                        <span className="text-sm">Booking Confirmation.pdf</span>
                                    </div>
                                    <Download className="h-4 w-4 text-gray-400" />
                                </div>
                                {/* Map actual attachments here later */}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BookingDetails;
