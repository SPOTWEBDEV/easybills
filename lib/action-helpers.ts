import type { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api-client";

type Router = ReturnType<typeof useRouter>;
const KYC_PATH = "/dashboard/profile/verification";

type Flags = { requiresKyc?: boolean; tierLimitExceeded?: boolean; requiresCardholder?: boolean; fields?: Record<string, string> };
const flagsOf = (err: unknown): Flags => ((err instanceof ApiError && err.payload && typeof err.payload === "object" ? err.payload : {}) as Flags);

/** KYC / tier-limit / card-verification errors are normal flow: send the user to the right screen, not a toast. */
export function flagRedirect(err: unknown): string | null {
  const f = flagsOf(err);
  if (f.requiresKyc || f.tierLimitExceeded) return KYC_PATH;
  if (f.requiresCardholder) return "/dashboard/services/cards";
  return null;
}

/** User-safe message. 4xx messages are written for users; raw 5xx text is never shown. */
export function friendlyError(err: unknown, opts: { purchase?: boolean } = {}): string {
  if (!(err instanceof ApiError)) return "Something went wrong. Please try again.";
  if (err.status === 429) return "Please wait a moment and try again.";
  if (err.status === 503) return "This feature is temporarily unavailable.";
  if (err.status === 502)
    return opts.purchase
      ? "The provider couldn't complete this request. Any charge has been refunded to your wallet. Please try again."
      : "Temporarily unavailable. Please try again shortly.";
  if (err.status >= 500) return `Something went wrong on our side.${err.requestId ? ` Reference: ${err.requestId}` : ""}`;
  const fields = flagsOf(err).fields;
  if (fields && typeof fields === "object" && Object.keys(fields).length) return Object.values(fields).join(" ");
  return err.message;
}

export function handleActionError(err: unknown, router: Router, setError: (m: string) => void, opts: { purchase?: boolean } = {}) {
  const to = flagRedirect(err);
  if (to) return router.push(to);
  setError(friendlyError(err, opts));
}

/** Reuses the existing payment-status screen for 202 "pending" results. */
export function goPending(router: Router, r: { message?: string }, title = "Processing") {
  const p = new URLSearchParams({ status: "pending", title, message: r.message ?? "Your request is still being processed. Please don't retry; we'll notify you when it settles." });
  router.replace(`/dashboard/payment-status?${p.toString()}`);
}
