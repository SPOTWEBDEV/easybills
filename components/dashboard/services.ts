import {
  Smartphone, Wifi, Zap, Tv, GraduationCap, Gift, Plane, Wallet, PhoneIncoming, CreditCard, Compass, type LucideIcon,
} from "lucide-react";
import { FLAGS } from "@/lib/feature-flags";

export type Service = {
  key: string; label: string; desc: string; icon: LucideIcon;
  tint: string; // text colour
  bg: string;   // soft tinted background
  href: string;
  comingSoon?: boolean;
};

export const SERVICES: Service[] = [
  { key: "airtime", label: "Airtime", desc: "Top up any network instantly", icon: Smartphone, tint: "text-brand-500", bg: "bg-brand-500/15", href: "/dashboard/services/airtime" },
  { key: "data", label: "Data", desc: "Buy data bundles for less", icon: Wifi, tint: "text-emerald-500", bg: "bg-emerald-500/15", href: "/dashboard/services/data" },
  { key: "electricity", label: "Electricity", desc: "Pay prepaid & postpaid bills", icon: Zap, tint: "text-red-500", bg: "bg-red-500/15", href: "/dashboard/services/electricity" },
  { key: "cable", label: "Cable TV", desc: "DStv, GOtv & Startimes", icon: Tv, tint: "text-brand-500", bg: "bg-brand-500/15", href: "/dashboard/services/cable" },
  { key: "exam", label: "Exam Pins", desc: "WAEC, JAMB & NECO pins", icon: GraduationCap, tint: "text-emerald-500", bg: "bg-emerald-500/15", href: "/dashboard/services/exam-pins" },
  { key: "giftcards", label: "Gift Cards", desc: "Buy gift cards instantly", icon: Gift, tint: "text-amber-500", bg: "bg-amber-500/15", href: "/dashboard/services/gift-cards", comingSoon: !FLAGS.giftCards },
  { key: "numbers", label: "Virtual Numbers", desc: "Receive SMS & OTP codes", icon: PhoneIncoming, tint: "text-purple-500", bg: "bg-purple-500/15", href: "/dashboard/services/numbers", comingSoon: !FLAGS.numbers },
  { key: "cards", label: "USD Cards", desc: "Virtual dollar cards", icon: CreditCard, tint: "text-pink-500", bg: "bg-pink-500/15", href: "/dashboard/services/cards", comingSoon: !FLAGS.cards },
  { key: "tours", label: "Tours", desc: "Tours & activities worldwide", icon: Compass, tint: "text-teal-500", bg: "bg-teal-500/15", href: "/dashboard/services/tours", comingSoon: !FLAGS.tours },
  { key: "flights", label: "Book Flight", desc: "Search & book flights", icon: Plane, tint: "text-blue-500", bg: "bg-blue-500/15", href: "/dashboard/services/flights", comingSoon: !FLAGS.flights },
  { key: "fund", label: "Fund Wallet", desc: "Top up your EasyBills wallet", icon: Wallet, tint: "text-brand-500", bg: "bg-brand-500/15", href: "/dashboard/fund-wallet" },
];
// Home "Quick actions" = every service except Fund Wallet (it lives on the wallet card)
export const QUICK_ACTIONS = SERVICES.filter((s) => s.key !== "fund");
