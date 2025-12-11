import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Zap, MapPin, ArrowRight } from "lucide-react";

const AIOptimizer: React.FC = () => {
    const [origin, setOrigin] = useState("Karachi");
    const [destination, setDestination] = useState("Lahore");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState("");

    const handleOptimize = async () => {
        setLoading(true);
        setResult(null);

        // Simulated Analysis Steps for UX
        const steps = ["Analyzing Traffic Patterns...", "Calculating CO2 Emissions...", "Checking Intermodal Options...", "Finalizing Route..."];
        for (const step of steps) {
            setLoadingStep(step);
            await new Promise(r => setTimeout(r, 600));
        }

        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const res = await fetch(`${apiUrl}/api/ai/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin, destination })
            });
            const json = await res.json();
            if (json.ok) {
                setResult(json.route);
            } else {
                alert("Optimization failed");
            }
        } catch (e) {
            console.error(e);
            alert("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-8 flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                    <Zap className="text-white h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Route Optimizer</h1>
                    <p className="text-muted-foreground">Advanced multi-modal route planning engine.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500" /> Route Parameters
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Origin Point</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    placeholder="City or Port"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    placeholder="City or Warehouse"
                                />
                            </div>

                            <button
                                onClick={handleOptimize}
                                disabled={loading}
                                className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium shadow-lg hover:bg-gray-800 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" /> Run AI Analysis
                                    </>
                                )}
                            </button>

                            {loading && (
                                <div className="text-center text-xs text-indigo-600 font-medium animate-pulse">
                                    {loadingStep}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2">
                    {result ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                                    <p className="text-sm font-medium text-green-800 mb-1">Projected Savings</p>
                                    <p className="text-3xl font-bold text-green-600">{result.savings}</p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                    <p className="text-sm font-medium text-blue-800 mb-1">CO₂ Reduction</p>
                                    <p className="text-3xl font-bold text-blue-600">{result.co2_reduction}</p>
                                </div>
                            </div>

                            {/* Route Visualizer */}
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-semibold text-lg mb-6">Optimized Path</h3>
                                <div className="relative flex items-center justify-between">
                                    {/* Connectivity Line */}
                                    <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-100 -z-10"></div>

                                    {result.path.map((loc: string, i: number) => (
                                        <div key={i} className="flex flex-col items-center z-10 bg-white px-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm mb-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded">{loc}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-200">
                                    <strong className="text-gray-900 block mb-1">Analysis Insight:</strong>
                                    {result.details}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-12">
                            <MapPin className="w-12 h-12 mb-4 opacity-20" />
                            <p>Enter parameters to generate an optimized route plan.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AIOptimizer;
