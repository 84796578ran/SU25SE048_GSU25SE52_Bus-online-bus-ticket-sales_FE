import { useState } from 'react';
import { bookingService } from '../services';
import type { BookingRequest, Booking } from '../services';

// Custom hook for booking management
export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const createBooking = async (bookingData: BookingRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newBooking = await bookingService.createBooking(bookingData);
      setBooking(newBooking);
      return newBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBookingByCode = async (bookingCode: string) => {
    try {
      setLoading(true);
      setError(null);
      const foundBooking = await bookingService.getBookingByCode(bookingCode);
      setBooking(foundBooking);
      return foundBooking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking not found');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      await bookingService.cancelBooking(bookingId);
      if (booking && booking.id === bookingId) {
        setBooking({ ...booking, status: 'cancelled' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    booking,
    createBooking,
    getBookingByCode,
    cancelBooking,
  };
};
