# PSW Integration Gateway

Simple PSW (Pakistan Single Window) gateway skeleton. Provides methods to submit GD/TD, query PSID and handle asynchronous callbacks. This is a stub — replace HTTP client and auth with real implementation.

Example usage:
```ts
import { PSWGateway } from "@/modules/psw-gateway";
const gw = new PSWGateway({ baseUrl: "https://psw.example/api", apiKey: "xxx" });
await gw.submitGoodsDeclaration({ /* payload */ });
```
