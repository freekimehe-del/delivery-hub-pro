import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Search, Printer, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function GDDashboard() {
    const navigate = useNavigate();
    const [gds, setGds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGDs = async () => {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            try {
                const res = await fetch(`${apiUrl}/api/customs`);
                const data = await res.json();
                if (data.ok) setGds(data.gds);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchGDs();
    }, []);

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'draft') return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
        if (s === 'submitted') return <Badge className="bg-blue-500">Submitted</Badge>;
        if (s === 'gate_out') return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Gate Out</Badge>;
        return <Badge>{status}</Badge>;
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900">Customs Clearance</h1>
                        <p className="text-muted-foreground">Manage your WeBOC Goods Declarations (GDs).</p>
                    </div>
                    <Button onClick={() => navigate('/logistics/customs/new')} className="bg-blue-800 hover:bg-blue-900 shadow-lg shadow-blue-900/20">
                        <Plus className="w-4 h-4 mr-2" /> File New GD
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-full"><FileText className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">{gds.length}</div>
                            <div className="text-xs text-muted-foreground">Total Filings</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-700 rounded-full"><CheckCircle className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">{gds.filter(g => g.status === 'gate_out').length}</div>
                            <div className="text-xs text-muted-foreground">Cleared (Gate Out)</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-orange-100 text-orange-700 rounded-full"><AlertTriangle className="w-6 h-6" /></div>
                        <div>
                            <div className="text-2xl font-bold">{gds.filter(g => g.status === 'examination').length}</div>
                            <div className="text-xs text-muted-foreground">Under Examination</div>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-slate-50 flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search GD Number..." className="pl-9 h-9 bg-white" />
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>GD Number</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Importer</TableHead>
                                <TableHead>Consignment (BL/IGM)</TableHead>
                                <TableHead>Duty (PKR)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-24">Loading Declarations...</TableCell></TableRow>
                            ) : gds.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No Declarations found.</TableCell></TableRow>
                            ) : (
                                gds.map(gd => (
                                    <TableRow key={gd.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/logistics/customs/${gd.id}`)}>
                                        <TableCell className="font-medium font-mono text-blue-700">{gd.gd_number}</TableCell>
                                        <TableCell className="uppercase text-xs font-bold text-slate-500">{gd.declaration_type}</TableCell>
                                        <TableCell>
                                            <div className="text-sm">{gd.importer_name}</div>
                                            <div className="text-xs text-muted-foreground">NTN: {gd.importer_ntn}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">BL: {gd.bl_number}</div>
                                            <div className="text-xs text-muted-foreground">{gd.vessel_name}</div>
                                        </TableCell>
                                        <TableCell className="font-mono">{Math.round(gd.total_duty || 0).toLocaleString()}</TableCell>
                                        <TableCell>{getStatusBadge(gd.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon"><Printer className="w-4 h-4 text-slate-400" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}
