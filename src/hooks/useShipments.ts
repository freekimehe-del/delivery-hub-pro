import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Shipment {
    id: string;
    shipment_ref: string;
    type: string;
    mode: string;
    status: string;
    origin: string;
    destination: string;
    created_at: string;
}

export function useShipments() {
    return useQuery({
        queryKey: ["shipments"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("shipment_master" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Shipment[];
        },
    });
}

export function useCreateShipment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newShipment: any) => {
            const { data, error } = await supabase
                .from("shipment_master" as any)
                .insert([newShipment])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shipments"] });
            toast.success("Shipment created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create shipment: " + error.message);
        },
    });
}
