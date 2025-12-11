// src/pages/customs/DutyCalculator.tsx
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calculator, DollarSign, Search } from "lucide-react";

const DutyCalculator: React.FC = () => {
    const [hsCode, setHsCode] = useState("");
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';

        try {
            const resp = await fetch(`${apiUrl}/api/customs/calculate-duty`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hs_code: hsCode,
                    value_pkr: value
                })
            });

            const data = await resp.json();
            if (resp.ok) {
                setResult(data.data);
            } else {
                alert("Error: " + (data.error || "Calculation failed"));
            }
        } catch (error: any) {
            alert("Network Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Duty Calculator</h1>
                <p className="text-muted-foreground">Estimate Import Duties & Taxes (FBR/Weboc Simulation).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="bg-white p-6 rounded shadow border">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Search className="w-5 h-5" /> Shipment Details
                    </h2>
                    <form onSubmit={handleCalculate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">HS Code (PCT)</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. 8703.2113"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={hsCode}
                                onChange={(e) => setHsCode(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Try '8703' for Vehicles (30% Duty) or '8471' for Laptops (0% Duty).</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Declared Value (PKR)</label>
                            <input
                                required
                                type="number"
                                placeholder="e.g. 5000000"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {loading ? 'Calculating...' : 'Calculate Duties'}
                        </button>
                    </form>
                </div>

                {/* Results Display */}
                <div className="bg-gray-50 p-6 rounded shadow border">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5" /> Estimated Breakdown
                    </h2>

                    {result ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Customs Duty (CD)</span>
                                <span className="font-medium">{result.breakdown.customs_duty.toLocaleString()} PKR</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Add. Customs Duty (ACD)</span>
                                <span className="font-medium">{result.breakdown.add_customs_duty.toLocaleString()} PKR</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Sales Tax (ST) 17%</span>
                                <span className="font-medium">{result.breakdown.sales_tax.toLocaleString()} PKR</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Income Tax (IT) 11%</span>
                                <span className="font-medium">{result.breakdown.income_tax.toLocaleString()} PKR</span>
                            </div>

                            <div className="pt-4 flex justify-between items-center text-lg font-bold text-blue-800">
                                <span>Total Payable</span>
                                <span>{result.total.toLocaleString()} PKR</span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-gray-400">
                            <DollarSign className="w-12 h-12 mb-2 opacity-50" />
                            <p>Enter details to estimate duties.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DutyCalculator;
