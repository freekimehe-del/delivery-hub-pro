import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

export interface PSWClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface GoodsDeclarationPayload {
  manifestNumber: string;
  shipper: string;
  consignee: string;
  items: Array<{ hsCode: string; description: string; quantity: number; value: number }>;
}

export class PSWGateway {
  private opts: PSWClientOptions;
  private client: AxiosInstance;

  constructor(opts: PSWClientOptions) {
    this.opts = opts;
    const baseURL = opts.baseUrl || process.env.PSW_BASE_URL || "";
    this.client = axios.create({ baseURL, timeout: opts.timeoutMs || 10000 });

    // Attach API key if provided (supports Authorization Bearer or x-api-key)
    this.client.interceptors.request.use((cfg) => {
      const key = this.opts.apiKey || process.env.PSW_API_KEY;
      if (key) {
        // prefer Bearer
        cfg.headers = cfg.headers || {};
        if (!cfg.headers["Authorization"]) cfg.headers["Authorization"] = `Bearer ${key}`;
        if (!cfg.headers["x-api-key"]) cfg.headers["x-api-key"] = key;
      }
      return cfg;
    });

    // Configure retry for transient failures
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // retry on network errors or 5xx
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response && error.response.status >= 500);
      },
    });
  }

  private getIdempotencyKey(provided?: string) {
    if (provided) return provided;
    return `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Submit Goods Declaration (GD)
  async submitGoodsDeclaration(
    payload: GoodsDeclarationPayload,
    opts?: { idempotencyKey?: string; path?: string }
  ): Promise<{ success: boolean; psid?: string; raw?: any }> {
    const path = opts?.path || "/goods-declarations";
    const idKey = this.getIdempotencyKey(opts?.idempotencyKey);
    try {
      const res = await this.client.post(
        path,
        payload,
        { headers: { "Idempotency-Key": idKey } }
      );
      return { success: true, psid: res.data?.psid || res.data?.id || undefined, raw: res.data };
    } catch (err: any) {
      // surface minimal details; caller can inspect error
      return { success: false, raw: err?.response?.data || { message: err?.message } };
    }
  }

  // Query PSW for a PSID or document status
  async getDocumentStatus(psid: string): Promise<{ status: string; updatedAt: string; raw?: any }> {
    try {
      const res = await this.client.get(`/documents/${encodeURIComponent(psid)}`);
      return { status: res.data?.status || "UNKNOWN", updatedAt: res.data?.updatedAt || new Date().toISOString(), raw: res.data };
    } catch (err: any) {
      return { status: "ERROR", updatedAt: new Date().toISOString(), raw: err?.response?.data || { message: err?.message } };
    }
  }

  // Submit Transit Declaration (TD)
  async submitTransitDeclaration(payload: any, opts?: { idempotencyKey?: string; path?: string }): Promise<{ success: boolean; psid?: string; raw?: any }> {
    const path = opts?.path || "/transit-declarations";
    const idKey = this.getIdempotencyKey(opts?.idempotencyKey);
    try {
      const res = await this.client.post(path, payload, { headers: { "Idempotency-Key": idKey } });
      return { success: true, psid: res.data?.psid || res.data?.id, raw: res.data };
    } catch (err: any) {
      return { success: false, raw: err?.response?.data || { message: err?.message } };
    }
  }
}

export default PSWGateway;
