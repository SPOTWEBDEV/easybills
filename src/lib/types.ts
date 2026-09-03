export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "super_admin" | string;
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarInitials: string;
  kycStatus: "unverified" | "pending" | "verified";
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  status: "active" | "suspended";
  balance?: number;
  createdAt: string;
}

export interface CustomerDetail {
  user: Customer;
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

export interface Product {
  id: number;
  name: string;
  category: string;
  provider: string;
  price: number;
  costPrice?: number;
  status: "active" | "disabled";
}

export interface PricingRule {
  id: number;
  name: string;
  marginType: "fixed" | "percentage";
  marginValue: number;
}

export interface Provider {
  id: string;
  name: string;
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

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
  sessionExpired?: boolean;
  requiresPin?: boolean;
}
