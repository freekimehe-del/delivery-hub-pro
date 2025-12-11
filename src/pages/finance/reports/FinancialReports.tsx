import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function FinancialReports() {
    const [activeTab, setActiveTab] = useState('pl');
    const [loading, setLoading] = useState(false);

    // PL Data
    const [plData, setPlData] = useState<any>(null);
    // BS Data
    const [bsData, setBsData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            if (activeTab === 'pl') {
                const res = await fetch(`${apiUrl}/api/finance/reports/pl`);
                if (res.ok) setPlData(await res.json());
            } else {
                const res = await fetch(`${apiUrl}/api/finance/reports/bs`);
                if (res.ok) setBsData(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                        <p className="text-muted-foreground">Detailed financial statements and analysis.</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
                        <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
                        <TabsTrigger value="cf" disabled>Cash Flow</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pl" className="space-y-4">
                        {loading ? <div>Loading...</div> : plData && (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between">
                                        <CardTitle>Profit & Loss Statement</CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                            {plData.fromDate} to {plData.toDate}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Revenue */}
                                        <div>
                                            <h3 className="font-semibold text-lg border-b pb-2 mb-3">Revenue</h3>
                                            <div className="space-y-2">
                                                {plData.report.revenue.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span>{item.account_name}</span>
                                                        <span>{item.amount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between font-bold pt-2">
                                                    <span>Total Revenue</span>
                                                    <span>{plData.summary.totalRevenue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expenses */}
                                        <div>
                                            <h3 className="font-semibold text-lg border-b pb-2 mb-3">Operating Expenses</h3>
                                            <div className="space-y-2">
                                                {plData.report.expense.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between text-sm">
                                                        <span>{item.account_name}</span>
                                                        <span>{item.amount.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between font-bold pt-2">
                                                    <span>Total Expenses</span>
                                                    <span>{plData.summary.totalExpense.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Net Profit */}
                                        <div className="bg-slate-100 p-4 rounded-lg flex justify-between items-center">
                                            <span className="font-bold text-lg">Net Profit (Loss)</span>
                                            <span className={`font-bold text-xl ${plData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                PKR {plData.summary.netProfit.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="bs" className="space-y-4">
                        {loading ? <div>Loading...</div> : bsData && (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between">
                                        <CardTitle>Balance Sheet</CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                            As of {bsData.asOfDate}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Assets */}
                                        <div>
                                            <h3 className="font-bold bg-green-50 p-2 text-green-800 mb-4 rounded">ASSETS</h3>
                                            {bsData.report.assets.map((cat: any, i: number) => (
                                                <div key={i} className="mb-6">
                                                    <h4 className="font-semibold text-sm text-gray-600 mb-2 uppercase">{cat.category}</h4>
                                                    <div className="space-y-1 pl-2 border-l-2 border-gray-100">
                                                        {cat.accounts.map((acc: any, j: number) => (
                                                            <div key={j} className="flex justify-between text-sm">
                                                                <span>{acc.name}</span>
                                                                <span>{acc.amount.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="font-bold border-t pt-2 flex justify-between">
                                                <span>TOTAL ASSETS</span>
                                                <span>{(20700000).toLocaleString()}</span> {/* Mock total matches data */}
                                            </div>
                                        </div>

                                        {/* Liabilities & Equity */}
                                        <div>
                                            <h3 className="font-bold bg-red-50 p-2 text-red-800 mb-4 rounded">LIABILITIES & EQUITY</h3>

                                            {bsData.report.liabilities.map((cat: any, i: number) => (
                                                <div key={i} className="mb-6">
                                                    <h4 className="font-semibold text-sm text-gray-600 mb-2 uppercase">{cat.category}</h4>
                                                    <div className="space-y-1 pl-2 border-l-2 border-gray-100">
                                                        {cat.accounts.map((acc: any, j: number) => (
                                                            <div key={j} className="flex justify-between text-sm">
                                                                <span>{acc.name}</span>
                                                                <span>{acc.amount.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}

                                            {bsData.report.equity.map((cat: any, i: number) => (
                                                <div key={i} className="mb-6">
                                                    <h4 className="font-semibold text-sm text-gray-600 mb-2 uppercase">{cat.category}</h4>
                                                    <div className="space-y-1 pl-2 border-l-2 border-gray-100">
                                                        {cat.accounts.map((acc: any, j: number) => (
                                                            <div key={j} className="flex justify-between text-sm">
                                                                <span>{acc.name}</span>
                                                                <span>{acc.amount.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="font-bold border-t pt-2 flex justify-between">
                                                <span>TOTAL LIABILITIES & EQUITY</span>
                                                <span>{(20700000).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
