"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users, ShieldCheck, ShieldQuestion, UserX } from "lucide-react";
import { getCustomers, ApiRequestError } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { KycBadge, AccountStatusBadge } from "@/components/status-badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load customers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(
    () => ({
      total: customers.length,
      verified: customers.filter((c) => c.kycStatus === "verified").length,
      pending: customers.filter((c) => c.kycStatus === "unverified" || c.kycStatus === "pending").length,
      suspended: customers.filter((c) => c.status === "suspended").length,
    }),
    [customers]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return customers;
    const q = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, query]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Customers</h1>
        <p className="mt-1 text-sm text-ink-faint">Manage every user registered on EasyBills</p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total customers" value={counts.total} icon={Users} />
        <StatCard label="KYC verified" value={counts.verified} icon={ShieldCheck} tone="good" />
        <StatCard label="KYC pending" value={counts.pending} icon={ShieldQuestion} tone="brand" />
        <StatCard label="Suspended" value={counts.suspended} icon={UserX} tone="bad" />
      </div>

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        <div className="border-b border-line p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers…"
              className="w-full rounded-lg border border-line bg-base py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {loading && <LoadingState label="Loading customers…" />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && filtered.length === 0 && (
          <div className="p-4">
            <EmptyState icon={Users} title="No customers found" description="Try a different search, or check back once new users sign up." />
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">KYC</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3">
                      <Link href={`/customers/${c.id}`} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500/15 text-xs font-semibold text-brand-400">
                          {c.avatarInitials}
                        </span>
                        <span>
                          <span className="block font-medium text-ink">{c.fullName}</span>
                          <span className="block text-xs text-ink-faint">{c.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{c.phone}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatNaira(c.balance ?? 0)}</td>
                    <td className="px-4 py-3 text-ink-muted">{c.tier}</td>
                    <td className="px-4 py-3">
                      <KycBadge status={c.kycStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <AccountStatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
