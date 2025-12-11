import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Plus, Pencil, Check, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CustomerFormDialog } from './CustomerFormDialog';
import { Badge } from "@/components/ui/badge";

interface CustomerDialogProps {
    onSelect: (customer: any) => void;
    selectedId?: string;
    trigger?: React.ReactNode;
}

export const CustomerSelectionDialog: React.FC<CustomerDialogProps> = ({ onSelect, selectedId, trigger }) => {
    const [open, setOpen] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Management State
    const [formOpen, setFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);

    useEffect(() => {
        if (open) {
            fetchCustomers();
        }
    }, [open]);

    const fetchCustomers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error("Error fetching customers:", error);
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    };

    const handleSelect = (customer: any) => {
        onSelect(customer);
        setOpen(false);
    };

    const handleEditClick = (e: React.MouseEvent, customer: any) => {
        e.stopPropagation(); // Prevent selection when clicking edit
        setEditingCustomer(customer);
        setFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingCustomer(null);
        setFormOpen(true);
    }

    const handleFormSave = () => {
        fetchCustomers(); // Refresh list
        // If we were adding new, ideally we select it automatically, but refresh for now is fine.
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {trigger || <Button variant="outline">Select Customer</Button>}
                </DialogTrigger>
                <DialogContent className="p-0 sm:max-w-[500px] overflow-hidden">
                    <DialogHeader className="px-4 py-2 border-b bg-gray-50/50">
                        <DialogTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Select Customer</DialogTitle>
                    </DialogHeader>

                    <Command className="rounded-none border-0 h-[400px]">
                        <CommandInput placeholder="Type to search customers..." />
                        <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                No customers found.
                                <br />
                                <Button variant="link" onClick={handleAddNew} className="mt-2 text-primary">
                                    + Add New Customer
                                </Button>
                            </CommandEmpty>

                            <CommandGroup heading="Customers">
                                {customers.map((customer) => (
                                    <CommandItem
                                        key={customer.id}
                                        value={`${customer.name} ${customer.email || ''} ${customer.phone || ''} ${customer.location || ''}`} // Searchable text
                                        onSelect={() => handleSelect(customer)}
                                        className="flex items-center justify-between p-2 cursor-pointer aria-selected:bg-accent"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="flex mx-2 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col truncate">
                                                <span className="font-medium truncate">{customer.name}</span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {customer.location || 'No location'}
                                                    {customer.email && ` • ${customer.email}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selectedId === customer.id && <Check className="h-4 w-4 text-primary" />}
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 hover:bg-gray-200 rounded-full"
                                                onClick={(e) => handleEditClick(e, customer)}
                                            >
                                                <Pencil className="h-3 w-3 text-gray-500" />
                                            </Button>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        <div className="p-2 border-t bg-gray-50">
                            <Button className="w-full gap-2" onClick={handleAddNew}>
                                <Plus className="h-4 w-4" /> Add New Customer
                            </Button>
                        </div>
                    </Command>
                </DialogContent>
            </Dialog>

            <CustomerFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                initialData={editingCustomer}
                onSave={handleFormSave}
            />
        </>
    );
};
