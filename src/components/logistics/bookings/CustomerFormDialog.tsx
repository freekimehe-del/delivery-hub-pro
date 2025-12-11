import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface CustomerFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
    onSave: () => void;
}

export const CustomerFormDialog: React.FC<CustomerFormDialogProps> = ({ open, onOpenChange, initialData, onSave }) => {
    const isEditMode = Boolean(initialData);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        id: "", // Helper for Edit
        // Add code if schema supports it, otherwise generic fields
        email: "",
        phone: "",
        location: "", // Address
        status: "active", // Default
        // Additional requested fields (Note: Schema might need updates if these columns don't exist yet, for now mapping to available)
        // type: "importer", 
        // contact_person: "",
        // tax_id: ""
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    id: initialData.id,
                    name: initialData.name || "",
                    email: initialData.email || "",
                    phone: initialData.phone || "",
                    location: initialData.location || "",
                    status: initialData.status || "active",
                });
            } else {
                setFormData({
                    id: "",
                    name: "",
                    email: "",
                    phone: "",
                    location: "",
                    status: "active",
                });
            }
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                location: formData.location,
                status: formData.status,
                updated_at: new Date().toISOString(),
            };

            if (isEditMode && formData.id) {
                // Update
                const { error } = await supabase
                    .from('customers')
                    .update(payload)
                    .eq('id', formData.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('customers')
                    .insert([payload]);
                if (error) throw error;
            }

            onSave();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error saving customer:", error);
            alert("Failed to save customer: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Customer" : "Add New Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="name">Customer Name *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Acme Logistics"
                            />
                        </div>
                        {/* 
                         NOTE: 'Customer Code' requires schema change or mapping to 'id' which is UUID. 
                         We'll use standard fields for now as per schema.
                         */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@acme.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 555 000 0000"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="location">Address / City</Label>
                            <Textarea
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Full address"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(v) => setFormData({ ...formData, status: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="individual">Individual</SelectItem>
                                    <SelectItem value="corporate">Corporate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Customer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
