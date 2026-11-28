import { apiFetch, unwrapList } from "@/lib/api-client";

export interface FxRateRow { currency: string; rateToNgn: number; updatedAt: string }

export const adminFxRatesApi = {
  list: async (): Promise<FxRateRow[]> =>
    unwrapList(await apiFetch<{ data: FxRateRow[] }>("/api/v1/admin/fx-rates", { auth: "admin" })),
  // super admin only
  update: (currency: string, rateToNgn: number) =>
    apiFetch<{ success: true }>(`/api/v1/admin/fx-rates/${encodeURIComponent(currency)}`, { method: "PUT", auth: "admin", body: { rateToNgn } }),
};
