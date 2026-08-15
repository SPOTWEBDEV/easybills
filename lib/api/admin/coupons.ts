import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminCouponRow {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  value: number;
  usageLimit: number;
  used: number;
  expiresAt: string;
  status: "active" | "expired" | "scheduled";
}

export const adminCouponsApi = {
  async list(): Promise<AdminCouponRow[]> {
    const res = await apiFetch<{ data: AdminCouponRow[] }>("/api/v1/admin/coupons", { auth: "admin" });
    return unwrapList(res);
  },
  async create(payload: {
    code: string;
    discountType: "percentage" | "fixed";
    value: number;
    usageLimit: number;
    expiresAt: string;
  }): Promise<{ id: string }> {
    return apiFetch("/api/v1/admin/coupons", { method: "POST", auth: "admin", body: payload });
  },
};
