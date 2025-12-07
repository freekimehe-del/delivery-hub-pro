# Duty & Tax Calculation Engine

Simple calculator skeleton to compute duties, taxes and bond estimates. Plug real rate tables and HS-code lookups into the `calculate` method.

Example:
```ts
import { DutyCalculator } from "@/modules/duty-engine";
const calc = new DutyCalculator();
const res = calc.calculate({ hsCode: '8703', value: 10000, countryOfOrigin: 'CN' });
```
