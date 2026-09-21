"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet as WalletIcon, ArrowDownToLine, Users } from "lucide-react";
import { getAdminTransactions, getCustomers, ApiRequestError } from "@/lib/api";
import type { Transaction, Customer } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { TransactionStatusBadge } from "@/components/status-badge";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatDate, formatNaira, formatCompactNaira } from "@/lib/utils";

export default function WalletsPage() {
  const [fundings, setFundings] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [txns, custs] = await Promise.all([getAdminTransactions(), getCustomers()]);
      setFundings(txns.data.filter((t) => t.category === "wallet-funding"));
      setCustomers(custs.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load wallets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalBalance = useMemo(
    () => customers.reduce((sum, c) => sum + (c.walletBalance || 0), 0),
    [customers]
  );
  const totalFunded = useMemo(
    () =>
      fundings.filter((t) => t.status === "success").reduce((sum, t) => sum + t.amount, 0),
    [fundings]
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Wallets</h1>
        <p className="mt-1 text-sm text-ink-faint">Customer balances and Paystack funding activity</p>
      </div>

      {loading && <LoadingState label="Loading wallets…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total wallet balance" value={formatCompactNaira(totalBalance)} icon={WalletIcon} tone="brand" />
            <StatCard label="Total funded (success)" value={formatCompactNaira(totalFunded)} icon={ArrowDownToLine} tone="good" />
            <StatCard label="Wallets" value={customers.length} icon={Users} />
          </div>

          <div className="rounded-2xl border border-line bg-surface shadow-card">
            <div className="border-b border-line p-4">
              <h2 className="font-display text-base font-semibold text-ink">Funding activity</h2>
            </div>

            {fundings.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={WalletIcon} title="No funding activity yet" description="Wallet top-ups via Paystack will appear here once customers fund their wallets." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Balance after</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundings.map((t) => (
                      <tr key={t.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                        <td className="px-4 py-3 font-mono text-xs text-ink-muted">{t.reference}</td>
                        <td className="px-4 py-3 text-ink">{t.customerName || "—"}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatNaira(t.amount)}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatNaira(t.balanceAfter)}</td>
                        <td className="px-4 py-3">
                          <TransactionStatusBadge status={t.status} />
                        </td>
                        <td className="px-4 py-3 text-ink-muted">{formatDate(t.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
