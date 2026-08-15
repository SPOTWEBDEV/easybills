import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminDashboardStats {
  revenue: number;
  sales: number;
  transactions: number;
  activeUsers: number;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  sales: number;
}

export interface TopServiceSlice {
  name: string;
  value: number;
}

export const adminDashboardApi = {
  async stats(): Promise<AdminDashboardStats> {
    return apiFetch("/api/v1/admin/dashboard/stats", { auth: "admin" });
  },
  async revenueTrend(): Promise<RevenueTrendPoint[]> {
    const res = await apiFetch<{ data: RevenueTrendPoint[] }>("/api/v1/admin/dashboard/revenue-trend", { auth: "admin" });
    return unwrapList(res);
  },
  async topServices(): Promise<TopServiceSlice[]> {
    const res = await apiFetch<{ data: TopServiceSlice[] }>("/api/v1/admin/dashboard/top-services", { auth: "admin" });
    return unwrapList(res);
  },
};
