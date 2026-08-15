export type TransactionStatus = "success" | "pending" | "failed";

export type TransactionCategory =
  | "airtime"
  | "data"
  | "electricity"
  | "cable"
  | "water"
  | "exam-pin"
  | "wallet-funding"
  | "withdrawal"
  | "betting";

export interface Transaction {
  id: string;
  reference: string;
  category: TransactionCategory;
  title: string;
  subtitle: string;
  amount: number;
  fee: number;
  status: TransactionStatus;
  date: string; // ISO
  provider?: string;
  recipient?: string;
  balanceAfter?: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarInitials: string;
  kycStatus: "unverified" | "pending" | "verified";
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  createdAt: string;
}

export interface Wallet {
  balance: number;
  cashback: number;
  currency: "NGN";
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export interface NetworkProvider {
  id: string;
  name: string;
  color: string;
  logoInitial: string;
}

export interface DataPlan {
  id: string;
  providerId: string;
  label: string;
  size: string;
  validity: string;
  price: number;
  costPrice: number;
}

export interface ElectricityProvider {
  id: string;
  name: string;
  region: string;
}

export interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon: string;
  bg: string;
}
