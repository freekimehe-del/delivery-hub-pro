import React, { useState, useEffect } from "react";
import { Plus, Search, FileText, Building2, CreditCard, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface LC {
    id: string;
    lc_number: string;
    bank_name: string;
    beneficiary: string;
    amount: number;
    currency: string;
    status: string;
    expiry_date: string;
}

const TradeFinanceDashboard = () => {
    const [lcs, setLcs] = useState<LC[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLCs = async () => {
            const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';
            try {
                const res = await fetch(`${apiUrl}/api/trade/lcs`);
                if (res.ok) {
                    const data = await res.json();
                    setLcs(data.lcs || []);
                }
            } catch (err) {
                toast.error("Failed to load LCs");
            } finally {
                setLoading(false);
            }
        };
        fetchLCs();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'opened': return <Badge className="bg-green-500">Active</Badge>;
            case 'draft': return <Badge variant="secondary">Draft</Badge>;
            case 'retired': return <Badge variant="outline">Retired</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900 to-blue-700 p-8 -mx-6 -mt-6 rounded-b-[3rem] shadow-2xl mb-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="relative">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Trade Finance</h1>
                    <p className="text-blue-100 max-w-xl">
                        Manage your Letters of Credit (LCs), Import Financing, and monitor global trade exposure in real-time.
                    </p>
                </div>
                <Button asChild className="relative bg-white text-blue-900 hover:bg-blue-50 hover:shadow-glow transition-all duration-300 font-semibold border-0">
                    <Link to="/logistics/customs/trade-finance/new-lc">
                        <Plus className="w-5 h-5 mr-2" /> Open New LC
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 card-hover group relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active LCs</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{lcs.filter(l => l.status === 'opened').length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 card-hover group relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <FileText className="w-24 h-24 text-slate-600" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <FileText className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Drafts</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{lcs.filter(l => l.status === 'draft').length}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white card-hover relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-100">Total Exposure</p>
                            <h3 className="text-3xl font-bold mt-1">
                                ${lcs.reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.amount : 0), 0).toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="glass rounded-3xl overflow-hidden border-0 shadow-xl ring-1 ring-slate-900/5 mt-8">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-500" />
                        Letters of Credit
                    </h3>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search LC Number, Bank..."
                            className="pl-10 h-10 bg-slate-50 border-0 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                        />
                    </div>
                </div>

                <div className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50/50">
                                <TableHead className="pl-6 h-12">LC Number</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>Beneficiary</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="pr-6">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : lcs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-slate-400">
                                        No Letters of Credit found. <span className="text-blue-500 cursor-pointer hover:underline">Create one now.</span>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lcs.map((lc) => (
                                    <TableRow key={lc.id} className="hover:bg-blue-50/30 transition-colors border-slate-50">
                                        <TableCell className="font-semibold text-slate-700 pl-6">{lc.lc_number}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {lc.bank_name.charAt(0)}
                                                </div>
                                                {lc.bank_name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600">{lc.beneficiary}</TableCell>
                                        <TableCell className="text-slate-500 font-mono text-xs">{new Date(lc.expiry_date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-mono font-medium">
                                            {lc.currency} {lc.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="pr-6">
                                            {getStatusBadge(lc.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default TradeFinanceDashboard;
