import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Manifests: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const { data, error } = await supabase
                .from('logistics_manifests' as any)
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setItems(data);
            }
        }
        load();
    }, []);



    // ... (existing imports)

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this manifest?")) return;

        const { error } = await supabase
            .from('logistics_manifests' as any)
            .delete()
            .eq('id', id);

        if (error) {
            alert("Error deleting manifest: " + error.message);
        } else {
            setItems(items.filter(i => i.id !== id));
        }
    };

    const handleExportSingleExcel = (m: any) => {
        const data = [{
            "Manifest Number": m.manifest_number,
            "Type": m.type || 'Manifest',
            "Mode": m.transport_mode,
            "Status": m.status,
            "Created Date": new Date(m.created_at).toLocaleDateString(),
            "Vessel/Flight": m.vessel_name || m.flight_number || "-",
            "Voyage": m.voyage_number || "-",
            "Port Loading": m.port_of_loading || "-",
            "Port Discharge": m.port_of_discharge || "-"
        }];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Manifest Details");
        XLSX.writeFile(wb, `${m.manifest_number}_Details.xlsx`);
    };

    const handleExportSinglePDF = (m: any) => {
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text(m.transport_mode === 'road' ? 'BILTY (Consignment Note)' : 'LOGISTICS MANIFEST', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.text(`Document #: ${m.manifest_number}`, 14, 40);
        doc.text(`Date: ${new Date(m.created_at).toLocaleDateString()}`, 14, 48);
        doc.text(`Status: ${m.status.toUpperCase()}`, 14, 56);

        // Grid for details
        autoTable(doc, {
            startY: 65,
            head: [['Field', 'Value']],
            body: [
                ['Transport Mode', m.transport_mode.toUpperCase()],
                ['Vessel / Flight', m.vessel_name || m.flight_number || "-"],
                ['Voyage #', m.voyage_number || "-"],
                ['Port of Loading', m.port_of_loading || "-"],
                ['Port of Discharge', m.port_of_discharge || "-"]
            ],
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] }
        });

        doc.save(`${m.manifest_number}.pdf`);
    };

    const handleExportExcel = () => {
        if (!items.length) return;

        // 1. Prepare Data for Main Sheet
        const mainData = items.map(m => ({
            "Manifest Number": m.manifest_number,
            "Type": m.type || 'Manifest',
            "Mode": m.transport_mode,
            "Status": m.status,
            "Created Date": new Date(m.created_at).toLocaleDateString(),
            "Vessel/Flight": m.vessel_name || m.flight_number || "-",
            "Voyage": m.voyage_number || "-"
        }));

        // 2. Create Workbook and Sheets
        const wb = XLSX.utils.book_new();
        const wsMain = XLSX.utils.json_to_sheet(mainData);

        // Auto-width for columns
        const wscols = Object.keys(mainData[0]).map(() => ({ wch: 20 }));
        wsMain['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, wsMain, "Manifests");

        // 3. Save File
        XLSX.writeFile(wb, `Manifests_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleExportPDF = () => {
        if (!items.length) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text("Logistics Manifests Report", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

        // Table
        const tableColumn = ["Manifest #", "Mode", "Status", "Date", "Vessel/Flight"];
        const tableRows = items.map(m => [
            m.manifest_number,
            m.transport_mode,
            m.status,
            new Date(m.created_at).toLocaleDateString(),
            m.vessel_name || m.flight_number || "-"
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 10 },
        });

        doc.save(`Manifests_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Logistics Manifests</h1>
                    <p className="text-muted-foreground">Manage manifests and auto-generated BLs.</p>
                </div>
                <div className="flex gap-2">
                    <Link to="/logistics/manifests/create" className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90">
                        Create Manifest
                    </Link>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-sm text-muted-foreground">No manifests created yet.</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manifest #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="h-8 gap-2">
                                                <Download className="h-3.5 w-3.5" />
                                                Export
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={handleExportPDF}>
                                                <FileText className="mr-2 h-4 w-4" />
                                                Export as PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleExportExcel}>
                                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                Export as Excel
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        <Link to={`/logistics/manifests/${m.id}`} className="text-blue-600 hover:underline">
                                            {m.manifest_number}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap uppercase">{m.transport_mode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${m.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                m.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(m.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/logistics/manifests/${m.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/logistics/manifests/${m.id}/edit`}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExportSinglePDF(m)}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Export PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleExportSingleExcel(m)}>
                                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                                    Export Excel
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(m.id)} className="text-red-600 focus:text-red-600">
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Manifests;
