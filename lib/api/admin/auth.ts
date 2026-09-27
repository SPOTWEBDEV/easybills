import { apiFetch, tokenStore } from "@/lib/api-client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const adminAuthApi = {
  async login(email: string, password: string): Promise<{ admin: AdminUser; token: string }> {
    const res = await apiFetch<{ admin: AdminUser; token: string }>("/api/v1/admin/auth/login", {
      method: "POST",
      body: { email, password },
      auth: "none",
    });
    tokenStore.setAdminToken(res.token);
    return res;
  },

  async me(): Promise<{ admin: AdminUser }> {
    return apiFetch("/api/v1/admin/auth/me", { auth: "admin" });
  },

  logout() {
    tokenStore.clearAdminToken();
  },
};
