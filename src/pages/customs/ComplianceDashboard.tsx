import React, { useState, useEffect } from "react";
import { ShieldCheck, FileText, CheckCircle, AlertTriangle, Upload, Search } from "lucide-react";
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

interface Document {
    id: string;
    name: string;
    type: string;
    reference: string;
    status: string;
    expiry_date: string;
}

const ComplianceDashboard = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            try {
                const res = await fetch(`${apiUrl}/api/customs/documents`);
                if (res.ok) {
                    const data = await res.json();
                    setDocuments(data.documents || []);
                }
            } catch (err) {
                toast.error("Failed to load Documents");
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    const handleUpload = async (id: string) => {
        // Mock upload action
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const res = await fetch(`${apiUrl}/api/customs/documents/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'uploaded', reference: `REF-${Math.floor(Math.random() * 1000)}` })
            });
            if (res.ok) {
                toast.success("Document Uploaded via PSW");
                // Refresh list locally
                setDocuments(docs => docs.map(d => d.id === id ? { ...d, status: 'uploaded', reference: 'REF-NEW' } : d));
            }
        } catch (e) {
            toast.error("Upload failed");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'verified': return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
            case 'pending': return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'uploaded': return <Badge variant="outline" className="text-blue-600 border-blue-600">Processing</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance & Documentation</h1>
                    <p className="text-muted-foreground">Manage Pakistan Single Window (PSW) regulatory requirements.</p>
                </div>
                <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                    <Link to="/logistics/customs/gate-pass">
                        <FileText className="w-4 h-4 mr-2" /> Generate Export Gate Pass
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requirement</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{documents.filter(d => d.status === 'pending').length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">PSW Integrations Active</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">DPP, PSI, DRAP, SBP</p>
                    </CardContent>
                </Card>
            </div>

            {/* Documents List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Required Documents</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Document Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Reference ID</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-6">Loading...</TableCell></TableRow>
                            ) : documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">{doc.name}</TableCell>
                                    <TableCell className="capitalize">{doc.type}</TableCell>
                                    <TableCell className="font-mono text-xs">{doc.reference || '-'}</TableCell>
                                    <TableCell>{doc.expiry_date || '-'}</TableCell>
                                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                    <TableCell className="text-right">
                                        {doc.status === 'pending' && (
                                            <Button size="sm" variant="outline" onClick={() => handleUpload(doc.id)}>
                                                <Upload className="w-4 h-4 mr-2" /> Upload
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default ComplianceDashboard;
