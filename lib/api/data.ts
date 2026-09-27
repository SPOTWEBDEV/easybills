import { apiFetch, unwrapList } from "@/lib/api-client";
import { DataPlan, NetworkProvider, Transaction } from "@/lib/types";

export interface DataPurchasePayload {
  providerId: string;
  planId: string;
  phone: string;
}

export const dataApi = {
  async getProviders(): Promise<NetworkProvider[]> {
    const res = await apiFetch<{ data: NetworkProvider[] }>("/api/v1/services/data/providers", { auth: "none" });
    return unwrapList(res);
  },

  async getPlans(providerId: string): Promise<DataPlan[]> {
    const res = await apiFetch<{ data: DataPlan[] }>("/api/v1/services/data/plans", {
      auth: "none",
      query: { provider_id: providerId },
    });
    return unwrapList(res);
  },

  async purchase(payload: DataPurchasePayload): Promise<{ transaction: Transaction }> {
    return apiFetch("/api/v1/services/data/purchase", {
      method: "POST",
      body: payload,
    });
  },
};
