"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CreditCard, Lock, Plus, Save } from "lucide-react";
import {
  createGiftCardBrand,
  getGiftCardBrands,
  updateGiftCardBrand,
  ApiRequestError,
} from "@/lib/api";
import type { GiftCardBrand } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { cx } from "@/lib/utils";

export function BrandsPanel() {
  const { admin } = useAuth();
  const isSuperAdmin = admin?.role === "super_admin";

  const [brands, setBrands] = useState<GiftCardBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // per-row editable state, keyed by brand id — buy + status only; the sell
  // rate/toggle moved to Sogo Africa and is no longer admin-configurable.
  const [drafts, setDrafts] = useState<Record<string, { buyEnabled: boolean; status: "active" | "inactive" }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const [showAddForm, setShowAddForm] = useState(false);
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getGiftCardBrands();
      setBrands(res.data);
      const nextDrafts: typeof drafts = {};
      for (const b of res.data) {
        nextDrafts[b.id] = { buyEnabled: b.buyEnabled, status: b.status };
      }
      setDrafts(nextDrafts);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load gift card brands.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateDraft(id: string, patch: Partial<(typeof drafts)[string]>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
  }

  async function handleSaveRow(id: string) {
    const draft = drafts[id];
    setRowError((e) => ({ ...e, [id]: "" }));
    setSavingId(id);
    try {
      await updateGiftCardBrand(id, { buyEnabled: draft.buyEnabled, status: draft.status });
      await load();
    } catch (err) {
      setRowError((e) => ({
        ...e,
        [id]: err instanceof ApiRequestError ? err.message : "Couldn't save this brand.",
      }));
    } finally {
      setSavingId(null);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    if (!newId.trim() || !newName.trim()) {
      setCreateError("Fill in an id and a name.");
      return;
    }
    setCreating(true);
    try {
      await createGiftCardBrand({ id: newId.trim(), name: newName.trim() });
      setNewId("");
      setNewName("");
      setShowAddForm(false);
      await load();
    } catch (err) {
      setCreateError(err instanceof ApiRequestError ? err.message : "Couldn't create this brand.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <LoadingState label="Loading brands…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <div className="mb-4 rounded-lg border border-line bg-base px-3 py-2.5 text-xs text-ink-faint">
        Selling is handled automatically by Sogo Africa now — there's no sell rate or sell toggle
        to set here per brand. This only controls the <span className="font-medium text-ink-muted">buy</span> direction
        (stock you've sourced yourself).
      </div>

      {!isSuperAdmin && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-line bg-base px-3 py-2 text-xs text-ink-faint">
          <Lock className="h-3.5 w-3.5" />
          Only super admins can change buy status or add brands — you can still view everything
          below.
        </div>
      )}

      {isSuperAdmin && (
        <div className="mb-4">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-hover"
            >
              <Plus className="h-4 w-4" />
              Add brand
            </button>
          ) : (
            <form onSubmit={handleCreate} className="rounded-2xl border border-line bg-surface p-5">
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-muted">
                    Brand id (slug, permanent)
                  </span>
                  <input
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    placeholder="steam"
                    className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-ink-muted">Display name</span>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Steam"
                    className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
                  />
                </label>
              </div>
              {createError && <p className="mb-3 text-xs text-bad">{createError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-brand-600 disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create brand"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-2 text-[11px] text-ink-faint">
                New brands start with buying off — flip it on once you've loaded stock.
              </p>
            </form>
          )}
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface shadow-card">
        {brands.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={CreditCard}
              title="No gift card brands yet"
              description="Add a brand above to start accepting buy requests for it."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-medium">Brand</th>
                  <th className="px-4 py-3 font-medium">Buy enabled</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {isSuperAdmin && <th className="px-4 py-3 font-medium text-right">Action</th>}
                </tr>
              </thead>
              <tbody>
                {brands.map((b) => {
                  const draft = drafts[b.id];
                  if (!draft) return null;
                  return (
                    <tr key={b.id} className="border-b border-line-soft last:border-0">
                      <td className="px-4 py-3">
                        <span className="block font-medium text-ink">{b.name}</span>
                        <span className="block font-mono text-xs text-ink-faint">{b.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          disabled={!isSuperAdmin}
                          checked={draft.buyEnabled}
                          onChange={(e) => updateDraft(b.id, { buyEnabled: e.target.checked })}
                          className="h-4 w-4 accent-brand-500 disabled:opacity-60"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          disabled={!isSuperAdmin}
                          value={draft.status}
                          onChange={(e) =>
                            updateDraft(b.id, { status: e.target.value as "active" | "inactive" })
                          }
                          className={cx(
                            "rounded-full border-0 px-2.5 py-1 text-xs font-medium capitalize focus:outline-none disabled:opacity-60",
                            draft.status === "active" ? "bg-good/15 text-good" : "bg-bad/15 text-bad"
                          )}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      {isSuperAdmin && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleSaveRow(b.id)}
                            disabled={savingId === b.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs font-medium text-ink-muted hover:bg-surface-hover hover:text-ink disabled:opacity-60"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {savingId === b.id ? "Saving…" : "Save"}
                          </button>
                          {rowError[b.id] && (
                            <p className="mt-1 text-[11px] text-bad">{rowError[b.id]}</p>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
