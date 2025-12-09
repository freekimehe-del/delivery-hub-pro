import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Manifests: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        let mounted = true;
        async function load() {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            try {
                const resp = await fetch(`${apiUrl}/api/manifests`);
                if (resp.ok) {
                    const json = await resp.json();
                    if (mounted && Array.isArray(json.manifests)) {
                        setItems(json.manifests);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        load();
        return () => { mounted = false };
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bills of Lading</h1>
                    <p className="text-muted-foreground">Manage multi-modal shipping BLs.</p>
                </div>
                <Link to="/logistics/manifests/create" className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90">
                    Create BL
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="text-sm text-muted-foreground">No BLs created yet.</div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BL #</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((m) => (
                                <tr key={m.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{m.manifest_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap uppercase">{m.transport_mode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(m.created_at).toLocaleString()}
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
