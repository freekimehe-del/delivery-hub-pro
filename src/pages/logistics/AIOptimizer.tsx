import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Zap, MapPin, ArrowRight } from "lucide-react";

const AIOptimizer: React.FC = () => {
    const [origin, setOrigin] = useState("Karachi");
    const [destination, setDestination] = useState("Lahore");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleOptimize = async () => {
        setLoading(true);
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        try {
            const resp = await fetch(`${apiUrl}/api/ai/optimize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin, destination })
            });
            if (resp.ok) {
                const json = await resp.json();
                setResult(json.route);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6 flex items-center space-x-2">
                <Zap className="text-yellow-500 h-8 w-8" />
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">AI Route Optimization</h1>
                    <p className="text-muted-foreground">Optimize multi-modal routes for cost and carbon footprint.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow border h-fit">
                    <h3 className="font-semibold mb-4">Route Parameters</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Origin</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Destination</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleOptimize}
                            disabled={loading}
                            className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded font-semibold shadow hover:from-indigo-600 hover:to-purple-700"
                        >
                            {loading ? "Optimizing..." : "Run AI Optimization"}
                        </button>
                    </div>
                </div>

                {result && (
                    <div className="bg-white p-6 rounded shadow border">
                        <h3 className="font-semibold mb-4 text-green-700">Optimization Result</h3>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 text-lg font-medium">
                                <span className="text-gray-600">Savings:</span>
                                <span className="text-green-600 font-bold">{result.savings}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-lg font-medium">
                                <span className="text-gray-600">CO2 Reduction:</span>
                                <span className="text-green-600 font-bold">{result.co2_reduction}</span>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Recommended Path</h4>
                                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded overflow-x-auto">
                                    {result.path.map((loc: string, i: number) => (
                                        <div key={i} className="flex items-center">
                                            <div className="flex flex-col items-center">
                                                <MapPin className="h-4 w-4 text-indigo-500" />
                                                <span className="text-xs font-semibold mt-1">{loc}</span>
                                            </div>
                                            {i < result.path.length - 1 && <ArrowRight className="mx-2 text-gray-400" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded text-sm border border-yellow-200">
                                <strong>AI Insight:</strong> {result.details}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AIOptimizer;
