import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Truck, Package, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

// Mock Map Placeholder (Leaflet would go here)
const MapPlaceholder = ({ location }: { location: any }) => (
    <div className="bg-gray-100 w-full h-96 rounded-lg flex items-center justify-center relative overflow-hidden border">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }} />
        <div className="bg-white/90 p-4 rounded-lg shadow-lg z-10 text-center">
            <MapPin className="h-8 w-8 text-red-600 mx-auto mb-2 animate-bounce" />
            <p className="font-semibold text-lg">{location?.name || "Unknown Location"}</p>
            <p className="text-xs text-gray-500">Lat: {location?.lat}, Lng: {location?.lng}</p>
        </div>
    </div>
);

export default function TrackingView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTracking = () => {
        setLoading(true);
        setError("");
        const apiUrl = (window as any).__API_BASE__ || 'http://localhost:4000';
        fetch(`${apiUrl}/api/tracking/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Tracking ID not found");
                return res.json();
            })
            .then(setData)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (id) fetchTracking();
    }, [id]);

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-96 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <AlertTriangle className="h-16 w-16 text-red-500" />
                <h1 className="text-2xl font-bold">Tracking Not Found</h1>
                <p className="text-gray-500">We couldn't find any shipment with ID: {id}</p>
                <Button onClick={() => navigate('/logistics/tracking')}>Try Another ID</Button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/logistics/tracking')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                {data.tracking_id}
                                <span className={`text-xs px-2 py-1 rounded-full uppercase ${data.current_status === 'active' ? 'bg-blue-100 text-blue-800' :
                                        data.current_status === 'delayed' ? 'bg-red-100 text-red-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {data.current_status}
                                </span>
                            </h1>
                            <p className="text-sm text-muted-foreground">Last updated: {new Date(data.last_updated).toLocaleString()}</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={fetchTracking}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Timeline & Details */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipment Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8 relative pl-4 border-l-2 border-gray-200 ml-4 py-2">
                                    {data.history.map((event: any, idx: number) => (
                                        <div key={idx} className="relative">
                                            {/* Dot */}
                                            <div className={`absolute -left-[21px] top-1 h-4 w-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-blue-600 h-5 w-5 -left-[23px]' : 'bg-gray-400'
                                                }`} />

                                            <div className="flex flex-col">
                                                <span className="font-semibold capitalize text-gray-900">{event.event_type.replace('_', ' ')}</span>
                                                <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                                                <p className="text-sm mt-1">{event.location?.name}</p>
                                                {event.metadata && (
                                                    <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                                        {Object.entries(event.metadata).map(([k, v]) => (
                                                            <div key={k} className="flex justify-between">
                                                                <span className="capitalize">{k}:</span>
                                                                <span className="font-medium">{String(v)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Map & Live Status */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardContent className="p-0">
                                <MapPlaceholder location={data.current_location} />
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center">
                                        <Truck className="h-6 w-6 text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Method</span>
                                        <span className="font-bold uppercase">Truck</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center">
                                        <Package className="h-6 w-6 text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Weight</span>
                                        <span className="font-bold">2,500 kg</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center">
                                        <Clock className="h-6 w-6 text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Est. Delivery</span>
                                        <span className="font-bold text-green-600">Tomorrow</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center">
                                        <MapPin className="h-6 w-6 text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Distance Remaining</span>
                                        <span className="font-bold">120 km</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
