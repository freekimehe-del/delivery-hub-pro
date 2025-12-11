import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useClearanceJobs } from "@/hooks/useCustoms";
import { supabase } from "@/integrations/supabase/client";

const CreateManifest: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { data: clearanceJobs } = useClearanceJobs();
    const [form, setForm] = useState({
        clearance_job_id: "",
        transport_mode: "maritime",
        vessel_name: "",
        voyage_number: "",
        port_of_loading: "Shanghai",
        port_of_discharge: "Karachi",
        flight_number: "",
        // Added fields for richer Logistics Manifest data
        container_size: "40ft",
        container_type: "standard",
        priority: "medium",
        offload_destination: "", // preferred yard slot / depot name
        instructions: "",
        legs: [{ from: "Shanghai", to: "Karachi", mode: "maritime" }] // Default leg
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const blNumber = "BL-" + Math.floor(Math.random() * 1000000);

        const payload = {
            manifest_number: blNumber,
            transport_mode: form.transport_mode,
            vessel_name: form.transport_mode === 'maritime' ? form.vessel_name : null,
            voyage_number: form.transport_mode === 'maritime' ? form.voyage_number : null,
            flight_number: form.transport_mode === 'air' ? form.flight_number : null,
            port_of_loading: form.port_of_loading,
            port_of_discharge: form.port_of_discharge,
            departure_date: new Date().toISOString(), // Mock departure today
            status: 'draft'
        };

        try {
            const { data, error } = await supabase
                .from('logistics_manifests')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            // If a clearance job was selected, link it (logic might vary depending on schema, but let's assume we update the job or shipment)
            // For now, just success.

            alert(`Success! Generated BL: ${data.manifest_number}`);
            navigate("/logistics/manifests");
        } catch (e: any) {
            console.error(e);
            alert("Error: " + (e.message || "Failed to create manifest"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Logistics Manifest</h1>
                <p className="text-muted-foreground">Enter details to generate a manifest and auto-produce a BL.</p>
            </div>

            <div className="bg-white p-6 rounded shadow max-w-2xl border">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Core manifest attributes */}
                    {/* Link to Customs */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Link Clearance Job (Optional)</label>
                        <select
                            value={form.clearance_job_id}
                            onChange={(e) => setForm({ ...form, clearance_job_id: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        >
                            <option value="">-- Select Pending Job --</option>
                            {clearanceJobs?.map((job: any) => (
                                <option key={job.id} value={job.id}>
                                    {job.job_number} ({job.type})
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Linking a job allows auto-filling details and tracking customs status.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Transport Mode</label>
                        <select
                            value={form.transport_mode}
                            onChange={(e) => setForm({ ...form, transport_mode: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        >
                            <option value="maritime">Maritime</option>
                            <option value="air">Air</option>
                            <option value="road">Road</option>
                        </select>
                    </div>

                    {form.transport_mode === 'maritime' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vessel Name</label>
                                <input
                                    required
                                    type="text"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                    value={form.vessel_name}
                                    onChange={(e) => setForm({ ...form, vessel_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Voyage Number</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                    value={form.voyage_number}
                                    onChange={(e) => setForm({ ...form, voyage_number: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {form.transport_mode === 'air' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Flight Number</label>
                            <input
                                required
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={form.flight_number}
                                onChange={(e) => setForm({ ...form, flight_number: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Additional manifest info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Container Size</label>
                            <select
                                value={form.container_size}
                                onChange={(e) => setForm({ ...form, container_size: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            >
                                <option value="20ft">20ft</option>
                                <option value="40ft">40ft</option>
                                <option value="45ft">45ft</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Container Type</label>
                            <select
                                value={form.container_type}
                                onChange={(e) => setForm({ ...form, container_type: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            >
                                <option value="standard">Standard</option>
                                <option value="high_cube">High Cube</option>
                                <option value="reefer">Reefer</option>
                                <option value="open_top">Open Top</option>
                                <option value="tank">Tank</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Preferred Offload Destination</label>
                            <input
                                type="text"
                                placeholder="e.g., YARD A - ROW 12 - SLOT 45"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={form.offload_destination}
                                onChange={(e) => setForm({ ...form, offload_destination: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Instructions</label>
                        <textarea
                            placeholder="Special handling, gate directions, equipment notes"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            rows={3}
                            value={form.instructions}
                            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Port of Loading</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={form.port_of_loading}
                                onChange={(e) => setForm({ ...form, port_of_loading: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Port of Discharge</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={form.port_of_discharge}
                                onChange={(e) => setForm({ ...form, port_of_discharge: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? 'Generating...' : 'Generate BL'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CreateManifest;
