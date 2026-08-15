import { apiFetch, unwrapList } from "@/lib/api-client";
import { ElectricityProvider, Transaction } from "@/lib/types";

export interface MeterLookupPayload {
  providerId: string;
  meterNumber: string;
  meterType: "prepaid" | "postpaid";
}

export interface ElectricityPurchasePayload extends MeterLookupPayload {
  amount: number;
  customerName: string;
}

export const electricityApi = {
  async getProviders(): Promise<ElectricityProvider[]> {
    const res = await apiFetch<{ data: ElectricityProvider[] }>("/api/v1/services/electricity/providers", {
      auth: "none",
    });
    return unwrapList(res);
  },

  async lookupMeter(payload: MeterLookupPayload): Promise<{ customerName: string; address: string }> {
    return apiFetch("/api/v1/services/electricity/lookup", {
      method: "POST",
      body: payload,
    });
  },

  async purchase(payload: ElectricityPurchasePayload): Promise<{ transaction: Transaction; token?: string }> {
    return apiFetch("/api/v1/services/electricity/purchase", {
      method: "POST",
      body: payload,
    });
  },
};
