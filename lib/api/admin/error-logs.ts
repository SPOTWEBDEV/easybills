import { apiFetch } from "@/lib/api-client";

export type ErrorLevel = "fatal" | "error" | "caught";

export interface ErrorLogRow {
  id: number;
  requestId: string;
  time: string;
  level: ErrorLevel;
  message: string;
  exceptionClass: string | null;
  file: string | null;
  line: number | null;
  cause: string | null;
  method: string | null;
  url: string | null;
  statusCode: number | null;
  userId: number | null;
  resolved: boolean;
  occurrences: number;
}
export interface ErrorLogSummary {
  last24h: { fatal: number; error: number; caught: number };
  unresolvedTotal: number;
  topRepeating: { id: number; message: string; count: number }[];
}
export interface ErrorLogList {
  data: ErrorLogRow[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
  summary: ErrorLogSummary;
}
export interface ErrorLogDetail extends ErrorLogRow {
  codeSnippet: string | null;
  trace: string | null;
  ip: string | null;
  userAgent: string | null;
  requestBody: string | null; // redacted JSON string
  context: string | null; // redacted JSON string
  relatedInRequest: ErrorLogRow[];
}

// All endpoints are super admin only.
export const adminErrorLogsApi = {
  list: (q: { level?: ErrorLevel; resolved?: "0" | "1"; q?: string; from?: string; to?: string; page?: number; perPage?: number }) =>
    apiFetch<ErrorLogList>("/api/v1/admin/error-logs", { auth: "admin", query: q }),
  get: (id: number) => apiFetch<ErrorLogDetail>(`/api/v1/admin/error-logs/${id}`, { auth: "admin" }),
  resolve: (id: number, b: { resolved: boolean; allSimilar?: boolean }) =>
    apiFetch<{ success: true; updated: number }>(`/api/v1/admin/error-logs/${id}/resolve`, { method: "POST", auth: "admin", body: b }),
  clear: (b: { onlyResolved: boolean; olderThanDays: number }) =>
    apiFetch<{ deleted: number }>("/api/v1/admin/error-logs/clear", { method: "POST", auth: "admin", body: b }),
  test: () => apiFetch<{ logged: true; id: number }>("/api/v1/admin/error-logs/test", { method: "POST", auth: "admin" }),
};
