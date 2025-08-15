// Type definitions for booking-related data structures

export interface Trip {
  id: string;
  tripId?: string;
  routeId?: string;
  fromLocation?: string;
  endLocation?: string;
  routeDescription?: string;
  busName?: string;
  description?: string;
  status?: number;
  route?: {
    departureLocation: string;
    arrivalLocation: string;
    estimatedDuration: string;
  };
  departureTime?: string;
  arrivalTime?: string;
  timeStart?: string;
  timeEnd?: string;
  availableSeats?: number;
  price?: number;
  bus?: {
    licensePlate: string;
    type: string;
  };
  driver?: {
    name: string;
    phone: string;
  };
  // Allow additional dynamic properties
  [key: string]: unknown;
}

export interface TransferTrip {
  id?: string;
  firstTrip?: Trip;
  secondTrip?: Trip;
  route?: {
    departureLocation: string;
    arrivalLocation: string;
    estimatedDuration: string;
  };
  departureTime?: string;
  arrivalTime?: string;
  availableSeats?: number;
  price?: number;
  bus?: {
    licensePlate: string;
    type: string;
  };
  driver?: {
    name: string;
    phone: string;
  };
  // Allow additional dynamic properties
  [key: string]: unknown;
}

export interface SearchResult {
  transferTrips?: TransferTrip[];
  departure?: {
    transferTrips: TransferTrip[];
  };
  return?: {
    transferTrips: TransferTrip[];
  };
  // Allow additional dynamic properties
  [key: string]: unknown;
}

export interface ApiSeat {
  id: string;
  seatNumber: string;
  isAvailable: boolean;
  price: number;
  type: string;
  // Allow additional dynamic properties
  [key: string]: unknown;
}

export interface BookingError {
  message: string;
  code?: string;
  details?: string;
}
