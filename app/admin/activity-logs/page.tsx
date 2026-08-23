"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/shared/pagination";
import { adminActivityLogsApi } from "@/lib/api/admin/activity-logs";
import { formatDate } from "@/lib/utils";

export default function AdminActivityLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity-logs", page],
    queryFn: () => adminActivityLogsApi.list(page, 20),
  });

  const rows = data?.data ?? [];

  return (
    <AdminShell>
      <AdminPageHeading
        title="Activity Logs"
        subtitle="Recent user activity across the platform — logins, purchases, and wallet funding"
      />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-700 text-left">
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">User</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">Action</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">Device</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-paper-200/40">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center text-sm text-ink-500 dark:text-paper-200/40">
                    Loading activity...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-14 text-center text-sm text-ink-500 dark:text-paper-200/40">
                    No activity recorded yet.
                  </td>
                </tr>
              ) : (
                rows.map((log) => (
                  <tr key={log.id} className="border-b border-ink-50 dark:border-ink-800/60 last:border-0 hover:bg-ink-50/60 dark:hover:bg-ink-800/40">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{log.user}</td>
                    <td className="whitespace-nowrap px-4 py-3">{log.action}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-500 dark:text-paper-200/40">{log.device}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(log.timestamp)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && (
          <div className="border-t border-ink-100 dark:border-ink-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-500 dark:text-paper-200/40">
                {data.meta.total} total {data.meta.total === 1 ? "entry" : "entries"}
              </p>
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}