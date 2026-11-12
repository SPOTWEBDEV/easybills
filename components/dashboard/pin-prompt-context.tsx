"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { PinInput } from "./pin-input";

type Ctx = { requestPin: (errorMessage?: string) => Promise<string | null> };
const PinContext = createContext<Ctx | null>(null);
const PIN_LENGTH = 4; // ⚠️ change if your transaction PIN is longer

export function PinPromptProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [value, setValue] = useState("");
  const resolver = useRef<((v: string | null) => void) | null>(null);

  const requestPin = useCallback((msg?: string) => {
    setError(msg); setValue(""); setOpen(true);
    return new Promise<string | null>((res) => { resolver.current = res; });
  }, []);
  const close = (v: string | null) => { setOpen(false); resolver.current?.(v); resolver.current = null; };

  return (
    <PinContext.Provider value={{ requestPin }}>
      {children}
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Enter transaction PIN" className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <form
            onSubmit={(e) => { e.preventDefault(); if (value.length === PIN_LENGTH) close(value); }}
            className="w-full max-w-sm rounded-3xl border bg-[rgb(var(--bg-elevated))] p-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-500"><Lock className="h-5 w-5" /></span>
            <h2 className="mt-4 font-display text-xl font-bold">Enter your transaction PIN</h2>
            <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">Confirm this payment with your {PIN_LENGTH}-digit PIN.</p>
            <div className="mt-5"><PinInput value={value} onChange={setValue} length={PIN_LENGTH} autoFocus label="Transaction PIN" /></div>
            {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => close(null)} className="flex-1 rounded-full border py-3 text-sm font-semibold">Cancel</button>
              <button type="submit" disabled={value.length !== PIN_LENGTH} className="flex-1 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 py-3 text-sm font-bold text-white disabled:opacity-50">Confirm</button>
            </div>
          </form>
        </div>
      )}
    </PinContext.Provider>
  );
}
export const usePinPrompt = () => {
  const c = useContext(PinContext);
  if (!c) throw new Error("usePinPrompt must be used inside PinPromptProvider");
  return c;
};
