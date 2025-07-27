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
}

// Booking related API calls
export const bookingService = {
  // Gọi API đặt vé qua VNPay
  createReservation: async (payload: VNPayPayloadType): Promise<any> => {
    try {
      const response = await apiClient.post<any>("/api/Reservations", payload);
      return response;
    } catch (error) {
      console.error("Error creating reservation:", error);
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
