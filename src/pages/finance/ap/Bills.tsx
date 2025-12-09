import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Filter, Download } from 'lucide-react';

export default function Bills() {
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadBills();
    }, [filter]);

    async function loadBills() {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const resp = await fetch(`${apiUrl}/api/finance/bills${params}`);
            if (resp.ok) {
                const data = await resp.json();
                setBills(data.bills || []);
            }
        } catch (error) {
            console.error('Failed to load bills:', error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            paid: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Vendor Bills</h1>
                    <p className="text-muted-foreground">Manage accounts payable and vendor expenses</p>
                </div>
                <Link
                    to="/finance/bills/create"
                    className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Enter Bill
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">Filter:</span>
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'paid'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-3 py-1 rounded text-sm ${filter === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bills List */}
            {loading ? (
                <div className="text-sm text-gray-500">Loading bills...</div>
            ) : bills.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                    <p className="text-gray-500 mb-4">No bills recorded</p>
                    <Link
                        to="/finance/bills/create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    >
                        <Plus className="w-4 h-4" />
                        Enter Your First Bill
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden border">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bill #
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vendor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bills.map((bill) => (
                                <tr key={bill.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        {bill.bill_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {bill.vendor?.vendor_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(bill.bill_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(bill.due_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                                        PKR {bill.total_amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                                bill.status
                                            )}`}
                                        >
                                            {bill.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            <button className="text-blue-600 hover:text-blue-800">View</button>
                                            {bill.status === 'pending' && (
                                                <button className="text-green-600 hover:text-green-800">Approve</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
}
