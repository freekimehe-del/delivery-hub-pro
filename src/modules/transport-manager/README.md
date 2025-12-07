# Multi-Modal Transport Manager

Orchestrator skeleton to register workflows per mode (maritime, road, air) and to drive transitions between workflow steps.

Example:
```ts
import { TransportManager } from "@/modules/transport-manager";
const tm = new TransportManager();
tm.registerWorkflow('maritime', async (ctx) => { /* steps */ });
```
