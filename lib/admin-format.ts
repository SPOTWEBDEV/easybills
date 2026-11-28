// Helpers for the admin dashboard. Server dates are "YYYY-MM-DD HH:MM:SS" in server time (no timezone given),
// so they are parsed as-is and only used for display / rough "how old" labels.
export function parseServerDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}
export function fmtDateTime(s?: string | null): string {
  const d = parseServerDate(s);
  return d ? d.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : s ?? "—";
}
export function ageInDays(s?: string | null): number | null {
  const d = parseServerDate(s);
  return d ? (Date.now() - d.getTime()) / 86_400_000 : null;
}
export function ageLabel(s?: string | null): string {
  const d = parseServerDate(s);
  if (!d) return "";
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}

export const SERVICE_LABELS: Record<string, string> = {
  airtime: "Airtime", data: "Data", electricity: "Electricity", cable: "Cable TV", "exam-pin": "Exam pins",
  flight: "Flights", "giftcard-reloadly": "Gift cards", "virtual-number": "Virtual numbers", "virtual-card": "Virtual USD cards",
};
export const serviceLabel = (s: string) => SERVICE_LABELS[s] ?? s.replace(/-/g, " ");
// Per the API doc these margin rows currently have no effect (the customer pays exactly the amount).
export const NOT_APPLIED_SERVICES = ["airtime", "electricity"];
// Priced from the USD rate on the FX Rates page.
export const USD_PRICED_SERVICES = ["flight", "giftcard-reloadly", "virtual-number", "virtual-card"];
