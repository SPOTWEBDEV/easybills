import { apiFetch } from "@/lib/api-client";
import { Transaction, Wallet } from "@/lib/types";

export interface InitializeFundingResponse {
  authorizationUrl: string;
  accessCode: string | null;
  reference: string;
}

export const walletApi = {
  async getWallet(): Promise<Wallet> {
    return apiFetch<Wallet>("/api/v1/wallet");
  },

  /**
   * Starts a real Paystack checkout. Redirect the browser to
   * `authorizationUrl` — the wallet is only credited once EasyBills'
   * backend receives and verifies Paystack's webhook, not by this call.
   */
  async initializeFunding(amount: number): Promise<InitializeFundingResponse> {
    const callbackUrl = typeof window !== "undefined" ? `${window.location.origin}/wallet/fund/callback` : undefined;
    return apiFetch<InitializeFundingResponse>("/api/v1/wallet/fund/initialize", {
      method: "POST",
      body: { amount, callbackUrl },
    });
  },

  async withdraw(payload: { amount: number; bankName: string; accountNumber: string }): Promise<{
    transaction: Transaction;
    wallet: Wallet;
  }> {
    return apiFetch("/api/v1/wallet/withdraw", {
      method: "POST",
      body: payload,
    });
  },
};
