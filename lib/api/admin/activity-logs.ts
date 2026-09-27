import { apiFetch } from "@/lib/api-client";
import { PaginatedResponse } from "@/lib/api/blog";

export interface AdminActivityLogRow {
  id: string;
  user: string;
  action: string;
  device: string;
  timestamp: string;
}

export const adminActivityLogsApi = {
  async list(page: number = 1, perPage: number = 20): Promise<PaginatedResponse<AdminActivityLogRow>> {
    return apiFetch("/api/v1/admin/activity-logs", { auth: "admin", query: { page, perPage } });
  },
};