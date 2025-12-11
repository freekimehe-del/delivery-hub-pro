import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

const POD: React.FC = () => {
    const [manifests, setManifests] = useState<any[]>([]);
    const [selectedManifest, setSelectedManifest] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [signatory, setSignatory] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const { data, error } = await supabase
                    .from('logistics_manifests')
                    .select('*')
                    .neq('status', 'completed'); // Only show active manifests

                if (error) throw error;
                setManifests(data || []);
            } catch (e) {
                console.error(e);
            }
        }
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedManifest || !file) {
            alert("Please select a manifest and upload proof.");
            return;
        }

        try {
            // 1. Create POD Record
            const { error: podError } = await supabase
                .from('proof_of_delivery')
                .insert([{
                    manifest_id: selectedManifest,
                    signatory_name: signatory,
                    // photo_evidence_url: we would upload file here and get URL
                    delivered_at: new Date().toISOString()
                }]);

            if (podError) throw podError;

            // 2. Update Manifest Status
            await supabase
                .from('logistics_manifests')
                .update({ status: 'completed' })
                .eq('id', selectedManifest);

            // 3. Update all linked Shipments to Delivered
            await supabase
                .from('shipment_master')
                .update({ status: 'delivered' })
                .eq('manifest_id', selectedManifest);

            setStatus("POD Submitted Successfully. Manifest Completed.");
            setFile(null);
            setSignatory("");
            setSelectedManifest("");

            // Refresh list
            const { data } = await supabase.from('logistics_manifests').select('*').neq('status', 'completed');
            setManifests(data || []);

        } catch (e: any) {
            console.error(e);
            alert("Error submitting POD: " + e.message);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Proof of Delivery Manager</h1>
                <p className="text-muted-foreground">Capture and verify delivery evidence.</p>
            </div>

            <div className="bg-white p-6 rounded shadow max-w-2xl border">
                {status && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{status}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Manifest / Shipment</label>
                        <select
                            value={selectedManifest}
                            onChange={(e) => setSelectedManifest(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                        >
                            <option value="">-- Select Manifest --</option>
                            {manifests.map(m => (
                                <option key={m.id} value={m.id}>{m.manifest_number} ({m.transport_mode})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Digital Signature / Signatory Name</label>
                        <input
                            type="text"
                            placeholder="Receiver Name"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                            value={signatory}
                            onChange={(e) => setSignatory(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Details of Evidence / Scanned POD</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                {file && <p className="text-sm text-blue-600 mt-2">Selected: {file.name}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Confirm Delivery & Upload POD
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default POD;
