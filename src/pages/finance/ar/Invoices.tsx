import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, FileDown, Download } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportEngine } from '@/lib/reports';
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

export default function Invoices() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadInvoices();
    }, [filter]);

    async function loadInvoices() {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const resp = await fetch(`${apiUrl}/api/finance/invoices${params}`);
            if (resp.ok) {
                const data = await resp.json();
                setInvoices(data.invoices || []);
            }
        } catch (error) {
            console.error('Failed to load invoices:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleExportExcel = () => {
        exportToExcel(invoices, 'Invoices_Report', 'Invoices');
    };

    const handleExportPDF = () => {
        const columns = [
            { header: 'Invoice #', key: 'invoice_number' },
            { header: 'Date', key: 'invoice_date' },
            { header: 'Due Date', key: 'due_date' },
            { header: 'Amount', key: 'total_amount' },
            { header: 'Balance', key: 'balance' },
            { header: 'Status', key: 'status' }
        ];
        exportToPDF(invoices, columns, 'Invoices Report', 'Invoices_Report');
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            partial: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-500'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage customer invoices and receivables</p>
                </div>

                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <FileDown className="h-4 w-4" /> Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link
                        to="/finance/invoices/create"
                    >
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>
                    <div className="flex gap-2">
                        {['all', 'draft', 'sent', 'partial', 'paid', 'overdue'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1 rounded text-sm ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invoice List */}
            {loading ? (
                <div className="text-sm text-gray-500">Loading invoices...</div>
            ) : invoices.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                    <p className="text-gray-500 mb-4">No invoices found</p>
                    <Link
                        to="/finance/invoices/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4" />
                        Create Your First Invoice
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        {invoice.invoice_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {invoice.customer?.customer_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(invoice.invoice_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(invoice.due_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        PKR {invoice.total_amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        PKR {invoice.balance?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                invoice.status
                                            )}`}
                                        >
                                            {invoice.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800">View</button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRowExportPDF(invoice)}
                                                title="Export PDF (Table)"
                                            >
                                                <FileDown className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <button
                                                className="text-green-600 hover:text-green-800"
                                                onClick={() => ReportEngine.generateInvoicePDF(invoice)}
                                                title="Download Invoice Form"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
