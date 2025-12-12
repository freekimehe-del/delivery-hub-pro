import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck } from "lucide-react";

interface ActiveTripsMapProps {
    className?: string;
    trips?: any[];
}

export function ActiveTripsMap({ className, trips = [] }: ActiveTripsMapProps) {
    return (
        <Card className={`col-span-1 md:col-span-2 lg:col-span-3 overflow-hidden flex flex-col h-[500px] ${className}`}>
            <CardHeader className="bg-muted/50 pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">Live Fleet Tracking</CardTitle>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        <Truck className="w-3 h-3 mr-1" />
                        {trips.filter(t => t.status === 'in_transit').length} Vehicles Active
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-slate-100">
                {/* Placeholder for actual Map integration (Leaflet/Mapbox) */}
                {/* Using standard OpenStreetMap Embed for demo purposes */}
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src="https://www.openstreetmap.org/export/embed.html?bbox=66.8,24.7,67.2,25.0&amp;layer=mapnik"
                    className="w-full h-full opacity-80 hover:opacity-100 transition-opacity"
                >
                </iframe>

                {/* Overlay showing "Active" simulation */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200 max-w-xs">
                    <h4 className="text-sm font-semibold mb-2">Active Shipments</h4>
                    <div className="space-y-2">
                        {trips.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No active trips detected.</p>
                        ) : (
                            trips.slice(0, 3).map((trip, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    <span className="font-medium text-slate-700">{trip.trip_number}</span>
                                    <span className="text-slate-500 truncate flex-1">{trip.destination_location}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
