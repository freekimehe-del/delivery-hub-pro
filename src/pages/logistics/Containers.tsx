import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Container, Wrench, RefreshCw } from "lucide-react";

const Containers: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [containers, setContainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadData() {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const resp = await fetch(`${apiUrl}/api/containers`);
            if (resp.ok) {
                const json = await resp.json();
                setStats(json.stats);
                setContainers(json.containers);
            }
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleReturn = async (id: string) => {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        setLoading(true);
        await fetch(`${apiUrl}/api/containers/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ container_id: id, location: 'Port of Karachi', condition: 'good' })
        });
        await loadData();
        setLoading(false);
    };

    const handleMaintenance = async (id: string) => {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        setLoading(true);
        await fetch(`${apiUrl}/api/containers/maintenance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ container_id: id, reason: 'Manual Inspection' })
        });
        await loadData();
        setLoading(false);
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Empty Container Management</h1>
                <p className="text-muted-foreground">Track empty container returns and maintenance lifecycle.</p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded shadow border flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Pool</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                        <Container className="text-blue-500" />
                    </div>
                    <div className="bg-white p-4 rounded shadow border flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Available</p>
                            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                        </div>
                        <RefreshCw className="text-green-500" />
                    </div>
                    <div className="bg-white p-4 rounded shadow border flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">In Maintenance</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
                        </div>
                        <Wrench className="text-orange-500" />
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Container ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {containers.map((c) => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">{c.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.status === 'available' ? 'bg-green-100 text-green-800' :
                                            c.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{c.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => handleReturn(c.id)} disabled={loading} className="text-indigo-600 hover:text-indigo-900 mr-4">Log Return</button>
                                    <button onClick={() => handleMaintenance(c.id)} disabled={loading} className="text-orange-600 hover:text-orange-900">Maintenance</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default Containers;
