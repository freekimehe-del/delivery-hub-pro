import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash, Upload, Save, ArrowLeft, Search } from "lucide-react";
import { CustomerSelectionDialog } from "@/components/logistics/bookings/CustomerSelectionDialog";

const CreateBooking: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // Get ID for edit mode
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        customer_id: "",
        transport_mode: "sea",
        cargo_type: "FCL",
        origin_location: "",
        destination_location: "",
        pickup_date: "",
        expected_delivery_date: "",
        incoterms: "FOB",
        instructions: "",
        status: "draft",
        // Resource Allocation Fields
        driver_id: "",
        vehicle_id: "",
        vessel_name: "",
        voyage_number: "",
        flight_number: "",
        awb_number: ""
    });

    const [items, setItems] = useState<any[]>([
        { description: "", quantity: 1, weight: 0, volume: 0, package_type: "box" }
    ]);

    useEffect(() => {
        fetchResources();
        if (isEditMode) {
            loadBookingData();
        }
    }, [id]);

    const fetchResources = async () => {
        const { data: cData } = await supabase.from('customers').select('*');
        if (cData) setCustomers(cData);

        const { data: dData } = await supabase.from('drivers').select('*');
        if (dData) setDrivers(dData);

        const { data: vData } = await supabase.from('vehicles').select('*');
        if (vData) setVehicles(vData);
    };

    const loadBookingData = async () => {
        setLoading(true);
        // Load booking
        const { data: bookingData, error } = await supabase
            .from('logistics_bookings' as any)
            .select('*')
            .eq('id', id)
            .single();

        const booking = bookingData as any;

        if (error) {
            console.error(error);
            alert("Error loading booking");
            navigate('/logistics/bookings');
            return;
        }

        // Load items
        const { data: bookingItems } = await supabase
            .from('booking_items' as any)
            .select('*')
            .eq('booking_id', id);

        if (booking) {
            setFormData({
                customer_id: booking.customer_id || "",
                transport_mode: booking.transport_mode || "sea",
                cargo_type: booking.cargo_type || "",
                origin_location: booking.origin_location || "",
                destination_location: booking.destination_location || "",
                pickup_date: booking.pickup_date ? new Date(booking.pickup_date).toISOString().split('T')[0] : "",
                expected_delivery_date: booking.expected_delivery_date ? new Date(booking.expected_delivery_date).toISOString().split('T')[0] : "",
                incoterms: booking.incoterms || "FOB",
                instructions: booking.instructions || "",
                status: booking.status || "draft",
                // Resources
                driver_id: booking.driver_id || "",
                vehicle_id: booking.vehicle_id || "",
                vessel_name: booking.vessel_name || "",
                voyage_number: booking.voyage_number || "",
                flight_number: booking.flight_number || "",
                awb_number: booking.awb_number || ""
            });
        }

        if (bookingItems && bookingItems.length > 0) {
            setItems(bookingItems);
        }

        setLoading(false);
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, weight: 0, volume: 0, package_type: "box" }]);
    };

    const removeItem = async (index: number) => {
        // If it's an existing item (has ID) and we are in edit mode, we might want to track deletion,
        // but for simplicity here we just remove from state. Real app should delete from DB or track pending deletes.
        // For now: we'll just handle it on save (overwrite approach) or naive delete.
        // Better: Delete immediately if it has ID? Or just filter out.
        // Let's filter out. If we want proper sync, we should delete from DB if it has an ID.

        const itemToRemove = items[index];
        if (itemToRemove.id) {
            // It's a saved item. For safety, let's just delete it from DB immediately or mark for deletion?
            // Immediate delete is easier for this MVP.
            if (confirm("Remove this item permanently?")) {
                await supabase.from('booking_items' as any).delete().eq('id', itemToRemove.id);
                setItems(items.filter((_, i) => i !== index));
            }
        } else {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.customer_id) {
            alert("Please select a customer.");
            setLoading(false);
            return;
        }

        try {
            let bookingId = id;

            // 1. Create or Update Booking Header
            // Sanitize Payload: Convert empty strings to null for UUID fields
            const payload = {
                ...formData,
                customer_id: formData.customer_id || null, // Should be caught by validation above, but safe to default
                driver_id: formData.driver_id || null,
                vehicle_id: formData.vehicle_id || null,
                pickup_date: formData.pickup_date || null,
                expected_delivery_date: formData.expected_delivery_date || null,
                status: isEditMode ? formData.status : 'draft', // Use form status if editing
                updated_at: new Date().toISOString()
            };

            if (isEditMode) {
                // UPDATE
                const { error: updateError } = await supabase
                    .from('logistics_bookings' as any)
                    .update(payload)
                    .eq('id', id);

                if (updateError) throw updateError;
            } else {
                // INSERT
                const bookingNum = `BKG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
                const insertPayload = { ...payload, booking_number: bookingNum };

                const { data: newBookingData, error: insertError } = await supabase
                    .from('logistics_bookings' as any)
                    .insert([insertPayload])
                    .select()
                    .single();

                if (insertError) throw insertError;
                const newBooking = newBookingData as any;
                bookingId = newBooking.id;
            }

            // 2. Upsert Items
            // We loop through items. If they have ID, we update. If not, we insert.
            const itemsToUpsert = items.map(item => ({
                booking_id: bookingId,
                description: item.description,
                quantity: item.quantity,
                weight: item.weight,
                volume: item.volume,
                package_type: item.package_type,
                id: item.id // Include ID if it exists for upsert
            }));

            // Supabase upsert requires unique constraint. 'id' is primary key, so it works.
            const { error: itemsError } = await supabase
                .from('booking_items' as any)
                .upsert(itemsToUpsert);

            if (itemsError) throw itemsError;

            // Success
            navigate('/logistics/bookings');

        } catch (error: any) {
            console.error(error);
            alert("Error saving booking: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <form onSubmit={handleSubmit} className="specy-y-6 max-w-5xl mx-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" type="button" onClick={() => navigate('/logistics/bookings')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">{isEditMode ? "Edit Booking" : "New Booking Request"}</h1>
                            <p className="text-muted-foreground">{isEditMode ? "Update booking details and cargo." : "Fill in the details to create a new shipment booking."}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {!isEditMode && <Button variant="outline" type="button">Save Draft</Button>}
                        <Button type="submit" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? "Saving..." : (isEditMode ? "Update Booking" : "Create Booking")}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6">
                    {/* Customer & Route */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>Select Customer</Label>
                                <div className="flex gap-2">

                                    <CustomerSelectionDialog
                                        selectedId={formData.customer_id}
                                        trigger={
                                            <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-colors">
                                                <span className={customers?.find(c => c.id === formData.customer_id) ? "text-foreground font-medium" : "text-muted-foreground"}>
                                                    {customers?.find(c => c.id === formData.customer_id)?.name || "Select Customer..."}
                                                </span>
                                                <Search className="h-4 w-4 text-muted-foreground opacity-70" />
                                            </div>
                                        }
                                        onSelect={(c) => {
                                            setFormData(prev => ({ ...prev, customer_id: c.id }));
                                        }}
                                    />
                                </div>
                            </div>

                            {isEditMode && (
                                <div>
                                    <Label>Booking Status</Label>
                                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="dispatched">Dispatched</SelectItem>
                                            <SelectItem value="in_transit">In Transit</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <div>
                                <Label>Transport Mode</Label>
                                <Select value={formData.transport_mode} onValueChange={(v) => setFormData({ ...formData, transport_mode: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sea">Sea Freight</SelectItem>
                                        <SelectItem value="air">Air Freight</SelectItem>
                                        <SelectItem value="road">Road Freight</SelectItem>
                                        <SelectItem value="rail">Rail Freight</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Origin Address / Port</Label>
                                <Input required
                                    value={formData.origin_location}
                                    onChange={(e) => setFormData({ ...formData, origin_location: e.target.value })}
                                    placeholder="e.g. Shanghai Port"
                                />
                            </div>
                            <div>
                                <Label>Destination Address / Port</Label>
                                <Input required
                                    value={formData.destination_location}
                                    onChange={(e) => setFormData({ ...formData, destination_location: e.target.value })}
                                    placeholder="e.g. Karachi Port"
                                />
                            </div>
                            <div>
                                <Label>Expected Pickup Date</Label>
                                <Input type="date"
                                    value={formData.pickup_date}
                                    onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Expected Delivery Date</Label>
                                <Input type="date"
                                    value={formData.expected_delivery_date}
                                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Incoterms</Label>
                                <Select value={formData.incoterms} onValueChange={(v) => setFormData({ ...formData, incoterms: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Incoterms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FOB">FOB (Free on Board)</SelectItem>
                                        <SelectItem value="CIF">CIF (Cost, Insurance & Freight)</SelectItem>
                                        <SelectItem value="EXW">EXW (Ex Works)</SelectItem>
                                        <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Cargo Type</Label>
                                <Input
                                    value={formData.cargo_type}
                                    onChange={(e) => setFormData({ ...formData, cargo_type: e.target.value })}
                                    placeholder="e.g. FCL, LCL, Bulk"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resource Allocation */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resource Allocation</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {formData.transport_mode === 'road' && (
                                <>
                                    <div>
                                        <Label>Driver</Label>
                                        <Select value={formData.driver_id} onValueChange={(v) => setFormData({ ...formData, driver_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Driver" /></SelectTrigger>
                                            <SelectContent>
                                                {drivers.map(d => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Vehicle</Label>
                                        <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Vehicle" /></SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map(v => (
                                                    <SelectItem key={v.id} value={v.id}>{v.plate} ({v.type})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                            {formData.transport_mode === 'sea' && (
                                <>
                                    <div>
                                        <Label>Vessel Name</Label>
                                        <Input
                                            value={formData.vessel_name}
                                            onChange={(e) => setFormData({ ...formData, vessel_name: e.target.value })}
                                            placeholder="e.g. MSC GULSUN"
                                        />
                                    </div>
                                    <div>
                                        <Label>Voyage Number</Label>
                                        <Input
                                            value={formData.voyage_number}
                                            onChange={(e) => setFormData({ ...formData, voyage_number: e.target.value })}
                                            placeholder="e.g. 302N"
                                        />
                                    </div>
                                </>
                            )}
                            {formData.transport_mode === 'air' && (
                                <>
                                    <div>
                                        <Label>Flight Number</Label>
                                        <Input
                                            value={formData.flight_number}
                                            onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
                                            placeholder="e.g. EK600"
                                        />
                                    </div>
                                    <div>
                                        <Label>AWB Number</Label>
                                        <Input
                                            value={formData.awb_number}
                                            onChange={(e) => setFormData({ ...formData, awb_number: e.target.value })}
                                            placeholder="123-45678901"
                                        />
                                    </div>
                                </>
                            )}
                            {formData.transport_mode === 'rail' && (
                                <div>
                                    <Label>Train / Wagon Number</Label>
                                    <Input placeholder="Enter Rail Details" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cargo / Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Cargo Details</CardTitle>
                            <Button type="button" size="sm" variant="outline" onClick={addItem}>
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-lg bg-gray-50">
                                        <div className="col-span-4">
                                            <Label>Description</Label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                placeholder="Item description"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Qty</Label>
                                            <Input type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Weight (kg)</Label>
                                            <Input type="number"
                                                value={item.weight}
                                                onChange={(e) => updateItem(index, 'weight', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Label>Volume (cbm)</Label>
                                            <Input type="number"
                                                value={item.volume}
                                                onChange={(e) => updateItem(index, 'volume', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeItem(index)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Instructions & Docs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Instructions & Attachments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Special Instructions</Label>
                                <Textarea
                                    rows={4}
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    placeholder="Enter specific handling instructions, gate codes, etc."
                                />
                            </div>

                            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">Drag and drop files here, or click to upload</p>
                                <p className="text-xs text-gray-400 mt-1">Supports PDF, JPG, PNG, Excel</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </DashboardLayout >
    );
};

export default CreateBooking;
