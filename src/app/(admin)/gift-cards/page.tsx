"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";
import { BrandsPanel } from "@/components/gift-cards/brands-panel";
import { StockPanel } from "@/components/gift-cards/stock-panel";
import { SalesPanel } from "@/components/gift-cards/sales-panel";

const TABS = [
  { id: "brands", label: "Brands" },
  { id: "stock", label: "Stock" },
  { id: "sales", label: "Sell Trades" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function GiftCardsPage() {
  const [tab, setTab] = useState<TabId>("brands");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Gift Cards</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Manage buy-side brands and stock. Sell trades are handled automatically by Sogo Africa.
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-line bg-surface p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-brand-500/15 text-brand-600" : "text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "brands" && <BrandsPanel />}
      {tab === "stock" && <StockPanel />}
      {tab === "sales" && <SalesPanel />}
    </div>
  );
}
