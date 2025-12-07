# Documentation & Compliance Module

PDF generation, document templating and PSW document helpers. This skeleton provides an interface for generating and storing documents.

Example:
```ts
import { DocumentManager } from "@/modules/docs-compliance";
const dm = new DocumentManager();
const pdf = await dm.generateGoodsDeclaration({/*...*/});
```
