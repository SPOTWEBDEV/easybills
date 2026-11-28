// Formatting helpers for non-NGN money and dates. NGN stays with formatNaira in lib/utils.
export function formatMoney(amount: number | null | undefined, currency = "USD"): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return "";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}
export const formatUsd = (n: number | null | undefined) => formatMoney(n, "USD");

// Server dates are "YYYY-MM-DD HH:MM:SS"; flight times are ISO 8601.
function toDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}
export function formatDateTime(s?: string | null): string {
  const d = toDate(s);
  return d ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : s ?? "";
}
export function formatDate(s?: string | null): string {
  const d = toDate(s);
  return d ? d.toLocaleDateString(undefined, { dateStyle: "medium" }) : s ?? "";
}
export function daysUntil(s?: string | null): number | null {
  const d = toDate(s);
  return d ? (d.getTime() - Date.now()) / 86_400_000 : null;
}
export function formatDuration(min?: number | null): string {
  if (!min) return "";
  const h = Math.floor(min / 60), m = min % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}
