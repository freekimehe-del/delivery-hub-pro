import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Payment {
    id: string;
    invoice_id: string | null;
    customer_id: string | null;
    amount: number;
    method: string | null;
    status: string;
    payment_date: string;
    invoice?: {
        id: string;
    };
    customer?: {
        name: string;
    };
}

export function usePayments(customerId?: string) {
    return useQuery({
        queryKey: ["payments", customerId],
        queryFn: async () => {
            let query = supabase
                .from("payments" as any)
                .select(`
            *,
            invoice:invoices(id),
            customer:customers(name)
        `)
                .order("payment_date", { ascending: false });

            if (customerId) {
                query = query.eq("customer_id", customerId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Payment[];
        },
    });
}
