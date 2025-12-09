import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DollarSign, TrendingUp, FileText, AlertCircle, CreditCard, Receipt } from 'lucide-react';

export default function FinanceDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadMetrics() {
            const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
            try {
                const resp = await fetch(`${apiUrl}/api/finance/dashboard`);
                if (resp.ok) {
                    const data = await resp.json();
                    setMetrics(data.metrics);
                }
            } catch (error) {
                console.error('Failed to load finance metrics:', error);
            } finally {
                setLoading(false);
            }
        }
        loadMetrics();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="p-8">Loading finance dashboard...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
                <p className="text-muted-foreground">Overview of financial metrics and operations</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">
                        PKR {metrics?.monthly_revenue?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                    <div className="mt-2 text-xs font-medium text-green-600">+12% vs last month</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Receipt className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">
                        PKR {metrics?.total_ar?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-500">Accounts Receivable</p>
                    <div className="mt-2 text-xs font-medium text-gray-600">Outstanding from customers</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <CreditCard className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">
                        PKR {metrics?.total_ap?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-500">Accounts Payable</p>
                    <div className="mt-2 text-xs font-medium text-gray-600">Payable to vendors</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.overdue_invoices || 0}</p>
                    <p className="text-sm text-gray-500">Overdue Invoices</p>
                    <div className="mt-2 text-xs font-medium text-red-600">Requires attention</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link
                            to="/finance/invoices/create"
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium">Create Invoice</span>
                            </div>
                            <span className="text-sm text-gray-400">→</span>
                        </Link>

                        <Link
                            to="/finance/payments/record"
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium">Record Payment</span>
                            </div>
                            <span className="text-sm text-gray-400">→</span>
                        </Link>

                        <Link
                            to="/finance/bills/create"
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Receipt className="w-5 h-5 text-orange-600" />
                                <span className="text-sm font-medium">Enter Bill</span>
                            </div>
                            <span className="text-sm text-gray-400">→</span>
                        </Link>

                        <Link
                            to="/finance/ledger"
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium">View General Ledger</span>
                            </div>
                            <span className="text-sm text-gray-400">→</span>
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Payment Received</p>
                                <p className="text-xs text-gray-500">PKR 45,000 from Customer ABC</p>
                                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Invoice Created</p>
                                <p className="text-xs text-gray-500">INV-2024-001 for Shipment SHP-123</p>
                                <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Bill Approved</p>
                                <p className="text-xs text-gray-500">BILL-2024-045 - Fuel Expenses</p>
                                <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/finance/invoices"
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow"
                >
                    <FileText className="w-8 h-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Invoices</h3>
                    <p className="text-sm text-gray-600">Manage customer invoices and AR</p>
                </Link>

                <Link
                    to="/finance/bills"
                    className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-shadow"
                >
                    <Receipt className="w-8 h-8 text-orange-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Bills</h3>
                    <p className="text-sm text-gray-600">Manage vendor bills and AP</p>
                </Link>

                <Link
                    to="/finance/reports"
                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow"
                >
                    <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-2">Reports</h3>
                    <p className="text-sm text-gray-600">Financial statements and analytics</p>
                </Link>
            </div>
        </DashboardLayout>
    );
}
