import { apiClient } from './api';
import type { 
  TripSearchParams, 
  TripSearchResult, 
  BusTrip, 
  ApiResponse 
} from '../types/api';

// Bus trip related API calls
export const tripService = {
  // Search for bus trips
  searchTrips: async (params: TripSearchParams): Promise<TripSearchResult> => {
    const queryParams = new URLSearchParams({
      from: params.from,
      to: params.to,
      departureDate: params.departureDate,
      passengerCount: params.passengerCount.toString(),
      ...(params.busType && { busType: params.busType }),
      ...(params.priceRange && { 
        minPrice: params.priceRange.min.toString(),
        maxPrice: params.priceRange.max.toString()
      }),
    });

    const response = await apiClient.get<ApiResponse<TripSearchResult>>(
      `/trips/search?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get trip details by ID
  getTripById: async (tripId: string): Promise<BusTrip> => {
    const response = await apiClient.get<ApiResponse<BusTrip>>(`/trips/${tripId}`);
    return response.data;
  },

  // Get available seats for a trip
  getAvailableSeats: async (tripId: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/trips/${tripId}/seats`);
    return response.data;
  },

  // Get popular routes
  getPopularRoutes: async () => {
    const response = await apiClient.get<ApiResponse<any>>('/trips/popular-routes');
    return response.data;
  },
};

export default tripService;
