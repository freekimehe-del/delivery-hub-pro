import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- Types ---
export interface TransitShipment {
    id: string;
    gd_number: string;
    type: 'afghan_transit' | 'transshipment' | 'local_transit';
    customer_name: string;
    carrier_name?: string;
    route_name?: string;
    container_no: string;
    bl_number: string;
    status: string;
    weboc_status: string;
    current_location: string;
    eta: string;
    created_at: string;
}

export interface TransitStats {
    total: number;
    att: number;
    transshipment: number;
    at_border: number;
    delayed: number;
}

const API_BASE = (window as any).__API_BASE__ || 'http://localhost:4000/api/transit';

// --- Hooks ---
export function useTransitShipments(filter?: { type?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (filter?.type) queryParams.append('type', filter.type);
    if (filter?.status) queryParams.append('status', filter.status);

    return useQuery({
        queryKey: ["transit_shipments", filter],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/shipments?${queryParams.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch shipments");
            return res.json() as Promise<TransitShipment[]>;
        }
    });
}

export function useTransitShipment(id: string | null) {
    return useQuery({
        queryKey: ["transit_shipment", id],
        queryFn: async () => {
            if (!id) return null;
            const res = await fetch(`${API_BASE}/shipments/${id}`);
            if (!res.ok) throw new Error("Failed to fetch shipment details");
            return res.json();
        },
        enabled: !!id
    });
}

export function useTransitStats() {
    return useQuery({
        queryKey: ["transit_stats"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/stats`);
            if (!res.ok) throw new Error("Failed to fetch stats");
            return res.json() as Promise<TransitStats>;
        }
    });
}

export function useTransitMutations() {
    const queryClient = useQueryClient();

    const createShipment = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`${API_BASE}/shipments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to create GD Entry");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transit_shipments"] });
            queryClient.invalidateQueries({ queryKey: ["transit_stats"] });
            toast.success("GD Entry Created Successfully (WeBOC integrated)");
        },
        onError: (err) => toast.error(err.message)
    });

    const updateCheckpoint = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const res = await fetch(`${API_BASE}/shipments/${id}/checkpoint`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed to update checkpoint");
            return res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["transit_shipment", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["transit_shipments"] });
            toast.success("Shipment Status Updated");
        },
        onError: (err) => toast.error(err.message)
    });

    return { createShipment, updateCheckpoint };
}
