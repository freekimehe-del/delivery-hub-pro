# Financial Settlement Module

Handles PSID lifecycle, payment reconciliation and ledger entries. This is a minimal skeleton — integrate with your bank/PSW systems.

Example:
```ts
import { FinancialSettlement } from "@/modules/financial";
const fin = new FinancialSettlement();
await fin.createPSID({ amount: 1000, currency: 'PKR' });
```
