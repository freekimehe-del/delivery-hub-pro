import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import { Truck, Lock, User } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                login(data.token, data.user);
                navigate(data.redirectUrl);
            } else {
                toast.error(data.message || "Login failed");
            }
        } catch (err) {
            toast.error("Network error. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-900/20">
                        <Truck className="w-8 h-8 text-white" />
                    </div>
                </div>

                <Card className="border-0 shadow-2xl shadow-slate-200/50 glass overflow-hidden">
                    <CardHeader className="space-y-1 text-center pb-8 border-b border-slate-100 bg-slate-50/50">
                        <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
                        <CardDescription>Enter your credentials to access the hub</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-9 h-11 bg-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-9 h-11 bg-white"
                                        required
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 text-md font-medium" disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-xs text-center text-slate-400 font-medium uppercase tracking-wider mb-4">Demo Credentials</p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => { setUsername('admin'); setPassword('admin123'); }}>
                                    <span className="font-bold block text-slate-700">Admin</span>
                                    admin / admin123
                                </div>
                                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => { setUsername('fleet'); setPassword('fleet123'); }}>
                                    <span className="font-bold block text-blue-700">Fleet</span>
                                    fleet / fleet123
                                </div>
                                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => { setUsername('warehouse'); setPassword('warehouse123'); }}>
                                    <span className="font-bold block text-emerald-700">Warehouse</span>
                                    warehouse / warehouse123
                                </div>
                                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                                    onClick={() => { setUsername('logistics'); setPassword('logistics123'); }}>
                                    <span className="font-bold block text-orange-700">Logistics</span>
                                    logistics / logistics123
                                </div>
                            </div>
                        </div>

                    </CardContent>
                </Card>
                <p className="text-center text-slate-400 text-xs mt-8">
                    &copy; 2025 Delivery Hub Pro. Secure Logistics Platform.
                </p>
            </div>
        </div>
    );
}
