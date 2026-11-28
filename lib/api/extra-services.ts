// API layer for: gift cards, virtual numbers, virtual USD cards, tours, flights.
// Paths and shapes follow the EasyBills API doc (sections 8-12). Same style as lib/api/dashboard.ts.
import { apiFetch, unwrapList } from "@/lib/api-client";
import type { Transaction } from "@/lib/types";

const V1 = "/api/v1";
type Tx = { transaction: Transaction };

/** A 202 body. A pending purchase is NOT an error: never show "failed", never let the user resubmit. */
export type Pending = { status: "pending"; message?: string; reference?: string; orderId?: number };
export function isPending(r: unknown): r is Pending {
  return !!r && typeof r === "object" && (r as { status?: unknown }).status === "pending";
}

function post<T>(path: string, body?: unknown) {
  return apiFetch<T>(`${V1}${path}`, { method: "POST", body });
}

/* ------------------------------ Gift cards ------------------------------ */
export type GiftProduct = {
  id: number; name: string; brand: string; country: string; logo: string | null;
  type: "fixed" | "range"; currency: string; min: number | null; max: number | null;
  denominations: number[] | null; redeemInstruction: string | null;
};
export type GiftCode = { code: string | null; pin: string | null; redemptionUrl: string | null };
export type GiftBuyResult = Tx & { orderId: number; codes: GiftCode[] | null };
export type GiftOrder = {
  id: number; reference: string; productName: string; amount: number; currency: string;
  pricePaid: number; status: "pending" | "success" | "failed"; codesAvailable: boolean; createdAt: string;
};
export const giftcardsApi = {
  /** `page` is ZERO-based. */
  products: async (q: { country?: string; q?: string; page?: number; size?: number }): Promise<GiftProduct[]> =>
    unwrapList(await apiFetch<{ data: GiftProduct[] }>(`${V1}/services/giftcards/reloadly/products`, { auth: "none", query: q })),
  quote: (productId: number, amount: number) =>
    apiFetch<{ productId: number; amount: number; price: number; currency: string }>(
      `${V1}/services/giftcards/reloadly/quote`, { auth: "none", query: { productId, amount } }),
  buy: (b: { productId: number; amount: number; transactionPin?: string }) =>
    post<GiftBuyResult | Pending>("/services/giftcards/reloadly/buy", b),
  orders: async (): Promise<GiftOrder[]> =>
    unwrapList(await apiFetch<{ data: GiftOrder[] }>(`${V1}/giftcards/reloadly/orders`)),
  reveal: (id: number, transactionPin?: string) =>
    post<{ codes: GiftCode[] }>(`/giftcards/reloadly/orders/${id}/reveal`, { transactionPin }),
};

/* ---------------------------- Virtual numbers ---------------------------- */
export type AvailableNumber = {
  phoneNumber: string; friendlyName: string; locality?: string | null; region?: string | null;
  capabilities?: { SMS?: boolean; voice?: boolean; MMS?: boolean };
};
export type OwnedNumber = {
  id: number; phoneNumber: string; country: string; type: string;
  monthlyPrice: number; renewsAt: string; createdAt: string;
};
export type NumberMessage = { id: number; from: string; body: string; receivedAt: string };
export const numbersApi = {
  countries: () => apiFetch<{ data: string[]; types: string[] }>(`${V1}/services/numbers/countries`, { auth: "none" }),
  search: (q: { country: string; type: string; areaCode?: string; contains?: string }) =>
    apiFetch<{ monthlyPrice: number; currency: string; data: AvailableNumber[] }>(`${V1}/services/numbers/search`, { query: q }),
  buy: (b: { phoneNumber: string; country: string; type: string; transactionPin?: string }) =>
    post<(Tx & { number: OwnedNumber }) | Pending>("/services/numbers/buy", b),
  list: async (): Promise<OwnedNumber[]> => unwrapList(await apiFetch<{ data: OwnedNumber[] }>(`${V1}/numbers`)),
  messages: async (id: string | number): Promise<NumberMessage[]> =>
    unwrapList(await apiFetch<{ data: NumberMessage[] }>(`${V1}/numbers/${id}/messages`)),
  release: (id: string | number) => post<{ success: true }>(`/numbers/${id}/release`),
};

