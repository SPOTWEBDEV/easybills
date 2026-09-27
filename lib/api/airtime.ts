import { apiFetch, unwrapList } from "@/lib/api-client";
import { NetworkProvider, Transaction } from "@/lib/types";

export interface AirtimePurchasePayload {
  providerId: string;
  phone: string;
  amount: number;
}

export const airtimeApi = {
  async getProviders(): Promise<NetworkProvider[]> {
    const res = await apiFetch<{ data: NetworkProvider[] }>("/api/v1/services/airtime/providers", { auth: "none" });
    return unwrapList(res);
  },

  async purchase(payload: AirtimePurchasePayload): Promise<{ transaction: Transaction }> {
    return apiFetch("/api/v1/services/airtime/purchase", {
      method: "POST",
      body: payload,
    });
  },
};
