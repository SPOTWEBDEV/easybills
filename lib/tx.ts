import type { TransactionCategory } from "@/lib/types";
export const isCreditCategory = (c: TransactionCategory) => c === "wallet-funding";
