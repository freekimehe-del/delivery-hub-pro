// src/pages/clearance/ClearanceDashboard.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Plus, FileText, Ship, ArrowRight, Loader2, DollarSign } from "lucide-react";

const ClearanceDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<any[]>([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clearance_jobs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setJobs(data || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateInvoice = async (job: any) => {
        if (!confirm(`Generate Invoice for Job ${job.job_number}?`)) return;

        try {
            // 1. Create Invoice Header
            const { data: invoice, error } = await (supabase as any)
                .from('invoices')
                .insert([{
                    invoice_number: `INV-${job.job_number}-${Math.floor(Math.random() * 100)}`,
                    // customer_id: job.client_id, // Disabled for now to avoid FK issues if client_id is null/invalid
                    invoice_date: new Date().toISOString(),
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'draft',
                    total_amount: 15000,
                    notes: `Clearance Job: ${job.job_number} / BL: ${job.bl_number}`
                }])
                .select()
                .single();

            if (error) throw error;

            // 2. Add Line Items
            await (supabase as any).from('invoice_line_items').insert([
                {
                    invoice_id: invoice.id,
                    description: "Customs Clearance Agency Fee",
                    quantity: 1,
                    unit_price: 10000,
                },
                {
                    invoice_id: invoice.id,
                    description: "Documentation Charges",
                    quantity: 1,
                    unit_price: 5000,
                }
            ]);

            alert("Invoice Generated! Redirecting to Finance...");
            navigate('/finance/invoices');
        } catch (e: any) {
            console.error(e);
            alert("Error: " + e.message);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'gd_filed': return 'bg-blue-100 text-blue-800';
            case 'assessed': return 'bg-yellow-100 text-yellow-800';
            case 'cleared': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Clearance Operations</h1>
                    <p className="text-muted-foreground">Manage ongoing Import/Export jobs and declarations.</p>
                </div>
                <Link
                    to="/clearance/new"
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    <Plus className="w-4 h-4" /> New Job
                </Link>
            </div>

            {/* Stats Cards (Mock for now) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow border border-l-4 border-l-blue-500">
                    <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
                    <p className="text-2xl font-bold">{jobs.filter(j => j.status !== 'cleared').length}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border border-l-4 border-l-yellow-500">
                    <h3 className="text-sm font-medium text-gray-500">Pending Assessment</h3>
                    <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'gd_filed').length}</p>
                </div>
                <div className="bg-white p-6 rounded shadow border border-l-4 border-l-green-500">
                    <h3 className="text-sm font-medium text-gray-500">Cleared (This Month)</h3>
                    <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'cleared').length}</p>
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded shadow border overflow-hidden">
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Ship className="w-5 h-5 text-gray-500" /> Recent Shipments
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <p>No active clearance jobs found.</p>
                        <Link to="/clearance/new" className="text-blue-600 hover:underline mt-2 inline-block">Start your first job</Link>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref (BL/IGM)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                                        {job.job_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {job.type} <span className="text-gray-400 text-xs">({job.transport_mode})</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>BL: {job.bl_number}</div>
                                        {job.vir_number && <div className="text-xs">IGM: {job.vir_number}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {job.port_of_discharge}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(job.status)}`}>
                                            {job.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {job.status === 'draft' && (
                                            <button
                                                onClick={() => navigate(`/clearance/${job.id}/file-gd`)}
                                                className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs inline-flex items-center gap-1"
                                            >
                                                File GD <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                        {job.status !== 'draft' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/clearance/${job.id}/file-gd`)}
                                                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                                    title="View GD"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleGenerateInvoice(job)}
                                                    className="text-green-600 hover:text-green-900 flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200"
                                                    title="Generate Invoice"
                                                >
                                                    <DollarSign className="w-3 h-3" /> Invoice
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ClearanceDashboard;
