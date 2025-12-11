import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Role {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    created_at: string;
}

export interface Permission {
    id: string;
    code: string;
    module: string | null;
    description: string | null;
}

export interface RolePermission {
    role_id: string;
    permission_id: string;
}

export function useRoles() {
    return useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("roles" as any)
                .select("*")
                .order("name");

            if (error) throw error;
            return data as unknown as Role[];
        },
    });
}

export function usePermissions() {
    return useQuery({
        queryKey: ["permissions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("permissions" as any)
                .select("*")
                .order("module, code");

            if (error) throw error;
            return data as unknown as Permission[];
        },
    });
}

export function useRolePermissions(roleId?: string) {
    return useQuery({
        queryKey: ["role_permissions", roleId],
        queryFn: async () => {
            let query = supabase.from("role_permissions" as any).select("*");

            if (roleId) {
                query = query.eq("role_id", roleId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as unknown as RolePermission[];
        },
        enabled: true, // Fetch all if no ID, or specific if ID provided
    });
}

export function useRoleMutations() {
    const queryClient = useQueryClient();

    // Create Role
    const createRole = useMutation({
        mutationFn: async (role: Omit<Role, "id" | "created_at">) => {
            const { data, error } = await supabase
                .from("roles" as any)
                .insert(role as any)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            toast.success("Role created successfully");
        },
        onError: (error) => toast.error("Failed to create role: " + error.message),
    });

    // Assign Permission to Role
    const assignPermission = useMutation({
        mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
            const { error } = await supabase
                .from("role_permissions" as any)
                .insert({ role_id: roleId, permission_id: permissionId } as any);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["role_permissions", variables.roleId] });
            toast.success("Permission assigned");
        },
        onError: (error) => toast.error("Failed to assign permission: " + error.message),
    });

    // Remove Permission from Role
    const removePermission = useMutation({
        mutationFn: async ({ roleId, permissionId }: { roleId: string; permissionId: string }) => {
            const { error } = await supabase
                .from("role_permissions" as any)
                .delete()
                .eq("role_id", roleId)
                .eq("permission_id", permissionId);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["role_permissions", variables.roleId] });
            toast.success("Permission removed");
        },
        onError: (error) => toast.error("Failed to remove permission: " + error.message),
    });

    return { createRole, assignPermission, removePermission };
}
