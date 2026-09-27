import { apiFetch, unwrapList } from "@/lib/api-client";

// --- Buy direction (admin-sourced stock) ---
// Response shape for GET brands/stock isn't in the doc — only the POST/PUT
// request bodies are. Fields below are inferred from those bodies; confirm
// against a real response and adjust.

export interface GiftCardBrand {
  id: string;
  name: string;
  buyEnabled: boolean;
  status?: string; // settable via PUT, exact values undocumented
}

export interface GiftCardStockItem {
  id: string;
  brandId: string;
  denominationAmount: number;
  price: number;
  totalCount: number; // GUESS — not in doc
  availableCount: number; // GUESS — not in doc
  createdAt: string; // GUESS — not in doc
}

// --- Sell direction (Sogo Africa, read-only) ---
// Doc only says "...trade fields..., customerName, customerEmail" — the
// rest here is a reasonable guess, not confirmed.
export interface GiftCardSellTrade {
  id: string;
  brandName: string;
  denominationAmount: number;
  payoutAmount: number; // GUESS
  status: "pending" | "success" | "failed" | string; // GUESS at exact values
  customerName: string;
  customerEmail: string;
  createdAt: string; // GUESS
}

export const adminGiftCardsApi = {
  async listBrands(): Promise<GiftCardBrand[]> {
    const res = await apiFetch<{ data: GiftCardBrand[] }>("/api/v1/admin/giftcards/brands", {
      auth: "admin",
    });
    return unwrapList(res);
  },

  // super_admin only
  async createBrand(brand: { id: string; name: string; buyEnabled?: boolean }): Promise<void> {
    await apiFetch("/api/v1/admin/giftcards/brands", {
      method: "POST",
      auth: "admin",
      body: brand,
    });
  },

  // super_admin only
  async updateBrand(id: string, patch: { buyEnabled?: boolean; status?: string }): Promise<void> {
    await apiFetch(`/api/v1/admin/giftcards/brands/${id}`, {
      method: "PUT",
      auth: "admin",
      body: patch,
    });
  },

  async listStock(brandId?: string): Promise<GiftCardStockItem[]> {
    const res = await apiFetch<{ data: GiftCardStockItem[] }>("/api/v1/admin/giftcards/stock", {
      auth: "admin",
      query: { brand_id: brandId },
    });
    return unwrapList(res);
  },

  async addStock(payload: {
    brandId: string;
    denominationAmount: number;
    price: number;
    items: { code: string; pin?: string }[];
  }): Promise<void> {
    await apiFetch("/api/v1/admin/giftcards/stock", {
      method: "POST",
      auth: "admin",
      body: payload,
    });
  },

  // Oversight only — there is nothing to action, Sogo's webhook already
  // resolved each trade one way or the other.
  async listSellTrades(status?: string): Promise<GiftCardSellTrade[]> {
    const res = await apiFetch<{ data: GiftCardSellTrade[] }>("/api/v1/admin/giftcards/sell-trades", {
      auth: "admin",
      query: { status },
    });
    return unwrapList(res);
  },
};