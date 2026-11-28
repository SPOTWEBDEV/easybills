"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Radio, Wifi, WifiOff } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { StatusPill } from "@/components/admin/status-pill";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminProvidersApi, AdminProviderRow } from "@/lib/api/admin/providers";
import { formatNaira } from "@/lib/utils";

// Gift cards stop working when this wallet runs dry, so warn before that happens. Adjust to taste.
const LOW_GIFTCARD_BALANCE = 100;

const columns: Column<AdminProviderRow>[] = [
  { key: "name", header: "Provider", render: (p) => <span className="font-semibold">{p.name}</span> },
  { key: "type", header: "Type", render: (p) => <span className="capitalize">{p.type}</span> },
  { key: "status", header: "Status", render: (p) => <StatusPill status={p.status} /> },
];

// The ePINs reply shape isn't documented beyond "raw includes its balance": look for a balance field defensively.
function findBalance(raw: unknown, depth = 0): number | null {
  if (!raw || typeof raw !== "object" || depth > 3) return null;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (/balance/i.test(k)) {
      const n = typeof v === "string" ? Number(v.replace(/[^\d.-]/g, "")) : v;
      if (typeof n === "number" && Number.isFinite(n)) return n;
    }
    if (v && typeof v === "object") { const found = findBalance(v, depth + 1); if (found !== null) return found; }
  }
  return null;
}

export default function AdminProvidersPage() {
  const { data: providers, isLoading } = useQuery({ queryKey: ["admin-providers"], queryFn: adminProvidersApi.list });
  const { data: epins, isLoading: epinsLoading } = useQuery({ queryKey: ["admin-epins-status"], queryFn: adminProvidersApi.epinsStatus });
  const { data: gift, isLoading: giftLoading, isError: giftError } = useQuery({ queryKey: ["admin-reloadly-balance"], queryFn: adminProvidersApi.reloadlyBalance });

  const list = providers ?? [];
  const active = list.filter((p) => p.status === "active").length;
  const epinsBalance = epins?.connected ? findBalance(epins.raw) : null;
  const giftLow = typeof gift?.balance === "number" && gift.balance < LOW_GIFTCARD_BALANCE;

  return (
    <AdminShell>
      <AdminPageHeading title="Bill Providers" subtitle="Provider health and the third-party APIs powering every service" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminStatCard label="Total providers" value={list.length.toString()} icon={Radio} />
        <AdminStatCard label="Active" value={active.toString()} icon={Wifi} />
        <AdminStatCard label="Inactive" value={(list.length - active).toString()} icon={WifiOff} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ePINs (airtime, data, bills)</CardTitle>
            <CardDescription>Live connection check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-3">
            {epinsLoading ? <p className="text-sm text-ink-500 dark:text-paper-200/40">Checking...</p>
              : epins?.connected ? (
                <>
                  <StatusPill status="connected" />
                  <p className="font-display text-2xl font-bold">{epinsBalance !== null ? formatNaira(epinsBalance) : "Balance not reported"}</p>
                  <p className="text-xs text-ink-500 dark:text-paper-200/40">Provider wallet balance</p>
                </>
              ) : (
                <>
                  <StatusPill status="offline" />
                  {epins?.error && <p className="text-xs text-ink-500 dark:text-paper-200/40">{epins.error}</p>}
                </>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gift card wallet</CardTitle>
            <CardDescription>When this runs dry, gift card purchases fail</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-3">
            {giftLoading ? <p className="text-sm text-ink-500 dark:text-paper-200/40">Checking...</p>
              : giftError || gift?.error || typeof gift?.balance !== "number" ? (
                <>
                  <StatusPill status="offline" />
                  <p className="text-xs text-ink-500 dark:text-paper-200/40">{gift?.error ?? "Couldn't read the balance."}</p>
                </>
              ) : (
                <>
                  <p className="font-display text-2xl font-bold">{gift.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-semibold text-ink-500">{gift.currencyCode ?? ""}</span></p>
                  {giftLow && (
                    <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Balance is low. Top up the gift card wallet before purchases start failing.
                    </div>
                  )}
                </>
              )}
          </CardContent>
        </Card>
      </div>

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
