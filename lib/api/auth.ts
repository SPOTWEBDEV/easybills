import { apiFetch, tokenStore } from "@/lib/api-client";
import { User } from "@/lib/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginResult {
  requiresTwoFactor?: boolean;
  phone?: string;
  user?: User;
  token?: string;
}

/**
 * Calls the real easybills-backend PHP API (see NEXT_PUBLIC_API_URL in
 * .env.local). Successful login/register/verify calls store the JWT in
 * localStorage via tokenStore, which apiFetch then attaches as a Bearer
 * token to every subsequent authenticated request.
 */
export const authApi = {
    async login(payload: LoginPayload): Promise<LoginResult> {
    const res = await apiFetch<LoginResult>("/api/v1/auth/login", {
      method: "POST",
      body: payload,
      auth: "none",
    });
    if (res.token) {
      tokenStore.setUserToken(res.token);
    }
    return res;
  },

  async verifyLoginOtp(phone: string, code: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>("/api/v1/auth/verify-login-otp", {
      method: "POST",
      body: { phone, code },
      auth: "none",
    });
    tokenStore.setUserToken(res.token);
    return res;
  },

  async register(payload: RegisterPayload): Promise<{ requiresOtp: boolean; phone: string }> {
    return apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: payload,
      auth: "none",
    });
  },

  /**
   * NOTE: unlike the old mock (which only took a code), the real backend
   * needs to know which account this OTP belongs to — pass the phone number
   * captured on the register step (already available via the verify-otp
   * page's `?phone=` query param).
   */
  async verifyOtp(phone: string, code: string): Promise<AuthResponse> {
    const res = await apiFetch<AuthResponse>("/api/v1/auth/verify-otp", {
      method: "POST",
      body: { phone, code },
      auth: "none",
    });
    tokenStore.setUserToken(res.token);
    return res;
  },

  async resendOtp(phone: string): Promise<{ sent: boolean }> {
    return apiFetch("/api/v1/auth/resend-otp", {
      method: "POST",
      body: { phone },
      auth: "none",
    });
  },

  async forgotPassword(email: string): Promise<{ sent: boolean }> {
    return apiFetch("/api/v1/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: "none",
    });
  },

  async resetPassword(payload: { email: string; code: string; password: string }): Promise<{ reset: boolean }> {
    return apiFetch("/api/v1/auth/reset-password", {
      method: "POST",
      body: payload,
      auth: "none",
    });
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch<{ success: boolean }>("/api/v1/auth/logout", { method: "POST" });
      return res;
    } finally {
      tokenStore.clearUserToken();
    }
  },

  async me(): Promise<{ user: User }> {
    return apiFetch("/api/v1/auth/me");
  },
};
