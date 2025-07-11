// Export all services from a single index file
export { apiClient } from './api';
export { default as tripService } from './tripService';
export { default as bookingService } from './bookingService';
export { default as dataService } from './dataService';
export { default as authService } from './authService';

// Re-export commonly used types
export type { 
  TripSearchParams, 
  TripSearchResult, 
  BusTrip, 
  Booking, 
  BookingRequest,
  Location,
  BusCompany,
  ApiResponse 
} from '../types/api';

export type { 
  LoginRequest, 
  RegisterRequest, 
  User, 
  AuthResponse 
} from './authService';
