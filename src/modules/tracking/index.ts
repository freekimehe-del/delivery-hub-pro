export type LocationReport = {
  lat: number;
  lon: number;
  ts: number; // epoch ms
  speedKph?: number;
};

export class TrackingService {
  private store = new Map<string, LocationReport[]>();

  ingestLocation(vehicleId: string, report: LocationReport) {
    const arr = this.store.get(vehicleId) || [];
    arr.push(report);
    this.store.set(vehicleId, arr.slice(-50));
  }

  // Very simple ETA estimator: average speed + straight-line distance (stub)
  estimateETA(vehicleId: string, dest: { lat: number; lon: number }): number | null {
    const arr = this.store.get(vehicleId);
    if (!arr || arr.length === 0) return null;
    const last = arr[arr.length - 1];
    const avgSpeed = arr.reduce((s, r) => s + (r.speedKph || 0), 0) / arr.length || 40;
    // Haversine distance (km)
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(dest.lat - last.lat);
    const dLon = toRad(dest.lon - last.lon);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(last.lat)) * Math.cos(toRad(dest.lat)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = R * c;
    const hours = distKm / (avgSpeed || 40);
    return Date.now() + Math.round(hours * 3600 * 1000);
  }
}

export default TrackingService;
