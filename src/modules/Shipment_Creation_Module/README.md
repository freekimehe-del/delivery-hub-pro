# Shipment Creation & Management Module

This module implements shipment creation and orchestration primitives for container, road, and air freight, with first-class support for Afghan transhipment and document initialization.

Structure (high level):

- `Shipment_Type_Manager` — handlers for Container / Road / Air shipments and submodules.
- `Route_Planner` — Afghan transhipment router and domestic route optimizer.
- `Document_Initializer` — upload/validate commercial documents and transport paperwork.

Use the exported factories and classes in application flows or the `LogisticsOrchestrator`.
