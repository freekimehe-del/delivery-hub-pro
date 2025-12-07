# Logistics Module

This module contains orchestration logic for import/export workflows, PSW integration, duty calculations and tracking.

Components:

- `orchestrator.ts`: Orchestrates flows across `psw-gateway`, `customs-engine`, `duty-engine`, `tracking`, and `financial` modules.
- `architecture.md`: Mermaid architecture diagram and notes.

Usage:

Instantiate the `LogisticsOrchestrator` with module implementations and call `handleImport` for import consignments.

Example:

```ts
import LogisticsOrchestrator from './orchestrator';
import { PSWGateway } from '../psw-gateway';

const orchestrator = new LogisticsOrchestrator(new PSWGateway(), /*ruleEngine*/ null, /*duty*/ null, /*tracking*/ null, /*financial*/ null)
```
# Logistics Module (Multi-Modal Importer Portal)

This module provides a comprehensive reference and lightweight orchestration skeleton for a logistics system tailored to Pakistani importers handling multi-modal shipments (Container Ship, Trucking, Air Freight) with first-class support for Afghan transhipment routes and dual customs clearance flows (Chapter XIV & XXV).

What is included:
- Process flow diagrams (Mermaid) for each transport mode and dual-duty workflows.
- Database schema (Postgres SQL) for Shipments, Manifests, Duty Payments, PODs, Bonds, Tracking.
- System architecture overview (integration with PSW, Carrier APIs, Tracking providers).
- Mockups & wireframes for key screens: Shipment Creation, Manifest View, Duty Dashboard.
- A TypeScript `LogisticsManager` skeleton that composes existing modules (`PSWGateway`, `DutyCalculator`, `RuleEngine`, `TrackingService`, `FinancialSettlement`).

Location: `src/modules/logistics/`

Usage:
1. Read `flows.md` and `architecture.md` for high-level design.
2. Inspect `schema.sql` to create DB tables.
3. Use `index.ts` as a starting point for integrating the module into services or APIs.
