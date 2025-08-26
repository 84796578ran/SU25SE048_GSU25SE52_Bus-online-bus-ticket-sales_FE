import { apiClient } from "./api";
import type { BookingRequest, Booking, ApiResponse } from "../types/api";

// Interface cho payload VNPay
export interface VNPayPayloadType {
  customerId: number;
  isReturn: boolean;
  tripSeats: {
    tripId: number;
    fromStationId: number;
    toStationId: number;
    seatIds: number[];
  }[];
  returnTripSeats: {
    tripId: number;
    fromStationId: number;
    toStationId: number;
    seatIds: number[];
  }[];
  // Optional return URL for payment gateway callbacks (frontend-provided)
  returnUrl?: string;
}

// Booking related API calls
export const bookingService = {
  // Gọi API đặt vé qua VNPay
  createReservation: async (payload: VNPayPayloadType, options?: { returnUrl?: string }): Promise<any> => {
    try {
      // If caller supplies returnUrl option but body lacks it, merge it in (some backends only read body)
      const mergedPayload: VNPayPayloadType = options?.returnUrl && !payload.returnUrl
        ? { ...payload, returnUrl: options.returnUrl }
        : payload;

      // Attach optional return URL via header as well (in case backend prefers header over body)
      const config = options?.returnUrl
        ? { headers: { "X-Return-Url": options.returnUrl } as Record<string, string> }
        : undefined;

      const response = await apiClient.post<any>("/api/Reservations", mergedPayload, config);
      return response;
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  },

  // Fetch customer's ticket history
  getCustomerTickets: async (): Promise<any> => {
    try {
      const response = await apiClient.get<any>(
        `/api/Ticket/customer/tickets`
      );
      return response;
    } catch (error) {
      console.error('Error fetching customer tickets:', error);
      throw error;
    }
  },
  // Create a new booking
  createBooking: async (bookingData: BookingRequest): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      "/bookings",
      bookingData
    );
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (bookingId: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(
      `/bookings/${bookingId}`
    );
    return response.data;
  },

  // Get booking by booking code
  getBookingByCode: async (bookingCode: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(
      `/bookings/code/${bookingCode}`
    );
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (bookingId: string): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(`/bookings/${bookingId}/cancel`, {});
  },

  // Confirm payment
  confirmPayment: async (
    bookingId: string,
    paymentData: any
  ): Promise<Booking> => {
    const response = await apiClient.post<ApiResponse<Booking>>(
      `/bookings/${bookingId}/payment`,
      paymentData
    );
    return response.data;
  },

  // Get user bookings (if user is logged in)
  getUserBookings: async (userId: string): Promise<Booking[]> => {
    const response = await apiClient.get<ApiResponse<Booking[]>>(
      `/users/${userId}/bookings`
    );
    return response.data;
  },
};

export default bookingService;
