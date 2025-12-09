import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, RefreshCw, CheckCircle, AlertOctagon } from "lucide-react";

export const CustomsDashboard = () => {
    const [declarations, setDeclarations] = useState<any[]>([]);

    useEffect(() => {
        async function load() {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            try {
                const resp = await fetch(`${apiUrl}/api/customs/declarations`);
                if (resp.ok) {
                    const json = await resp.json();
                    setDeclarations(json.declarations);
                }
            } catch (e) { console.error(e); }
        }
        load();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Active Clearances</h2>
                <Link to="/customs/filing" className="bg-primary text-white px-4 py-2 rounded flex items-center shadow hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Good Declaration
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mock Stats */}
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <p className="text-gray-500 text-sm">Pending Assessment</p>
                    <p className="text-2xl font-bold">{declarations.filter(d => d.status === 'submitted').length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                    <p className="text-gray-500 text-sm">Awaiting Payment</p>
                    <p className="text-2xl font-bold">{declarations.filter(d => d.status === 'assessed').length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <p className="text-gray-500 text-sm">Cleared Today</p>
                    <p className="text-2xl font-bold">{declarations.filter(d => d.status === 'cleared').length}</p>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Declaration ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BL #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {declarations.length === 0 ? (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-500">No active declarations found. File a new one to start.</td></tr>
                        ) : declarations.map(d => (
                            <tr key={d.id}>
                                <td className="px-6 py-4 font-mono text-sm">{d.id.slice(0, 8)}...</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{d.type}</span></td>
                                <td className="px-6 py-4">{d.bl_number}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.status === 'cleared' ? 'bg-green-100 text-green-800' :
                                        d.status === 'assessed' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {d.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {d.status === 'assessed' && (
                                        <button className="text-indigo-600 hover:underline text-sm font-medium">Pay Duty</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
