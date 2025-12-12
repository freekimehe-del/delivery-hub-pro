import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Users, Shield, Lock } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
            try {
                const res = await fetch(`${apiUrl}/api/auth/users`);
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users || []);
                }
            } catch (err) {
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system access, roles, and permissions.</p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <CardTitle>System Users</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Permissions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">Loading users...</TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">@{user.username}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {user.role.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.keys(user.permissions).map((mod) => (
                                                        <Badge key={mod} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-0 text-[10px]">
                                                            {mod}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
