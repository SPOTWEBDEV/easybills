"use client";

import { useState } from "react";
import { cx } from "@/lib/utils";
import { BookingsPanel } from "@/components/flights/bookings-panel";
import { FxRatesPanel } from "@/components/flights/fx-rates-panel";

const TABS = [
  { id: "bookings", label: "Bookings" },
  { id: "fx-rates", label: "FX Rates & Markup" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function FlightsPage() {
  const [tab, setTab] = useState<TabId>("bookings");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Flights</h1>
        <p className="mt-1 text-sm text-ink-faint">
          Bookings made through Duffel, and the FX rates &amp; markup that price them in Naira.
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

      {tab === "bookings" && <BookingsPanel />}
      {tab === "fx-rates" && <FxRatesPanel />}
    </div>
  );
}
