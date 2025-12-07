# Tracking & ETA Module

Handles ingestion of GPS/position reports and exposes a simple ETA estimator. This skeleton uses a basic averaging estimator — replace with real model.

Example:
```ts
import { TrackingService } from "@/modules/tracking";
const t = new TrackingService();
t.ingestLocation('veh-1', { lat: 24.86, lon: 67.01, ts: Date.now() });
```
