import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Matches the mobile app: 8+ characters with letters and numbers, optional referral code.
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.string().email("Enter a valid email address."),
    phone: z.string().regex(/^0\d{10}$/, "Enter a valid 11-digit Nigerian phone number."),
    password: z
      .string()
      .min(8, "Use 8+ characters, with letters and numbers.")
      .regex(/[a-zA-Z]/, "Use 8+ characters, with letters and numbers.")
      .regex(/[0-9]/, "Use 8+ characters, with letters and numbers."),
    confirmPassword: z.string(),
    referralCode: z.string().trim().optional(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: "Please accept the Terms and Privacy Policy." }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const airtimeSchema = z.object({
  providerId: z.string().min(1, "Select a network."),
  phone: z.string().regex(/^0\d{10}$/, "Enter a valid 11-digit phone number."),
  amount: z.coerce.number().min(50, "Minimum amount is ₦50.").max(100000, "Maximum amount is ₦100,000."),
  transactionPin: z.string().optional(),
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
});
export type FundWalletInput = z.infer<typeof fundWalletSchema>;
