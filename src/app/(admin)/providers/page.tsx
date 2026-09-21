"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, Radio, XCircle } from "lucide-react";
import { getEpinsStatus, getProviders, ApiRequestError } from "@/lib/api";
import type { EpinsStatus, Provider } from "@/lib/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { cx } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  network: "Network",
  electricity: "Electricity",
  cable: "Cable",
};

export default function ProvidersPage() {
  const [epins, setEpins] = useState<EpinsStatus | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProviders() {
    try {
      const res = await getProviders();
      setProviders(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load providers.");
    }
  }

  async function checkEpins() {
    setChecking(true);
    try {
      const res = await getEpinsStatus();
      setEpins(res);
    } catch (err) {
      setEpins({ connected: false, error: err instanceof ApiRequestError ? err.message : "Check failed." });
    } finally {
      setChecking(false);
    }
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    await Promise.all([loadProviders(), checkEpins()]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Providers</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Check this first when airtime/data/electricity/cable/exam-pin purchases start failing
          broadly — it isolates a connectivity or credentials issue before you dig into individual
          transactions.
        </p>
      </div>

      {loading && <LoadingState label="Checking providers…" />}
      {!loading && error && <ErrorState message={error} onRetry={loadAll} />}

      {!loading && !error && (
        <>
          <div
            className={cx(
              "mb-6 flex flex-col justify-between gap-4 rounded-2xl border p-6 shadow-card sm:flex-row sm:items-center",
              epins?.connected ? "border-good/30 bg-good/5" : "border-bad/30 bg-bad/5"
            )}
          >
            <div className="flex items-center gap-4">
              <span
                className={cx(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  epins?.connected ? "bg-good/15 text-good" : "bg-bad/15 text-bad"
                )}
              >
                {epins?.connected ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-ink">
                  ePINs {epins?.connected ? "connected" : "not connected"}
                </p>
                <p className="text-sm text-ink-faint">
                  {epins?.connected
                    ? "The ePINs account is reachable — airtime/data/electricity/cable/exam-pin issues are likely elsewhere."
                    : epins?.error || "Couldn't reach ePINs — check EPINS_API_KEY / EPINS_MODE on the backend."}
                </p>
              </div>
            </div>
            <button
              onClick={checkEpins}
              disabled={checking}
              className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-hover disabled:opacity-60 sm:self-center"
            >
              <RefreshCw className={cx("h-4 w-4", checking && "animate-spin")} />
              {checking ? "Checking…" : "Re-check"}
            </button>
          </div>

          <div className="rounded-2xl border border-line bg-surface shadow-card">
            <div className="border-b border-line p-4">
              <h2 className="font-display text-base font-semibold text-ink">All providers</h2>
            </div>
            {providers.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={Radio}
                  title="No providers found"
                  description="Network, electricity, and cable providers will show up here."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                      <th className="px-4 py-3 font-medium">Provider</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                        <td className="px-4 py-3 text-ink">{p.name}</td>
                        <td className="px-4 py-3 text-ink-muted">{TYPE_LABEL[p.type] || p.type}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cx(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                              p.status === "active" ? "bg-good/15 text-good" : "bg-bad/15 text-bad"
                            )}
                          >
                            <span className={cx("h-1.5 w-1.5 rounded-full", p.status === "active" ? "bg-good" : "bg-bad")} />
                            {p.status}
                          </span>
                        </td>
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
