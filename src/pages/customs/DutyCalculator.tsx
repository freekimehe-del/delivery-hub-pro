// src/pages/customs/DutyCalculator.tsx
import React, { useState } from "react";
import { Calculator, DollarSign, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DutyCalculator: React.FC = () => {
    const [hsCode, setHsCode] = useState("");
    const [value, setValue] = useState("");
    const [isFiler, setIsFiler] = useState(true);
    const [isCommercial, setIsCommercial] = useState(true);
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
                    items: [{
                        hs_code: hsCode,
                        value: value // Backend expects 'value' in items array
                    }],
                    currency: 'PKR',
                    is_filer: isFiler,
                    is_commercial: isCommercial
                })
            });

            const data = await resp.json();
            if (resp.ok) {
                // The backend returns a detailed object in `item_details[0].calculation`
                // But also an aggregated breakdown in `breakdown`.
                // We'll use the aggregated one since we only sent one item.
                setResult(data);
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
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Duty Calculator</h1>
                <p className="text-muted-foreground">Estimate Import Duties & Taxes (Weboc/PSW Simulation).</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b pb-2">
                        <Search className="w-5 h-5 text-blue-600" /> Shipment Details
                    </h2>
                    <form onSubmit={handleCalculate} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">HS Code (PCT)</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 8703.2113"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500"
                                    value={hsCode}
                                    onChange={(e) => setHsCode(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground mt-1">Try '8703' (Cars), '8517' (Phones), '8471' (Laptops).</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Declared Value (PKR)</label>
                                <input
                                    required
                                    type="number"
                                    placeholder="e.g. 5000000"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2.5 border focus:ring-blue-500 focus:border-blue-500"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                                    <Switch id="filer-mode" checked={isFiler} onCheckedChange={setIsFiler} />
                                    <Label htmlFor="filer-mode" className="cursor-pointer">
                                        {isFiler ? "Active Taxpayer (Filer)" : "Non-Filer"}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                                    <Switch id="comm-mode" checked={isCommercial} onCheckedChange={setIsCommercial} />
                                    <Label htmlFor="comm-mode" className="cursor-pointer">
                                        {isCommercial ? "Commercial Importer" : "Non-Commercial"}
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            {loading ? 'Calculating...' : 'Calculate Duties'}
                        </button>
                    </form>
                </div>

                {/* Results Display */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
                    <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b pb-2 text-gray-800">
                        <Calculator className="w-5 h-5 text-green-600" /> Estimated Breakdown
                    </h2>

                    {result ? (
                        <div className="space-y-4 animate-in fade-in duration-500">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-white p-3 rounded shadow-sm">
                                    <div className="text-xs text-gray-500 uppercase">Assessable Value</div>
                                    <div className="font-semibold text-lg">{result.total_value_pkr.toLocaleString()}</div>
                                </div>
                                <div className="bg-white p-3 rounded shadow-sm border-l-4 border-l-blue-600">
                                    <div className="text-xs text-gray-500 uppercase">Total Duty Payable</div>
                                    <div className="font-bold text-lg text-blue-700">{result.total_payable.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg border overflow-hidden text-sm">
                                <div className="flex justify-between items-center px-4 py-3 border-b hover:bg-gray-50">
                                    <span className="text-gray-600">Customs Duty (CD)</span>
                                    <span className="font-medium">{result.breakdown.customs_duty.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 border-b hover:bg-gray-50">
                                    <span className="text-gray-600">Add. Customs Duty (ACD)</span>
                                    <span className="font-medium">{result.breakdown.additional_customs_duty.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 border-b hover:bg-gray-50">
                                    <span className="text-gray-600">Regulatory Duty (RD)</span>
                                    <span className="font-medium">{result.breakdown.regulatory_duty.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 border-b hover:bg-gray-50">
                                    <span className="text-gray-600">Federal Excise Duty (FED)</span>
                                    <span className="font-medium">{result.breakdown.fed.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50/50">
                                    <span className="text-gray-800 font-medium">Subtotal (for Sales Tax)</span>
                                    <span className="font-medium text-gray-800">
                                        {(result.total_value_pkr + result.breakdown.customs_duty + result.breakdown.additional_customs_duty + result.breakdown.regulatory_duty + result.breakdown.fed).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 border-b hover:bg-gray-50">
                                    <span className="text-gray-600">Sales Tax (ST) 18%</span>
                                    <span className="font-medium">{result.breakdown.sales_tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 border-b hover:bg-gray-50">
                                    <span className="text-gray-600">Add. Sales Tax (AST)</span>
                                    <span className="font-medium">{result.breakdown.additional_sales_tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center px-4 py-3 border-b hover:bg-gray-50">
                                    <span className="text-gray-600">Income Tax (WHT)</span>
                                    <span className="font-medium">{result.breakdown.income_tax.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
                                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                                <p>
                                    Calculations include 1% Landing Charges in Assessable Value.
                                    Income Tax calculated on: (Value + Duty + ST + AST).
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                            <DollarSign className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-center max-w-xs">Enter HS Code and Value to generate a detailed Pakistani Customs Duty estimation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DutyCalculator;
