// src/pages/clearance/NewClearanceJob.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

const NewClearanceJob: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        job_number: `IMP-KHI-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        type: "import",
        transport_mode: "maritime",
        bl_number: "",
        vessel_name: "",
        vir_number: "", // IGM
        port_of_discharge: "KPT",
        client_name: "" // For now just a string, ideally a lookup
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Mock inserting client or getting generic one
            // In real app, we would select from 'customers' table.

            const { error } = await supabase
                .from('clearance_jobs')
                .insert([{
                    job_number: form.job_number,
                    type: form.type,
                    transport_mode: form.transport_mode,
                    bl_number: form.bl_number,
                    vessel_name: form.vessel_name,
                    vir_number: form.vir_number,
                    port_of_discharge: form.port_of_discharge,
                    status: 'draft'
                }]);

            if (error) throw error;

            alert("Clearance Job Created Successfully!");
            navigate("/clearance"); // Redirect to Dashboard
        } catch (error: any) {
            console.error(error);
            alert("Error creating job: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">New Clearance Job</h1>
                <p className="text-muted-foreground">Open a new file for Import/Export clearance (GD Filing).</p>
            </div>

            <div className="bg-white p-6 rounded shadow max-w-2xl border">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Job Number</label>
                            <input
                                type="text"
                                disabled
                                className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2 border"
                                value={form.job_number}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            >
                                <option value="import">Import</option>
                                <option value="export">Export</option>
                                <option value="transit">Transit</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">BL / AWB Number</label>
                            <input
                                required
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={form.bl_number}
                                onChange={(e) => setForm({ ...form, bl_number: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">IGM / VIR Number</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={form.vir_number}
                                onChange={(e) => setForm({ ...form, vir_number: e.target.value })}
                                placeholder="For Imports via Sea"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vessel / Flight Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={form.vessel_name}
                                onChange={(e) => setForm({ ...form, vessel_name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Port (Discharge/Loading)</label>
                            <select
                                value={form.port_of_discharge}
                                onChange={(e) => setForm({ ...form, port_of_discharge: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            >
                                <option value="KPT">Karachi Port Trust (KPT)</option>
                                <option value="SAPT">South Asia Pakistan Terminal (SAPT)</option>
                                <option value="QICT">Qasim International (QICT)</option>
                                <option value="AIR">Karachi Airport (JIAP)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            {loading ? 'Creating Job...' : 'Create Clearance Job'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default NewClearanceJob;
