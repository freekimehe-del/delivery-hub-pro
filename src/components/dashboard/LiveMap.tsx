import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock vehicle data
const vehicles = [
  { id: 1, name: "Truck-001", driver: "John D.", lat: 40.7128, lng: -74.006, status: "active" },
  { id: 2, name: "Van-003", driver: "Sarah M.", lat: 40.7282, lng: -73.9942, status: "active" },
  { id: 3, name: "Truck-007", driver: "Mike R.", lat: 40.6892, lng: -74.0445, status: "idle" },
  { id: 4, name: "Van-012", driver: "Lisa K.", lat: 40.7549, lng: -73.984, status: "active" },
  { id: 5, name: "Truck-015", driver: "Tom B.", lat: 40.7061, lng: -74.0088, status: "delivering" },
];

export function LiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-card rounded-xl border border-border overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Navigation className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Live Fleet Tracking</h3>
            <p className="text-xs text-muted-foreground">Real-time vehicle positions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="online" className="gap-1.5">
            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
            5 Active
          </Badge>
          <Button variant="ghost" size="icon-sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div
        ref={mapRef}
        className="relative h-[400px] bg-gradient-to-br from-slate-100 to-slate-200"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {/* Vehicle markers */}
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="absolute cursor-pointer group"
            style={{
              left: `${20 + index * 15}%`,
              top: `${25 + (index % 3) * 20}%`,
            }}
            onClick={() => setSelectedVehicle(vehicle.id === selectedVehicle ? null : vehicle.id)}
          >
            <div
              className={`relative p-2 rounded-full transition-all duration-200 ${
                vehicle.status === "active"
                  ? "bg-fleet-green shadow-lg shadow-fleet-green/30"
                  : vehicle.status === "delivering"
                  ? "bg-primary shadow-lg shadow-primary/30"
                  : "bg-muted-foreground/50"
              } ${selectedVehicle === vehicle.id ? "scale-125 ring-4 ring-primary/30" : "hover:scale-110"}`}
            >
              <MapPin className="w-4 h-4 text-primary-foreground" />
              {vehicle.status === "active" && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-fleet-green border-2 border-card rounded-full animate-ping" />
              )}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-card border border-border rounded-lg shadow-lg p-3 whitespace-nowrap">
                <p className="font-medium text-sm">{vehicle.name}</p>
                <p className="text-xs text-muted-foreground">{vehicle.driver}</p>
                <Badge
                  variant={
                    vehicle.status === "active"
                      ? "success"
                      : vehicle.status === "delivering"
                      ? "in-progress"
                      : "offline"
                  }
                  className="mt-1.5"
                >
                  {vehicle.status}
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Map controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button variant="secondary" size="icon" className="bg-card shadow-md">
            <span className="text-lg font-medium">+</span>
          </Button>
          <Button variant="secondary" size="icon" className="bg-card shadow-md">
            <span className="text-lg font-medium">−</span>
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur border border-border rounded-lg p-3 shadow-md">
          <p className="text-xs font-medium text-muted-foreground mb-2">Status</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-fleet-green" />
              Active
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Delivering
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/50" />
              Idle
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
