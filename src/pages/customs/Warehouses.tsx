// src/pages/customs/Warehouses.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Warehouse, Package, Truck, ArrowLeftRight, CheckCircle, MapPin } from "lucide-react";

// Types
interface WarehouseData {
    id: string;
    name: string;
    location: string;
    is_bonded: boolean;
    capacity_sqft: number;
}

interface GatePass {
    id: string;
    pass_number: string;
    type: 'inward' | 'outward';
    driver_name: string;
    vehicle_number: string;
    status: string;
    created_at: string;
}

const Warehouses: React.FC = () => {
    const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
    const [passes, setPasses] = useState<GatePass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPassModal, setShowPassModal] = useState(false);

    // New Pass Form State
    const [newPass, setNewPass] = useState({
        type: 'inward',
        warehouse_id: '',
        driver_name: '',
        vehicle_number: '',
        description: '',
        quantity: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch Warehouses
            const { data: whData } = await supabase.from('warehouses').select('*');
            if (whData) setWarehouses(whData);

            // Fetch Recent Passes
            const { data: passData } = await supabase
                .from('gate_passes')
                .select('*')
                .order('issue_date', { ascending: false })
                .limit(10);
            if (passData) setPasses(passData as any);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePass = async () => {
        if (!newPass.warehouse_id || !newPass.driver_name) return alert("Please fill required fields");

        try {
            // 1. Create Pass
            const { data: pass, error } = await supabase
                .from('gate_passes')
                .insert([{
                    pass_number: `GP-${newPass.type === 'inward' ? 'IN' : 'OUT'}-${Math.floor(Math.random() * 10000)}`,
                    type: newPass.type,
                    warehouse_id: newPass.warehouse_id,
                    driver_name: newPass.driver_name,
                    vehicle_number: newPass.vehicle_number,
                    status: 'issued'
                }])
                .select()
                .single();

            if (error) throw error;

            // 2. Add Item (Simplified for demo)
            await supabase.from('gate_pass_items').insert([{
                gate_pass_id: pass.id,
                description: newPass.description || 'General Cargo',
                quantity: parseFloat(newPass.quantity) || 0
            }]);

            // 3. Update Inventory (Logic would go here - e.g. increment/decrement)
            // For now just tracking the pass

            alert("Gate Pass Issued Successfully!");
            setShowPassModal(false);
            fetchData(); // Refresh list

        } catch (error: any) {
            alert("Error: " + error.message);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Warehouse className="w-6 h-6" /> Warehouse Management
                    </h1>
                    <p className="text-muted-foreground">Manage Bonded Inventory and Gate Passes.</p>
                </div>
                <button
                    onClick={() => setShowPassModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
                >
                    <ArrowLeftRight className="w-4 h-4" /> Issue Gate Pass
                </button>
            </div>

            {/* Warehouse Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {warehouses.map(wh => (
                    <div key={wh.id} className="bg-white p-5 rounded shadow border border-gray-100 hover:border-blue-200 transition">
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-lg ${wh.is_bonded ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                <Warehouse className="w-6 h-6" />
                            </div>
                            {wh.is_bonded && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">Bonded</span>}
                        </div>
                        <h3 className="font-semibold text-lg">{wh.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                            <MapPin className="w-3 h-3" /> {wh.location}
                        </div>
                        <div className="flex justify-between text-sm border-t pt-3">
                            <div className="text-gray-500">Capacity</div>
                            <div className="font-medium">{wh.capacity_sqft?.toLocaleString()} sqft</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Gate Passes */}
            <div className="bg-white rounded shadow border overflow-hidden">
                <div className="p-4 border-b flex items-center gap-2">
                    <Truck className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold">Recent Gate Passes</h3>
                </div>
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Pass #</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Driver / Vehicle</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {passes.map(pass => (
                            <tr key={pass.id}>
                                <td className="px-4 py-3 font-medium">{pass.pass_number}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium ${pass.type === 'inward' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {pass.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{pass.driver_name} ({pass.vehicle_number})</td>
                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                        <CheckCircle className="w-3 h-3" /> {pass.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-500">
                                    {new Date(pass.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {passes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No gate passes issued yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Pass Modal */}
            {showPassModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Issue Gate Pass</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Pass Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" checked={newPass.type === 'inward'} onChange={() => setNewPass({ ...newPass, type: 'inward' })} /> Inward
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" checked={newPass.type === 'outward'} onChange={() => setNewPass({ ...newPass, type: 'outward' })} /> Outward
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Warehouse</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={newPass.warehouse_id}
                                    onChange={e => setNewPass({ ...newPass, warehouse_id: e.target.value })}
                                >
                                    <option value="">Select Warehouse</option>
                                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Driver Name</label>
                                    <input className="w-full border rounded p-2" placeholder="Ali Khan"
                                        value={newPass.driver_name} onChange={e => setNewPass({ ...newPass, driver_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Vehicle #</label>
                                    <input className="w-full border rounded p-2" placeholder="ABC-123"
                                        value={newPass.vehicle_number} onChange={e => setNewPass({ ...newPass, vehicle_number: e.target.value })} />
                                </div>
                            </div>

                            <div className="border-t pt-3">
                                <h4 className="font-medium text-sm mb-2">Item Details</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <input className="w-full border rounded p-2 text-sm" placeholder="Description"
                                            value={newPass.description} onChange={e => setNewPass({ ...newPass, description: e.target.value })} />
                                    </div>
                                    <div>
                                        <input type="number" className="w-full border rounded p-2 text-sm" placeholder="Qty"
                                            value={newPass.quantity} onChange={e => setNewPass({ ...newPass, quantity: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setShowPassModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button onClick={handleCreatePass} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create Pass</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Warehouses;
