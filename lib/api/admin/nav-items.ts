import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminNavItemRow {
  id: string;
  sectionKey: string;
  label: string;
  icon: string;
  href: string;
  group: string;
  sortOrder: number;
  visible: boolean;
}

export const adminNavItemsApi = {
  /** All items, visible + hidden — used only by the nav-settings page. */
  async list(): Promise<AdminNavItemRow[]> {
    const res = await apiFetch<{ data: AdminNavItemRow[] }>("/api/v1/admin/nav-items", { auth: "admin" });
    return unwrapList(res);
  },
  /** Visible-only, filtered server-side — this is what the sidebar calls. */
  async listVisible(): Promise<AdminNavItemRow[]> {
    const res = await apiFetch<{ data: AdminNavItemRow[] }>("/api/v1/admin/nav-items/visible", { auth: "admin" });
    return unwrapList(res);
  },
  async setVisible(id: string, visible: boolean): Promise<{ success: boolean }> {
    return apiFetch(`/api/v1/admin/nav-items/${id}`, { method: "PUT", auth: "admin", body: { visible } });
  },
};