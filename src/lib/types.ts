export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin" | string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
  kycStatus: "unverified" | "pending" | "verified";
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  status: "active" | "suspended";
  suspensionReason: string | null;
  joinedAt: string;
}

export interface CustomerDetailUser extends Customer {
  ninVerified: boolean;
  bvnVerified: boolean;
}

export interface CustomerDetail {
  user: CustomerDetailUser;
  wallet: { balance: number; cashback: number; currency: string };
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: number;
  reference: string;
  category: "airtime" | "data" | "electricity" | "cable" | "wallet-funding" | string;
  title: string;
  subtitle: string;
  amount: number;
  fee: number;
  status: "success" | "pending" | "failed";
  date: string;
  provider: string;
  recipient: string;
  balanceAfter: number;
  customerName?: string;
  customerEmail?: string;
  failureReason?: string | null;
}

export interface DashboardStats {
  revenue: number;
  sales: number;
  transactions: number;
  activeUsers: number;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
  sales: number;
}

export interface TopService {
  name: string;
  value: number;
}

export interface PaginatedMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ReferralTopReferrer {
  name: string;
  email: string;
  invites: number;
  conversions: number;
  earned: number;
}

export interface ReferralProgram {
  stats: {
    totalReferrals: number;
    rewardsPaidOut: number;
    conversionRate: number;
  };
  settings: {
    referrerReward: number;
    referredReward: number;
    rewardTrigger: string;
  };
  topReferrers: ReferralTopReferrer[];
}

export interface AdminBroadcast {
  id: number;
  title: string;
  body: string;
  channel: "push" | "email";
  audience: "all" | "new_users";
  sentTo: number;
  status: "sent" | "pending" | "failed" | string;
  sentAt: string;
}

// ---- Gift cards ----
// The sell direction (customer cashing in a card) moved to an automated
// Sogo Africa integration — admin no longer sets a sell rate, enables/
// disables selling per brand, or approves/rejects individual trades. The
// buy direction (admin-sourced stock) is unchanged.

export interface GiftCardBrand {
  id: string;
  name: string;
  buyEnabled: boolean;
  status: "active" | "inactive";
}

export interface GiftCardStockItem {
  denominationAmount: number;
  price: number;
  available: number;
}

// Read-only oversight of Sogo's sell-side verification — there is nothing
// for admin to action here anymore.
export interface GiftCardSellTrade {
  id: number;
  brandId: string;
  brandName: string;
  faceValueAmount: number;
  payoutAmount: number;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  customerName?: string;
  customerEmail?: string;
}

// ---- Flights ----

export interface AdminFlightBooking {
  id: number;
  bookingReference: string;
  origin: string;
  destination: string;
  departureAt: string | null;
  returnAt: string | null;
  passengerCount: number;
  amountPaid: number;
  status: "confirmed" | "cancelled" | "failed";
  refundAmount: number | null;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
}

export interface FxRate {
  currency: string;
  rateToNgn: number;
  updatedAt: string;
}

// ---- Pricing (profit margins) ----
// One row per service category: airtime, data, electricity, cable,
// exam-pin, flight, gift-card. See the Pricing page for how each category
// actually applies its margin — they're not all the same mechanism.
export interface PricingRule {
  id: number;
  service: string;
  marginType: "fixed" | "percentage";
  marginValue: number;
  updatedAt: string;
}

// ---- Providers ----

export interface Provider {
  id: string;
  name: string;
  type: "network" | "electricity" | "cable" | string;
  status: "active" | "inactive" | string;
}

export interface EpinsStatus {
  connected: boolean;
  raw?: unknown;
  error?: string;
}

// ---- KYC ----
// Tier upgrades (NIN -> Tier 2, BVN -> Tier 3) are admin-reviewed, not
// automated: a user submits, it sits pending, and an admin approves or
// declines it. The tier only ever changes at the moment of approval.

export interface KycTierLimit {
  tier: "tier1" | "tier2" | "tier3";
  maxWalletBalance: number;
  maxSingleTransaction: number;
  maxDailyTotal: number;
  updatedAt: string;
}

export interface KycApplication {
  id: number;
  type: "nin" | "bvn";
  dateOfBirth: string | null;
  status: "pending" | "approved" | "declined";
  declineReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

// The only endpoint that ever reveals the decrypted NIN/BVN — every access
// is written to the audit log.
export interface KycApplicationDetail extends KycApplication {
  idNumber: string;
  bureauSnapshot: Record<string, unknown> | null;
  accountHolder: { fullName: string; email: string; phone: string };
}

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
  sessionExpired?: boolean;
  requiresPin?: boolean;
  tierLimitExceeded?: boolean;
}
