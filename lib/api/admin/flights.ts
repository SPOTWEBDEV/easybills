import { apiFetch, unwrapList } from "@/lib/api-client";

export interface AdminFlightBooking {
  id: number;
  bookingReference: string;
  origin: string;
  destination: string;
  departureAt: string;
  returnAt: string | null;
  passengerCount: number;
  amountPaid: number;
  status: "confirmed" | "cancelled" | "failed";
  refundAmount: number | null;
  createdAt: string;
  customerName: string;
  customerEmail: string;
}

export const adminFlightsApi = {
  list: async (status?: "all" | "confirmed" | "cancelled" | "failed"): Promise<AdminFlightBooking[]> =>
    unwrapList(await apiFetch<{ data: AdminFlightBooking[] }>("/api/v1/admin/flights/bookings", {
      auth: "admin", query: { status: status && status !== "all" ? status : undefined },
    })),
};
