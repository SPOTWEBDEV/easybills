import { apiFetch } from "@/lib/api-client";
import { PaginatedResponse } from "@/lib/api/blog";

export interface AdminBlogPostRow {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  status: "draft" | "published";
  views: number;
  publishedAt: string | null;
  updatedAt: string;
}

export const adminBlogApi = {
  async list(page: number = 1, perPage: number = 20): Promise<PaginatedResponse<AdminBlogPostRow>> {
    return apiFetch("/api/v1/admin/blog", { auth: "admin", query: { page, perPage } });
  },
  async create(payload: { title: string; author: string; content?: string; status?: string }): Promise<{ id: string }> {
    return apiFetch("/api/v1/admin/blog", { method: "POST", auth: "admin", body: payload });
  },
  async update(id: string, payload: { title: string; author: string; content?: string; status?: string }): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/admin/blog/${id}`, { method: "PUT", auth: "admin", body: payload });
  },
  async toggleStatus(id: string): Promise<{ status: string }> {
    return apiFetch(`/api/v1/admin/blog/${id}/toggle-status`, { method: "POST", auth: "admin" });
  },
  async remove(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/admin/blog/${id}`, { method: "DELETE", auth: "admin" });
  },
};