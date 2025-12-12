// src/pages/finance/logistics/LandedCost.tsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Calculator, Save, Truck, Package } from "lucide-react";

interface CostHead {
    id: string;
    label: string;
    amount: number;
    currency: string;
    exRate: number;
}

const LandedCost: React.FC = () => {
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Cost Heads
    const [costs, setCosts] = useState<CostHead[]>([
        { id: 'freight', label: 'Ocean Freight', amount: 0, currency: 'PKR', exRate: 1 },
        { id: 'insurance', label: 'Marine Insurance', amount: 0, currency: 'PKR', exRate: 1 },
        { id: 'terminal', label: 'Terminal Handling (THC)', amount: 0, currency: 'PKR', exRate: 1 },
        { id: 'agency', label: 'Agency / Clearing Fees', amount: 0, currency: 'PKR', exRate: 1 },
        { id: 'transport', label: 'Inland Transport', amount: 0, currency: 'PKR', exRate: 1 },
    ]);

    // Real Items Fetching
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    useEffect(() => {
        if (selectedJob) {
            fetchJobItems(selectedJob.id);
        } else {
            setItems([]);
        }
    }, [selectedJob]);

    const fetchJobs = async () => {
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const res = await fetch(`${apiUrl}/api/finance/clearance-jobs`);
            const json = await res.json();
            if (json.jobs) setJobs(json.jobs);
        } catch (e) {
            console.error("Failed to fetch jobs", e);
        }
    };

    const fetchJobItems = async (jobId: string) => {
        setLoading(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const res = await fetch(`${apiUrl}/api/finance/clearance-jobs/${jobId}/items`);
            const json = await res.json();
            if (json.items) setItems(json.items);
        } catch (error) {
            console.error("Error fetching items:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCostChange = (id: string, field: keyof CostHead, value: any) => {
        setCosts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const calculateAllocations = () => {
        if (items.length === 0) return [];

        // 1. Calculate Total Base Value (for apportionment)
        const totalBaseValue = items.reduce((sum, item) => sum + (item.qty * item.unit_price), 0);

        // 2. Calculate Total Extra Costs in PKR
        const totalExtraCosts = costs.reduce((sum, c) => sum + (c.amount * c.exRate), 0);

        return items.map(item => {
            const itemBaseVal = item.qty * item.unit_price;
            // Prevent division by zero
            const ratio = totalBaseValue > 0 ? (itemBaseVal / totalBaseValue) : 0;

            const allocatedExtra = totalExtraCosts * ratio;
            const totalCost = (itemBaseVal * 278) + item.duty_paid + allocatedExtra; // Assuming Base is USD provided, converting to PKR

            return {
                ...item,
                base_val_pkr: itemBaseVal * 278,
                allocated_extra: allocatedExtra,
                total_landed_cost: totalCost,
                cost_per_unit: item.qty > 0 ? totalCost / item.qty : 0
            };
        });
    };

    const allocatedItems = calculateAllocations();
    const totalJobCost = allocatedItems.reduce((sum, i) => sum + i.total_landed_cost, 0);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Landed Cost Calculator</h1>
                <p className="text-muted-foreground">Apportion Freight, Duties, and Expenses to determine Item-level Profitability.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Job Selection */}
                <div className="lg:col-span-1 bg-white p-4 rounded shadow border h-fit">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5" /> Select Job
                    </h3>
                    <div className="space-y-2">
                        {jobs.map(job => (
                            <button
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className={`w-full text-left p-3 rounded text-sm border transition ${selectedJob?.id === job.id
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div>{job.job_number}</div>
                                <div className="text-xs text-gray-500">{job.bl_number}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                {selectedJob ? (
                    <div className="lg:col-span-3 space-y-6">
                        {/* Cost Inputs */}
                        <div className="bg-white p-6 rounded shadow border">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" /> Cost Heads (Expenses)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {costs.map(cost => (
                                    <div key={cost.id} className="p-3 bg-gray-50 rounded border flex items-end gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs font-medium text-gray-500 block mb-1">{cost.label}</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    className="w-24 p-1 text-sm border rounded"
                                                    value={cost.amount}
                                                    onChange={e => handleCostChange(cost.id, 'amount', parseFloat(e.target.value) || 0)}
                                                    placeholder="Amount"
                                                />
                                                <select
                                                    className="p-1 text-sm border rounded bg-white"
                                                    value={cost.currency}
                                                    onChange={e => handleCostChange(cost.id, 'currency', e.target.value)}
                                                >
                                                    <option>PKR</option>
                                                    <option>USD</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 block mb-1">Ex. Rate</label>
                                            <input
                                                type="number"
                                                className="w-16 p-1 text-sm border rounded"
                                                value={cost.exRate}
                                                onChange={e => handleCostChange(cost.id, 'exRate', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="text-right flex-1">
                                            <div className="text-xs text-gray-400">Total (PKR)</div>
                                            <div className="font-medium">{(cost.amount * cost.exRate).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Allocation Table */}
                        <div className="bg-white p-6 rounded shadow border">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Calculator className="w-5 h-5" /> Cost Allocation (Value Based)
                                </h3>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">Total Job Cost</div>
                                    <div className="text-xl font-bold text-green-700">PKR {totalJobCost.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Item</th>
                                            <th className="px-4 py-2 text-right">Qty</th>
                                            <th className="px-4 py-2 text-right">Base (PKR)</th>
                                            <th className="px-4 py-2 text-right">Duty Paid</th>
                                            <th className="px-4 py-2 text-right">Allocated Exp.</th>
                                            <th className="px-4 py-2 text-right font-bold bg-green-50">Total Cost</th>
                                            <th className="px-4 py-2 text-right font-bold bg-green-50">Unit Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allocatedItems.map((item, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium">{item.name}</td>
                                                <td className="px-4 py-2 text-right">{item.qty}</td>
                                                <td className="px-4 py-2 text-right text-gray-600">{item.base_val_pkr.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right text-red-600">{item.duty_paid.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right text-orange-600">{Math.round(item.allocated_extra).toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-bold bg-green-50">{Math.round(item.total_landed_cost).toLocaleString()}</td>
                                                <td className="px-4 py-2 text-right font-bold bg-green-50">{Math.round(item.cost_per_unit).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button className="px-4 py-2 border rounded hover:bg-gray-50" onClick={() => window.print()}>Export PDF</button>
                            <button
                                onClick={async () => {
                                    const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
                                    try {
                                        const resp = await fetch(`${apiUrl}/api/finance/landed-cost`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                job_id: selectedJob.id,
                                                total_cost_pkr: totalJobCost,
                                                cost_data: { costs, items: allocatedItems }
                                            })
                                        });

                                        if (!resp.ok) throw new Error("Failed to save");
                                        alert("Costing Saved Successfully via Finance API!");
                                    } catch (e: any) {
                                        alert("Error saving: " + e.message);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save Final Costing
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-3 h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded bg-gray-50">
                        <Truck className="w-12 h-12 mb-2 opacity-50" />
                        <p>Select a Clearance Job to calculate Landed Cost.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default LandedCost;
