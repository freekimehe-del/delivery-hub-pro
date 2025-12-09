import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';

export default function FinancialReports() {
    // Mock data for reports since we don't have enough real data yet
    const revenueData = [
        { month: 'Jan', revenue: 45000, expenses: 32000 },
        { month: 'Feb', revenue: 52000, expenses: 35000 },
        { month: 'Mar', revenue: 48000, expenses: 38000 },
        { month: 'Apr', revenue: 61000, expenses: 42000 },
        { month: 'May', revenue: 55000, expenses: 39000 },
        { month: 'Jun', revenue: 67000, expenses: 45000 },
    ];

    const categoryData = [
        { name: 'Freight', value: 45 },
        { name: 'Customs', value: 25 },
        { name: 'Warehousing', value: 20 },
        { name: 'Value Added', value: 10 },
    ];

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Financial Reports</h1>
                <p className="text-muted-foreground">Analysis and statements</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Revenue vs Expenses */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Trend */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Profit Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    name="Net Profit"
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Balance Sheet</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Statement</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Assets, liabilities, and equity summary as of today.</p>
                    <button className="text-blue-600 text-sm font-medium hover:underline">View Report →</button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Profit & Loss</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Statement</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Revenue, costs, and expenses over a specific period.</p>
                    <button className="text-blue-600 text-sm font-medium hover:underline">View Report →</button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Cash Flow</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">Statement</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Inflows and outflows of cash from operations.</p>
                    <button className="text-blue-600 text-sm font-medium hover:underline">View Report →</button>
                </div>
            </div>
        </DashboardLayout>
    );
}
