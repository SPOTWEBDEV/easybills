"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Plus, ListChecks } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeading } from "@/components/admin/admin-page-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminDataTable, Column } from "@/components/admin/admin-data-table";
import { adminGiftCardsApi, GiftCardBrand, GiftCardStockItem } from "@/lib/api/admin/giftcards";
import { formatDate, formatNaira } from "@/lib/utils";

export default function AdminGiftCardsPage() {
  const queryClient = useQueryClient();
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingStock, setSavingStock] = useState(false);

  const [newBrand, setNewBrand] = useState({ id: "", name: "", buyEnabled: true });
  const [newStock, setNewStock] = useState({ denominationAmount: 0, price: 0, itemsText: "" });

  const { data: brands, isLoading: brandsLoading } = useQuery({
    queryKey: ["admin-giftcard-brands"],
    queryFn: adminGiftCardsApi.listBrands,
  });

  const { data: stock, isLoading: stockLoading } = useQuery({
    queryKey: ["admin-giftcard-stock", selectedBrandId],
    queryFn: () => adminGiftCardsApi.listStock(selectedBrandId ?? undefined),
    enabled: !!selectedBrandId,
  });

  const toggleBuyEnabled = async (brand: GiftCardBrand) => {
    try {
      await adminGiftCardsApi.updateBrand(brand.id, { buyEnabled: !brand.buyEnabled });
      queryClient.invalidateQueries({ queryKey: ["admin-giftcard-brands"] });
      toast.success(`${brand.name} buy ${!brand.buyEnabled ? "enabled" : "disabled"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update brand. (super_admin only)");
    }
  };

  const handleAddBrand = async () => {
    if (!newBrand.id || !newBrand.name) {
      toast.error("Brand id and name are required.");
      return;
    }
    setSavingBrand(true);
    try {
      await adminGiftCardsApi.createBrand(newBrand);
      queryClient.invalidateQueries({ queryKey: ["admin-giftcard-brands"] });
      toast.success("Brand added");
      setShowAddBrand(false);
      setNewBrand({ id: "", name: "", buyEnabled: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add brand. (super_admin only)");
    } finally {
      setSavingBrand(false);
    }
  };

  const handleAddStock = async () => {
    if (!selectedBrandId || !newStock.itemsText.trim()) {
      toast.error("Select a brand and provide at least one card code.");
      return;
    }
    const items = newStock.itemsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [code, pin] = line.split(",").map((s) => s.trim());
        return pin ? { code, pin } : { code };
      });

    setSavingStock(true);
    try {
      await adminGiftCardsApi.addStock({
        brandId: selectedBrandId,
        denominationAmount: newStock.denominationAmount,
        price: newStock.price,
        items,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-giftcard-stock", selectedBrandId] });
      toast.success(`${items.length} card(s) added to stock`);
      setShowAddStock(false);
      setNewStock({ denominationAmount: 0, price: 0, itemsText: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add stock.");
    } finally {
      setSavingStock(false);
    }
  };

  const stockColumns: Column<GiftCardStockItem>[] = [
    { key: "denominationAmount", header: "Denomination", render: (s) => formatNaira(s.denominationAmount) },
    { key: "price", header: "Price", render: (s) => formatNaira(s.price) },
    { key: "totalCount", header: "Total", render: (s) => s.totalCount },
    { key: "availableCount", header: "Available", render: (s) => s.availableCount },
    { key: "createdAt", header: "Added", render: (s) => formatDate(s.createdAt) },
  ];

  return (
    <AdminShell>
      <AdminPageHeading
        title="Gift Cards"
        subtitle="Manage brands and buy-side stock — sell trades are oversight-only via Sogo Africa"
        action={
          <Link
            href="/admin/gift-cards/sell-trades"
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-paper-200/60 dark:hover:bg-ink-800"
          >
            <ListChecks className="h-4 w-4" />
            Sell trades
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Brands */}
        <Card className="h-fit p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Brands</h3>
            <button
              onClick={() => setShowAddBrand((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          </div>

          {showAddBrand && (
            <div className="mb-4 space-y-2 rounded-xl border border-ink-200 p-3 dark:border-ink-700">
              <Input placeholder="Brand id (e.g. amazon)" value={newBrand.id} onChange={(e) => setNewBrand((b) => ({ ...b, id: e.target.value }))} />
              <Input placeholder="Display name" value={newBrand.name} onChange={(e) => setNewBrand((b) => ({ ...b, name: e.target.value }))} />
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={newBrand.buyEnabled}
                  onChange={(e) => setNewBrand((b) => ({ ...b, buyEnabled: e.target.checked }))}
                />
                Buy enabled
              </label>
              <Button className="w-full" onClick={handleAddBrand} loading={savingBrand}>
                Save brand
              </Button>
            </div>
          )}

          {brandsLoading ? (
            <p className="text-sm text-ink-500 dark:text-paper-200/40">Loading...</p>
          ) : (
            <div className="space-y-1">
              {(brands ?? []).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrandId(brand.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedBrandId === brand.id
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "hover:bg-ink-50 dark:hover:bg-ink-800"
                  }`}
                >
                  <span>{brand.name}</span>
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBuyEnabled(brand);
                    }}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      brand.buyEnabled
                        ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                        : "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-paper-200/40"
                    }`}
                  >
                    {brand.buyEnabled ? "Buy on" : "Buy off"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Stock for selected brand */}
        <Card className="p-5">
          {!selectedBrandId ? (
            <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">
              Select a brand to view and manage its stock.
            </p>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Stock — {brands?.find((b) => b.id === selectedBrandId)?.name}
                </h3>
                <Button size="sm" onClick={() => setShowAddStock((v) => !v)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add stock
                </Button>
              </div>

              {showAddStock && (
                <div className="mb-5 space-y-3 rounded-xl border border-ink-200 p-4 dark:border-ink-700">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Denomination amount</Label>
                      <Input
                        type="number"
                        value={newStock.denominationAmount}
                        onChange={(e) => setNewStock((s) => ({ ...s, denominationAmount: Number(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={newStock.price}
                        onChange={(e) => setNewStock((s) => ({ ...s, price: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Card codes (one per line — "code" or "code,pin")</Label>
                    <textarea
                      rows={4}
                      value={newStock.itemsText}
                      onChange={(e) => setNewStock((s) => ({ ...s, itemsText: e.target.value }))}
                      className="w-full rounded-lg border border-ink-200 bg-transparent p-2.5 font-mono text-xs dark:border-ink-700"
                      placeholder={"CODE1234\nCODE5678,PIN9012"}
                    />
                  </div>
                  <Button onClick={handleAddStock} loading={savingStock}>
                    Add to stock
                  </Button>
                </div>
              )}

              {stockLoading ? (
                <p className="py-10 text-center text-sm text-ink-500 dark:text-paper-200/40">Loading stock...</p>
              ) : (
                <AdminDataTable columns={stockColumns} data={stock ?? []} pageSize={10} />
              )}
            </>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}