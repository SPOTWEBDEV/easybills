"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { adminNavItemsApi } from "@/lib/api/admin/nav-items";

export default function AdminNavigationSettingsPage() {
  const queryClient = useQueryClient();
  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-nav-items"],
    queryFn: adminNavItemsApi.list,
  });

  const groups = Array.from(new Set((items ?? []).map((i) => i.group)));

  const handleToggle = async (id: string, visible: boolean) => {
    try {
      await adminNavItemsApi.setVisible(id, visible);
      queryClient.invalidateQueries({ queryKey: ["admin-nav-items"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update this item.");
    }
  };

  return (
    <AdminShell>
      <AdminPageHeading
        title="Navigation"
        subtitle="Control which sections appear in the admin sidebar — changes apply instantly for every admin"
      />

      {isLoading ? (
        <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading...</p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group} className="overflow-hidden p-0">
              <div className="border-b border-ink-100 dark:border-ink-700 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">
                  {group}
                </p>
              </div>
              <div className="divide-y divide-ink-100 dark:divide-ink-700">
                {(items ?? [])
                  .filter((i) => i.group === group)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-3.5">
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-ink-500 dark:text-paper-200/40">{item.href}</p>
                      </div>
                      <Switch
                        checked={item.visible}
                        onCheckedChange={(checked) => handleToggle(item.id, checked)}
                      />
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}