import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const CreateManifest: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        transport_mode: "maritime",
        vessel_name: "",
        voyage_number: "",
        port_of_loading: "Shanghai",
        port_of_discharge: "Karachi",
        flight_number: "",
        legs: [{ from: "Shanghai", to: "Karachi", mode: "maritime" }] // Default leg
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        try {
            const resp = await fetch(`${apiUrl}/api/manifests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const json = await resp.json();
            if (resp.ok) {
                navigate("/logistics/manifests");
            } else {
                alert("Error: " + (json.errors || "Failed to create"));
            }
        } catch (e) {
            console.error(e);
            alert("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Create Bill of Lading</h1>
                <p className="text-muted-foreground">Enter details to generate a PSW-compliant BL.</p>
            </div>

            <div className="bg-white p-6 rounded shadow max-w-2xl border">
                <form onSubmit={handleSubmit} className="space-y-4">
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
