# System Architecture (Overview)

```mermaid
flowchart LR
  subgraph Importer Portal
    UI[Web/Mobile UI] --> API[API Gateway / Backend]
  end

  API -->|REST/gRPC| Logistics[Logistics Manager]
  Logistics --> PSW[Pakistan Single Window (PSW)]
  Logistics --> Duty[Duty & Tax Engine]
  Logistics --> CustomsRules[Customs Rule Engine]
  Logistics --> Tracking[Tracking Provider]
  Logistics --> Carriers[Carrier APIs / EDIFACT]
  Logistics --> Financial[Financial / Banking]
  Logistics --> DB[(Postgres)]
  Logistics --> MQ[(Message Broker e.g., Rabbit/Kafka)]

  PSW -->|callbacks / webhooks| API
  Tracking --> MQ
  Carriers --> MQ
  Financial --> PSW
  DB --> Analytics[Reporting & BI]

  classDef infra fill:#f9f,stroke:#333,stroke-width:1px;
  class MQ,DB,PSW,Tracking,Carriers,Financial infra;
```

Notes:
- The `Logistics Manager` is the orchestration layer: it composes PSW submissions, rule evaluations, duty calculations and triggers carrier bookings / tracking.
- Message Broker decouples long-running transit events (GPS, border events, PSW callbacks) from request-response flows.
- DB stores authoritative records and immutable audit logs for customs decisions.
