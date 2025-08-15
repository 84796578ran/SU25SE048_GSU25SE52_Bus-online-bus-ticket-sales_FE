// Types for Bus Ticket System

// Basic types
export interface Location {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  timeTransit: number;
  note: string;
  isDeleted: boolean;
}

export interface Station {
  id: number;
  stationId: string;
  name: string;
  locationName: string;
  status: number;
  isDeleted: boolean;
}

export interface BusCompany {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalTrips: number;
}

export interface BusRoute {
  id: string;
  from: Location;
  to: Location;
  distance: number;
  estimatedDuration: string;
  price: number;
  busCompany: BusCompany;
}

export interface BusTrip {
  id: string;
  route: BusRoute;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  busType: string;
  amenities: string[];
}

export interface Seat {
  id: string;
  seatNumber: string;
  isAvailable: boolean;
  seatType: 'normal' | 'vip' | 'sleeper';
  price: number;
}

export interface Passenger {
  fullName: string;
  phone: string;
  email: string;
  idCard: string;
  dateOfBirth: string;
}

export interface BookingRequest {
  tripId: string;
  seatIds: string[];
  passengers: Passenger[];
  contactInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  paymentMethod: 'cash' | 'card' | 'wallet';
}

export interface Booking {
  id: string;
  bookingCode: string;
  trip: BusTrip;
  seats: Seat[];
  passengers: Passenger[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

// Search types
export interface TripSearchParams {
  from: string;
  to: string;
  departureDate: string;
  passengerCount: number;
  busType?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface TripSearchResult {
  trips: BusTrip[];
  total: number;
  page: number;
  limit: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
