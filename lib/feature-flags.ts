// Switch features on in .env.local (NEXT_PUBLIC_FEATURE_*=true) once the backend developer confirms them.
// Each variable must be referenced literally so Next.js can inline it at build time.
const on = (v: string | undefined) => v === "true";

export const FLAGS = {
  giftCards: on(process.env.NEXT_PUBLIC_FEATURE_GIFTCARDS),
  numbers: on(process.env.NEXT_PUBLIC_FEATURE_NUMBERS),
  cards: on(process.env.NEXT_PUBLIC_FEATURE_CARDS), // on hold: provider being changed
  tours: on(process.env.NEXT_PUBLIC_FEATURE_TOURS),
  flights: on(process.env.NEXT_PUBLIC_FEATURE_FLIGHTS), // blocked: needs Tier 2 KYC
} as const;
