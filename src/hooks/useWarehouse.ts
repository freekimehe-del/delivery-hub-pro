import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Warehouse {
    id: string;
    name: string;
    location: string;
    is_bonded: boolean;
    capacity_sqft: number;
    manager_name: string;
}

export interface InventoryItem {
    id: string;
    warehouse_id: string;
    description: string;
    quantity_on_hand: number;
    unit: string;
    received_date: string;
    warehouse?: Warehouse;
}

export interface GatePass {
    id: string;
    pass_number: string;
    type: 'inward' | 'outward';
    driver_name: string;
    vehicle_number: string;
    status: string;
    created_at: string; // mapped from issue_date or created_at
    issue_date: string;
}

export function useWarehouses() {
    return useQuery({
        queryKey: ["warehouses"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("warehouses" as any)
                .select("*")
                .order("name");
            if (error) throw error;
            return data as Warehouse[];
        },
    });
}

export function useInventory(warehouseId?: string) {
    return useQuery({
        queryKey: ["warehouse_inventory", warehouseId],
        queryFn: async () => {
            let query = supabase
                .from("warehouse_inventory" as any)
                .select("*, warehouse:warehouses(name)")
                .order("description");

            if (warehouseId) {
                query = query.eq("warehouse_id", warehouseId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as InventoryItem[];
        },
    });
}

export function useGatePasses(limit = 10) {
    return useQuery({
        queryKey: ["gate_passes", limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("gate_passes" as any)
                .select("*")
                .order("issue_date", { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data as GatePass[];
        },
    });
}

export function useWarehouseMutations() {
    const queryClient = useQueryClient();

    const createGatePass = useMutation({
        mutationFn: async (passData: any) => {
            // 1. Create Pass
            const { data: pass, error } = await supabase
                .from('gate_passes' as any)
                .insert([passData])
                .select()
                .single();

            if (error) throw error;
            return pass;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gate_passes"] });
            toast.success("Gate pass created");
        },
        onError: (e) => toast.error(e.message)
    });

    const addInventory = useMutation({
        mutationFn: async (item: Omit<InventoryItem, "id" | "received_date">) => {
            const { error } = await supabase
                .from("warehouse_inventory" as any)
                .insert([item]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["warehouse_inventory"] });
            toast.success("Inventory updated");
        },
        onError: (e) => toast.error(e.message)
    });

    return { createGatePass, addInventory };
}