/* ---------------------------- Virtual USD cards ---------------------------- */
export type CardholderStatus = "none" | "pending" | "verified" | "failed" | "manual_review";
export type Cardholder = {
  status: CardholderStatus; reason: string | null; issueFeeUsd: number;
  limits: { limitUsd: number; minFundingUsd: number }[];
};
export type CardSummary = { id: number; limitUsd: number; status: "active" | "frozen"; createdAt: string };
export type CardDetail = {
  id: number; brand: string; last4: string; currency: string; balance: number;
  availableBalance: number; isActive: boolean; limitUsd: number;
};
export type CardSecrets = {
  cardNumber: string; cvv: string; expiryMonth: string | number; expiryYear: string | number;
  cardName: string; billingAddress?: unknown;
};
export type CardTx = { type: string; amount: number; currency: string; description: string; merchant: string | null; date: string };
export type CardQuote = { amountUsd: number; issueFeeUsd: number; totalUsd: number; priceNgn: number; currency: string };
export const cardsApi = {
  cardholder: () => apiFetch<Cardholder>(`${V1}/cards/cardholder`),
  /** multipart/form-data: bvn, address, city, state, postalCode, houseNo, selfie (file). */
  submitCardholder: (form: FormData) =>
    apiFetch<{ status: string; message?: string }>(`${V1}/cards/cardholder`, { method: "POST", body: form }),
  quote: (q: { type: "create" | "fund"; amountUsd: number }) => apiFetch<CardQuote>(`${V1}/cards/quote`, { query: q }),
  create: (b: { limit: number; fundingUsd: number; cardPin: string; transactionPin?: string }) =>
    post<(Tx & { card: { id: number; limitUsd: number; status: string; createdAt: string } }) | Pending>("/cards", b),
  list: async (): Promise<CardSummary[]> => unwrapList(await apiFetch<{ data: CardSummary[] }>(`${V1}/cards`)),
  get: (id: string | number) => apiFetch<CardDetail>(`${V1}/cards/${id}`),
  reveal: (id: string | number, transactionPin?: string) => post<CardSecrets>(`/cards/${id}/reveal`, { transactionPin }),
  fund: (id: string | number, b: { amountUsd: number; transactionPin?: string }) => post<Pending>(`/cards/${id}/fund`, b),
  freeze: (id: string | number) => post<{ success: true; status: string }>(`/cards/${id}/freeze`),
  unfreeze: (id: string | number) => post<{ success: true; status: string }>(`/cards/${id}/unfreeze`),
  transactions: async (id: string | number, page = 1): Promise<CardTx[]> =>
    unwrapList(await apiFetch<{ data: CardTx[] }>(`${V1}/cards/${id}/transactions`, { query: { page } })),
};

/* --------------------------------- Tours --------------------------------- */
export type Destination = { id: string; name: string; type: string };
export type TourSummary = {
  code: string; title: string; description?: string | null; image?: string | null; rating?: number | null;
  reviewCount?: number | null; durationMinutes?: number | null; fromPrice?: number | null;
  currency?: string | null; bookingUrl?: string | null;
};
export type TourDetail = TourSummary & {
  inclusions?: unknown; exclusions?: unknown; additionalInfo?: unknown; cancellationPolicy?: unknown; images?: string[] | null;
};
export const toursApi = {
  destinations: async (q: string): Promise<Destination[]> =>
    unwrapList(await apiFetch<{ data: Destination[] }>(`${V1}/services/tours/destinations`, { auth: "none", query: { q } })),
  search: (q: { destinationId?: string; q?: string; sort?: string; page?: number; count?: number }) =>
    apiFetch<{ data: TourSummary[]; total: number; page: number }>(`${V1}/services/tours/search`, { auth: "none", query: q }),
  product: (code: string) =>
    apiFetch<TourDetail>(`${V1}/services/tours/products/${encodeURIComponent(code)}`, { auth: "none" }),
};

/* -------------------------------- Flights -------------------------------- */
export type FlightSegment = {
  airline?: string; flightNumber?: string; origin: string; destination: string; departureAt: string; arrivalAt: string;
};
export type FlightSlice = {
  origin: string; destination: string; departureAt: string; arrivalAt: string; stops: number; segments?: FlightSegment[];
};
export type FlightOffer = {
  id: string; airline: string; airlineLogoUrl?: string | null; price: number; currency: string;
  passengerCount: number; expiresAt?: string | null; slices: FlightSlice[];
};
export type SearchPassenger = { id: string; type: string | null; age: number | null };
export type FlightSearchInput = {
  origin: string; destination: string; departureDate: string; returnDate?: string; cabinClass?: string;
  passengers: { adults: number; children: number[]; infants: number };
};
export type FlightSearchResult = { offerRequestId: string; passengers: SearchPassenger[]; offers: FlightOffer[] };
export type BookPassenger = {
  duffelPassengerId: string; title: string; gender: string; givenName: string; familyName: string;
  bornOn: string; email: string; phone: string; responsibleForInfantId?: string;
};
export type Booking = {
  id: number; bookingReference: string; origin: string; destination: string; departureAt: string;
  returnAt?: string | null; passengerCount: number; amountPaid: number;
  status: "confirmed" | "cancelled" | "failed"; refundAmount?: number | null; createdAt: string;
};
export type BookingDetail = Booking & {
  passengers?: Record<string, unknown>[]; documents?: { type: string; uniqueIdentifier: string }[];
};
export const flightsApi = {
  search: (b: FlightSearchInput) => post<FlightSearchResult>("/services/flights/search", b),
  offer: (id: string) => apiFetch<FlightOffer>(`${V1}/services/flights/offers/${encodeURIComponent(id)}`),
  book: (b: { offerId: string; passengers: BookPassenger[]; transactionPin?: string }) =>
    post<(Tx & { booking: Booking }) | Pending>("/services/flights/book", b),
  bookings: async (): Promise<Booking[]> => unwrapList(await apiFetch<{ data: Booking[] }>(`${V1}/flights/bookings`)),
  booking: (id: string | number) => apiFetch<BookingDetail>(`${V1}/flights/bookings/${id}`),
  cancel: (id: string | number) => post<{ success: true; refundAmount: number }>(`/flights/bookings/${id}/cancel`),
};
