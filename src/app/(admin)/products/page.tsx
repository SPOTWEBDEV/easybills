"use client";

import { useEffect, useState } from "react";
import { Package, RefreshCw } from "lucide-react";
import { getProducts, toggleProductStatus, syncDataPlans, ApiRequestError } from "@/lib/api";
import type { Product } from "@/lib/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatNaira, cx } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggle(id: number) {
    setTogglingId(id);
    try {
      await toggleProductStatus(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't update this product.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      await syncDataPlans();
      setSyncMessage("Data plans synced successfully.");
      await load();
    } catch (err) {
      setSyncMessage(
        err instanceof ApiRequestError ? err.message : "Couldn't sync data plans."
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink-faint">Manage the catalog customers buy from</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-hover disabled:opacity-60"
        >
          <RefreshCw className={cx("h-4 w-4", syncing && "animate-spin")} />
          {syncing ? "Syncing…" : "Sync data plans"}
        </button>
      </div>

      {syncMessage && (
        <div className="mb-4 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink-muted">
          {syncMessage}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        {loading && <LoadingState label="Loading products…" />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && products.length === 0 && (
          <div className="p-4">
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Data plans stay empty until an admin runs the sync at least once."
            />
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-line-soft last:border-0 hover:bg-surface-hover">
                    <td className="px-4 py-3 text-ink">{p.name}</td>
                    <td className="px-4 py-3 capitalize text-ink-muted">{p.category}</td>
                    <td className="px-4 py-3 text-ink-muted">{p.provider}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatNaira(p.price)}</td>
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
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggle(p.id)}
                        disabled={togglingId === p.id}
                        className="rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted hover:bg-surface-hover hover:text-ink disabled:opacity-60"
                      >
                        {p.status === "active" ? "Disable" : "Enable"}
                      </button>
                    </td>
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
