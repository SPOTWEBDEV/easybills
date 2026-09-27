import { apiFetch } from "@/lib/api-client";

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  author: string;
  excerpt: string;
  publishedAt: string | null;
  views: number;
}

export interface BlogPostDetail {
  id: string;
  title: string;
  slug: string;
  author: string;
  content: string;
  publishedAt: string | null;
  views: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

export const blogApi = {
  async list(page: number = 1, perPage: number = 9): Promise<PaginatedResponse<BlogPostSummary>> {
    return apiFetch("/api/v1/blog", { auth: "none", query: { page, perPage } });
  },
  async getBySlug(slug: string): Promise<BlogPostDetail> {
    return apiFetch(`/api/v1/blog/${encodeURIComponent(slug)}`, { auth: "none" });
  },
};