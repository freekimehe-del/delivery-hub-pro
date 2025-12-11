import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Customer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    status: "active" | "premium" | "inactive";
    joined_at: string;
    created_at: string;
    // Aggregate stats
    total_orders?: number;
    total_spent?: number;
}

export function useCustomers() {
    return useQuery({
        queryKey: ["customers"],
        queryFn: async () => {
            // Fetch customers and join with invoices to calculate stats
            // Note: In a real large-scale app, we'd use a view or dedicated stats table. 
            // For now, we'll fetch aggregated data or calculate on client if small scale.

            const { data: customers, error } = await supabase
                .from("customers")
                .select(`
          *,
          invoices (
            amount,
            status
          )
        `)
                .order("name");

            if (error) throw error;

            // Transform and aggregate
            return customers.map((c: any) => ({
                ...c,
                total_orders: c.invoices?.length || 0,
                total_spent: c.invoices?.reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0) || 0,
            })) as Customer[];
        },
    });
}

export function useCustomer(id: string | null) {
    return useQuery({
        queryKey: ["customer", id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from("customers")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data as Customer;
        },
        enabled: !!id,
    });
}

export function useCustomerMutations() {
    const queryClient = useQueryClient();

    const createCustomer = useMutation({
        mutationFn: async (newCustomer: Omit<Customer, "id" | "joined_at" | "created_at" | "total_orders" | "total_spent">) => {
            const { data, error } = await supabase
                .from("customers" as any)
                .insert(newCustomer as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            toast.success("Customer created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create customer: " + error.message);
        },
    });

    const updateCustomer = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
            const { data, error } = await supabase
                .from("customers" as any)
                .update(updates as any)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
            queryClient.invalidateQueries({ queryKey: ["customer", variables.id] });
            toast.success("Customer updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update customer: " + error.message);
        },
    });

    return { createCustomer, updateCustomer };
}
