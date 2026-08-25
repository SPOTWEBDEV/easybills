import { apiFetch } from "@/lib/api-client";
import { PaginatedResponse } from "@/lib/api/blog";

export interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  async list(page: number = 1, perPage: number = 20): Promise<PaginatedResponse<NotificationRow>> {
    return apiFetch("/api/v1/notifications", { query: { page, perPage } });
  },
  async unreadCount(): Promise<{ count: number }> {
    return apiFetch("/api/v1/notifications/unread-count");
  },
  async markRead(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/notifications/${id}/read`, { method: "POST" });
  },
  async markAllRead(): Promise<{ success: boolean; updated: number }> {
    return apiFetch("/api/v1/notifications/read-all", { method: "POST" });
  },
};