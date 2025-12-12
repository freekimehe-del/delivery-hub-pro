import { useQuery } from "@tanstack/react-query";

const API_BASE = (window as any).__API_BASE__ || 'http://localhost:4000/api/dnd';

export interface DndStats {
    days_demurrage: number;
    days_detention: number;
    demurrage_cost: number;
    detention_cost: number;
    currency: string;
}

export interface ContainerCycle {
    id: string;
    container_no: string;
    shipping_line_id: string;
    terminal_id: string;
    bl_number: string;
    vessel_arrival: string;
    discharge_date: string;
    gate_out: string | null;
    empty_return: string | null;
    status: string;
    stats: DndStats;
}

export function useDndCycles() {
    return useQuery({
        queryKey: ["dnd_cycles"],
        queryFn: async () => {
            const res = await fetch(`${API_BASE}/cycles`);
            if (!res.ok) throw new Error("Failed to fetch D&D cycles");
            return res.json() as Promise<ContainerCycle[]>;
        }
    });
}
