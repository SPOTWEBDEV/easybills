import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(3, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    phone: z
      .string()
      .regex(/^0\d{10}$/, "Enter a valid 11-digit Nigerian phone number."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms to continue." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const airtimeSchema = z.object({
  providerId: z.string().min(1, "Select a network."),
  phone: z.string().regex(/^0\d{10}$/, "Enter a valid 11-digit phone number."),
  amount: z.coerce.number().min(50, "Minimum amount is ₦50.").max(100000, "Maximum amount is ₦100,000."),
});
export type AirtimeInput = z.infer<typeof airtimeSchema>;

export const dataPurchaseSchema = z.object({
  providerId: z.string().min(1, "Select a network."),
  planId: z.string().min(1, "Select a data plan."),
  phone: z.string().regex(/^0\d{10}$/, "Enter a valid 11-digit phone number."),
});
export type DataPurchaseInput = z.infer<typeof dataPurchaseSchema>;

export const electricitySchema = z.object({
  providerId: z.string().min(1, "Select a distribution company."),
  meterType: z.enum(["prepaid", "postpaid"]),
  meterNumber: z.string().regex(/^\d{10,13}$/, "Enter a valid meter number."),
  amount: z.coerce.number().min(500, "Minimum payment is ₦500."),
});
export type ElectricityInput = z.infer<typeof electricitySchema>;

export const fundWalletSchema = z.object({
  amount: z.coerce.number().min(100, "Minimum funding amount is ₦100."),
  method: z.enum(["bank_transfer", "card", "virtual_account"]),
});
export type FundWalletInput = z.infer<typeof fundWalletSchema>;

export const withdrawSchema = z.object({
  amount: z.coerce.number().min(500, "Minimum withdrawal is ₦500."),
  bankName: z.string().min(2, "Select a bank."),
  accountNumber: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit account number."),
});
export type WithdrawInput = z.infer<typeof withdrawSchema>;
