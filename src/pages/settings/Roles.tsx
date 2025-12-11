import { useState } from "react";
import { useRoles, usePermissions, useRolePermissions, useRoleMutations, Role, Permission } from "@/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Plus, Check, Trash2, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

export default function Roles() {
    const { data: roles, isLoading: rolesLoading } = useRoles();
    const { data: allPermissions } = usePermissions();
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

    return (
        <div className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage system roles and their granular access permissions.
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Role
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                {/* Roles List */}
                <Card className="md:col-span-4 flex flex-col h-full">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            System Roles
                        </CardTitle>
                        <CardDescription>Select a role to manage permissions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="space-y-1 p-4 pt-0">
                                {rolesLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <Skeleton key={i} className="h-12 w-full" />
                                    ))
                                ) : (
                                    roles?.map((role) => (
                                        <button
                                            key={role.id}
                                            onClick={() => setSelectedRoleId(role.id)}
                                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-colors ${selectedRoleId === role.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted"
                                                }`}
                                        >
                                            <div>
                                                <div className="font-medium">{role.name}</div>
                                                <div className={`text-xs ${selectedRoleId === role.id ? "text-primary-foreground/80" : "text-muted-foreground"
                                                    }`}>
                                                    {role.slug}
                                                </div>
                                            </div>
                                            {selectedRoleId === role.id && <Check className="w-4 h-4" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Role Details & Permissions */}
                <Card className="md:col-span-8 flex flex-col h-full">
                    {selectedRoleId ? (
                        <RoleDetails
                            role={roles?.find(r => r.id === selectedRoleId)!}
                            allPermissions={allPermissions || []}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
                            <Shield className="w-16 h-16 opacity-20" />
                            <p>Select a role from the left to view details</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

function RoleDetails({ role, allPermissions }: { role: Role; allPermissions: Permission[] }) {
    const { data: rolePermissions, isLoading: rpLoading } = useRolePermissions(role.id);
    const { assignPermission, removePermission } = useRoleMutations();

    // Group permissions by module
    const permissionsByModule = allPermissions.reduce((acc, perm) => {
        const module = perm.module || "General";
        if (!acc[module]) acc[module] = [];
        acc[module].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    const hasPermission = (permId: string) =>
        rolePermissions?.some(rp => rp.permission_id === permId);

    const togglePermission = (permId: string, currentStatus: boolean) => {
        if (currentStatus) {
            removePermission.mutate({ roleId: role.id, permissionId: permId });
        } else {
            assignPermission.mutate({ roleId: role.id, permissionId: permId });
        }
    };

    return (
        <>
            <CardHeader className="border-b">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{role.name}</CardTitle>
                        <CardDescription className="mt-1">{role.description}</CardDescription>
                    </div>
                    {role.slug === 'super_admin' && (
                        <Badge variant="secondary" className="gap-1">
                            <Lock className="w-3 h-3" /> System Managed
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-6">
                    {role.slug === 'super_admin' ? (
                        <div className="bg-muted/50 p-6 rounded-lg text-center border border-dashed">
                            <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <h3 className="font-semibold">Super Admin Access</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                                This role has full access to all system modules and settings implied by the system architecture.
                                Individual permissions are not editable.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(permissionsByModule).map(([module, perms]) => (
                                <div key={module}>
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 capitalize">
                                        {module.replace('_', ' ')}
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {perms.length}
                                        </Badge>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {perms.map((perm) => {
                                            const isActive = hasPermission(perm.id);
                                            return (
                                                <div
                                                    key={perm.id}
                                                    className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${isActive ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/20"
                                                        }`}
                                                >
                                                    <Switch
                                                        checked={!!isActive}
                                                        onCheckedChange={() => togglePermission(perm.id, !!isActive)}
                                                        disabled={rpLoading}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-sm">{perm.code}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-2" title={perm.description || ''}>
                                                            {perm.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </>
    );
}
