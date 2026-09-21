"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Boxes, PackagePlus } from "lucide-react";
import {
  addGiftCardStock,
  getGiftCardBrands,
  getGiftCardStock,
  ApiRequestError,
} from "@/lib/api";
import type { GiftCardBrand, GiftCardStockItem } from "@/lib/types";
import { LoadingState, ErrorState, EmptyState } from "@/components/states";
import { formatNaira } from "@/lib/utils";

export function StockPanel() {
  const [brands, setBrands] = useState<GiftCardBrand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [stock, setStock] = useState<GiftCardStockItem[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingStock, setLoadingStock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [denomination, setDenomination] = useState("");
  const [price, setPrice] = useState("");
  const [codesText, setCodesText] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addResult, setAddResult] = useState<number | null>(null);

  async function loadBrands() {
    setLoadingBrands(true);
    setError(null);
    try {
      const res = await getGiftCardBrands();
      setBrands(res.data);
      if (res.data.length && !selectedBrand) setSelectedBrand(res.data[0].id);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load brands.");
    } finally {
      setLoadingBrands(false);
    }
  }

  async function loadStock(brandId: string) {
    if (!brandId) return;
    setLoadingStock(true);
    setError(null);
    try {
      const res = await getGiftCardStock(brandId);
      setStock(res.data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load stock.");
    } finally {
      setLoadingStock(false);
    }
  }

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) loadStock(selectedBrand);
  }, [selectedBrand]);

  async function handleAddStock(e: FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddResult(null);

    const denomValue = Number(denomination);
    const priceValue = Number(price);
    const items = codesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [code, pin] = line.split(",").map((s) => s.trim());
        return pin ? { code, pin } : { code };
      });

    if (!selectedBrand || Number.isNaN(denomValue) || Number.isNaN(priceValue) || items.length === 0) {
      setAddError("Pick a brand, set a denomination and price, and paste at least one code.");
      return;
    }

    setAdding(true);
    try {
      const res = await addGiftCardStock({
        brandId: selectedBrand,
        denominationAmount: denomValue,
        price: priceValue,
        items,
      });
      setAddResult(res.added);
      setDenomination("");
      setPrice("");
      setCodesText("");
      await loadStock(selectedBrand);
    } catch (err) {
      setAddError(err instanceof ApiRequestError ? err.message : "Couldn't add this stock.");
    } finally {
      setAdding(false);
    }
  }

  if (loadingBrands) return <LoadingState label="Loading brands…" />;
  if (error && brands.length === 0) return <ErrorState message={error} onRetry={loadBrands} />;

  return (
    <div>
      <div className="mb-4 max-w-xs">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-muted">Brand</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full rounded-lg border border-line bg-base px-3.5 py-2.5 text-sm text-ink focus:border-brand-500 focus:outline-none"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface shadow-card lg:col-span-2">
          <div className="border-b border-line p-4">
            <h2 className="font-display text-base font-semibold text-ink">Current inventory</h2>
          </div>
          {loadingStock ? (
            <LoadingState label="Loading stock…" />
          ) : stock.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={Boxes}
                title="No stock loaded for this brand"
                description="Add a batch of codes on the right to make this brand purchasable."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-3 font-medium">Denomination</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((s) => (
                    <tr key={s.denominationAmount} className="border-b border-line-soft last:border-0">
                      <td className="px-4 py-3 text-ink">{formatNaira(s.denominationAmount)}</td>
                      <td className="px-4 py-3 text-ink-muted">{formatNaira(s.price)}</td>
                      <td className="px-4 py-3 text-ink-muted">{s.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={handleAddStock} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
              <PackagePlus className="h-4 w-4" />
            </span>
            <h2 className="font-display text-base font-semibold text-ink">Add stock</h2>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Denomination</span>
              <input
                type="number"
                value={denomination}
                onChange={(e) => setDenomination(e.target.value)}
                placeholder="5000"
                className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-ink-muted">Price to customer</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5400"
                className="w-full rounded-lg border border-line bg-base px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
              />
            </label>
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium text-ink-muted">
              Codes (one per line — <span className="font-mono">code</span> or{" "}
              <span className="font-mono">code,pin</span>)
            </span>
            <textarea
              rows={6}
              value={codesText}
              onChange={(e) => setCodesText(e.target.value)}
              placeholder={"XXXX-YYYY-1111\nXXXX-YYYY-2222,9876"}
              className="w-full resize-none rounded-lg border border-line bg-base px-3.5 py-2.5 font-mono text-xs text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none"
            />
          </label>

          {addError && (
            <div className="mb-4 rounded-lg border border-bad/30 bg-bad/10 px-3 py-2 text-xs text-bad">
              {addError}
            </div>
          )}
          {addResult !== null && !addError && (
            <div className="mb-4 rounded-lg border border-good/30 bg-good/10 px-3 py-2 text-xs text-good">
              Added {addResult} code{addResult === 1 ? "" : "s"}. Remember to enable "Buy" for this
              brand on the Brands & Rates tab if it isn't already.
            </div>
          )}

          <button
            type="submit"
            disabled={adding}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-paper-50 transition-colors hover:bg-brand-600 disabled:opacity-60"
          >
            {adding ? "Adding…" : "Add stock"}
          </button>
        </form>
      </div>
    </div>
  );
}
