import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Invoice {
    id: string;
    customer_id: string;
    amount: number;
    status: "paid" | "pending" | "overdue" | "draft" | "sent";
    issue_date: string;
    due_date: string | null;
    created_at: string;
    customer?: {
        name: string;
    };
}

export function useInvoices(customerId?: string) {
    return useQuery({
        queryKey: ["invoices", customerId],
        queryFn: async () => {
            let query = supabase
                .from("invoices" as any)
                .select(`
          *,
          customer:customers(name)
        `)
                .order("issue_date", { ascending: false });

            if (customerId) {
                query = query.eq("customer_id", customerId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Invoice[];
        },
    });
}

export function useInvoiceMutations() {
    const queryClient = useQueryClient();

    const createInvoice = useMutation({
        mutationFn: async (invoice: Omit<Invoice, "created_at" | "customer">) => {
            const { data, error } = await supabase
                .from("invoices" as any)
                .insert(invoice as any)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success("Invoice created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create invoice: " + error.message);
        },
    });

    return { createInvoice };
}
