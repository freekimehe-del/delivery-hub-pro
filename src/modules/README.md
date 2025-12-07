# Modules

This folder contains lightweight skeletons for core system modules. Each module exposes simple, well-typed interfaces and a minimal class implementation to be expanded.

Modules included:
- `psw-gateway` — Pakistan Single Window integration gateway (API client)
- `customs-engine` — Rule engine for Chapter XXV & XIV
- `transport-manager` — Multi-modal workflow orchestrator
- `duty-engine` — Duty & tax calculation engine
- `docs-compliance` — Document generation and PSW document helpers
- `tracking` — Real-time tracking ingestion and ETA estimator
- `financial` — PSID lifecycle and payment reconciliation

Exported entrypoint: `src/modules/index.ts`

Each module contains a small README and an `index.ts` with example usage.
