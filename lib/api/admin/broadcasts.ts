import { apiFetch, unwrapList } from "@/lib/api-client";

export type BroadcastChannel = "push" | "email";
export type BroadcastAudience = "all" | "new_users";

export interface BroadcastRow {
  id: number | string;
  title: string;
  body: string | null;
  channel: string;
  audience: string;
  sentTo: number;
  status: string;
  sentAt: string;
}

export const adminBroadcastsApi = {
  list: async (): Promise<BroadcastRow[]> =>
    unwrapList(await apiFetch<{ data: BroadcastRow[] }>("/api/v1/admin/notifications", { auth: "admin" })),
  /** new_users = active users who signed up in the last 30 days. sentTo = users matched, not a delivery guarantee. */
  send: (b: { title: string; body?: string; channel: BroadcastChannel; audience: BroadcastAudience }) =>
    apiFetch<{ id: number; sentTo: number }>("/api/v1/admin/notifications", { method: "POST", auth: "admin", body: b }),
};
