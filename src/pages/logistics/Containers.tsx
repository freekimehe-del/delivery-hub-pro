import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Container, Wrench, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Containers: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [containers, setContainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function loadData() {
        try {
            // Fetch Inventory
            const { data, error } = await supabase
                .from('container_inventory')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                // Auto seed if empty for demo
                seedContainers();
                return;
            }

            setContainers(data);

            // Calculate Stats
            const total = data.length;
            const available = data.filter((c: any) => c.status === 'available').length;
            const maintenance = data.filter((c: any) => c.status === 'maintenance').length;
            setStats({ total, available, maintenance });

        } catch (e) {
            console.error(e);
        }
    }

    async function seedContainers() {
        const mocks = [
            { container_number: 'MSKU-102938', size: '40ft', type: 'standard', status: 'available', location: 'Port of Karachi', condition: 'good' },
            { container_number: 'MSKU-998877', size: '20ft', type: 'standard', status: 'in_use', location: 'En Route to Lahore', condition: 'good' },
            { container_number: 'CMAU-554433', size: '40ft', type: 'reefer', status: 'maintenance', location: 'Repair Yard', condition: 'damaged' },
            { container_number: 'HLCU-112233', size: '45ft', type: 'high_cube', status: 'available', location: 'Port of Bin Qasim', condition: 'good' },
        ];
        await supabase.from('container_inventory').insert(mocks);
        loadData();
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleReturn = async (id: string) => {
        setLoading(true);
        // "Return" means marking as available and setting location to a depot
        await supabase
            .from('container_inventory')
            .update({ status: 'available', location: 'Return Depot', condition: 'good' })
            .eq('id', id);
        await loadData();
        setLoading(false);
    };

    const handleMaintenance = async (id: string) => {
        setLoading(true);
        await supabase
            .from('container_inventory')
            .update({ status: 'maintenance', location: 'Maintenance Bay' })
            .eq('id', id);
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
