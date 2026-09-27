import { apiFetch } from "@/lib/api-client";

export const securityApi = {
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return apiFetch("/api/v1/security/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  },
  async setTransactionPin(pin: string, currentPin?: string): Promise<{ success: boolean }> {
    return apiFetch("/api/v1/security/transaction-pin", {
      method: "POST",
      body: { pin, currentPin },
    });
  },
  async verifyTransactionPin(pin: string): Promise<{ valid: boolean }> {
    return apiFetch("/api/v1/security/transaction-pin/verify", {
      method: "POST",
      body: { pin },
    });
  },
  async setTwoFactor(enabled: boolean): Promise<{ success: boolean; twoFactorEnabled: boolean }> {
    return apiFetch("/api/v1/security/two-factor", {
      method: "POST",
      body: { enabled },
    });
  },
};