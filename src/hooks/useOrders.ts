import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// --- Types ---
export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status?: string;
}

export interface OrderLog {
  id: string;
  previous_status: string | null;
  new_status: string;
  notes: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  warehouse_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready_for_dispatch' | 'dispatched' | 'in_transit' | 'delivered' | 'cancelled';
  payment_status: string;
  shipping_address: {
    line1: string;
    city: string;
    state: string;
  };
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expected_delivery: string;
  total_amount: number;
  created_at: string;
  items: OrderItem[];
  customer?: { name: string; email: string };
  logs?: OrderLog[];
}

export interface OrderStats {
  total: number;
  pending: number;
  dispatch: number;
  in_transit: number;
  delivered: number;
}

const API_BASE = 'http://localhost:4000/api';

// --- Hooks ---

export function useOrders(filters?: { status?: string; customer_id?: string }) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.customer_id) queryParams.append('customer_id', filters.customer_id);

  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/orders?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json() as Promise<{ orders: Order[]; stats: OrderStats }>;
    },
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`${API_BASE}/orders/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      return res.json() as Promise<Order>;
    },
    enabled: !!id,
  });
}

export function useOrderMutations() {
  const queryClient = useQueryClient();

  const createOrder = useMutation({
    mutationFn: async (newOrder: Partial<Order>) => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create order");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully");
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      toast.success(`Order status updated to ${variables.status}`);
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });

  return { createOrder, updateStatus };
}
