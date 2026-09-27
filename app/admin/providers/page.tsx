"use client";

import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminProvidersApi, AdminProviderRow } from "@/lib/api/admin/providers";
import { Radio, Wifi, WifiOff } from "lucide-react";

const columns: Column<AdminProviderRow>[] = [
  { key: "name", header: "Provider", render: (p) => <span className="font-semibold">{p.name}</span> },
  { key: "type", header: "Type", render: (p) => p.type },
  { key: "status", header: "Status", render: (p) => <StatusPill status={p.status} /> },
];

export default function AdminProvidersPage() {
  const { data: providers, isLoading } = useQuery({ queryKey: ["admin-providers"], queryFn: adminProvidersApi.list });
  const { data: epinsStatus } = useQuery({ queryKey: ["admin-epins-status"], queryFn: adminProvidersApi.epinsStatus });

  const list = providers ?? [];
  const active = list.filter((p) => p.status === "active").length;
  const inactive = list.length - active;

  return (
    <AdminShell>
      <AdminPageHeading title="Bill Providers" subtitle="Third-party APIs powering every service" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total providers" value={list.length.toString()} icon={Radio} />
        <AdminStatCard label="Active" value={active.toString()} icon={Wifi} />
        <AdminStatCard label="Inactive" value={inactive.toString()} icon={WifiOff} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>ePINs connection</CardTitle>
          <CardDescription>Live check against your configured EPINS_API_KEY</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {epinsStatus === undefined ? (
            <p className="text-sm text-ink-500 dark:text-paper-200/40">Checking...</p>
          ) : epinsStatus.connected ? (
            <StatusPill status="connected" />
          ) : (
            <div>
              <StatusPill status="offline" />
              {epinsStatus.error && (
                <p className="mt-2 text-xs text-ink-500 dark:text-paper-200/40">{epinsStatus.error}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading providers...</p>
        ) : (
          <AdminDataTable columns={columns} data={list} searchKeys={["name", "type"]} searchPlaceholder="Search providers..." />
        )}
      </div>
    </AdminShell>
  );
}
