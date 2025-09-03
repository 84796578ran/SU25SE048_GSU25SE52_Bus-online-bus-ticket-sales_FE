"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Search,
  DirectionsBus,
  EventSeat,
  LocationOn,
  Payment,
  ArrowBack,
  ArrowForward,
  Check,
  CheckCircle,
  Close,
  Info,
  AccessTime,
  LocalShipping,
  ShoppingCart,
  Route,
  CreditCard,
  Star,
  StarBorder,
  Visibility,
  Person,
} from "@mui/icons-material";
import Link from "next/link";
import { apiClient } from "@/services/api";
import { bookingService, VNPayPayloadType } from "@/services/bookingService";
import authService, { type CustomerProfile } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import SeatMap from "@/components/SeatMap";

interface BaseTripType {
  id: number;
  tripId: string;
  fromLocation: string;
  endLocation: string;
  routeDescription: string | null;
  timeStart: string;
  timeEnd: string;
  price: number;
  routeId: number;
  busName: string;
  description: string;
  status: number;
  isDeleted: boolean;
  fromStationId: number;
  toStationId: number;
}

interface TripType extends BaseTripType {
  tripType?: "direct" | "transfer" | "triple"; 
  direction?: "departure" | "return"; 
  // Fields for transfer trips
  firstTrip?: BaseTripType;
  secondTrip?: BaseTripType;
  totalPrice?: number;
  totalDuration?: string;
}

interface SeatType {
  id: string; // Display ID for UI purposes  
  row: string;
  column: number;
  isBooked: boolean;
  price: number;
  seatNumber: string; // Display seat number like "1G4"
  seatType?: string;
  isSelected?: boolean;
  tripId?: number; // Add tripId to identify which trip this seat belongs to
  floorIndex?: number;
  rowIndex?: number;
  columnIndex?: number;
}

interface ApiSeatResponse {
  id: number;
  seatId: string;
  isAvailable: boolean;
}

interface ShuttlePointType {
  id: number;
  name: string;
  address: string;
  time: string;
  extraFee: number;
}

interface SearchDataType {
  from: string;
  to: string;
  fromId: string;
  toId: string;
  fromStation: string;
  toStation: string;
  fromStationId: string;
  toStationId: string;
  departureDate: string;
  returnDate: string;
  tripType: string;
}

// Define step titles
const steps = ["Tìm chuyến xe", "Chọn ghế", "Thanh toán"];


const generateMockSeats = (): SeatType[] => {
  const rows = ["A", "B", "C", "D", "E"];
  const columns = [1, 2, 3, 4];
  const seats: SeatType[] = [];

  rows.forEach((row) => {
    columns.forEach((col) => {
      const backendId = Math.floor(Math.random() * 1000) + 1000; // Mock backend ID
      const id = backendId.toString(); // Use backend ID as string ID
      const isBooked = Math.random() > 0.7;
      seats.push({
        id,
        row,
        column: col,
        isBooked,
        price: 250000,
        seatNumber: `${row}${col}`,
        seatType: "regular",
      } as SeatType);
    });
  });

  return seats;
};

// Payment methods
const paymentMethods = [
  { id: "vnpay", name: "VNPay", icon: <CreditCard /> },
];

function BookingContent() {
  // VNPayPayloadType được import từ bookingService.ts

  // Client-side hydration check to prevent Material-UI hydration issues
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // State
  const [activeStep, setActiveStep] = useState<number>(0);
  const [searchData, setSearchData] = useState<SearchDataType>({
    from: "",
    to: "",
    fromId: "",
    toId: "",
    fromStation: "",
    toStation: "",
    fromStationId: "",
    toStationId: "",
    departureDate: "",
    returnDate: "",
    tripType: "oneWay",
  });
  const [loading, setLoading] = useState<boolean>(true);
  
  // Separate trips for departure and return (round-trip functionality)
  const [departureTrips, setDepartureTrips] = useState<TripType[]>([]);
  const [returnTrips, setReturnTrips] = useState<TripType[]>([]);
  const [trips, setTrips] = useState<TripType[]>([]); // Keep for backward compatibility
  
  // Separate trip selections for round-trip
  const [selectedDepartureTrip, setSelectedDepartureTrip] = useState<TripType | null>(null);
  const [selectedReturnTrip, setSelectedReturnTrip] = useState<TripType | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripType | null>(null); // Keep for one-way compatibility
  
  // Separate seat management for departure and return trips
  const [departureSeats, setDepartureSeats] = useState<SeatType[]>([]);
  const [returnSeats, setReturnSeats] = useState<SeatType[]>([]);
  const [selectedDepartureSeats, setSelectedDepartureSeats] = useState<SeatType[]>([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState<SeatType[]>([]);
  
  const [firstLegSeats, setFirstLegSeats] = useState<SeatType[]>([]);
  const [secondLegSeats, setSecondLegSeats] = useState<SeatType[]>([]);
  const [selectedFirstLegSeats, setSelectedFirstLegSeats] = useState<SeatType[]>([]);
  const [selectedSecondLegSeats, setSelectedSecondLegSeats] = useState<SeatType[]>([]);
  // Return transfer leg seats
  const [returnFirstLegSeats, setReturnFirstLegSeats] = useState<SeatType[]>([]);
  const [returnSecondLegSeats, setReturnSecondLegSeats] = useState<SeatType[]>([]);
  const [selectedReturnFirstLegSeats, setSelectedReturnFirstLegSeats] = useState<SeatType[]>([]);
  const [selectedReturnSecondLegSeats, setSelectedReturnSecondLegSeats] = useState<SeatType[]>([]);
  
  const [seats, setSeats] = useState<SeatType[]>([]); // Keep for one-way compatibility
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]); // Keep for one-way compatibility
  // Removed pickup point selection per request
  const [shuttlePoint, setShuttlePoint] = useState<ShuttlePointType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [completed, setCompleted] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null);
  const [paymentError, setPaymentError] = useState<string>("");
  const [vnpayPayload, setVnpayPayload] = useState<VNPayPayloadType | null>(
    null
  );
  // Ensure we only show success ticket after restoration completes
  const [bookingDataRestored, setBookingDataRestored] = useState<boolean>(false);

  // API result data for booking result display
  const [bookingResult, setBookingResult] = useState<{
    message: string;
    referenceId: number;
    totalPrice: number;
    paymentDate: string;
  } | null>(null);
  const [bookingResultLoading, setBookingResultLoading] = useState<boolean>(false);
  const [bookingResultError, setBookingResultError] = useState<string>("");

  // Seat diagram states
  const [seatLoading, setSeatLoading] = useState<boolean>(false);
  const [seatError, setSeatError] = useState<string>("");
  const [seatDialogOpen, setSeatDialogOpen] = useState<boolean>(false);
  const [seatDialogTrip, setSeatDialogTrip] = useState<TripType | null>(null);

  // Dialog specific seat data - separate from main seats state to avoid conflicts
  const [dialogSeats, setDialogSeats] = useState<SeatType[]>([]);
  const [dialogFirstSeats, setDialogFirstSeats] = useState<SeatType[]>([]);
  const [dialogSecondSeats, setDialogSecondSeats] = useState<SeatType[]>([]);
  const [dialogSeatLoading, setDialogSeatLoading] = useState<boolean>(false);
  const [dialogSeatError, setDialogSeatError] = useState<string>("");
  // Track composite seat ids (floor-seat) to avoid mirroring selection across floors
  // Legacy single list (used for direct trips). For transfer trips we maintain per-trip map to avoid mirroring.
  const [selectedCompositeSeatIds, setSelectedCompositeSeatIds] = useState<string[]>([]);
  const [selectedCompositeSeatIdsMap, setSelectedCompositeSeatIdsMap] = useState<Record<string, string[]>>({});

  // Authentication hook
  const { user, isAuthenticated } = useAuth();
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [localUserData, setLocalUserData] = useState<any>(null);

  // Phone number state for Google login users
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState<string>("");
  const [isPhoneEditable, setIsPhoneEditable] = useState<boolean>(false);
  const [isPhoneUpdating, setIsPhoneUpdating] = useState<boolean>(false);

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    type: 'success'
  });

  // Helper function for showing notifications
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'error') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  // Seat availability by trip id for displaying in trip cards
  const [seatAvailabilityByTrip, setSeatAvailabilityByTrip] = useState<
    Record<string, { available: number; total: number }>
  >({});
  const [loadingSeatsByTrip, setLoadingSeatsByTrip] = useState<
    Record<string, boolean>
  >({});

  // New seat map state for trip cards and step 2
  const [seatMapDataByTrip, setSeatMapDataByTrip] = useState<
    Record<string, any[]>
  >({});
  const [loadingSeatMapsByTrip, setLoadingSeatMapsByTrip] = useState<
    Record<string, boolean>
  >({});

  // ================= Seat ID Normalization Helpers =================
  // Backend expects numeric seatIds. We now keep seat.id exactly the API numeric string.
  const getSeatPayloadId = (seat: SeatType): number | null => {
    if (!seat) {
      console.warn('❌ getSeatPayloadId: seat is null/undefined');
      return null;
    }
    
    // Debug log - xem chính xác seat object
    console.log('🐛 getSeatPayloadId input:', {
      id: seat.id,
      seatNumber: seat.seatNumber,
      fullSeat: seat
    });
    
    // Extract numeric ID from seat.id
    let numericId: number;
    
    if (seat.id.includes('-')) {
  // Legacy handling for prefixed IDs (no longer used, kept for safety)
      const parts = seat.id.split('-');
      const lastPart = parts[parts.length - 1];
      numericId = parseInt(lastPart, 10);
    } else {
      // Direct numeric string like "1057" or "8"
      numericId = parseInt(seat.id, 10);
    }
    
    if (!isNaN(numericId) && numericId > 0) {
      console.log(`✅ Extracted ID: ${numericId} from seat.id: ${seat.id} (${seat.seatNumber})`);
      return numericId;
    }
    
    console.error('❌ Could not extract numeric ID from seat:', {
      id: seat.id,
      seatNumber: seat.seatNumber
    });
    return null;
  };

  const mapSeatsToIds = (seatsArr: SeatType[]): number[] => {
    console.log(`🧪 mapSeatsToIds called with ${seatsArr.length} seats`);
    console.log('🧪 Input seats:', seatsArr.map(s => ({ id: s.id, seatNumber: s.seatNumber })));
    
    const ids = seatsArr.map(getSeatPayloadId).filter((v): v is number => v !== null && v > 0);
    console.log(`🧪 Extracted seat IDs:`, ids);
    
    // Deduplicate while preserving order
    const unique: number[] = [];
    for (const id of ids) if (!unique.includes(id)) unique.push(id);
    
    console.log(`🧪 Final deduplicated seat IDs:`, unique);
    
    if (unique.length === 0) {
      console.error('❌ No valid seat IDs extracted!');
    }
    
    return unique;
  };
  
  // Responsive design - use client-side only to prevent hydration mismatch
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(theme.breakpoints.down("sm").replace('@media ', ''));
    setIsMobile(mediaQuery.matches);
    
    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, [theme.breakpoints]);

  // Get search params from URL
  const searchParams = useSearchParams();
  const router = useRouter();

  // API function to fetch trips using search endpoint
  const fetchTrips = async (
    searchData: SearchDataType
  ): Promise<{ 
    departureTrips: TripType[], 
    returnTrips: TripType[], 
    allTrips: TripType[] // For backward compatibility
  }> => {
    try {
      let result;

      if (searchData.tripType === "roundTrip" && searchData.returnDate) {
        // Use round-trip API
        console.log("🔄 Fetching round trips...", searchData);

        result = await apiClient.searchRoundTrips({
          fromLocationId: searchData.fromId,
          fromStationId: searchData.fromStationId,
          toLocationId: searchData.toId,
          toStationId: searchData.toStationId,
          date: searchData.departureDate,
          returnDate: searchData.returnDate,
        });
      } else {
        // Use one-way API with the new API client method
        console.log("➡️ Fetching one-way trips...", searchData);

        result = await apiClient.searchTrips({
          fromLocationId: searchData.fromId,
          fromStationId: searchData.fromStationId,
          toLocationId: searchData.toId,
          toStationId: searchData.toStationId,
          date: searchData.departureDate,
        });
      }

      console.log("API Response:", result); // Debug log

      // Handle different response structures for one-way vs round-trip
      let departureTrips: TripType[] = [];
      let returnTrips: TripType[] = [];
      let allTrips: TripType[] = [];

      if (result) {
        if (searchData.tripType === "roundTrip" && searchData.returnDate) {
          // Round-trip response structure: { departure: {...}, return: {...} }
          console.log("Processing round-trip response:", result);

          // Process departure trips
          if (result.departure) {
            if (
              result.departure.directTrips &&
              result.departure.directTrips.length > 0
            ) {
              console.log("🔍 Processing round-trip departure direct trips:", result.departure.directTrips);
              const processedDepartureTrips = result.departure.directTrips.map((trip: TripType, index: number) => {
                console.log(`🔍 Processing departure direct trip ${index}:`, trip);
                if (!trip.id && trip.id !== 0) {
                  console.warn(`⚠️ Departure direct trip ${index} missing id:`, trip);
                }
                return {
                  ...trip,
                  tripType: "direct",
                  direction: "departure",
                };
              });
              departureTrips = [...departureTrips, ...processedDepartureTrips];
              allTrips = [...allTrips, ...processedDepartureTrips];
            }

            if (
              result.departure.transferTrips &&
              result.departure.transferTrips.length > 0
            ) {
              const processedDepartureTrips = result.departure.transferTrips
                .map((transferTrip: any, index: number) => {
                  const { firstTrip, secondTrip } = transferTrip;

                  if (!firstTrip || !secondTrip) {
                    console.warn(
                      `⚠️ Departure transfer trip ${index} missing firstTrip or secondTrip:`,
                      transferTrip
                    );
                    return null;
                  }

                  const totalPrice = (firstTrip.price || 0) + (secondTrip.price || 0);
                  const startTime = new Date(firstTrip.timeStart);
                  const endTime = new Date(secondTrip.timeEnd);
                  const durationMs = endTime.getTime() - startTime.getTime();
                  const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                  const durationMinutes = Math.floor(
                    (durationMs % (1000 * 60 * 60)) / (1000 * 60)
                  );
                  const totalDuration = `${durationHours}h${
                    durationMinutes > 0 ? ` ${durationMinutes}m` : ''
                  }`;

                  return {
                    id: parseInt(`${firstTrip.id}${secondTrip.id}`),
                    tripId: `${firstTrip.tripId}_${secondTrip.tripId}`,
                    fromLocation: firstTrip.fromLocation,
                    endLocation: secondTrip.endLocation,
                    routeDescription: `${firstTrip.routeDescription} → ${secondTrip.routeDescription}`,
                    timeStart: firstTrip.timeStart,
                    timeEnd: secondTrip.timeEnd,
                    price: totalPrice,
                    routeId: firstTrip.routeId,
                    busName: `${firstTrip.busName} → ${secondTrip.busName}`,
                    description: `${firstTrip.fromLocation} → ${firstTrip.endLocation} → ${secondTrip.endLocation}`,
                    status: Math.min(firstTrip.status, secondTrip.status),
                    isDeleted: firstTrip.isDeleted || secondTrip.isDeleted,
                    tripType: "transfer" as const,
                    direction: "departure" as const,
                    firstTrip,
                    secondTrip,
                    totalPrice,
                    totalDuration,
                  };
                })
                .filter(Boolean);

              departureTrips = [...departureTrips, ...processedDepartureTrips];
              allTrips = [...allTrips, ...processedDepartureTrips];
            }

            if (
              result.departure.tripleTrips &&
              result.departure.tripleTrips.length > 0
            ) {
              const processedDepartureTrips = result.departure.tripleTrips.map((trip: TripType) => ({
                ...trip,
                tripType: "triple",
                direction: "departure",
              }));
              departureTrips = [...departureTrips, ...processedDepartureTrips];
              allTrips = [...allTrips, ...processedDepartureTrips];
            }
          }

          // Process return trips
          if (result.return) {
            if (
              result.return.directTrips &&
              result.return.directTrips.length > 0
            ) {
              const processedReturnTrips = result.return.directTrips.map((trip: TripType) => ({
                ...trip,
                tripType: "direct",
                direction: "return",
              }));
              returnTrips = [...returnTrips, ...processedReturnTrips];
              allTrips = [...allTrips, ...processedReturnTrips];
            }

            if (
              result.return.transferTrips &&
              result.return.transferTrips.length > 0
            ) {
              const processedReturnTrips = result.return.transferTrips.map((transferTrip: any, index: number) => {
                const { firstTrip, secondTrip } = transferTrip;
                
                if (!firstTrip || !secondTrip) {
                  console.warn(`⚠️ Return transfer trip ${index} missing firstTrip or secondTrip:`, transferTrip);
                  return null;
                }

                const totalPrice = (firstTrip.price || 0) + (secondTrip.price || 0);
                const startTime = new Date(firstTrip.timeStart);
                const endTime = new Date(secondTrip.timeEnd);
                const durationMs = endTime.getTime() - startTime.getTime();
                const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                const totalDuration = `${durationHours}h${durationMinutes > 0 ? ` ${durationMinutes}m` : ''}`;

                return {
                  id: parseInt(`${firstTrip.id}${secondTrip.id}`),
                  tripId: `${firstTrip.tripId}_${secondTrip.tripId}`,
                  fromLocation: firstTrip.fromLocation,
                  endLocation: secondTrip.endLocation,
                  routeDescription: `${firstTrip.routeDescription} → ${secondTrip.routeDescription}`,
                  timeStart: firstTrip.timeStart,
                  timeEnd: secondTrip.timeEnd,
                  price: totalPrice,
                  routeId: firstTrip.routeId,
                  busName: `${firstTrip.busName} → ${secondTrip.busName}`,
                  description: `${firstTrip.fromLocation} → ${firstTrip.endLocation} → ${secondTrip.endLocation}`,
                  status: Math.min(firstTrip.status, secondTrip.status),
                  isDeleted: firstTrip.isDeleted || secondTrip.isDeleted,
                  tripType: "transfer" as const,
                  direction: "return" as const,
                  firstTrip: firstTrip,
                  secondTrip: secondTrip,
                  totalPrice: totalPrice,
                  totalDuration: totalDuration,
                };
              }).filter(Boolean);
              returnTrips = [...returnTrips, ...processedReturnTrips];
              allTrips = [...allTrips, ...processedReturnTrips];
            }

            if (
              result.return.tripleTrips &&
              result.return.tripleTrips.length > 0
            ) {
              const processedReturnTrips = result.return.tripleTrips.map((trip: TripType) => ({
                ...trip,
                tripType: "triple",
                direction: "return",
              }));
              returnTrips = [...returnTrips, ...processedReturnTrips];
              allTrips = [...allTrips, ...processedReturnTrips];
            }
          }
        } else {
          // One-way response structure: { isDirect: true, directTrips: [...], transferTrips: [], tripleTrips: [] }
          console.log("Processing one-way response:", result);

          if (result.directTrips && result.directTrips.length > 0) {
            console.log("🔍 Processing direct trips:", result.directTrips);
            const processedTrips = result.directTrips.map((trip: TripType, index: number) => {
              console.log(`🔍 Processing direct trip ${index}:`, trip);
              if (!trip.id && trip.id !== 0) {
                console.warn(`⚠️ Direct trip ${index} missing id:`, trip);
              }
              return {
                ...trip,
                tripType: "direct",
              };
            });
            departureTrips = [...departureTrips, ...processedTrips];
            allTrips = [...allTrips, ...processedTrips];
          }

          if (result.transferTrips && result.transferTrips.length > 0) {
            console.log("🔍 Processing transfer trips:", result.transferTrips);
            const processedTrips = result.transferTrips.map((transferTrip: any, index: number) => {
              console.log(`🔍 Processing transfer trip ${index}:`, transferTrip);
              
              // Transfer trip has firstTrip and secondTrip structure
              const { firstTrip, secondTrip } = transferTrip;
              
              if (!firstTrip || !secondTrip) {
                console.warn(`⚠️ Transfer trip ${index} missing firstTrip or secondTrip:`, transferTrip);
                return null;
              }

              // Calculate total price and duration
              const totalPrice = (firstTrip.price || 0) + (secondTrip.price || 0);
              
              // Calculate total duration
              const startTime = new Date(firstTrip.timeStart);
              const endTime = new Date(secondTrip.timeEnd);
              const durationMs = endTime.getTime() - startTime.getTime();
              const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
              const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
              const totalDuration = `${durationHours}h${durationMinutes > 0 ? ` ${durationMinutes}m` : ''}`;

              return {
                // Use firstTrip as base, but override key fields
                id: parseInt(`${firstTrip.id}${secondTrip.id}`), // Unique numeric ID for transfer trip
                tripId: `${firstTrip.tripId}_${secondTrip.tripId}`,
                fromLocation: firstTrip.fromLocation,
                endLocation: secondTrip.endLocation,
                routeDescription: `${firstTrip.routeDescription} → ${secondTrip.routeDescription}`,
                timeStart: firstTrip.timeStart,
                timeEnd: secondTrip.timeEnd,
                price: totalPrice,
                routeId: firstTrip.routeId, // Use first trip's route
                busName: `${firstTrip.busName} → ${secondTrip.busName}`,
                description: `${firstTrip.fromLocation} → ${firstTrip.endLocation} → ${secondTrip.endLocation}`,
                status: Math.min(firstTrip.status, secondTrip.status), // Use most restrictive status
                isDeleted: firstTrip.isDeleted || secondTrip.isDeleted,
                tripType: "transfer" as const,
                // Transfer-specific fields
                firstTrip: firstTrip,
                secondTrip: secondTrip,
                totalPrice: totalPrice,
                totalDuration: totalDuration,
              };
            }).filter(Boolean); // Filter out null values
            
            console.log("🔍 Processed transfer trips:", processedTrips);
            departureTrips = [...departureTrips, ...processedTrips];
            allTrips = [...allTrips, ...processedTrips];
          }

          if (result.tripleTrips && result.tripleTrips.length > 0) {
            console.log("🔍 Processing triple trips:", result.tripleTrips);
            const processedTrips = result.tripleTrips.map((trip: TripType, index: number) => {
              console.log(`🔍 Processing triple trip ${index}:`, trip);
              if (!trip.id && trip.id !== 0) {
                console.warn(`⚠️ Triple trip ${index} missing id:`, trip);
              }
              return {
                ...trip,
                tripType: "triple",
              };
            });
            departureTrips = [...departureTrips, ...processedTrips];
            allTrips = [...allTrips, ...processedTrips];
          }
        }
      }

      console.log("🎯 Processed trip data:", {
        departureTrips: departureTrips.length,
        returnTrips: returnTrips.length,
        allTrips: allTrips.length,
        isRoundTrip: searchData.tripType === "roundTrip"
      });

      // Additional validation before returning
      const validatedAllTrips = allTrips.filter((trip) => {
        if (!trip) {
          console.warn("⚠️ Found undefined trip in allTrips, filtering out");
          return false;
        }
        if (!trip.id && trip.id !== 0) {
          console.warn("⚠️ Found trip with missing id in allTrips, filtering out:", trip);
          return false;
        }
        return true;
      });

      const validatedDepartureTrips = departureTrips.filter((trip) => {
        if (!trip) {
          console.warn("⚠️ Found undefined trip in departureTrips, filtering out");
          return false;
        }
        if (!trip.id && trip.id !== 0) {
          console.warn("⚠️ Found trip with missing id in departureTrips, filtering out:", trip);
          return false;
        }
        return true;
      });

      const validatedReturnTrips = returnTrips.filter((trip) => {
        if (!trip) {
          console.warn("⚠️ Found undefined trip in returnTrips, filtering out");
          return false;
        }
        if (!trip.id && trip.id !== 0) {
          console.warn("⚠️ Found trip with missing id in returnTrips, filtering out:", trip);
          return false;
        }
        return true;
      });

      console.log("🎯 Final validated trip data:", {
        allTrips: { original: allTrips.length, validated: validatedAllTrips.length },
        departureTrips: { original: departureTrips.length, validated: validatedDepartureTrips.length },
        returnTrips: { original: returnTrips.length, validated: validatedReturnTrips.length }
      });

      return { 
        departureTrips: validatedDepartureTrips, 
        returnTrips: validatedReturnTrips, 
        allTrips: validatedAllTrips 
      };
    } catch (error) {
      console.error("Error fetching trips:", error);
      return { departureTrips: [], returnTrips: [], allTrips: [] };
    }
  };

  // Small helper to render a seat panel (title + diagram + selected summary)
  const renderSeatPanel = (
    title: string,
    busName: string,
    date: string,
    seats: SeatType[],
    selectedSeats: SeatType[],
    onSelect: (seat: SeatType) => void,
    color: string,
    metaSeatsForMap?: any[]
  ) => {
    let seatMapData: any[] = [];
    const metaArray = (metaSeatsForMap || []).filter(Boolean);
    // Case 1: API returned array of floor objects {floorIndex, seats:[...]}
    if (metaArray.length && metaArray[0] && Array.isArray(metaArray[0].seats)) {
      seatMapData = metaArray.flatMap((floor: any) =>
        (floor.seats || []).map((s: any, idx: number) => ({
          id: s.id ?? idx,
          seatId: s.seatId || `gap-${floor.floorIndex}-${s.rowIndex}-${s.columnIndex}`,
          isAvailable: s.isSeat ? s.isAvailable : false,
          isSeat: !!s.isSeat,
          floorIndex: floor.floorIndex,
          rowIndex: s.rowIndex,
          columnIndex: s.columnIndex
        }))
      );
    } else if (metaArray.some((m: any) => typeof m?.floorIndex !== 'undefined' && typeof m?.rowIndex !== 'undefined')) {
      // Case 2: flat list already containing floorIndex/rowIndex/columnIndex
      seatMapData = metaArray.map((m: any, idx: number) => ({
        id: m.id ?? idx,
        seatId: m.seatId || `gap-${m.floorIndex}-${m.rowIndex}-${m.columnIndex}`,
        isAvailable: m.isSeat ? m.isAvailable : false,
        isSeat: !!m.isSeat,
        floorIndex: m.floorIndex,
        rowIndex: m.rowIndex,
        columnIndex: m.columnIndex,
      }));
    } else {
      // Case 3: fallback merge from SeatType array
      const metaBySeatId = new Map<string, any>(metaArray.map((m: any) => [m.seatId, m]));
      seatMapData = seats.map((seat, index) => {
        const sid = String(seat.seatNumber || seat.id);
        const meta = metaBySeatId.get(sid);
        return {
          id: typeof seat.id === 'string' ? parseInt((seat.id as string).replace(/[^0-9]/g, '')) || index : (seat.id as number) || index,
          seatId: sid,
          isAvailable: !seat.isBooked,
          isSeat: meta?.isSeat ?? true,
          floorIndex: meta?.floorIndex ?? 1,
          rowIndex: meta?.rowIndex ?? (seat.row ? seat.row.charCodeAt(0) - 64 : 1),
          columnIndex: meta?.columnIndex ?? seat.column ?? 1,
        };
      });
    }

    // Get selected seat IDs for the SeatMap component
    const selectedSeatIds = selectedSeats.map(seat => seat.seatNumber || seat.id);

    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: `3px solid ${color}`, background: `linear-gradient(135deg, ${color}22 0%, white 100%)` }}>
        <Typography variant="h6" gutterBottom sx={{ color, fontWeight: 700 }}>
          {title} {busName ? `- ${busName}` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {date}
        </Typography>
        
        {/* Use new SeatMap component */}
        <SeatMap
          seats={seatMapData}
          onSeatClick={(seat) => {
            // Find the corresponding SeatType and call onSelect
            const seatType = seats.find(s => (s.seatNumber || s.id) === seat.seatId);
            if (seatType) {
              onSelect(seatType);
            }
          }}
          selectedSeats={selectedSeatIds}
          maxSeats={4}
          showLegend={true}
          compact={false}
          disabled={false}
          floorDisplay="toggle"
          initialFloor={1}
          floorLabels={{ 1: 'Tầng 1', 2: 'Tầng 2' }}
        />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color }}>
            Ghế đã chọn ({selectedSeats.length}):
          </Typography>
          {selectedSeats.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedSeats.map(seat => (
                <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => onSelect(seat)} sx={{ bgcolor: color, color: 'white', fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Chưa chọn ghế nào
            </Typography>
          )}
        </Box>
      </Paper>
    );
  };

  // Effect to check for VNPay payment return parameters
  useEffect(() => {
    if (!searchParams) return;
    
    const vnpResponseCode = searchParams.get("vnp_ResponseCode");
    const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus");

    // Check if this is a VNPay payment return
    if (vnpResponseCode !== null) {
      console.log("🔍 Detected VNPay payment return parameters:", {
        vnpResponseCode,
        vnpTransactionStatus,
      });

      // Redirect to unified confirmation page
      console.log("🔄 Redirecting to confirmation page");
      if (typeof window !== 'undefined') {
        window.location.href =
          "/booking/confirm?" + window.location.search.substring(1);
      }
      return;
    }
  }, [searchParams]);

  // Effect to handle payment status from confirm page
  useEffect(() => {
    if (!searchParams) return;
    
    const paymentStatusParam = searchParams.get("paymentStatus");
    const paymentErrorParam = searchParams.get("paymentError");

    // Check if this is a redirect from confirm page with payment status
  if (paymentStatusParam) {
      console.log("🔍 Detected payment status from confirm page:", {
        paymentStatus: paymentStatusParam,
        paymentError: paymentErrorParam,
      });

      // Set payment status first
      setPaymentStatus(paymentStatusParam as "success" | "failed");
      if (paymentErrorParam) {
        setPaymentError(decodeURIComponent(paymentErrorParam));
      }
      setActiveStep(2); // Set to payment step

      // Debug all URL parameters
      console.log("🔍 All URL parameters:", Object.fromEntries(searchParams.entries()));
      
      // Try to get referenceId from different possible parameter names
      const referenceIdParam = searchParams.get("referenceId") || 
                              searchParams.get("vnp_TxnRef") ||
                              searchParams.get("txnRef") ||
                              searchParams.get("ref");
      
      // For testing - use a hardcoded referenceId if none found in URL
      const testReferenceId = "638920753597890461"; // From your example
      
      if (referenceIdParam) {
        console.log("🔍 Found referenceId in URL, fetching booking result:", referenceIdParam);
        fetchBookingResult(referenceIdParam);
      } else if (paymentStatusParam === "success" || paymentStatusParam === "failed") {
        // If we're in payment status but no referenceId in URL, try with test ID
        console.warn("⚠️ No referenceId found in URL parameters, trying with test referenceId for demo");
        console.log("🧪 Using test referenceId:", testReferenceId);
        fetchBookingResult(testReferenceId);
      } else {
        console.warn("⚠️ No referenceId found and not in payment status, marking as restored without API call");
        setBookingDataRestored(true);
      }

      if (paymentStatusParam === "success" || paymentStatusParam === "failed") {
        setCompleted(true);
      }

      // Clean up URL parameters
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete("paymentStatus");
        url.searchParams.delete("paymentError");
        url.searchParams.delete("referenceId");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (paymentStatus && !completed && bookingDataRestored) {
      setCompleted(true);
    }
  }, [bookingDataRestored, paymentStatus, completed]);

  // Effect to load data from URL parameters
  useEffect(() => {
    if (!searchParams) return;
    
    // Check for login success message
    const loginSuccess = searchParams.get("loginSuccess");
    const loginMessage = searchParams.get("message");
    
    if (loginSuccess === "true" && loginMessage) {
      // Show success notification
      const message = decodeURIComponent(loginMessage);
      setNotification({
        open: true,
        message: message,
        type: 'success'
      });
      
      // Clean up URL parameters
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete("loginSuccess");
        url.searchParams.delete("message");
        window.history.replaceState({}, "", url.toString());
      }
    }
    
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const fromId = searchParams.get("fromId");
    const toId = searchParams.get("toId");
    const fromStation = searchParams.get("fromStation");
    const toStation = searchParams.get("toStation");
    const fromStationId = searchParams.get("fromStationId");
    const toStationId = searchParams.get("toStationId");
    const departureDate = searchParams.get("departureDate");
    const returnDate = searchParams.get("returnDate");
    const tripType = searchParams.get("tripType") || "oneWay";

    // Set search data from URL params
    const searchDataFromUrl: SearchDataType = {
      from: from || "",
      to: to || "",
      fromId: fromId || "",
      toId: toId || "",
      fromStation: fromStation || "",
      toStation: toStation || "",
      fromStationId: fromStationId || "",
      toStationId: toStationId || "",
      departureDate: departureDate || "",
      returnDate: returnDate || "",
      tripType: tripType,
    };

    setSearchData(searchDataFromUrl);

    // Fetch trip data from API if we have required parameters
    const loadTrips = async () => {
      setLoading(true);
      try {
        const { departureTrips, returnTrips, allTrips } = await fetchTrips(searchDataFromUrl);
        
        // Set the separated trip data
        setDepartureTrips(departureTrips);
        setReturnTrips(returnTrips);
        setTrips(allTrips); // Keep for backward compatibility

        console.log("🎯 Trip data loaded:", {
          departureTrips: departureTrips.length,
          returnTrips: returnTrips.length,
          allTrips: allTrips.length,
          isRoundTrip: searchDataFromUrl.tripType === "roundTrip"
        });

        // Load seat availability for trip cards if we have trip data
        if (allTrips && allTrips.length > 0) {
          console.log("🎫 Starting to load seat availability for trips...");
          // Load seat availability in background (don't await to avoid blocking UI)
          loadSeatAvailabilityForTrips(allTrips, searchDataFromUrl).catch(
            (error) => {
              console.error(
                "❌ Error loading seat availability for trips:",
                error
              );
            }
          );
        }
      } catch (error) {
        console.error("Error loading trips:", error);
        setDepartureTrips([]);
        setReturnTrips([]);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch trips if we have the required search parameters
    if (fromId && toId && fromStationId && toStationId && departureDate) {
      loadTrips();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Effect to initialize and fetch customer profile
  useEffect(() => {
    const initCustomer = async () => {
      console.log('🔍 InitCustomer called:', { isAuthenticated, user: !!user });
      
    if (isAuthenticated && user) {
        try {
          const localUser = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('user_data') || '{}') : {};
          console.log('📦 LocalUser data:', localUser);
          setLocalUserData(localUser);
          
          const customerId = parseInt(localUser?.customerId || (user as any)?.customerId || (user as any)?.id || '');
          console.log('🆔 CustomerId to fetch:', customerId);
          
          if (!isNaN(customerId)) {
            console.log('📞 Calling getCustomerProfile...');
            const profile = await authService.getCustomerProfile(customerId);
            setCustomerProfile(profile);
            const phone = profile?.phone || (user as any).phone || '';
            setCustomerPhoneNumber(phone);
            setIsPhoneEditable(!phone || phone.length === 0);
            console.log('👤 Loaded customer profile:', profile);
          } else {
            console.log('⚠️ Invalid customerId, using user data only');
            const phoneFromUser = (user as any).phone || '';
            setCustomerPhoneNumber(phoneFromUser);
            setIsPhoneEditable(!phoneFromUser || phoneFromUser.length === 0);
          }
        } catch (e) {
          console.warn('⚠️ Could not load customer profile, fallback to user data:', e);
          const phoneFromUser = (user as any)?.phone || '';
          setCustomerPhoneNumber(phoneFromUser);
          setIsPhoneEditable(!phoneFromUser || phoneFromUser.length === 0);
        }
      } else {
        console.log('❌ Not authenticated or no user data');
      }
    };
    initCustomer();
  }, [isAuthenticated, user]);

  // Effect to update current time on client side to prevent hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      const timeElement = document.getElementById('current-time');
      if (timeElement) {
        timeElement.textContent = new Date().toLocaleString("vi-VN");
      }
    };

    // Update time immediately
    updateTime();

    // Update time every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle step navigation
  const handleNext = async () => {
    // Step 1: Trip selection validation
    if (activeStep === 0) {
      if (searchData.tripType === "roundTrip") {
        // Round-trip validation: need both departure and return trips
        if (!selectedDepartureTrip) {
          showNotification("Vui lòng chọn chuyến đi", "error");
          return;
        }
        if (!selectedReturnTrip) {
          showNotification("Vui lòng chọn chuyến về", "error");
          return;
        }
      } else {
        // One-way validation
        if (!selectedTrip && !selectedDepartureTrip) {
          showNotification("Vui lòng chọn một chuyến xe", "error");
          return;
        }
      }
    }

    // Step 2: Seat selection validation
    if (activeStep === 1) {
      if (searchData.tripType === "roundTrip") {
        // Round-trip validation: need seats for both trips
        const isDepartureTransfer = selectedDepartureTrip && (selectedDepartureTrip as any).tripType === "transfer";
        const isReturnTransfer = selectedReturnTrip && (selectedReturnTrip as any).tripType === "transfer";

        // Outbound
        if (isDepartureTransfer) {
          if (selectedFirstLegSeats.length === 0) {
            showNotification("Vui lòng chọn ít nhất một ghế cho chặng 1 của chuyến đi", "error");
            return;
          }
          if (selectedSecondLegSeats.length === 0) {
            showNotification("Vui lòng chọn ít nhất một ghế cho chặng 2 của chuyến đi", "error");
            return;
          }
        } else if (selectedDepartureSeats.length === 0) {
          showNotification("Vui lòng chọn ít nhất một ghế cho chuyến đi", "error");
          return;
        }

        // Return
        if (isReturnTransfer) {
          if (selectedReturnFirstLegSeats.length === 0) {
            showNotification("Vui lòng chọn ít nhất một ghế cho chặng 1 của chuyến về", "error");
            return;
          }
          if (selectedReturnSecondLegSeats.length === 0) {
            showNotification("Vui lòng chọn ít nhất một ghế cho chặng 2 của chuyến về", "error");
            return;
          }
        } else if (selectedReturnSeats.length === 0) {
          showNotification("Vui lòng chọn ít nhất một ghế cho chuyến về", "error");
          return;
        }
      } else {
        // One-way validation (including transfer trips)
        if (selectedTrip?.tripType === "transfer") {
          // Transfer trip validation: need seats for both legs
          if (selectedFirstLegSeats.length === 0) {
            showNotification("Vui lòng chọn ít nhất một ghế cho chặng 1", "error");
            return;
          }
          if (selectedSecondLegSeats.length === 0) {
            showNotification("Vui lòng chọn ít nhất một ghế cho chặng 2", "error");
            return;
          }
        } else {
          // Regular one-way validation
          const currentSelectedSeats = selectedSeats.length > 0 ? selectedSeats : selectedDepartureSeats;
          if (currentSelectedSeats.length === 0) {
            showNotification("Vui lòng chọn ít nhất một ghế", "error");
            return;
          }
        }
      }
    }

    // Step 3: Payment validation
    if (activeStep === 2) {
      // Pickup point no longer required
      if (!paymentMethod) {
        showNotification("Vui lòng chọn phương thức thanh toán", "error");
        return;
      }
      // Validate phone number
      if (isAuthenticated && isPhoneEditable && (!customerPhoneNumber || customerPhoneNumber.trim().length === 0)) {
        showNotification("Vui lòng nhập số điện thoại", "error");
        return;
      }
      // Basic phone number validation
      if (isAuthenticated && customerPhoneNumber && customerPhoneNumber.trim().length > 0) {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(customerPhoneNumber.replace(/\s/g, ''))) {
          showNotification("Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số", "error");
          return;
        }
      }
    }

    // Add loading state for step transitions
    setSeatLoading(true);

    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      // If moving to seat selection, fetch real seat data
      if (activeStep === 0) {
        const isRoundTripMovingToSeats = searchData.tripType === "roundTrip" && selectedDepartureTrip && selectedReturnTrip;
        const isOneWayMovingToSeats = searchData.tripType !== "roundTrip" && selectedTrip;
        
        if (isRoundTripMovingToSeats) {
          console.log("🎯 Moving to step 2 - Loading seats for ROUND TRIP:", {
            departureTrip: {
              id: selectedDepartureTrip.id,
              tripId: selectedDepartureTrip.tripId,
              busName: selectedDepartureTrip.busName,
            },
            returnTrip: {
              id: selectedReturnTrip.id,
              tripId: selectedReturnTrip.tripId,
              busName: selectedReturnTrip.busName,
            }
          });

          try {
            // Load seats for both trips in parallel
            const [departureSeatData, returnSeatData] = await Promise.all([
              fetchSeatAvailability(selectedDepartureTrip),
              fetchSeatAvailability(selectedReturnTrip)
            ]);
            
            console.log("🎯 Seat data fetched for round trip:", {
              departure: {
                count: departureSeatData.length,
                sample: departureSeatData.slice(0, 3),
              },
              return: {
                count: returnSeatData.length,
                sample: returnSeatData.slice(0, 3),
              }
            });
            
            // Outbound
            setDepartureSeats(departureSeatData);
            if ((selectedDepartureTrip as any)?.tripType === 'transfer') {
              // Assume API already separates legs by trip objects; just partition by tripId if needed later
              setFirstLegSeats(departureSeatData.filter(s => (s as any).tripId === (selectedDepartureTrip as any).firstTrip.id));
              setSecondLegSeats(departureSeatData.filter(s => (s as any).tripId === (selectedDepartureTrip as any).secondTrip.id));
            }

            // Return
            setReturnSeats(returnSeatData);
            if ((selectedReturnTrip as any)?.tripType === 'transfer') {
              setReturnFirstLegSeats(returnSeatData.filter(s => (s as any).tripId === (selectedReturnTrip as any).firstTrip.id));
              setReturnSecondLegSeats(returnSeatData.filter(s => (s as any).tripId === (selectedReturnTrip as any).secondTrip.id));
            }
            setSeats(departureSeatData); // Keep for backward compatibility
            
            console.log("🎯 Seats state updated for round trip");
          } catch (error) {
            console.error("Error loading seats for round trip:", error);
            // Fallback to mock data if API fails
            const mockSeats = generateMockSeats();
            setDepartureSeats(mockSeats);
            setReturnSeats(mockSeats);
            setSeats(mockSeats);
            console.log("🎯 Using mock seats for round trip due to API error:", mockSeats.length);
          }
        } else if (isOneWayMovingToSeats) {
          console.log("🎯 Moving to step 2 - Loading seats for ONE WAY trip:", {
            tripId: selectedTrip.id,
            tripIdString: selectedTrip.tripId,
            busName: selectedTrip.busName,
          });

          try {
            const seatData = await fetchSeatAvailability(selectedTrip);
            console.log("🎯 Seat data fetched for step 2:", {
              count: seatData.length,
              sample: seatData.slice(0, 3),
            });
            setSeats(seatData);
            console.log("🎯 Seats state updated for step 2");
          } catch (error) {
            console.error("Error loading seats:", error);
            // Fallback to mock data if API fails
            const mockSeats = generateMockSeats();
            setSeats(mockSeats);
            console.log(
              "🎯 Using mock seats due to API error:",
              mockSeats.length
            );
          }
        }
        
      } else {
        // Small delay for smooth transition
        setTimeout(() => {
          setSeatLoading(false);
        }, 300);
      }
    } else {
      // Nếu là bước cuối cùng (thanh toán)
      try {
        setSeatLoading(true);

        // Nếu đã chọn VNPay và có payload
        if (paymentMethod === "vnpay" && vnpayPayload) {
          console.log(
            "🔄 Gửi yêu cầu thanh toán VNPay với dữ liệu:",
            vnpayPayload
          );

          // Log thông tin chi tiết để kiểm tra
          console.log("Chi tiết dữ liệu thanh toán:");
          console.log(
            "- Chuyến xe:",
            selectedTrip?.tripId,
            selectedTrip?.busName
          );
          console.log(
            "- Ghế đã chọn:",
            selectedSeats.map((s) => s.id).join(", ")
          );
          console.log("- Điểm đón:", shuttlePoint?.name);
          console.log("- Phương thức thanh toán:", paymentMethod);
          console.log("- Tổng tiền:", calculateTotalPrice().total);

          try {
            // Gọi API thanh toán sử dụng bookingService
            console.log(
              "🚀 Gọi API /api/Reservations với payload:",
              vnpayPayload
            );

            // Always pass a returnUrl that points to the current origin so sandbox returns to localhost
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
            // Build safe return URL:
            // - Nếu localhost: luôn dùng http để tránh lỗi HTTPS (không có cert)
            // - Nếu có NEXT_PUBLIC_BASE_URL: ưu tiên biến môi trường (prod/staging)
            // - Ngược lại: dùng origin hiện tại
            const baseFromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
            let returnBase = baseFromEnv || currentOrigin;
            if (/localhost|127\.0\.0\.1/i.test(returnBase)) {
              // Chuẩn hóa thành http://localhost:port
              const port = typeof window !== 'undefined' ? window.location.port || '3000' : '3000';
              returnBase = `http://localhost:${port}`; // ép http
            }
            const returnUrl = `${returnBase.replace(/\/$/, '')}/booking/confirm`;
            // Đồng bộ vào payload (ghi đè nếu khác)
            if (vnpayPayload && vnpayPayload.returnUrl !== returnUrl) {
              vnpayPayload.returnUrl = returnUrl;
            }
            const response = await bookingService.createReservation(
              vnpayPayload,
              { returnUrl }
            );

            console.log(
              "🎉 Kết quả API thanh toán (response đầy đủ):",
              response
            );

            // Hiển thị chi tiết cấu trúc dữ liệu trả về
            if (response) {
              console.log("📊 Cấu trúc dữ liệu trả về:");
              console.log("- Response type:", typeof response);
              console.log("- Response:", response);

              // Phân tích cấu trúc dữ liệu
              if (typeof response === "object") {
                Object.keys(response).forEach((key) => {
                  console.log(`  + ${key}:`, response[key]);
                });

                // Kiểm tra các khả năng có thể của paymentUrl
                const paymentUrl = response.paymentUrl || 
                                  response.payment_url || 
                                  response.vnpayUrl || 
                                  response.redirectUrl || 
                                  response.url;

                if (paymentUrl) {
                  console.log(
                    "🌐 Chuyển hướng đến URL thanh toán:",
                    paymentUrl
                  );

                  // Save booking data to localStorage before redirect
                  const bookingData = {
                    searchData,
                    selectedTrip,
                    selectedDepartureTrip,
                    selectedReturnTrip,
                    selectedSeats,
                    selectedDepartureSeats,
                    selectedReturnSeats,
                    selectedFirstLegSeats,
                    selectedSecondLegSeats,
                    selectedReturnFirstLegSeats,
                    selectedReturnSecondLegSeats,
                    shuttlePoint,
                    customerPhoneNumber,
                    totalPrice: calculateTotalPrice().total,
                    timestamp: typeof window !== 'undefined' ? Date.now() : 0
                  };
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('bookingData', JSON.stringify(bookingData));
                  }
                  console.log("💾 Saved booking data to localStorage:", bookingData);

                  if (typeof window !== 'undefined') {
                    window.location.href = paymentUrl;
                  }
                  return; // Dừng thực thi tiếp để chuyển trang
                } else {
                  console.warn("⚠️ Không tìm thấy paymentUrl trong response:", {
                    paymentUrl: response.paymentUrl,
                    payment_url: response.payment_url,
                    vnpayUrl: response.vnpayUrl,
                    redirectUrl: response.redirectUrl,
                    url: response.url
                  });
                  
                  // Set payment failed status
                  setPaymentStatus("failed");
                  setPaymentError("Không thể tạo URL thanh toán. Vui lòng thử lại.");
                  setCompleted(true);
                  return;
                }
              }
            } else {
              console.error("❌ Response rỗng hoặc null");
              setPaymentStatus("failed");
              setPaymentError("Không nhận được phản hồi từ server");
              setCompleted(true);
              return;
            }
          } catch (error: any) {
            console.error("❌ Lỗi khi gọi API thanh toán:", error);

            // Log chi tiết lỗi để debug
            if (error.response) {
              console.error("- Response error:", error.response.data);
              console.error("- Status:", error.response.status);
              console.error("- Headers:", error.response.headers);
            } else if (error.request) {
              console.error("- Request error:", error.request);
            } else {
              console.error("- Error message:", error.message);
            }

            setPaymentStatus("failed");
            setPaymentError(error.message || "Có lỗi xảy ra khi xử lý thanh toán");
            setCompleted(true);
            return;
          }
        }

        // Thanh toán thành công mặc định (cho test)
        setPaymentStatus("success");
        setCompleted(true);
      } catch (error) {
        console.error("Error during payment processing:", error);
        setPaymentStatus("failed");
        setPaymentError("Có lỗi xảy ra trong quá trình thanh toán");
        setCompleted(true);
      } finally {
        setSeatLoading(false);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle trip selection
  const handleSelectTrip = (trip: TripType) => {
    setSelectedTrip(trip);
  };

  // Handle departure trip selection for round-trip
  const handleSelectDepartureTrip = (trip: TripType) => {
    console.log("🛫 Selected departure trip:", trip.tripId, trip.busName);
    setSelectedDepartureTrip(trip);
    // For one-way compatibility, also set selectedTrip
    if (searchData.tripType !== "roundTrip") {
      setSelectedTrip(trip);
    }
  };

  // Handle return trip selection for round-trip
  const handleSelectReturnTrip = (trip: TripType) => {
    console.log("🛬 Selected return trip:", trip.tripId, trip.busName);
    setSelectedReturnTrip(trip);
  };

  // Handle seat selection
  const handleSelectSeat = (seat: SeatType) => {
    if (seat.isBooked) return;

    const alreadySelected = selectedSeats.find((s) => s.id === seat.id);

    if (alreadySelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Handle departure seat selection for round-trip
  const handleSelectDepartureSeat = (seat: SeatType) => {
    if (seat.isBooked) return;

    const alreadySelected = selectedDepartureSeats.find((s) => s.id === seat.id);

    if (alreadySelected) {
      setSelectedDepartureSeats(selectedDepartureSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedDepartureSeats([...selectedDepartureSeats, seat]);
    }
  };

  // Handle return seat selection for round-trip
  const handleSelectReturnSeat = (seat: SeatType) => {
    if (seat.isBooked) return;

    const alreadySelected = selectedReturnSeats.find((s) => s.id === seat.id);

    if (alreadySelected) {
      setSelectedReturnSeats(selectedReturnSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedReturnSeats([...selectedReturnSeats, seat]);
    }
  };

  // Handle transfer trip leg seat selections
  const handleSelectFirstLegSeat = (seat: SeatType) => {
    if (seat.isBooked) return;
    // Ensure seat has correct tripId for first leg (no ID prefixing)
    const seatWithTrip: SeatType = { ...seat, tripId: seat.tripId }; // tripId should already be set when building seats
    const alreadySelected = selectedFirstLegSeats.some(s => s.id === seatWithTrip.id);
    setSelectedFirstLegSeats(
      alreadySelected
        ? selectedFirstLegSeats.filter(s => s.id !== seatWithTrip.id)
        : [...selectedFirstLegSeats, seatWithTrip]
    );
  };

  const handleSelectSecondLegSeat = (seat: SeatType) => {
    if (seat.isBooked) return;
    const seatWithTrip: SeatType = { ...seat, tripId: seat.tripId };
    const alreadySelected = selectedSecondLegSeats.some(s => s.id === seatWithTrip.id);
    setSelectedSecondLegSeats(
      alreadySelected
        ? selectedSecondLegSeats.filter(s => s.id !== seatWithTrip.id)
        : [...selectedSecondLegSeats, seatWithTrip]
    );
  };

  // Handle shuttle point selection
  // Pickup selection removed

  // Handle phone number save/update
  const handleSavePhoneNumber = async () => {
    if (!customerPhoneNumber || customerPhoneNumber.trim().length === 0) {
      setNotification({
        open: true,
        message: "⚠️ Vui lòng nhập số điện thoại",
        type: "error"
      });
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerPhoneNumber.replace(/\s/g, ''))) {
      setNotification({
        open: true,
        message: "⚠️ Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số",
        type: "error"
      });
      return;
    }

    setIsPhoneUpdating(true);
    
    try {
      console.log("📱 Saving phone number:", customerPhoneNumber);
      
      // Get user ID for API call
      const userData = typeof window !== 'undefined' ? 
        JSON.parse(localStorage.getItem("user_data") || "{}") : {};
      const userId = parseInt(userData?.id || '0');
      
      if (!userId || isNaN(userId)) {
        console.error("❌ No valid user ID found for phone update");
        setNotification({
          open: true,
          message: "❌ Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.",
          type: "error"
        });
        return;
      }

      // Call API to update phone number
      await authService.updateCustomerPhoneNumber(userId, customerPhoneNumber.trim());
      
      // Update local state and localStorage after successful API call
      if (user && typeof window !== 'undefined') {
        const updatedUserData = {
          ...userData,
          phone: customerPhoneNumber.trim()
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUserData));
      }

      // Update customer profile state if it exists
      if (customerProfile) {
        setCustomerProfile({
          ...customerProfile,
          phone: customerPhoneNumber.trim()
        });
      }
      
      setIsPhoneEditable(false);
      console.log("✅ Phone number saved successfully");
      
      // Show success notification
      setNotification({
        open: true,
        message: "🎉 Cập nhật số điện thoại thành công!",
        type: "success"
      });
      
    } catch (error) {
      console.error("❌ Error saving phone number:", error);
      setNotification({
        open: true,
        message: "❌ Có lỗi xảy ra khi lưu số điện thoại. Vui lòng thử lại.",
        type: "error"
      });
    } finally {
      setIsPhoneUpdating(false);
    }
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = async (method: string) => {
    setPaymentMethod(method);

    // Nếu chọn VNPay, chuẩn bị gọi API
    if (method === "vnpay") {
      console.log("VNPay selected - preparing API payload...");

      // Chuẩn bị payload theo yêu cầu
      const isRoundTrip =
        searchData.tripType === "roundTrip" && searchData.returnDate
          ? true
          : false;

      console.log("🔍 Trip type analysis:", {
        tripType: searchData.tripType,
        returnDate: searchData.returnDate,
        isRoundTrip: isRoundTrip,
        selectedTrip: selectedTrip?.id,
        selectedDepartureTrip: selectedDepartureTrip?.id,
        selectedReturnTrip: selectedReturnTrip?.id,
        selectedSeats: selectedSeats.length,
        selectedDepartureSeats: selectedDepartureSeats.length,
        selectedReturnSeats: selectedReturnSeats.length,
      });

      let tripSeats: Array<{
        tripId: number;
        fromStationId: number;
        toStationId: number;
        seatIds: number[];
      }> = [];
      let returnTripSeats: Array<{
        tripId: number;
        fromStationId: number;
        toStationId: number;
        seatIds: number[];
      }> = [];

      if (isRoundTrip) {
        if (!selectedDepartureTrip) {
          showNotification("Vui lòng chọn chuyến đi và ghế cho chuyến đi!", "error");
          return;
        }
        const isDepartureTransfer = (selectedDepartureTrip as any).tripType === "transfer" && (selectedDepartureTrip as any).firstTrip && (selectedDepartureTrip as any).secondTrip;

        if (isDepartureTransfer) {
          // Cần ghế cho cả 2 chặng của chuyến đi
          if (selectedFirstLegSeats.length === 0) {
            showNotification("Vui lòng chọn ghế cho chặng 1 của chuyến đi!", "error");
            return;
          }
          if (selectedSecondLegSeats.length === 0) {
            showNotification("Vui lòng chọn ghế cho chặng 2 của chuyến đi!", "error");
          return;
        }

          // Thông tin chuyến đi (2 chặng)
          tripSeats = [
            {
              tripId: (selectedDepartureTrip as any).firstTrip.id,
              fromStationId: (selectedDepartureTrip as any).firstTrip.fromStationId,
              toStationId: (selectedDepartureTrip as any).firstTrip.toStationId,
              seatIds: selectedFirstLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
              // normalized by mapSeatsToIds below (second leg) but keep original list for log clarity
            },
            {
              tripId: (selectedDepartureTrip as any).secondTrip.id,
              fromStationId: (selectedDepartureTrip as any).secondTrip.fromStationId,
              toStationId: (selectedDepartureTrip as any).secondTrip.toStationId,
              seatIds: selectedSecondLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            },
          ];
        } else {
          // Chuyến đi thẳng
          if (selectedDepartureSeats.length === 0) {
            showNotification("Vui lòng chọn ghế cho chuyến đi!", "error");
            return;
          }
        tripSeats = [
          {
            tripId: selectedDepartureTrip.id,
            fromStationId: parseInt(searchData.fromStationId),
            toStationId: parseInt(searchData.toStationId),
            seatIds: selectedDepartureSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
          },
        ];
        }

        // Thông tin chuyến về - sử dụng dữ liệu thực tế
        if (selectedReturnTrip) {
          const isReturnTransfer = (selectedReturnTrip as any).tripType === "transfer" && (selectedReturnTrip as any).firstTrip && (selectedReturnTrip as any).secondTrip;

          if (isReturnTransfer) {
            // Cần ghế cho cả 2 chặng của chuyến về
            if (selectedReturnFirstLegSeats.length === 0) {
              showNotification("Vui lòng chọn ghế cho chặng 1 của chuyến về!", "error");
              return;
            }
            if (selectedReturnSecondLegSeats.length === 0) {
              showNotification("Vui lòng chọn ghế cho chặng 2 của chuyến về!", "error");
              return;
            }

            returnTripSeats = [
              {
                tripId: (selectedReturnTrip as any).firstTrip.id,
                fromStationId: (selectedReturnTrip as any).firstTrip.fromStationId,
                toStationId: (selectedReturnTrip as any).firstTrip.toStationId,
                seatIds: selectedReturnFirstLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
              },
              {
                tripId: (selectedReturnTrip as any).secondTrip.id,
                fromStationId: (selectedReturnTrip as any).secondTrip.fromStationId,
                toStationId: (selectedReturnTrip as any).secondTrip.toStationId,
  seatIds: selectedReturnSecondLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
              },
            ];
          } else {
        returnTripSeats = [
          {
            tripId: selectedReturnTrip.id,
            fromStationId: parseInt(searchData.toStationId), // Đảo ngược vì là chuyến về
            toStationId: parseInt(searchData.fromStationId), // Đảo ngược vì là chuyến về
  seatIds: selectedReturnSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
          },
        ];
          }
        } else {
          returnTripSeats = [];
        }

        console.log("🎫 Round trip payload prepared:", {
          departure: isDepartureTransfer ? {
            firstLeg: {
              tripId: (selectedDepartureTrip as any).firstTrip.id,
              busName: (selectedDepartureTrip as any).firstTrip.busName,
              seatsCount: selectedFirstLegSeats.length,
              seatIds: selectedFirstLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
              normalizedSeatIds: selectedFirstLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            },
            secondLeg: {
              tripId: (selectedDepartureTrip as any).secondTrip.id,
              busName: (selectedDepartureTrip as any).secondTrip.busName,
              seatsCount: selectedSecondLegSeats.length,
              seatIds: selectedSecondLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            }
          } : {
            tripId: selectedDepartureTrip.id,
            busName: selectedDepartureTrip.busName,
            seatsCount: selectedDepartureSeats.length,
            seatIds: selectedDepartureSeats.map((seat) => seat.id),
          },
          return: selectedReturnTrip ? (
            (selectedReturnTrip as any).tripType === 'transfer' ? {
              firstLeg: {
                tripId: (selectedReturnTrip as any).firstTrip.id,
                busName: (selectedReturnTrip as any).firstTrip.busName,
                seatsCount: selectedReturnFirstLegSeats.length,
                seatIds: selectedReturnFirstLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
              },
              secondLeg: {
                tripId: (selectedReturnTrip as any).secondTrip.id,
                busName: (selectedReturnTrip as any).secondTrip.busName,
                seatsCount: selectedReturnSecondLegSeats.length,
                seatIds: selectedReturnSecondLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
                normalizedSeatIds: selectedReturnSecondLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
              }
            } : {
            tripId: selectedReturnTrip.id,
            busName: selectedReturnTrip.busName,
            seatsCount: selectedReturnSeats.length,
            seatIds: selectedReturnSeats.map((seat) => seat.id),
            }
          ) : undefined,
        });
      } else {
        // Chuyến một chiều (bao gồm cả transfer trip)
        if (!selectedTrip) {
          showNotification("Vui lòng chọn chuyến xe!", "error");
          return;
        }

        if (selectedTrip.tripType === "transfer") {
          // Transfer trip - cần 2 tripSeats cho 2 chặng
          if (selectedFirstLegSeats.length === 0 || selectedSecondLegSeats.length === 0) {
            showNotification("Vui lòng chọn ghế cho cả hai chặng!", "error");
            return;
          }

          console.log("🧪 Transfer seat mapping debug:", {
            firstLegRaw: selectedFirstLegSeats.map(s => s.id),
            firstLegBackend: selectedFirstLegSeats.map(getSeatPayloadId),
            secondLegRaw: selectedSecondLegSeats.map(s => s.id),
            secondLegBackend: selectedSecondLegSeats.map(getSeatPayloadId)
          });

          tripSeats = [
            {
              tripId: selectedTrip.firstTrip!.id,
              fromStationId: selectedTrip.firstTrip!.fromStationId,
              toStationId: selectedTrip.firstTrip!.toStationId,
              seatIds: selectedFirstLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            },
            {
              tripId: selectedTrip.secondTrip!.id,
              fromStationId: selectedTrip.secondTrip!.fromStationId,
              toStationId: selectedTrip.secondTrip!.toStationId,
              seatIds: selectedSecondLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            },
          ];

          console.log("🎫 Transfer trip payload prepared:", {
            firstLeg: {
              tripId: selectedTrip.firstTrip!.id,
              busName: selectedTrip.firstTrip!.busName,
              seatsCount: selectedFirstLegSeats.length,
              seatIds: selectedFirstLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            },
            secondLeg: {
              tripId: selectedTrip.secondTrip!.id,
              busName: selectedTrip.secondTrip!.busName,
              seatsCount: selectedSecondLegSeats.length,
              seatIds: selectedSecondLegSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            },
          });
        } else {
          // Regular one-way trip
          if (selectedSeats.length === 0) {
            showNotification("Vui lòng chọn ít nhất một ghế!", "error");
            return;
          }

          tripSeats = [
            {
              tripId: selectedTrip.id,
              fromStationId: parseInt(searchData.fromStationId),
              toStationId: parseInt(searchData.toStationId),
              seatIds: selectedSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            },
          ];

          console.log("🧪 One-way seat mapping debug:", {
            rawIds: selectedSeats.map(s => s.id),
            backendIds: selectedSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
            finalSeatIds: selectedSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n))
          });

          console.log("🎫 One way trip payload prepared:", {
            tripId: selectedTrip.id,
            busName: selectedTrip.busName,
            seatsCount: selectedSeats.length,
            seatIds: selectedSeats.map(s => parseInt(String(s.id),10)).filter(n=>!isNaN(n)),
          });
        }

        returnTripSeats = []; // Rỗng cho chuyến một chiều
      }

      // Tạo payload
      const userId = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem("user_data") || "{}")?.id
        : null;

      let dynamicReturnUrl: string | undefined = undefined;
      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        if (/localhost|127\.0\.0\.1/i.test(origin)) {
          const port = window.location.port || '3000';
            dynamicReturnUrl = `http://localhost:${port}/booking/confirm`;
        } else {
          dynamicReturnUrl = `${origin.replace(/\/$/, '')}/booking/confirm`;
        }
      }
      const payload: VNPayPayloadType = {
        customerId: userId,
        isReturn: isRoundTrip,
        tripSeats: tripSeats,
        returnTripSeats: returnTripSeats,
        returnUrl: dynamicReturnUrl,
      };

      // Debug: log detailed seat id mapping
      console.log("🧪 Seat ID debug before submit:", {
        tripSeats: tripSeats.map(ts => ({ ...ts, seatIdsRaw: ts.seatIds })),
        returnTripSeats: returnTripSeats.map(ts => ({ ...ts, seatIdsRaw: ts.seatIds }))
      });

      // Guard: block if any tripSeats has empty seatIds
      const emptySeatGroup = [...tripSeats, ...returnTripSeats].find(g => !g.seatIds || g.seatIds.length === 0);
      if (emptySeatGroup) {
        console.warn("❌ Blocking submit: found empty seatIds group", emptySeatGroup);
        showNotification("Không thể tạo đặt chỗ: danh sách ghế rỗng hoặc không hợp lệ. Vui lòng chọn lại ghế.", "error");
        return;
      }

      console.log("VNPay API payload prepared:", payload);
      console.log("📱 Customer phone number for booking:", customerPhoneNumber);

      setVnpayPayload(payload);
    }
  };

  // Fetch booking result from API
  const fetchBookingResult = async (referenceId: string | number) => {
    setBookingResultLoading(true);
    setBookingResultError("");
    
    try {
      console.log("🔍 Fetching booking result for referenceId:", referenceId);
      
      const response = await fetch(`https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net/api/Reservations/result/${referenceId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Booking result API response:", data);
      
      setBookingResult(data);
      setBookingDataRestored(true);
    } catch (error) {
      console.error("❌ Failed to fetch booking result:", error);
      setBookingResultError(error instanceof Error ? error.message : "Không thể tải thông tin đặt vé");
      setBookingDataRestored(true); // Still mark as restored to show error state
    } finally {
      setBookingResultLoading(false);
    }
  };

  // Fetch seat availability from API
  const fetchSeatAvailability = async (trip: TripType): Promise<SeatType[]> => {
    try {
      setSeatLoading(true);
      setSeatError("");

      console.log("🎫 Fetching seat availability for trip:", {
        "trip.id (will use this)": trip.id,
        "trip.tripId (string, not used)": trip.tripId,
        "trip.tripType": trip.tripType,
        fromStationId: searchData.fromStationId,
        toStationId: searchData.toStationId,
        "API expects numeric tripId": true,
      });

      // Handle transfer trips differently - need to fetch seats for both firstTrip and secondTrip
  if (trip.tripType === "transfer" && trip.firstTrip && trip.secondTrip) {
        console.log("🔄 Transfer trip detected - fetching seats for both trips:", {
          "firstTrip.id": trip.firstTrip.id,
          "secondTrip.id": trip.secondTrip.id,
          "firstTrip.busName": trip.firstTrip.busName,
          "secondTrip.busName": trip.secondTrip.busName,
        });

        // Fetch seats for both legs WITH raw floors so we can render exactly like preview
        const firstTripSeats = await apiClient.getSeatAvailable(
          trip.firstTrip!.id,
          trip.firstTrip!.fromStationId,
          trip.firstTrip!.toStationId,
          { raw: true }
        );

        const secondTripSeats = await apiClient.getSeatAvailable(
          trip.secondTrip!.id,
          trip.secondTrip!.fromStationId,
          trip.secondTrip!.toStationId,
          { raw: true }
        );

        console.log("🎫 Transfer trip seat data:", {
          "firstTrip seats count": Array.isArray(firstTripSeats) ? firstTripSeats.length : 0,
          "secondTrip seats count": Array.isArray(secondTripSeats) ? secondTripSeats.length : 0,
        });

        // Persist raw floors for each leg if present so renderSeatDiagram can early-return with both floors
        if (Array.isArray(firstTripSeats) && firstTripSeats[0]?.seats) {
          setSeatMapDataByTrip(prev => ({ ...prev, [trip.firstTrip!.id.toString()]: firstTripSeats }));
        }
        if (Array.isArray(secondTripSeats) && secondTripSeats[0]?.seats) {
          setSeatMapDataByTrip(prev => ({ ...prev, [trip.secondTrip!.id.toString()]: secondTripSeats }));
        }

        // Flatten floors if needed and filter actual seats
        const flattenFloors = (data: any[]): any[] => {
          if (data[0]?.seats) {
            return data.flatMap((floor: any) =>
              (floor.seats || [])
                .filter((s: any) => s.isSeat === true && s.id) // Only process actual seats with IDs
                .map((s: any) => ({ ...s, floorIndex: s.floorIndex ?? floor.floorIndex }))
            );
          }
          return data.filter((s: any) => s.isSeat === true && s.id);
        };

        const firstFlat = Array.isArray(firstTripSeats) ? flattenFloors(firstTripSeats) : [];
        const secondFlat = Array.isArray(secondTripSeats) ? flattenFloors(secondTripSeats) : [];

        const transformedFirstSeats: SeatType[] = firstFlat.map((apiSeat: any, index: number) => {
          const rowLetter = String.fromCharCode(65 + ((apiSeat.rowIndex ?? 1) - 1));
          const columnIndex = apiSeat.columnIndex;
          const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;
          return {
            id: apiSeat.id.toString(), // Use original API numeric ID as string
            row: rowLetter,
            column: columnIndex,
            isBooked: !apiSeat.isAvailable,
            price: trip.firstTrip!.price,
            seatNumber: displaySeatNumber,
            seatType: "regular",
            isSelected: false,
            tripId: trip.firstTrip!.id,
            floorIndex: apiSeat.floorIndex ?? 1,
            rowIndex: apiSeat.rowIndex ?? 1,
            columnIndex: apiSeat.columnIndex ?? columnIndex,
          } as SeatType;
        });

        const transformedSecondSeats: SeatType[] = secondFlat.map((apiSeat: any, index: number) => {
          const rowLetter = String.fromCharCode(65 + ((apiSeat.rowIndex ?? 1) - 1));
          const columnIndex = apiSeat.columnIndex;
          const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;
          return {
            id: apiSeat.id.toString(), // Use original API numeric ID as string
            row: rowLetter,
            column: columnIndex,
            isBooked: !apiSeat.isAvailable,
            price: trip.secondTrip!.price,
            seatNumber: displaySeatNumber,
            seatType: "regular",
            isSelected: false,
            tripId: trip.secondTrip!.id,
            floorIndex: apiSeat.floorIndex ?? 1,
            rowIndex: apiSeat.rowIndex ?? 1,
            columnIndex: apiSeat.columnIndex ?? columnIndex,
          } as SeatType;
        });

        // Store seats separately for transfer trips
        setFirstLegSeats(transformedFirstSeats);
        setSecondLegSeats(transformedSecondSeats);

        console.log("🎫 Transfer trip seats stored separately:", {
          "firstLeg seats": transformedFirstSeats.length,
          "secondLeg seats": transformedSecondSeats.length,
        });

        // Return combined for backward compatibility
        return [...transformedFirstSeats, ...transformedSecondSeats];
      }

      // For direct trips, use the original logic
      const tripIdToUse = trip.id;

      console.log("🎫 Using trip.id for seat availability API:", {
        "trip.id (numeric, correct for API)": trip.id,
        "trip.tripId (string identifier, not for API)": trip.tripId,
        "tripIdToUse (final)": tripIdToUse,
        "type": typeof tripIdToUse,
        "trip.direction": trip.direction
      });

      // For return trips, we need to swap fromStationId and toStationId
      // because the direction is opposite to the departure trip
      let fromStationIdToUse = searchData.fromStationId;
      let toStationIdToUse = searchData.toStationId;
      
      if (trip.direction === "return") {
        fromStationIdToUse = searchData.toStationId;
        toStationIdToUse = searchData.fromStationId;
        console.log("🔄 Return trip detected in fetchSeatAvailability - swapping station IDs:", {
          "original fromStationId": searchData.fromStationId,
          "original toStationId": searchData.toStationId,
          "swapped fromStationId": fromStationIdToUse,
          "swapped toStationId": toStationIdToUse
        });
      }

      console.log("🎫 Final station IDs for fetchSeatAvailability API call:", {
        fromStationId: fromStationIdToUse,
        toStationId: toStationIdToUse,
        isReturnTrip: trip.direction === "return"
      });

      const seatData = await apiClient.getSeatAvailable(
        tripIdToUse,
        fromStationIdToUse,
        toStationIdToUse,
        { raw: true } // ensure we keep floor structure
      );

      console.log("🎫 Seat API response (raw mode):", {
        isArray: Array.isArray(seatData),
        floors: Array.isArray(seatData) && seatData[0]?.seats ? seatData.length : 0,
        sample: Array.isArray(seatData) ? seatData.slice(0,2) : seatData
      });

      // If we received floor structure, persist raw floors for renderSeatDiagram early-return path
      if (Array.isArray(seatData) && seatData.length && seatData[0]?.seats) {
        setSeatMapDataByTrip(prev => ({ ...prev, [tripIdToUse.toString()]: seatData }));
      }

      // Transform API response to our SeatType format
      if (Array.isArray(seatData) && seatData.length > 0) {
        // Detect floor structure
        let flatSeats: any[] = [];
        if (seatData[0]?.seats) {
          flatSeats = seatData.flatMap((floor: any) =>
            (floor.seats || [])
              .filter((s: any) => s.isSeat === true && s.id) // Only process actual seats with IDs
              .map((s: any) => ({ ...s, floorIndex: s.floorIndex ?? floor.floorIndex }))
          );
        } else {
          flatSeats = (seatData as any[]).filter((s: any) => s.isSeat === true && s.id);
        }
        console.log("🎫 Normalizing seats for state (flattened)", { count: flatSeats.length, actualSeats: flatSeats.filter(s => s.id).length });

        const transformedSeats: SeatType[] = flatSeats.map(
          (apiSeat: any, index: number) => {
            // Use the API response format with floorIndex, rowIndex, columnIndex
            const rowLetter = String.fromCharCode(65 + (apiSeat.rowIndex - 1)); // Convert rowIndex to letter (1=A, 2=B, etc.)
            const columnIndex = apiSeat.columnIndex;
            
            // Use the seatId from API as display number
            const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;
            
            // Create a consistent UI ID - use the API numeric ID for consistency
            const uiId = apiSeat.id.toString();

            const transformedSeat: SeatType = {
              id: uiId,
              row: rowLetter,
              column: columnIndex,
              isBooked: !apiSeat.isAvailable,
              price: trip.price, // Use trip price as default
              seatNumber: displaySeatNumber,
              seatType: "regular", // Default seat type
              isSelected: false,
              // Preserve meta for later floor separation
              floorIndex: apiSeat.floorIndex ?? 1,
              rowIndex: apiSeat.rowIndex ?? (apiSeat.rowIndex || 1),
              columnIndex: apiSeat.columnIndex ?? columnIndex,
              tripId: tripIdToUse,
            };

            // Debug logging for transformation
            if (index < 5) {
              console.log(`🔍 Seat ${index + 1} transform:`, {
                "API id": apiSeat.id,
                "API seatId": apiSeat.seatId,
                "UI id": transformedSeat.id,
                "seatNumber": transformedSeat.seatNumber,
                "API isAvailable": apiSeat.isAvailable,
                "Transformed isBooked": transformedSeat.isBooked,
              });
            }

            return transformedSeat;
          }
        );

        console.log("🎫 Transformed seats:", {
          "total seats": transformedSeats.length,
          "available seats": transformedSeats.filter(seat => !seat.isBooked).length,
          "booked seats": transformedSeats.filter(seat => seat.isBooked).length,
        });

        return transformedSeats;
      } else {
        console.warn("⚠️ No seat data returned from API or invalid format");
        return [];
      }
    } catch (error) {
      console.error("❌ Error fetching seat availability:", error);
      setSeatError("Không thể tải thông tin ghế. Vui lòng thử lại.");
      return [];
    } finally {
      setSeatLoading(false);
    }
  };

  // Load seat availability for all trips (for trip cards display)
  const loadSeatAvailabilityForTrips = async (
    trips: TripType[],
    searchDataForSeats: SearchDataType
  ) => {
    console.log("🎫 Loading seat availability for", trips.length, "trips...", {
      fromStationId: searchDataForSeats.fromStationId,
      toStationId: searchDataForSeats.toStationId,
    });

    // Validation: ensure we have required station IDs
    if (!searchDataForSeats.fromStationId || !searchDataForSeats.toStationId) {
      console.warn("⚠️ Cannot load seat availability: missing station IDs", {
        fromStationId: searchDataForSeats.fromStationId,
        toStationId: searchDataForSeats.toStationId,
      });
      return;
    }

    // Filter out invalid trips and validate trip data
    const validTrips = trips.filter((trip) => {
      if (!trip) {
        console.warn("⚠️ Skipping undefined trip in loadSeatAvailabilityForTrips");
        return false;
      }
      if (!trip.id && trip.id !== 0) {
        console.warn("⚠️ Skipping trip with missing or invalid id:", trip);
        return false;
      }
      return true;
    });

    console.log("🎫 Valid trips for seat loading:", {
      original: trips.length,
      valid: validTrips.length,
      filtered: trips.length - validTrips.length
    });

    // Load seat availability for first few trips to avoid too many API calls
    const tripsToLoad = validTrips.slice(0, 5); // Limit to first 5 trips

    for (const trip of tripsToLoad) {
      try {
        // Additional validation for trip.id
        if (!trip.id && trip.id !== 0) {
          console.error("❌ Trip has invalid id, skipping:", trip);
          continue;
        }

        // Safe trip key conversion (avoid direct toString on possibly undefined)
        const tripKey = String(trip.id);

        // Set loading state for this trip
        setLoadingSeatsByTrip((prev) => ({
          ...prev,
          [tripKey]: true,
        }));

        console.log("🎫 Loading seats for trip", trip.id, "with params:", {
          "trip.id (used as tripId)": trip.id,
          "trip.tripId (string ID)": trip.tripId,
          "trip object": trip,
          fromStationId: (trip as any).fromStationId || searchDataForSeats.fromStationId,
          toStationId: (trip as any).toStationId || searchDataForSeats.toStationId,
        });

        // SPECIAL HANDLING: transfer trip => NEVER call API with synthetic concatenated id
        if (trip.tripType === "transfer" && trip.firstTrip && trip.secondTrip) {
          console.log("🔄 Transfer trip detected in batch seat prefetch. Fetching each leg separately to avoid using synthetic id:", {
            syntheticId: trip.id,
            firstTripId: trip.firstTrip.id,
            secondTripId: trip.secondTrip.id,
          });

          try {
            const [firstSeatsRaw, secondSeatsRaw] = await Promise.all([
              apiClient.getSeatAvailable(
                trip.firstTrip.id,
                trip.firstTrip.fromStationId,
                trip.firstTrip.toStationId
              ),
              apiClient.getSeatAvailable(
                trip.secondTrip.id,
                trip.secondTrip.fromStationId,
                trip.secondTrip.toStationId
              ),
            ]);

            const firstSeats = Array.isArray(firstSeatsRaw) ? firstSeatsRaw : [];
            const secondSeats = Array.isArray(secondSeatsRaw) ? secondSeatsRaw : [];

      const firstTransformed = firstSeats.map((apiSeat: any, index: number) => {
              const rowLetter = String.fromCharCode(65 + (apiSeat.rowIndex - 1));
              const columnIndex = apiSeat.columnIndex;
              const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;
              return {
        // Use raw backend seat id (string) without prefixes
        id: apiSeat.id ? String(apiSeat.id) : `seat-${index}`,
                row: rowLetter,
                column: columnIndex,
                isBooked: !apiSeat.isAvailable,
                price: trip.firstTrip!.price,
                seatNumber: displaySeatNumber,
                seatType: "regular",
                isSelected: false,
        tripId: trip.firstTrip!.id,
              };
            });

      const secondTransformed = secondSeats.map((apiSeat: any, index: number) => {
              const rowLetter = String.fromCharCode(65 + (apiSeat.rowIndex - 1));
              const columnIndex = apiSeat.columnIndex;
              const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;
              return {
        id: apiSeat.id ? String(apiSeat.id) : `seat-${index}`,
                row: rowLetter,
                column: columnIndex,
                isBooked: !apiSeat.isAvailable,
                price: trip.secondTrip!.price,
                seatNumber: displaySeatNumber,
                seatType: "regular",
                isSelected: false,
        tripId: trip.secondTrip!.id,
              };
            });

            const availableFirst = firstTransformed.filter(s => !s.isBooked).length;
            const availableSecond = secondTransformed.filter(s => !s.isBooked).length;
            const totalFirst = firstTransformed.length;
            const totalSecond = secondTransformed.length;

            setSeatAvailabilityByTrip((prev) => ({
              ...prev,
              [tripKey]: {
                available: availableFirst + availableSecond,
                total: totalFirst + totalSecond,
              },
            }));

            console.log("✅ Prefetched transfer trip seat availability (aggregated):", {
              syntheticId: trip.id,
              availableFirst,
              availableSecond,
              totalFirst,
              totalSecond,
              aggregatedAvailable: availableFirst + availableSecond,
              aggregatedTotal: totalFirst + totalSecond,
            });
          } catch (legError) {
            console.error("❌ Error prefetching transfer trip legs:", legError);
          } finally {
            setLoadingSeatsByTrip((prev) => ({
              ...prev,
              [tripKey]: false,
            }));
          }
          // Move to next trip (skip generic path)
          continue;
        }

        // Use trip.id directly as it's the correct numeric ID for the API
        const tripIdToUse = trip.id;

        console.log("🎫 Using trip.id for seat availability API:", {
          "trip.id (numeric, correct for API)": trip.id,
          "trip.tripId (string identifier, not for API)": trip.tripId,
          "tripIdToUse (final)": tripIdToUse,
          "trip.direction": trip.direction
        });

        // For return trips, we need to swap fromStationId and toStationId
        // because the direction is opposite to the departure trip
        let fromStationIdToUse = (trip as any).fromStationId || searchDataForSeats.fromStationId;
        let toStationIdToUse = (trip as any).toStationId || searchDataForSeats.toStationId;
        
        if (trip.direction === "return") {
          fromStationIdToUse = searchDataForSeats.toStationId;
          toStationIdToUse = searchDataForSeats.fromStationId;
          console.log("🔄 Return trip detected - swapping station IDs:", {
            "original fromStationId": searchDataForSeats.fromStationId,
            "original toStationId": searchDataForSeats.toStationId,
            "swapped fromStationId": fromStationIdToUse,
            "swapped toStationId": toStationIdToUse
          });
        }

        console.log("🎫 Final station IDs for API call:", {
          fromStationId: fromStationIdToUse,
          toStationId: toStationIdToUse,
          isReturnTrip: trip.direction === "return"
        });

        // Call API with the correct station IDs - use new seat-available API
        const seatData = await apiClient.getSeatAvailable(
          tripIdToUse,
          fromStationIdToUse,
          toStationIdToUse
        );

        console.log("🎫 Seat data received for trip", trip.id, ":", {
          dataType: typeof seatData,
          isArray: Array.isArray(seatData),
          length: Array.isArray(seatData) ? seatData.length : "N/A",
        });

        // Transform the data using new API format
        const transformedSeats = Array.isArray(seatData)
          ? seatData.map((apiSeat: any, index: number) => {
              // Use the new API response format with floorIndex, rowIndex, columnIndex
              const rowLetter = String.fromCharCode(65 + (apiSeat.rowIndex - 1)); // Convert rowIndex to letter (1=A, 2=B, etc.)
              const columnIndex = apiSeat.columnIndex;
              
              // Use the seatId from API or generate one
              const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;

              return {
                // Guard against undefined apiSeat.id
                id: apiSeat && apiSeat.id != null ? String(apiSeat.id) : `seat-${index}`,
                row: rowLetter,
                column: columnIndex,
                isBooked: !apiSeat.isAvailable,
                price: trip.price,
                seatNumber: displaySeatNumber,
                seatType: "regular",
                isSelected: false,
              } as SeatType;
            })
          : [];

        const availableSeats = transformedSeats.filter(
          (seat) => !seat.isBooked
        ).length;
        const totalSeats = transformedSeats.length;

        setSeatAvailabilityByTrip((prev) => ({
          ...prev,
          [tripKey]: {
            available: availableSeats,
            total: totalSeats,
          },
        }));

        console.log("🎫 Loaded seat info for trip", trip.id, ":", {
          available: availableSeats,
          total: totalSeats,
        });

        // Small delay to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("❌ Error loading seats for trip", trip.id, ":", error);
      } finally {
        // Clear loading state for this trip
        setLoadingSeatsByTrip((prev) => ({
          ...prev,
          [trip.id.toString()]: false,
        }));
      }
    }
  };

  // Fetch seat map data for trip cards and step 2
  const fetchSeatMapData = async (trip: TripType, force: boolean = false) => {
    const tripKey = trip.id.toString();
    
    // Check if already loading or loaded (unless force reload)
    if (!force && (loadingSeatMapsByTrip[tripKey] || seatMapDataByTrip[tripKey])) {
      return;
    }

    // Set loading state
    setLoadingSeatMapsByTrip((prev) => ({
      ...prev,
      [tripKey]: true,
    }));

    try {
      console.log("🎫 Fetching seat map data for trip:", {
        tripId: trip.id,
        tripType: trip.tripType,
        fromStationId: trip.fromStationId,
        toStationId: trip.toStationId,
      });

      let seatData: any[] = [];

      // Handle transfer trips
      if (trip.tripType === "transfer" && trip.firstTrip && trip.secondTrip) {
        console.log("🔄 Fetching seat map data for transfer trip:", {
          firstTripId: trip.firstTrip.id,
          secondTripId: trip.secondTrip.id,
        });

        // Fetch both legs in parallel
        const [firstTripSeats, secondTripSeats] = await Promise.all([
          apiClient.getSeatAvailable(trip.firstTrip.id, trip.firstTrip.fromStationId, trip.firstTrip.toStationId, { raw: true }),
          apiClient.getSeatAvailable(trip.secondTrip.id, trip.secondTrip.fromStationId, trip.secondTrip.toStationId, { raw: true }),
        ]);

        // Combine seat data from both legs
        seatData = [
          ...(Array.isArray(firstTripSeats) ? firstTripSeats : []),
          ...(Array.isArray(secondTripSeats) ? secondTripSeats : [])
        ];
      } else {
        // Handle direct trips
        let fromStationIdToUse = trip.fromStationId;
        let toStationIdToUse = trip.toStationId;
        
        // For return trips, swap station IDs
        if (trip.direction === "return") {
          fromStationIdToUse = trip.toStationId;
          toStationIdToUse = trip.fromStationId;
        }

        seatData = await apiClient.getSeatAvailable(
          trip.id,
          fromStationIdToUse,
          toStationIdToUse,
          { raw: true }
        );
      }

      console.log("🎫 Seat map data received:", {
        tripId: trip.id,
        dataType: typeof seatData,
        isArray: Array.isArray(seatData),
        length: Array.isArray(seatData) ? seatData.length : "N/A",
        sample: Array.isArray(seatData) ? seatData.slice(0, 3) : "N/A",
      });

      // If response is in floor structure (has .seats arrays) keep ORIGINAL shape (array of floors)
      let storedData: any[] = [];
      if (Array.isArray(seatData) && seatData.length && seatData[0].seats) {
        // Already floors from raw path
        storedData = seatData as any[];
      } else if (Array.isArray(seatData)) {
        storedData = seatData;
      }

      setSeatMapDataByTrip((prev) => ({
        ...prev,
        [tripKey]: storedData,
      }));

      // Small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("❌ Error fetching seat map data for trip", trip.id, ":", error);
      // Store empty array to prevent repeated failed requests
      setSeatMapDataByTrip((prev) => ({
        ...prev,
        [tripKey]: [],
      }));
    } finally {
      // Clear loading state for this trip
      setLoadingSeatMapsByTrip((prev) => ({
        ...prev,
        [tripKey]: false,
      }));
    }
  };

  // Handle seat diagram dialog
  const handleOpenSeatDialog = async (trip: TripType) => {
    setSeatDialogTrip(trip);
    setSeatDialogOpen(true);
    setDialogSeatLoading(true);
    setDialogSeatError("");

    console.log("🎫 Opening seat dialog for trip:", {
      "trip.id (numeric, will use)": trip.id,
      "trip.tripId (string, display only)": trip.tripId,
      "trip.tripType": trip.tripType,
      busName: trip.busName,
    });

    try {
      // Handle transfer trips differently - show both first and second trip seats
      if (trip.tripType === "transfer" && trip.firstTrip && trip.secondTrip) {
        console.log("🔄 Transfer trip detected in handleOpenSeatDialog:", {
          "firstTrip.id": trip.firstTrip.id,
          "secondTrip.id": trip.secondTrip.id,
          "firstTrip.busName": trip.firstTrip.busName,
          "secondTrip.busName": trip.secondTrip.busName,
        });

        // Use both trip IDs for fetching
        const firstTripId = trip.firstTrip.id;
        const secondTripId = trip.secondTrip.id;

        // For return trips, swap stations; use same for both legs (assuming segment split stations handled server side)
        // Fetch both legs in parallel using leg-specific station IDs from API result
        const [firstTripSeats, secondTripSeats] = await Promise.all([
          apiClient.getSeatAvailability(firstTripId, trip.firstTrip.fromStationId, trip.firstTrip.toStationId),
          apiClient.getSeatAvailability(secondTripId, trip.secondTrip.fromStationId, trip.secondTrip.toStationId),
        ]);

        // Transformers
        const transformSeats = (
          apiSeats: ApiSeatResponse[],
          price: number,
          legTripId: number
        ): SeatType[] =>
          (apiSeats || []).map((apiSeat: ApiSeatResponse, index: number) => {
            const seatsPerRow = 4;
            const rowIndex = Math.floor(index / seatsPerRow);
            const columnIndex = (index % seatsPerRow) + 1;
            return {
              id: apiSeat.id.toString(),
              row: String.fromCharCode(65 + rowIndex),
              column: columnIndex,
              isBooked: !apiSeat.isAvailable,
              price,
              seatNumber: apiSeat.seatId,
              seatType: "standard",
              isSelected: false,
              tripId: legTripId,
            };
          });

        const firstSeats = Array.isArray(firstTripSeats)
          ? transformSeats(firstTripSeats, trip.firstTrip!.price, firstTripId)
          : [];
        const secondSeats = Array.isArray(secondTripSeats)
          ? transformSeats(secondTripSeats, trip.secondTrip!.price, secondTripId)
          : [];

        setDialogFirstSeats(firstSeats);
        setDialogSecondSeats(secondSeats);
        // Keep a combined array for any existing consumers
        setDialogSeats([...firstSeats, ...secondSeats]);
        setDialogSeatLoading(false);
        return;
      }

      // For direct trips, use the original logic
      const tripIdToUse = trip.id;

      console.log("🎫 Using trip.id for direct trip seat dialog API:", {
        "trip.id (numeric, correct for API)": trip.id,
        "trip.tripId (string identifier, not for API)": trip.tripId,
        "tripIdToUse (final)": tripIdToUse,
        "trip.direction": trip.direction
      });

      // For return trips, we need to swap fromStationId and toStationId
      // because the direction is opposite to the departure trip
      let fromStationIdToUse = searchData.fromStationId;
      let toStationIdToUse = searchData.toStationId;
      
      if (trip.direction === "return") {
        fromStationIdToUse = searchData.toStationId;
        toStationIdToUse = searchData.fromStationId;
        console.log("🔄 Return trip detected in handleOpenSeatDialog - swapping station IDs:", {
          "original fromStationId": searchData.fromStationId,
          "original toStationId": searchData.toStationId,
          "swapped fromStationId": fromStationIdToUse,
          "swapped toStationId": toStationIdToUse
        });
      }

      console.log("🎫 Final station IDs for handleOpenSeatDialog API call:", {
        fromStationId: fromStationIdToUse,
        toStationId: toStationIdToUse,
        isReturnTrip: trip.direction === "return"
      });

      console.log("🎯 Fetching fresh seat data for dialog...");

      // Fetch fresh seat data specifically for dialog - use new seat-available API
      const seatData = await apiClient.getSeatAvailable(
        tripIdToUse,
        fromStationIdToUse,
        toStationIdToUse
      );

      console.log("🔍 Raw API response for dialog:", {
        dataType: typeof seatData,
        isArray: Array.isArray(seatData),
        length: Array.isArray(seatData) ? seatData.length : "N/A",
        sample: Array.isArray(seatData) ? seatData.slice(0, 5) : "N/A",
      });

      // Transform API response with detailed logging using new API format
      if (Array.isArray(seatData) && seatData.length > 0) {
        // Handle different response structures (floor-based vs flat)
        let actualSeats: any[] = [];
        if (seatData[0]?.seats) {
          // Floor-based structure
          actualSeats = seatData.flatMap((floor: any) =>
            (floor.seats || []).filter((s: any) => s.isSeat === true && s.id)
          );
        } else {
          // Flat structure - filter only actual seats
          actualSeats = seatData.filter((s: any) => s.isSeat === true && s.id);
        }
        
        const transformedSeats: SeatType[] = actualSeats.map(
          (apiSeat: any, index: number) => {
            // Use the API response format with floorIndex, rowIndex, columnIndex
            const rowLetter = String.fromCharCode(65 + (apiSeat.rowIndex - 1)); // Convert rowIndex to letter (1=A, 2=B, etc.)
            const columnIndex = apiSeat.columnIndex;
            
            // Use the seatId from API as display number
            const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;

            const transformedSeat: SeatType = {
              id: apiSeat.id.toString(), // Use API numeric ID as string
              row: rowLetter,
              column: columnIndex,
              isBooked: !apiSeat.isAvailable, // KEY LOGIC: isAvailable: true -> isBooked: false (ghế trống)
              price: trip.price,
              seatNumber: displaySeatNumber,
              seatType: "regular",
              isSelected: false,
              floorIndex: apiSeat.floorIndex,
              rowIndex: apiSeat.rowIndex,
              columnIndex: apiSeat.columnIndex,
            };

            // Debug logging for transformation
            if (index < 5) {
              console.log(`🔍 Dialog Seat ${index + 1} transform:`, {
                "API id": apiSeat.id,
                "API seatId": apiSeat.seatId,
                "API isAvailable": apiSeat.isAvailable,
                "Transformed isBooked": transformedSeat.isBooked,
                "Expected color": transformedSeat.isBooked
                  ? "GRAY (đã đặt)"
                  : "WHITE (trống)",
                seatNumber: displaySeatNumber,
                "Logic check": `!${
                  apiSeat.isAvailable
                } = ${!apiSeat.isAvailable}`,
              });
            }

            return transformedSeat;
          }
        );

        console.log("🎯 Dialog seat data summary:", {
          total: transformedSeats.length,
          booked: transformedSeats.filter((s) => s.isBooked).length,
          available: transformedSeats.filter((s) => !s.isBooked).length,
          sample: transformedSeats.slice(0, 3).map((s) => ({
            id: s.id,
            isBooked: s.isBooked,
            seatNumber: s.seatNumber,
          })),
        });

        setDialogSeats(transformedSeats);

        // Update seat availability info for trip card display
        const availableSeats = transformedSeats.filter(
          (seat) => !seat.isBooked
        ).length;
        const totalSeats = transformedSeats.length;
        setSeatAvailabilityByTrip((prev) => ({
          ...prev,
          [trip.id.toString()]: {
            available: availableSeats,
            total: totalSeats,
          },
        }));

        console.log("🎫 Updated seat availability for trip", trip.id, ":", {
          available: availableSeats,
          total: totalSeats,
        });
      } else {
        console.warn("🎫 No seat data or invalid format:", seatData);
        setDialogSeats([]);
      }
    } catch (error) {
      console.error("❌ Error loading seats for dialog:", error);
      setDialogSeatError("Không thể tải sơ đồ ghế");
      setDialogSeats([]);
    } finally {
      setDialogSeatLoading(false);
    }
  };

  const handleCloseSeatDialog = () => {
    setSeatDialogOpen(false);
    setSeatDialogTrip(null);
    setDialogSeats([]);
    setDialogFirstSeats([]);
    setDialogSecondSeats([]);
    setDialogSeatError("");
  };

  // Format price as VND
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  // Time formatter with fixed timezone to avoid SSR/CSR mismatch
  const formatTimeSafe = (isoString: string): string => {
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(new Date(isoString));
    } catch (e) {
      return "";
    }
  };

  // Render transfer trip card with special layout
  const renderTransferTripCard = (trip: TripType, index: number, onSelect: (trip: TripType) => void, isSelected: boolean) => {
    if (trip.tripType !== "transfer" || !trip.firstTrip || !trip.secondTrip) {
      return null;
    }

    return (
      <motion.div
        key={`transfer-${trip.id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card
          onClick={() => onSelect(trip)}
          sx={{
            mb: 2,
            cursor: "pointer",
            border: isSelected ? "2px solid #f48fb1" : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: 3,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-2px)",
            },
            bgcolor: isSelected ? "rgba(244, 143, 177, 0.05)" : "white",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Transfer Trip Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Chip 
                label="Chuyến nối" 
                size="small" 
                sx={{ 
                  bgcolor: "#fff3e0", 
                  color: "#e65100",
                  fontWeight: 600,
                  mr: 2
                }} 
              />
              <Typography variant="body2" color="text.secondary">
                {trip.totalDuration} • {formatPrice(trip.price)}
              </Typography>
            </Box>

            {/* First Trip */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, p: 2, bgcolor: "rgba(0, 0, 0, 0.02)", borderRadius: 2 }}>
              <Box sx={{ flex: "1 1 150px", textAlign: "center" }}>
                <Typography variant="body1" sx={{ color: "#f48fb1", fontWeight: 600 }}>
                  {formatTimeSafe(trip.firstTrip.timeStart)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trip.firstTrip.fromLocation}
                </Typography>
              </Box>
              <Box sx={{ flex: "0 0 auto", textAlign: "center" }}>
                <DirectionsBus sx={{ color: "#f48fb1", fontSize: 20 }} />
                <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                  {trip.firstTrip.busName}
                </Typography>
              </Box>
              <Box sx={{ flex: "1 1 150px", textAlign: "center" }}>
                <Typography variant="body1" sx={{ color: "#f48fb1", fontWeight: 600 }}>
                  {formatTimeSafe(trip.firstTrip.timeEnd)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trip.firstTrip.endLocation}
                </Typography>
              </Box>
            </Box>

            {/* Transfer Indicator */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", my: 1 }}>
              <Box sx={{ height: 1, flex: 1, bgcolor: "rgba(0, 0, 0, 0.1)" }} />
              <Typography variant="caption" sx={{ mx: 2, color: "text.secondary", fontWeight: 500 }}>
                Chuyển xe
              </Typography>
              <Box sx={{ height: 1, flex: 1, bgcolor: "rgba(0, 0, 0, 0.1)" }} />
            </Box>

            {/* Second Trip */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2, bgcolor: "rgba(0, 0, 0, 0.02)", borderRadius: 2 }}>
              <Box sx={{ flex: "1 1 150px", textAlign: "center" }}>
                <Typography variant="body1" sx={{ color: "#f48fb1", fontWeight: 600 }}>
                  {formatTimeSafe(trip.secondTrip.timeStart)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trip.secondTrip.fromLocation}
                </Typography>
              </Box>
              <Box sx={{ flex: "0 0 auto", textAlign: "center" }}>
                <DirectionsBus sx={{ color: "#f48fb1", fontSize: 20 }} />
                <Typography variant="caption" sx={{ display: "block", color: "text.secondary" }}>
                  {trip.secondTrip.busName}
                </Typography>
              </Box>
              <Box sx={{ flex: "1 1 150px", textAlign: "center" }}>
                <Typography variant="body1" sx={{ color: "#f48fb1", fontWeight: 600 }}>
                  {formatTimeSafe(trip.secondTrip.timeEnd)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trip.secondTrip.endLocation}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
              {isSelected && (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <CheckCircle sx={{ color: "#f48fb1", fontSize: 28 }} />
                </Box>
              )}
            </Box>

            {/* Route Information - Detailed Itinerary */}
            <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(244, 143, 177, 0.05)", borderRadius: 2, border: "1px solid rgba(244, 143, 177, 0.2)" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <Route sx={{ fontSize: 18, color: "#f48fb1", mr: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f48fb1" }}>
                  Lộ trình chi tiết
                </Typography>
              </Box>
              
              {/* First Trip Route */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                  Chặng 1: {trip.firstTrip.fromLocation} → {trip.firstTrip.endLocation}
                </Typography>
                {trip.firstTrip.routeDescription && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1, fontStyle: "italic" }}>
                    📍 Lộ trình: {trip.firstTrip.routeDescription}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1 }}>
                  🚌 Nhà xe: {trip.firstTrip.busName} • ⏰ {formatTimeSafe(trip.firstTrip.timeStart)} - {formatTimeSafe(trip.firstTrip.timeEnd)}
                </Typography>
              </Box>

              {/* Transfer Point */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", my: 1 }}>
                <Box sx={{ height: 1, flex: 1, bgcolor: "rgba(244, 143, 177, 0.3)" }} />
                <Typography variant="caption" sx={{ 
                  mx: 2, 
                  color: "#f48fb1", 
                  fontWeight: 600, 
                  bgcolor: "white", 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 1, 
                  border: "1px solid rgba(244, 143, 177, 0.3)" 
                }}>
                  🔄 Điểm chuyển xe: {trip.firstTrip.endLocation}
                </Typography>
                <Box sx={{ height: 1, flex: 1, bgcolor: "rgba(244, 143, 177, 0.3)" }} />
              </Box>

              {/* Second Trip Route */}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                  Chặng 2: {trip.secondTrip.fromLocation} → {trip.secondTrip.endLocation}
                </Typography>
                {trip.secondTrip.routeDescription && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1, fontStyle: "italic" }}>
                    📍 Lộ trình: {trip.secondTrip.routeDescription}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1 }}>
                  🚌 Nhà xe: {trip.secondTrip.busName} • ⏰ {formatTimeSafe(trip.secondTrip.timeStart)} - {formatTimeSafe(trip.secondTrip.timeEnd)}
                </Typography>
              </Box>

              {/* Summary */}
              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid rgba(244, 143, 177, 0.2)" }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Info sx={{ fontSize: 14 }} />
                  Tổng thời gian: {trip.totalDuration} • Tổng giá: {formatPrice(trip.price)} • Có thể lên/xuống xe tại các điểm trung gian
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const calculateTotalPrice = () => {
    let basePrice = 0;

    // Handle different trip types
    if (searchData.tripType === "roundTrip") {
      // Round trip calculation (support transfer in both directions)
      const isDepartureTransfer = selectedDepartureTrip && (selectedDepartureTrip as any).tripType === "transfer";
      const isReturnTransfer = selectedReturnTrip && (selectedReturnTrip as any).tripType === "transfer";

      // Departure
      if (isDepartureTransfer) {
        const depLeg1Price = (((selectedDepartureTrip as any)?.firstTrip?.price) || 0);
        const depLeg2Price = (((selectedDepartureTrip as any)?.secondTrip?.price) || 0);
        basePrice += selectedFirstLegSeats.length * depLeg1Price;
        basePrice += selectedSecondLegSeats.length * depLeg2Price;
      } else if (selectedDepartureTrip) {
        basePrice += selectedDepartureSeats.length * (selectedDepartureTrip?.price || 0);
      }

      // Return
      if (isReturnTransfer) {
        const retLeg1Price = (((selectedReturnTrip as any)?.firstTrip?.price) || 0);
        const retLeg2Price = (((selectedReturnTrip as any)?.secondTrip?.price) || 0);
        basePrice += selectedReturnFirstLegSeats.length * retLeg1Price;
        basePrice += selectedReturnSecondLegSeats.length * retLeg2Price;
      } else if (selectedReturnTrip) {
        basePrice += selectedReturnSeats.length * (selectedReturnTrip?.price || 0);
      }
    } else {
      // One-way trip calculation (including transfer trips)
      if (selectedTrip?.tripType === "transfer") {
        // Transfer trip calculation: sum of both legs
        if (selectedTrip.firstTrip && selectedFirstLegSeats.length > 0) {
          basePrice += selectedFirstLegSeats.length * selectedTrip.firstTrip.price;
        }
        if (selectedTrip.secondTrip && selectedSecondLegSeats.length > 0) {
          basePrice += selectedSecondLegSeats.length * selectedTrip.secondTrip.price;
        }
      } else {
        // Regular one-way trip calculation
        const currentTrip = selectedTrip || selectedDepartureTrip;
        const currentSeats = selectedSeats.length > 0 ? selectedSeats : selectedDepartureSeats;
        
        if (currentTrip && currentSeats.length > 0) {
          basePrice = currentSeats.length * currentTrip.price;
        }
      }
    }

    let shuttleFee = 0;
    // Pickup fee removed

    return {
      basePrice,
      shuttleFee,
      total: basePrice + shuttleFee,
    };
  };

  // Render different step content
  const getStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderSearchTrips();
      case 1:
        return renderSeatSelection();
      case 2:
        return renderPaymentWithShuttle();
      default:
        return "Unknown step";
    }
  };

  // Render search and trips
  const renderSearchTrips = () => {
    const isRoundTrip = searchData.tripType === "roundTrip";
    
    return (
      <Box sx={{ mt: 4 }}>
        {/* Search Information Panel */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#f48fb1" }}>
            Thông tin tìm kiếm
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
              <TextField
                fullWidth
                label="Điểm khởi hành"
                value={searchData.from}
                InputProps={{
                  startAdornment: (
                    <LocationOn sx={{ mr: 1, color: "#f48fb1" }} />
                  ),
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Trạm đi"
                value={searchData.fromStation}
                InputProps={{
                  startAdornment: (
                    <DirectionsBus sx={{ mr: 1, color: "#f48fb1" }} />
                  ),
                  readOnly: true,
                }}
                sx={{ mt: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
              <TextField
                fullWidth
                label="Điểm đến"
                value={searchData.to}
                InputProps={{
                  startAdornment: (
                    <LocationOn sx={{ mr: 1, color: "#f48fb1" }} />
                  ),
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="Trạm đến"
                value={searchData.toStation}
                InputProps={{
                  startAdornment: (
                    <DirectionsBus sx={{ mr: 1, color: "#f48fb1" }} />
                  ),
                  readOnly: true,
                }}
                sx={{ mt: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
              <TextField
                fullWidth
                label="Ngày khởi hành"
                value={searchData.departureDate}
                InputProps={{ readOnly: true }}
              />
            </Box>
            {isRoundTrip && searchData.returnDate && (
              <Box sx={{ width: { xs: "100%", sm: "calc(50% - 12px)" } }}>
                <TextField
                  fullWidth
                  label="Ngày về"
                  value={searchData.returnDate}
                  InputProps={{ readOnly: true }}
                />
              </Box>
            )}
          </Box>
        </Paper>

        {loading ? (
          renderLoading()
        ) : (
          <>
            {/* Round Trip Layout */}
            {isRoundTrip ? (
              <Box>
                {/* Departure Trips Section */}
                <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: "#1976d2",
                        mr: 2,
                      }}
                    />
                    <Typography variant="h6" sx={{ color: "#1976d2" }}>
                      🛫 Chuyến đi ({searchData.departureDate})
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ ml: 2, color: "text.secondary" }}
                    >
                      {departureTrips.length} chuyến có sẵn
                    </Typography>
                  </Box>

                  {departureTrips.length > 0 ? (
                    <Box>
                      {departureTrips.map((trip, index) => {
                        // Use special render for transfer trips in round-trip departure
                        if (trip.tripType === "transfer") {
                          return renderTransferTripCard(
                            trip, 
                            index, 
                            handleSelectDepartureTrip, 
                            selectedDepartureTrip?.id === trip.id
                          );
                        }
                        
                        // Regular departure trip card
                        return (
                          <motion.div
                            key={`departure-${trip.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                          <Card
                            onClick={() => handleSelectDepartureTrip(trip)}
                            sx={{
                              mb: 2,
                              cursor: "pointer",
                              border:
                                selectedDepartureTrip?.id === trip.id
                                  ? "2px solid #1976d2"
                                  : "1px solid rgba(0, 0, 0, 0.08)",
                              borderRadius: 3,
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                                transform: "translateY(-2px)",
                              },
                              bgcolor:
                                selectedDepartureTrip?.id === trip.id
                                  ? "rgba(25, 118, 210, 0.05)"
                                  : "white",
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                <Box sx={{ flex: "1 1 200px", textAlign: "center" }}>
                                  <Typography
                                    variant="h6"
                                    sx={{ color: "#1976d2", fontWeight: 700 }}
                                  >
                                    {formatTimeSafe(trip.timeStart)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {trip.fromLocation}
                                  </Typography>
                                </Box>
                                <Box sx={{ flex: "0 0 auto", textAlign: "center" }}>
                                  <DirectionsBus
                                    sx={{ color: "#1976d2", fontSize: 24 }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "block",
                                      color: "text.secondary",
                                    }}
                                  >
                                    {trip.busName}
                                  </Typography>
                                </Box>
                                <Box sx={{ flex: "1 1 200px", textAlign: "center" }}>
                                  <Typography
                                    variant="h6"
                                    sx={{ color: "#1976d2", fontWeight: 700 }}
                                  >
                                    {formatTimeSafe(trip.timeEnd)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {trip.endLocation}
                                  </Typography>
                                </Box>
                                <Box sx={{ flex: "0 0 auto", textAlign: "center" }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: "#f48fb1",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {formatPrice(trip.price)}
                                  </Typography>
                                </Box>
                                {selectedDepartureTrip?.id === trip.id && (
                                  <Box
                                    sx={{
                                      flex: "0 0 auto",
                                      display: "flex",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <CheckCircle
                                      sx={{ color: "#1976d2", fontSize: 28 }}
                                    />
                                  </Box>
                                )}
                              </Box>
                              
                              {/* Route Information - Detailed Direct Trip Route */}
                              {trip.routeDescription && (
                                <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(25, 118, 210, 0.05)", borderRadius: 2, border: "1px solid rgba(25, 118, 210, 0.2)" }}>
                                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                                    <Route sx={{ fontSize: 18, color: "#1976d2", mr: 1 }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1976d2" }}>
                                      Lộ trình chi tiết
                                    </Typography>
                                  </Box>
                                  
                                  {/* Route Details */}
                                  <Box sx={{ mb: 1.5 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                                      Chuyến thẳng: {trip.fromLocation} → {trip.endLocation}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1, fontStyle: "italic" }}>
                                      📍 {trip.routeDescription}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1, mt: 0.5 }}>
                                      🚌 Nhà xe: {trip.busName} • ⏰ {formatTimeSafe(trip.timeStart)} - {formatTimeSafe(trip.timeEnd)} • 💰 {formatPrice(trip.price)}
                                    </Typography>
                                  </Box>

                                  {/* Summary */}
                                  <Box sx={{ pt: 1, borderTop: "1px solid rgba(25, 118, 210, 0.2)" }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                      <Info sx={{ fontSize: 14 }} />
                                      Chuyến thẳng không cần chuyển xe • Có thể lên/xuống xe tại các điểm trung gian theo lộ trình
                                    </Typography>
                                  </Box>
                                </Box>
                              )}


                            </CardContent>
                          </Card>
                        </motion.div>
                        );
                      })}
                    </Box>
                  ) : (
                    <Alert severity="info">
                      Không tìm thấy chuyến đi nào cho ngày{" "}
                      {searchData.departureDate}
                    </Alert>
                  )}
                </Paper>

                {/* Return Trips Section - Only show if departure trip is selected */}
                {selectedDepartureTrip && (
                  <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "#7b1fa2",
                          mr: 2,
                        }}
                      />
                      <Typography variant="h6" sx={{ color: "#7b1fa2" }}>
                        🛬 Chuyến về ({searchData.returnDate})
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ ml: 2, color: "text.secondary" }}
                      >
                        {returnTrips.length} chuyến có sẵn
                      </Typography>
                    </Box>

                    {returnTrips.length > 0 ? (
                      <Box>
                        {returnTrips.map((trip, index) => {
                          // Use special render for transfer trips in return
                          if (trip.tripType === "transfer") {
                            return renderTransferTripCard(
                              trip, 
                              index, 
                              handleSelectReturnTrip, 
                              selectedReturnTrip?.id === trip.id
                            );
                          }
                          
                          // Regular return trip card
                          return (
                            <motion.div
                              key={`return-${trip.id}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                            <Card
                              onClick={() => handleSelectReturnTrip(trip)}
                              sx={{
                                mb: 2,
                                cursor: "pointer",
                                border:
                                  selectedReturnTrip?.id === trip.id
                                    ? "2px solid #7b1fa2"
                                    : "1px solid rgba(0, 0, 0, 0.08)",
                                borderRadius: 3,
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                                  transform: "translateY(-2px)",
                                },
                                bgcolor:
                                  selectedReturnTrip?.id === trip.id
                                    ? "rgba(123, 31, 162, 0.05)"
                                    : "white",
                              }}
                            >
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                                  <Box sx={{ flex: "1 1 200px", textAlign: "center" }}>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        color: "#7b1fa2",
                                        fontWeight: 700,
                                      }}
                                    >
                                   {formatTimeSafe(trip.timeStart)}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {trip.fromLocation}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ flex: "0 0 auto", textAlign: "center" }}>
                                    <DirectionsBus
                                      sx={{ color: "#7b1fa2", fontSize: 24 }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        display: "block",
                                        color: "text.secondary",
                                      }}
                                    >
                                      {trip.busName}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ flex: "1 1 200px", textAlign: "center" }}>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        color: "#7b1fa2",
                                        fontWeight: 700,
                                      }}
                                    >
                                     {formatTimeSafe(trip.timeEnd)}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {trip.endLocation}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ flex: "0 0 auto", textAlign: "center" }}>
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        color: "#f48fb1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {formatPrice(trip.price)}
                                    </Typography>
                                  </Box>
                                  {selectedReturnTrip?.id === trip.id && (
                                    <Box
                                      sx={{
                                        flex: "0 0 auto",
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <CheckCircle
                                        sx={{ color: "#7b1fa2", fontSize: 28 }}
                                      />
                                    </Box>
                                  )}
                                </Box>
                                
                                {/* Route Information - Detailed Return Trip Route */}
                                {trip.routeDescription && (
                                  <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(123, 31, 162, 0.05)", borderRadius: 2, border: "1px solid rgba(123, 31, 162, 0.2)" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                                      <Route sx={{ fontSize: 18, color: "#7b1fa2", mr: 1 }} />
                                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#7b1fa2" }}>
                                        Lộ trình chi tiết (Chuyến về)
                                      </Typography>
                                    </Box>
                                    
                                    {/* Route Details */}
                                    <Box sx={{ mb: 1.5 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                                        Chuyến thẳng: {trip.fromLocation} → {trip.endLocation}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1, fontStyle: "italic" }}>
                                        📍 {trip.routeDescription}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1, mt: 0.5 }}>
                                        🚌 Nhà xe: {trip.busName} • ⏰ {formatTimeSafe(trip.timeStart)} - {formatTimeSafe(trip.timeEnd)} • 💰 {formatPrice(trip.price)}
                                      </Typography>
                                    </Box>

                                    {/* Summary */}
                                    <Box sx={{ pt: 1, borderTop: "1px solid rgba(123, 31, 162, 0.2)" }}>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Info sx={{ fontSize: 14 }} />
                                        Chuyến về thẳng không cần chuyển xe • Có thể lên/xuống xe tại các điểm trung gian theo lộ trình
                                      </Typography>
                                    </Box>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                          );
                        })}
                      </Box>
                    ) : (
                      <Alert severity="info">
                        Không tìm thấy chuyến về nào cho ngày{" "}
                        {searchData.returnDate}
                      </Alert>
                    )}
                  </Paper>
                )}
              </Box>
            ) : (
              /* One-way Trip Layout */
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ color: "#1976d2" }}>
                    ➡️ Chuyến xe một chiều
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ ml: 2, color: "text.secondary" }}
                  >
                    {departureTrips.length} chuyến có sẵn
                  </Typography>
                </Box>

                {departureTrips.length > 0 ? (
                  departureTrips.map((trip, index) => {
                    // Use special render for transfer trips
                    if (trip.tripType === "transfer") {
                      return renderTransferTripCard(
                        trip, 
                        index, 
                        handleSelectDepartureTrip, 
                        selectedDepartureTrip?.id === trip.id || selectedTrip?.id === trip.id
                      );
                    }
                    
                    // Regular trip card
                    return (
                      <motion.div
                        key={`oneway-${trip.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                      <Card
                        onClick={() => handleSelectDepartureTrip(trip)}
                        sx={{
                          mb: 2,
                          cursor: "pointer",
                          border:
                            selectedDepartureTrip?.id === trip.id || selectedTrip?.id === trip.id
                              ? "2px solid #f48fb1"
                              : "1px solid rgba(0, 0, 0, 0.08)",
                          borderRadius: 3,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                            transform: "translateY(-2px)",
                          },
                          bgcolor:
                            selectedDepartureTrip?.id === trip.id || selectedTrip?.id === trip.id
                              ? "rgba(244, 143, 177, 0.05)"
                              : "white",
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                            <Box sx={{ flex: "1 1 200px", textAlign: "center" }}>
                              <Typography
                                variant="h6"
                                sx={{ color: "#f48fb1", fontWeight: 700 }}
                              >
                                {new Date(trip.timeStart).toLocaleTimeString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {trip.fromLocation}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: "0 0 auto", textAlign: "center" }}>
                              <DirectionsBus
                                sx={{ color: "#f48fb1", fontSize: 24 }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  color: "text.secondary",
                                }}
                              >
                                {trip.busName}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: "1 1 200px", textAlign: "center" }}>
                              <Typography
                                variant="h6"
                                sx={{ color: "#f48fb1", fontWeight: 700 }}
                              >
                                {new Date(trip.timeEnd).toLocaleTimeString(
                                  "vi-VN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {trip.endLocation}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: "0 0 auto", textAlign: "center" }}>
                              <Typography
                                variant="h6"
                                sx={{ color: "#f48fb1", fontWeight: 700 }}
                              >
                                {formatPrice(trip.price)}
                              </Typography>
                            </Box>
                            {(selectedDepartureTrip?.id === trip.id || selectedTrip?.id === trip.id) && (
                              <Box
                                sx={{
                                  flex: "0 0 auto",
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <CheckCircle
                                  sx={{ color: "#f48fb1", fontSize: 28 }}
                                />
                              </Box>
                            )}
                          </Box>
                          
                          {/* Route Information - Detailed One-way Trip Route */}
                          {trip.routeDescription && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(244, 143, 177, 0.05)", borderRadius: 2, border: "1px solid rgba(244, 143, 177, 0.2)" }}>
                              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                                <Route sx={{ fontSize: 18, color: "#f48fb1", mr: 1 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#f48fb1" }}>
                                  Lộ trình chi tiết
                                </Typography>
                              </Box>
                              
                              {/* Route Details */}
                              <Box sx={{ mb: 1.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                                  Chuyến thẳng: {trip.fromLocation} → {trip.endLocation}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1, fontStyle: "italic" }}>
                                  📍 {trip.routeDescription}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 1, mt: 0.5 }}>
                                  🚌 Nhà xe: {trip.busName} • ⏰ {new Date(trip.timeStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - {new Date(trip.timeEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • 💰 {formatPrice(trip.price)}
                                </Typography>
                              </Box>

                              {/* Summary */}
                              <Box sx={{ pt: 1, borderTop: "1px solid rgba(244, 143, 177, 0.2)" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <Info sx={{ fontSize: 14 }} />
                                  Chuyến thẳng không cần chuyển xe • Có thể lên/xuống xe tại các điểm trung gian theo lộ trình
                                </Typography>
                              </Box>
                            </Box>
                          )}


                        </CardContent>
                      </Card>
                    </motion.div>
                    );
                  })
                ) : (
                  <Alert severity="info">
                    Không tìm thấy chuyến xe nào cho lịch trình này
                  </Alert>
                )}
              </Paper>
            )}
          </>
        )}
      </Box>
    );
  };

  // Render seat selection
  const renderSeatSelection = () => {
    const isRoundTrip = searchData.tripType === "roundTrip";
    const isTransferTrip = selectedTrip?.tripType === "transfer" && selectedTrip.firstTrip && selectedTrip.secondTrip;
    const isDepartureTransfer = isRoundTrip && selectedDepartureTrip && (selectedDepartureTrip as any).tripType === 'transfer';
    const isReturnTransfer = isRoundTrip && selectedReturnTrip && (selectedReturnTrip as any).tripType === 'transfer';
    
    // Check if we should show dual seat diagrams for round trip OR transfer trip
    const shouldShowDualDiagrams = (
      (isRoundTrip && selectedDepartureTrip && selectedReturnTrip && 
       !isDepartureTransfer && !isReturnTransfer &&
       departureSeats.length > 0 && returnSeats.length > 0)
    ) || (
      (!isRoundTrip && isTransferTrip && selectedTrip?.firstTrip && selectedTrip?.secondTrip && firstLegSeats.length > 0 && secondLegSeats.length > 0)
    );

    const shouldShowQuadDiagrams = isRoundTrip && isDepartureTransfer && isReturnTransfer &&
      firstLegSeats.length > 0 && secondLegSeats.length > 0 && returnFirstLegSeats.length > 0 && returnSecondLegSeats.length > 0;

    // Triple diagrams: transfer departure (2 legs) + direct return (1 leg)
    const shouldShowTripleDiagrams = (
      isDepartureTransfer && selectedReturnTrip && !isReturnTransfer &&
      firstLegSeats.length > 0 && secondLegSeats.length > 0 && returnSeats.length > 0
    );

    // Triple diagrams: direct departure (1 leg) + transfer return (2 legs)
    const shouldShowTripleReturnDiagrams = (
      !isDepartureTransfer && isReturnTransfer && selectedDepartureTrip &&
      departureSeats.length > 0 && returnFirstLegSeats.length > 0 && returnSecondLegSeats.length > 0
    );

    if (shouldShowQuadDiagrams) {
      return (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 4 }}>
            🎫 Chọn ghế: Chặng 1 + Chặng 2 (chuyến đi - nối) + Chặng 1 + Chặng 2 (chuyến về - nối)
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 4 }}>
            {/* Outbound Leg 1 */}
            {renderSeatPanel(
              '🧩 Chặng 1 - Chuyến đi',
              (selectedDepartureTrip as any)?.firstTrip?.busName,
              searchData.departureDate,
              firstLegSeats,
              selectedFirstLegSeats,
              handleSelectFirstLegSeat,
              '#1976d2',
              seatMapDataByTrip[(selectedDepartureTrip as any)?.firstTrip?.id?.toString()] || []
            )}
            {/* Outbound Leg 2 */}
            {renderSeatPanel(
              '🧩 Chặng 2 - Chuyến đi',
              (selectedDepartureTrip as any)?.secondTrip?.busName,
              searchData.departureDate,
              secondLegSeats,
              selectedSecondLegSeats,
              handleSelectSecondLegSeat,
              '#1976d2',
              seatMapDataByTrip[(selectedDepartureTrip as any)?.secondTrip?.id?.toString()] || []
            )}
            {/* Return Leg 1 */}
            {renderSeatPanel(
              '🧩 Chặng 1 - Chuyến về',
              (selectedReturnTrip as any)?.firstTrip?.busName,
              searchData.returnDate,
              returnFirstLegSeats,
              selectedReturnFirstLegSeats,
              (seat)=>setSelectedReturnFirstLegSeats(t=> t.some(s=>s.id===seat.id)? t.filter(s=>s.id!==seat.id):[...t, seat]),
              '#7b1fa2',
              seatMapDataByTrip[(selectedReturnTrip as any)?.firstTrip?.id?.toString()] || []
            )}
            {/* Return Leg 2 */}
            {renderSeatPanel(
              '🧩 Chặng 2 - Chuyến về',
              (selectedReturnTrip as any)?.secondTrip?.busName,
              searchData.returnDate,
              returnSecondLegSeats,
              selectedReturnSecondLegSeats,
              (seat)=>setSelectedReturnSecondLegSeats(t=> t.some(s=>s.id===seat.id)? t.filter(s=>s.id!==seat.id):[...t, seat]),
              '#7b1fa2',
              seatMapDataByTrip[(selectedReturnTrip as any)?.secondTrip?.id?.toString()] || []
            )}
          </Box>
        </Box>
      );
    }

    if (shouldShowTripleDiagrams) {
      return (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 4 }}>
            🎫 Chọn ghế: Chặng 1 + Chặng 2 (chuyến đi - nối) + Chuyến về
          </Typography>

          {/* Status Summary */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "center", gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, py: 2, borderRadius: 3, bgcolor: "rgba(25, 118, 210, 0.1)", border: "2px solid #1976d2" }}>
              <CheckCircle sx={{ color: "#1976d2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Chặng 1: {(selectedDepartureTrip as any)?.firstTrip?.busName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, py: 2, borderRadius: 3, bgcolor: "rgba(25, 118, 210, 0.1)", border: "2px solid #1976d2" }}>
              <CheckCircle sx={{ color: "#1976d2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Chặng 2: {(selectedDepartureTrip as any)?.secondTrip?.busName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, py: 2, borderRadius: 3, bgcolor: "rgba(123, 31, 162, 0.1)", border: "2px solid #7b1fa2" }}>
              <CheckCircle sx={{ color: "#7b1fa2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Chuyến về: {selectedReturnTrip?.busName}
              </Typography>
            </Box>
          </Box>

          {/* Triple Seat Diagrams */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 4, mb: 4 }}>
            {/* Leg 1 */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #1976d2", background: "linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: 700 }}>
                🧩 Chặng 1 - {(selectedDepartureTrip as any)?.firstTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {(selectedDepartureTrip as any)?.firstTrip && (
                  <>
                    {new Date((selectedDepartureTrip as any).firstTrip.timeStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {" "}- {new Date((selectedDepartureTrip as any).firstTrip.timeEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {searchData.departureDate}
                  </>
                )}
              </Typography>
              {renderSeatDiagram(
                firstLegSeats.map(seat => ({ ...seat, isSelected: selectedFirstLegSeats.some(s => s.id === seat.id) })),
                true,
                handleSelectFirstLegSeat
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(25, 118, 210, 0.08)", borderRadius: 2, border: "1px solid rgba(25, 118, 210, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1976d2" }}>
                  Ghế đã chọn ({selectedFirstLegSeats.length}):
                </Typography>
                {selectedFirstLegSeats.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedFirstLegSeats.map((seat) => (
                      <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => handleSelectFirstLegSeat(seat)} sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Chưa chọn ghế nào
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#1976d2" }}>
                  {formatPrice(selectedFirstLegSeats.length * (((selectedDepartureTrip as any)?.firstTrip?.price) || 0))}
                </Typography>
              </Box>
            </Paper>

            {/* Leg 2 */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #1976d2", background: "linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: 700 }}>
                🧩 Chặng 2 - {(selectedDepartureTrip as any)?.secondTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {(selectedDepartureTrip as any)?.secondTrip && (
                  <>
                    {new Date((selectedDepartureTrip as any).secondTrip.timeStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {" "}- {new Date((selectedDepartureTrip as any).secondTrip.timeEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {searchData.departureDate}
                  </>
                )}
              </Typography>
              {renderSeatDiagram(
                secondLegSeats.map(seat => ({ ...seat, isSelected: selectedSecondLegSeats.some(s => s.id === seat.id) })),
                true,
                handleSelectSecondLegSeat
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(25, 118, 210, 0.08)", borderRadius: 2, border: "1px solid rgba(25, 118, 210, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1976d2" }}>
                  Ghế đã chọn ({selectedSecondLegSeats.length}):
                </Typography>
                {selectedSecondLegSeats.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedSecondLegSeats.map((seat) => (
                      <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => handleSelectSecondLegSeat(seat)} sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Chưa chọn ghế nào
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#1976d2" }}>
                  {formatPrice(selectedSecondLegSeats.length * (((selectedDepartureTrip as any)?.secondTrip?.price) || 0))}
                </Typography>
              </Box>
            </Paper>

            {/* Return */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #7b1fa2", background: "linear-gradient(135deg, rgba(123, 31, 162, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2", fontWeight: 700 }}>
                🛬 Chuyến về - {selectedReturnTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedReturnTrip && (
                  <>
                    {new Date(selectedReturnTrip.timeStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {" "}- {new Date(selectedReturnTrip.timeEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {searchData.returnDate}
                  </>
                )}
              </Typography>
              {renderSeatDiagram(
                returnSeats.map(seat => ({ ...seat, isSelected: selectedReturnSeats.some(s => s.id === seat.id) })),
                true,
                handleSelectReturnSeat
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(123, 31, 162, 0.08)", borderRadius: 2, border: "1px solid rgba(123, 31, 162, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#7b1fa2" }}>
                  Ghế đã chọn ({selectedReturnSeats.length}):
                </Typography>
                {selectedReturnSeats.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedReturnSeats.map((seat) => (
                      <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => handleSelectReturnSeat(seat)} sx={{ bgcolor: "#7b1fa2", color: "white", fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Chưa chọn ghế nào
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#7b1fa2" }}>
                  {formatPrice(selectedReturnSeats.length * ((selectedReturnTrip?.price) || 0))}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Total Summary for 3 sections */}
          <Paper elevation={6} sx={{ p: 4, borderRadius: 3, background: "linear-gradient(135deg, rgba(244, 143, 177, 0.1) 0%, white 100%)", border: "2px solid #f48fb1" }}>
            <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 3 }}>
              💰 Tổng quan thanh toán
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3, alignItems: "end" }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>🧩 Chặng 1</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedFirstLegSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>{formatPrice(selectedFirstLegSeats.length * (((selectedDepartureTrip as any)?.firstTrip?.price) || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>🧩 Chặng 2</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedSecondLegSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>{formatPrice(selectedSecondLegSeats.length * (((selectedDepartureTrip as any)?.secondTrip?.price) || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7b1fa2", mb: 1 }}>🛬 Chuyến về</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedReturnSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2" }}>{formatPrice(selectedReturnSeats.length * ((selectedReturnTrip?.price) || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center", p: 3, bgcolor: "#f48fb1", borderRadius: 3, color: "white" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>TỔNG CỘNG</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {formatPrice(
                    (selectedFirstLegSeats.length * ((((selectedDepartureTrip as any)?.firstTrip?.price) || 0))) +
                    (selectedSecondLegSeats.length * ((((selectedDepartureTrip as any)?.secondTrip?.price) || 0))) +
                    (selectedReturnSeats.length * ((selectedReturnTrip?.price) || 0))
                  )}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    }

    if (shouldShowTripleReturnDiagrams) {
      return (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 4 }}>
            🎫 Chọn ghế: Chuyến đi + Chặng 1 + Chặng 2 (chuyến về - nối)
          </Typography>

          {/* Status Summary */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "center", gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, py: 2, borderRadius: 3, bgcolor: "rgba(25, 118, 210, 0.1)", border: "2px solid #1976d2" }}>
              <CheckCircle sx={{ color: "#1976d2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Chuyến đi: {selectedDepartureTrip?.busName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, py: 2, borderRadius: 3, bgcolor: "rgba(123, 31, 162, 0.1)", border: "2px solid #7b1fa2" }}>
              <CheckCircle sx={{ color: "#7b1fa2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Chặng 1: {(selectedReturnTrip as any)?.firstTrip?.busName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, py: 2, borderRadius: 3, bgcolor: "rgba(123, 31, 162, 0.1)", border: "2px solid #7b1fa2" }}>
              <CheckCircle sx={{ color: "#7b1fa2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Chặng 2: {(selectedReturnTrip as any)?.secondTrip?.busName}
              </Typography>
            </Box>
          </Box>

          {/* Triple Seat Diagrams */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 4, mb: 4 }}>
            {/* Departure Direct */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #1976d2", background: "linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: 700 }}>
                🛫 Chuyến đi - {selectedDepartureTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedDepartureTrip && (
                  <>
                    {new Date(selectedDepartureTrip.timeStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {" "}- {new Date(selectedDepartureTrip.timeEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {searchData.departureDate}
                  </>
                )}
              </Typography>
              {renderSeatDiagram(
                departureSeats.map(seat => ({ ...seat, isSelected: selectedDepartureSeats.some(s => s.id === seat.id) })),
                true,
                handleSelectDepartureSeat
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(25, 118, 210, 0.08)", borderRadius: 2, border: "1px solid rgba(25, 118, 210, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1976d2" }}>
                  Ghế đã chọn ({selectedDepartureSeats.length}):
                </Typography>
                {selectedDepartureSeats.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedDepartureSeats.map((seat) => (
                      <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => handleSelectDepartureSeat(seat)} sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Chưa chọn ghế nào
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#1976d2" }}>
                  {formatPrice(selectedDepartureSeats.length * ((selectedDepartureTrip?.price) || 0))}
                </Typography>
              </Box>
            </Paper>

            {/* Return Leg 1 */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #7b1fa2", background: "linear-gradient(135deg, rgba(123, 31, 162, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2", fontWeight: 700 }}>
                🧩 Chặng 1 - {(selectedReturnTrip as any)?.firstTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {(selectedReturnTrip as any)?.firstTrip && (
                  <>
                    {new Date((selectedReturnTrip as any).firstTrip.timeStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {" "}- {new Date((selectedReturnTrip as any).firstTrip.timeEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {searchData.returnDate}
                  </>
                )}
              </Typography>
              {renderSeatDiagram(
                returnFirstLegSeats.map(seat => ({ ...seat, isSelected: selectedReturnFirstLegSeats.some(s => s.id === seat.id) })),
                true,
                (seat) => setSelectedReturnFirstLegSeats(prev => prev.some(s => s.id === seat.id) ? prev.filter(s => s.id !== seat.id) : [...prev, seat])
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(123, 31, 162, 0.08)", borderRadius: 2, border: "1px solid rgba(123, 31, 162, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#7b1fa2" }}>
                  Ghế đã chọn ({selectedReturnFirstLegSeats.length}):
                </Typography>
                {selectedReturnFirstLegSeats.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedReturnFirstLegSeats.map((seat) => (
                      <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => setSelectedReturnFirstLegSeats(prev => prev.filter(s => s.id !== seat.id))} sx={{ bgcolor: "#7b1fa2", color: "white", fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Chưa chọn ghế nào
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#7b1fa2" }}>
                  {formatPrice(selectedReturnFirstLegSeats.length * (((selectedReturnTrip as any)?.firstTrip?.price) || 0))}
                </Typography>
              </Box>
            </Paper>

            {/* Return Leg 2 */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #7b1fa2", background: "linear-gradient(135deg, rgba(123, 31, 162, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2", fontWeight: 700 }}>
                🧩 Chặng 2 - {(selectedReturnTrip as any)?.secondTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {(selectedReturnTrip as any)?.secondTrip && (
                  <>
                    {new Date((selectedReturnTrip as any).secondTrip.timeStart).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {" "}- {new Date((selectedReturnTrip as any).secondTrip.timeEnd).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {searchData.returnDate}
                  </>
                )}
              </Typography>
              {renderSeatDiagram(
                returnSecondLegSeats.map(seat => ({ ...seat, isSelected: selectedReturnSecondLegSeats.some(s => s.id === seat.id) })),
                true,
                (seat) => setSelectedReturnSecondLegSeats(prev => prev.some(s => s.id === seat.id) ? prev.filter(s => s.id !== seat.id) : [...prev, seat])
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(123, 31, 162, 0.08)", borderRadius: 2, border: "1px solid rgba(123, 31, 162, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#7b1fa2" }}>
                  Ghế đã chọn ({selectedReturnSecondLegSeats.length}):
                </Typography>
                {selectedReturnSecondLegSeats.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedReturnSecondLegSeats.map((seat) => (
                      <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => setSelectedReturnSecondLegSeats(prev => prev.filter(s => s.id !== seat.id))} sx={{ bgcolor: "#7b1fa2", color: "white", fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    Chưa chọn ghế nào
                  </Typography>
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#7b1fa2" }}>
                  {formatPrice(selectedReturnSecondLegSeats.length * (((selectedReturnTrip as any)?.secondTrip?.price) || 0))}
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Total Summary for 3 sections */}
          <Paper elevation={6} sx={{ p: 4, borderRadius: 3, background: "linear-gradient(135deg, rgba(244, 143, 177, 0.1) 0%, white 100%)", border: "2px solid #f48fb1" }}>
            <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 3 }}>
              💰 Tổng quan thanh toán
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3, alignItems: "end" }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>🛫 Chuyến đi</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedDepartureSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>{formatPrice(selectedDepartureSeats.length * ((selectedDepartureTrip?.price) || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7b1fa2", mb: 1 }}>🧩 Chặng 1</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedReturnFirstLegSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2" }}>{formatPrice(selectedReturnFirstLegSeats.length * (((selectedReturnTrip as any)?.firstTrip?.price) || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7b1fa2", mb: 1 }}>🧩 Chặng 2</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedReturnSecondLegSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2" }}>{formatPrice(selectedReturnSecondLegSeats.length * (((selectedReturnTrip as any)?.secondTrip?.price) || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center", p: 3, bgcolor: "#f48fb1", borderRadius: 3, color: "white" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>TỔNG CỘNG</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {formatPrice(
                    (selectedDepartureSeats.length * ((selectedDepartureTrip?.price) || 0)) +
                    (selectedReturnFirstLegSeats.length * (((selectedReturnTrip as any)?.firstTrip?.price) || 0)) +
                    (selectedReturnSecondLegSeats.length * (((selectedReturnTrip as any)?.secondTrip?.price) || 0))
                  )}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    }

    if (shouldShowDualDiagrams) {
      // Dual seat diagram mode for round trip or transfer trip
      return (
        <Box sx={{ mt: 4 }}>
          {/* Title for dual selection */}
          <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 4 }}>
            {isRoundTrip ? "🎫 Chọn ghế cho cả hai chuyến" : "🎫 Chọn ghế cho cả hai chặng (chuyến nối)"}
          </Typography>

          {/* Trip Status Summary */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "center", gap: 3 }}>
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1,
                px: 3,
                py: 2,
                borderRadius: 3,
                bgcolor: "rgba(25, 118, 210, 0.1)",
                border: "2px solid #1976d2"
              }}
            >
              <CheckCircle sx={{ color: "#1976d2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {isRoundTrip ? `Chuyến đi: ${selectedDepartureTrip?.busName}` : `Chặng 1: ${selectedTrip?.firstTrip?.busName}`}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 1,
                px: 3,
                py: 2,
                borderRadius: 3,
                bgcolor: "rgba(123, 31, 162, 0.1)",
                border: "2px solid #7b1fa2"
              }}
            >
              <CheckCircle sx={{ color: "#7b1fa2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {isRoundTrip ? `Chuyến về: ${selectedReturnTrip?.busName}` : `Chặng 2: ${selectedTrip?.secondTrip?.busName}`}
              </Typography>
            </Box>
          </Box>

          {/* Dual Seat Diagrams */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 4,
              mb: 4,
            }}
          >
            {/* First Trip/Leg Seat Selection */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "3px solid #1976d2",
                background: "linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, white 100%)",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                {isRoundTrip ? `🛫 Chuyến đi - ${selectedDepartureTrip?.busName}` : `🧩 Chặng 1 - ${selectedTrip?.firstTrip?.busName}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isRoundTrip ? (
                  selectedDepartureTrip && (
                    <>
                      {formatTimeSafe(selectedDepartureTrip.timeStart)} - {formatTimeSafe(selectedDepartureTrip.timeEnd)} • {searchData.departureDate}
                    </>
                  )
                ) : (
                  selectedTrip?.firstTrip && (
                    <>
                      {formatTimeSafe(selectedTrip.firstTrip.timeStart)} - {formatTimeSafe(selectedTrip.firstTrip.timeEnd)} • {searchData.departureDate}
                    </>
                  )
                )}
              </Typography>
              
              {/* First trip seat diagram */}
              {isRoundTrip ? (
                renderSeatDiagram(
                  departureSeats.map(seat => ({
                    ...seat,
                    isSelected: selectedDepartureSeats.some(s => s.id === seat.id)
                  })), 
                  true, 
                  handleSelectDepartureSeat
                )
              ) : (
                renderSeatDiagram(
                  firstLegSeats.map(seat => ({
                    ...seat,
                    isSelected: selectedFirstLegSeats.some(s => s.id === seat.id)
                  })), 
                  true, 
                  handleSelectFirstLegSeat
                )
              )}
              
              {/* Selected first trip seats summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(25, 118, 210, 0.08)", borderRadius: 2, border: "1px solid rgba(25, 118, 210, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1976d2" }}>
                  Ghế đã chọn ({isRoundTrip ? selectedDepartureSeats.length : selectedFirstLegSeats.length}):
                </Typography>
                {isRoundTrip ? (
                  selectedDepartureSeats.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedDepartureSeats.map((seat) => (
                        <Chip
                          key={seat.id}
                          label={seat.seatNumber || seat.id}
                          onDelete={() => handleSelectDepartureSeat(seat)}
                          sx={{ 
                            bgcolor: "#1976d2", 
                            color: "white",
                            fontWeight: 600,
                            '& .MuiChip-deleteIcon': { color: 'white' }
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Chưa chọn ghế nào
                    </Typography>
                  )
                ) : (
                  selectedFirstLegSeats.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedFirstLegSeats.map((seat) => (
                        <Chip
                          key={seat.id}
                          label={seat.seatNumber || seat.id}
                          onDelete={() => handleSelectFirstLegSeat(seat)}
                          sx={{ 
                            bgcolor: "#1976d2", 
                            color: "white",
                            fontWeight: 600,
                            '& .MuiChip-deleteIcon': { color: 'white' }
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Chưa chọn ghế nào
                    </Typography>
                  )
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#1976d2" }}>
                  {isRoundTrip 
                    ? formatPrice(selectedDepartureSeats.length * (selectedDepartureTrip?.price || 0))
                    : formatPrice(selectedFirstLegSeats.length * (selectedTrip?.firstTrip?.price || 0))
                  }
                </Typography>
              </Box>
            </Paper>

            {/* Second Trip/Leg Seat Selection */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 3,
                border: "3px solid #7b1fa2",
                background: "linear-gradient(135deg, rgba(123, 31, 162, 0.02) 0%, white 100%)",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2", fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
                {isRoundTrip ? `🛬 Chuyến về - ${selectedReturnTrip?.busName}` : `🧩 Chặng 2 - ${selectedTrip?.secondTrip?.busName}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isRoundTrip ? (
                  selectedReturnTrip && (
                    <>
                      {formatTimeSafe(selectedReturnTrip.timeStart)} - {formatTimeSafe(selectedReturnTrip.timeEnd)} • {searchData.returnDate}
                    </>
                  )
                ) : (
                  selectedTrip?.secondTrip && (
                    <>
                      {formatTimeSafe(selectedTrip.secondTrip.timeStart)} - {formatTimeSafe(selectedTrip.secondTrip.timeEnd)} • {searchData.departureDate}
                    </>
                  )
                )}
              </Typography>
              
              {/* Second trip seat diagram */}
              {isRoundTrip ? (
                renderSeatDiagram(
                  returnSeats.map(seat => ({
                    ...seat,
                    isSelected: selectedReturnSeats.some(s => s.id === seat.id)
                  })), 
                  true, 
                  handleSelectReturnSeat
                )
              ) : (
                renderSeatDiagram(
                  secondLegSeats.map(seat => ({
                    ...seat,
                    isSelected: selectedSecondLegSeats.some(s => s.id === seat.id)
                  })), 
                  true, 
                  handleSelectSecondLegSeat
                )
              )}
              
              {/* Selected second trip seats summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(123, 31, 162, 0.08)", borderRadius: 2, border: "1px solid rgba(123, 31, 162, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#7b1fa2" }}>
                  Ghế đã chọn ({isRoundTrip ? selectedReturnSeats.length : selectedSecondLegSeats.length}):
                </Typography>
                {isRoundTrip ? (
                  selectedReturnSeats.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedReturnSeats.map((seat) => (
                        <Chip
                          key={seat.id}
                          label={seat.seatNumber || seat.id}
                          onDelete={() => handleSelectReturnSeat(seat)}
                          sx={{ 
                            bgcolor: "#7b1fa2", 
                            color: "white",
                            fontWeight: 600,
                            '& .MuiChip-deleteIcon': { color: 'white' }
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Chưa chọn ghế nào
                    </Typography>
                  )
                ) : (
                  selectedSecondLegSeats.length > 0 ? (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedSecondLegSeats.map((seat) => (
                        <Chip
                          key={seat.id}
                          label={seat.seatNumber || seat.id}
                          onDelete={() => handleSelectSecondLegSeat(seat)}
                          sx={{ 
                            bgcolor: "#7b1fa2", 
                            color: "white",
                            fontWeight: 600,
                            '& .MuiChip-deleteIcon': { color: 'white' }
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Chưa chọn ghế nào
                    </Typography>
                  )
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#7b1fa2" }}>
                  {isRoundTrip 
                    ? formatPrice(selectedReturnSeats.length * (selectedReturnTrip?.price || 0))
                    : formatPrice(selectedSecondLegSeats.length * (selectedTrip?.secondTrip?.price || 0))
                  }
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* Total Summary */}
          <Paper elevation={6} sx={{ p: 4, borderRadius: 3, background: "linear-gradient(135deg, rgba(244, 143, 177, 0.1) 0%, white 100%)", border: "2px solid #f48fb1" }}>
            <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 3 }}>
              💰 Tổng quan thanh toán
            </Typography>
            
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3, alignItems: "end" }}>
              {/* First trip/leg summary */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                  {isRoundTrip ? "🛫 Chuyến đi" : "🧩 Chặng 1"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {isRoundTrip 
                    ? `${selectedDepartureSeats.length} ghế`
                    : `${selectedFirstLegSeats.length} ghế`
                  }
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>
                  {isRoundTrip 
                    ? formatPrice(selectedDepartureSeats.length * (selectedDepartureTrip?.price || 0))
                    : formatPrice(selectedFirstLegSeats.length * (selectedTrip?.firstTrip?.price || 0))
                  }
                </Typography>
              </Box>

              {/* Second trip/leg summary */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7b1fa2", mb: 1 }}>
                  {isRoundTrip ? "🛬 Chuyến về" : "🧩 Chặng 2"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {isRoundTrip 
                    ? `${selectedReturnSeats.length} ghế`
                    : `${selectedSecondLegSeats.length} ghế`
                  }
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2" }}>
                  {isRoundTrip 
                    ? formatPrice(selectedReturnSeats.length * (selectedReturnTrip?.price || 0))
                    : formatPrice(selectedSecondLegSeats.length * (selectedTrip?.secondTrip?.price || 0))
                  }
                </Typography>
              </Box>

              {/* Total */}
              <Box sx={{ textAlign: "center", p: 3, bgcolor: "#f48fb1", borderRadius: 3, color: "white" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  TỔNG CỘNG
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {isRoundTrip ? (
                    formatPrice(
                      (selectedDepartureSeats.length * (selectedDepartureTrip?.price || 0)) +
                      (selectedReturnSeats.length * (selectedReturnTrip?.price || 0))
                    )
                  ) : (
                    formatPrice(
                      (selectedFirstLegSeats.length * (selectedTrip?.firstTrip?.price || 0)) +
                      (selectedSecondLegSeats.length * (selectedTrip?.secondTrip?.price || 0))
                    )
                  )}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    }

    // Single trip mode (original logic for one-way or step-by-step round trip)
    const currentTrip = isRoundTrip && selectedDepartureTrip && selectedReturnTrip 
      ? selectedReturnTrip 
      : selectedDepartureTrip || selectedTrip;
    
    if (!currentTrip) return null;

    // Determine which trip we're selecting seats for
    const isDepartureSelection = !isRoundTrip || !selectedDepartureTrip || 
      (selectedDepartureTrip && !selectedReturnTrip && departureSeats.length === 0);
    
    const isReturnSelection = isRoundTrip && selectedDepartureTrip && selectedReturnTrip && 
      (departureSeats.length > 0 && returnSeats.length === 0);

    return (
      <Box sx={{ mt: 4 }}>
        {/* Trip Selection Status for Round Trip */}
        {isRoundTrip && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              {/* Departure Trip Status */}
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: selectedDepartureTrip ? "rgba(25, 118, 210, 0.1)" : "rgba(0, 0, 0, 0.05)",
                  border: selectedDepartureTrip ? "1px solid #1976d2" : "1px solid rgba(0, 0, 0, 0.1)"
                }}
              >
                <CheckCircle 
                  sx={{ 
                    color: selectedDepartureTrip ? "#1976d2" : "#ccc", 
                    fontSize: 20 
                  }} 
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Chuyến đi: {selectedDepartureTrip ? "Đã chọn" : "Chưa chọn"}
                </Typography>
              </Box>

              {/* Return Trip Status */}
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: selectedReturnTrip ? "rgba(123, 31, 162, 0.1)" : "rgba(0, 0, 0, 0.05)",
                  border: selectedReturnTrip ? "1px solid #7b1fa2" : "1px solid rgba(0, 0, 0, 0.1)"
                }}
              >
                <CheckCircle 
                  sx={{ 
                    color: selectedReturnTrip ? "#7b1fa2" : "#ccc", 
                    fontSize: 20 
                  }} 
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Chuyến về: {selectedReturnTrip ? "Đã chọn" : "Chưa chọn"}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Typography variant="h6" gutterBottom>
          {isRoundTrip ? (
            isDepartureSelection ? (
              <>🛫 Chọn ghế chuyến đi - {currentTrip.busName}</>
            ) : (
              <>🛬 Chọn ghế chuyến về - {currentTrip.busName}</>
            )
          ) : (
            <>Chọn ghế - {currentTrip.busName}</>
          )} (
          {new Date(currentTrip.timeStart).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {new Date(currentTrip.timeEnd).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          )
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          <Box sx={{ flex: { xs: "1", md: "2" } }}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                position: "relative",
                overflow: "auto",
                minHeight: "400px",
              }}
            >
              {/* Enhanced seat diagram with API integration */}
              {renderSeatDiagram(
                seats, 
                true, 
                isRoundTrip ? (
                  isDepartureSelection ? handleSelectDepartureSeat : handleSelectReturnSeat
                ) : handleSelectSeat
              )}
            </Paper>
          </Box>

          <Box sx={{ flex: { xs: "1", md: "1" } }}>
            <Paper elevation={3} sx={{ p: 3, position: "sticky", top: 20 }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#f48fb1" }}>
                Chi tiết đặt chỗ
              </Typography>

              {/* Current Trip Info */}
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {currentTrip.busName} - {currentTrip.tripId}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Khởi hành:</Typography>
                  <Typography variant="body2">
                    {new Date(currentTrip.timeStart).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}{" "}
                    - {isDepartureSelection || !isRoundTrip ? searchData.departureDate : searchData.returnDate}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Điểm đi:</Typography>
                  <Typography variant="body2">
                    {isDepartureSelection || !isRoundTrip ? searchData.fromStation : searchData.toStation}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Điểm đến:</Typography>
                  <Typography variant="body2">
                    {isDepartureSelection || !isRoundTrip ? searchData.toStation : searchData.fromStation}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Seat Selection for Current Trip */}
              <Typography variant="subtitle1" gutterBottom>
                {isRoundTrip ? (
                  isDepartureSelection ? "Ghế chuyến đi:" : "Ghế chuyến về:"
                ) : "Ghế đã chọn:"}
              </Typography>

              <Box sx={{ minHeight: "60px" }}>
                {(() => {
                  const currentSeats = isRoundTrip ? (
                    isDepartureSelection ? departureSeats : returnSeats
                  ) : selectedSeats;
                  
                  return currentSeats.length > 0 ? (
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      {currentSeats.map((seat) => (
                        <Chip
                          key={seat.id}
                          label={seat.seatNumber || seat.id}
                          color="primary"
                          onDelete={() => {
                            if (isRoundTrip) {
                              isDepartureSelection ? handleSelectDepartureSeat(seat) : handleSelectReturnSeat(seat);
                            } else {
                              handleSelectSeat(seat);
                            }
                          }}
                          sx={{ 
                            bgcolor: isDepartureSelection || !isRoundTrip ? "#1976d2" : "#7b1fa2" 
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2 }}
                    >
                      Chưa chọn ghế nào
                    </Typography>
                  );
                })()}
              </Box>

              {/* Round Trip Summary */}
              {isRoundTrip && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom sx={{ color: "#f48fb1" }}>
                    Tổng quan khứ hồi:
                  </Typography>
                  
                  {/* Departure Trip Summary */}
                  <Box sx={{ mb: 2, p: 2, bgcolor: "rgba(25, 118, 210, 0.05)", borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2", mb: 1 }}>
                      🛫 Chuyến đi ({searchData.departureDate})
                    </Typography>
                    {selectedDepartureTrip ? (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          {selectedDepartureTrip.busName} • {departureSeats.length} ghế
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatPrice(departureSeats.length * selectedDepartureTrip.price)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Chưa chọn chuyến
                      </Typography>
                    )}
                  </Box>

                  {/* Return Trip Summary */}
                  <Box sx={{ mb: 2, p: 2, bgcolor: "rgba(123, 31, 162, 0.05)", borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#7b1fa2", mb: 1 }}>
                      🛬 Chuyến về ({searchData.returnDate})
                    </Typography>
                    {selectedReturnTrip ? (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          {selectedReturnTrip.busName} • {returnSeats.length} ghế
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatPrice(returnSeats.length * selectedReturnTrip.price)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Chưa chọn chuyến
                      </Typography>
                    )}
                  </Box>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: "bold",
                }}
              >
                <Typography variant="subtitle1">Tổng tiền:</Typography>
                <Typography variant="subtitle1" sx={{ color: "#f48fb1" }}>
                  {isRoundTrip ? (
                    formatPrice(
                      (departureSeats.length * (selectedDepartureTrip?.price || 0)) +
                      (returnSeats.length * (selectedReturnTrip?.price || 0))
                    )
                  ) : (
                    formatPrice(selectedSeats.length * currentTrip.price)
                  )}
                </Typography>
              </Box>

              {/* Progress indicator */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "#fce4ec", borderRadius: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#f48fb1", mb: 1 }}
                >
                  💡 Lưu ý:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  {isRoundTrip ? (
                    <>
                      • Vui lòng chọn ghế cho cả chuyến đi và chuyến về
                      <br />
                      • Ghế đã đặt sẽ được giữ trong 15 phút
                      <br />
                      • Có thể chọn số ghế khác nhau cho mỗi chuyến
                    </>
                  ) : (
                    <>
                      • Vui lòng chọn ít nhất 1 ghế để tiếp tục
                      <br />
                      • Ghế đã đặt sẽ được giữ trong 15 phút
                      <br />
                      • Giá vé có thể thay đổi tùy theo ghế được chọn
                    </>
                  )}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  // Enhanced payment page with modern UI
  function renderPaymentWithShuttle() {
    console.log("🎯 renderPaymentWithShuttle called with:", {
      selectedTrip: selectedTrip?.busName,
      selectedDepartureTrip: selectedDepartureTrip?.busName,
      selectedReturnTrip: selectedReturnTrip?.busName,
      searchData,
    activeStep,
    isAuthenticated,
    hasUser: !!user,
    hasCustomerProfile: !!customerProfile,
    hasLocalUserData: !!localUserData
    });

    // For round trip, check if we have departure trip or return trip
    const currentTrip = selectedTrip || selectedDepartureTrip || selectedReturnTrip;
    
    if (!currentTrip) {
      console.log("🚨 No trip selected for payment page:", {
        selectedTrip,
        selectedDepartureTrip,
        selectedReturnTrip
      });
      return (
        <Box sx={{ mt: 4, textAlign: "center", p: 4 }}>
          <Typography variant="h6" color="error">
            ⚠️ Không tìm thấy thông tin chuyến xe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng quay lại chọn chuyến xe
          </Typography>
        </Box>
      );
    }

    const priceDetails = calculateTotalPrice();
    console.log("💰 Price details calculated:", priceDetails);

    return (
      <Box sx={{ mt: 4 }}>
        {/* Modern Header Section */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800,
              background: "linear-gradient(45deg, #f48fb1 30%, #e91e63 90%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2 
            }}
          >
            💳 Thanh toán & Hoàn tất đặt vé
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Vui lòng hoàn tất thông tin để xác nhận đặt vé của bạn
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
            gap: 4,
          }}
        >
          {/* Left Column - Main Payment Content */}
          <Box>
            {/* Enhanced Shuttle Points Section */}
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4, 
                mb: 4, 
                borderRadius: 4,
                background: "linear-gradient(135deg, rgba(244, 143, 177, 0.05) 0%, white 100%)",
                border: "1px solid rgba(244, 143, 177, 0.2)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(90deg, #f48fb1, #e91e63, #f48fb1)",
                }
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 3, 
                    bgcolor: "rgba(244, 143, 177, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2
                  }}
                >
                  <LocationOn sx={{ color: "#f48fb1", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#f48fb1", mb: 0.5 }}>
                    Thông tin đặt chỗ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kiểm tra chi tiết chuyến đi và tiếp tục thanh toán
                  </Typography>
                </Box>
              </Box>

              {/* Pickup selection removed */}
              <Box sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(0,0,0,0.02)", border: "1px dashed rgba(0,0,0,0.12)" }}>
                <Typography variant="body2" color="text.secondary">
                  Mẹo: Hãy kiểm tra kỹ thời gian, điểm đi/đến trước khi thanh toán.
                </Typography>
              </Box>
            </Paper>

            {/* Enhanced Payment Methods Section */}
            <Paper 
              elevation={8} 
              sx={{ 
                p: 4, 
                mb: 4, 
                borderRadius: 4,
                background: "linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, white 100%)",
                border: "1px solid rgba(25, 118, 210, 0.2)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(90deg, #1976d2, #2196f3, #1976d2)",
                }
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 3, 
                    bgcolor: "rgba(25, 118, 210, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2
                  }}
                >
                  <CreditCard sx={{ color: "#1976d2", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5 }}>
                    💳 Phương thức thanh toán
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chọn cách thức thanh toán phù hợp với bạn
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    sx={{
                      cursor: "pointer",
                      border: paymentMethod === method.id
                        ? "3px solid #1976d2"
                        : "2px solid transparent",
                      borderRadius: 3,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      background: paymentMethod === method.id
                        ? "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)"
                        : "white",
                      minHeight: 80,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(25, 118, 210, 0.25)",
                        borderColor: "#1976d2",
                      },
                    }}
                    onClick={() => handleSelectPaymentMethod(method.id)}
                  >
                    <CardContent sx={{ p: 3, display: "flex", alignItems: "center", height: "100%" }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: 2, 
                        bgcolor: paymentMethod === method.id ? "#1976d2" : "rgba(25, 118, 210, 0.1)",
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        mr: 2,
                        transition: "all 0.3s ease"
                      }}>
                        <Box sx={{ color: paymentMethod === method.id ? "white" : "#1976d2", fontSize: 20 }}>
                          {method.icon}
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                        {method.name}
                      </Typography>
                      {paymentMethod === method.id && (
                        <Box 
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: "50%", 
                            bgcolor: "#1976d2", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center"
                          }}
                        >
                          <Check sx={{ color: "white", fontSize: 16 }} />
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* VNPay Info */}
              {paymentMethod === "vnpay" && (
                <Box sx={{ mt: 3, p: 3, bgcolor: "rgba(25, 118, 210, 0.05)", borderRadius: 3, border: "1px solid rgba(25, 118, 210, 0.2)" }}>
                  <Typography variant="body2" sx={{ color: "#1976d2", fontWeight: 600, mb: 1 }}>
                    ✅ Thanh toán qua VNPay
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hỗ trợ thanh toán qua thẻ ATM, Visa, MasterCard, JCB và ví điện tử
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Customer Information Section - Luôn hiển thị khi đã đăng nhập */}
            {isAuthenticated && (
              <Paper 
                elevation={8} 
                sx={{ 
                  p: 4, 
                  mb: 4,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, white 100%)",
                  border: "1px solid rgba(33, 150, 243, 0.2)",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "linear-gradient(90deg, #2196f3, #42a5f5, #2196f3)",
                  }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: 3, 
                      bgcolor: "rgba(33, 150, 243, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2
                    }}
                  >
                    <Person sx={{ fontSize: 24, color: "#2196f3" }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5 }}>
                      Thông tin khách hàng
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thông tin tài khoản của bạn
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
                  <Box>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      bgcolor: "rgba(33, 150, 243, 0.05)",
                      border: "1px solid rgba(33, 150, 243, 0.1)"
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Họ và tên
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
                        {customerProfile?.fullName || (user as any)?.fullName || localUserData?.fullName || 'Đang tải...'}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      bgcolor: "rgba(33, 150, 243, 0.05)",
                      border: "1px solid rgba(33, 150, 243, 0.1)"
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Email
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
                        {customerProfile?.gmail || localUserData?.gmail || (user as any)?.gmail || (user as any)?.email || 'Đang tải...'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      bgcolor: "rgba(33, 150, 243, 0.05)",
                      border: "1px solid rgba(33, 150, 243, 0.1)"
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Số điện thoại
                      </Typography>
                      {isPhoneEditable ? (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <TextField
                            fullWidth
                            value={customerPhoneNumber}
                            onChange={(e) => setCustomerPhoneNumber(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            variant="outlined"
                            size="small"
                            InputProps={{
                              sx: {
                                bgcolor: "white",
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#1976d2",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#1976d2",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#1976d2",
                                },
                              }
                            }}
                            helperText={customerPhoneNumber.trim().length === 0 ? "Vui lòng nhập số điện thoại" : ""}
                            error={customerPhoneNumber.trim().length === 0}
                          />
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            <Button
                              size="small"
                              onClick={() => {
                                setIsPhoneEditable(false);
                                // Reset to original value if user cancels
                                setCustomerPhoneNumber((user as any).phone || "");
                              }}
                              sx={{ color: "#666", fontSize: "0.75rem" }}
                            >
                              Hủy
                            </Button>
                            <Button
                              size="small"
                              onClick={handleSavePhoneNumber}
                              variant="contained"
                              disabled={isPhoneUpdating}
                              sx={{ 
                                bgcolor: "#1976d2", 
                                fontSize: "0.75rem",
                                minWidth: "60px",
                                "&:hover": { bgcolor: "#1565c0" },
                                "&:disabled": { bgcolor: "rgba(25, 118, 210, 0.3)" }
                              }}
                            >
                              {isPhoneUpdating ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                "Lưu"
                              )}
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
                            {customerPhoneNumber || 'Chưa cập nhật'}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => setIsPhoneEditable(true)}
                            sx={{ color: "#1976d2", fontSize: "0.75rem" }}
                          >
                            {customerPhoneNumber ? "Sửa" : "Thêm"}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{ 
                      p: 3, 
                      borderRadius: 3, 
                      bgcolor: "rgba(33, 150, 243, 0.05)",
                      border: "1px solid rgba(33, 150, 243, 0.1)"
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Mã khách hàng
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
                          {customerProfile?.customerId || (user as any)?.customerId || localUserData?.customerId || 'Đang tải...'}
                      </Typography>
                    </Box>
                  </Box>

                  {(customerProfile?.gender || (user as any)?.gender || localUserData?.gender) && (
                    <Box>
                      <Box sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        bgcolor: "rgba(33, 150, 243, 0.05)",
                        border: "1px solid rgba(33, 150, 243, 0.1)"
                      }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Giới tính
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "#1976d2" }}>
                          {(() => {
                            const gender = customerProfile?.gender || (user as any)?.gender || localUserData?.gender;
                            return gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : gender;
                          })()}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box sx={{ 
                  mt: 3, 
                  p: 2.5, 
                  bgcolor: "rgba(76, 175, 80, 0.05)", 
                  borderRadius: 3, 
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <CheckCircle sx={{ color: "#4caf50", mr: 1.5, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "#2e7d32", fontWeight: 600 }}>
                    Thông tin tài khoản đã được xác thực
                  </Typography>
                </Box>

                {/* Phone number reminder for Google login users */}
                {isPhoneEditable && (!customerPhoneNumber || customerPhoneNumber.trim().length === 0) && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 2.5, 
                    bgcolor: "rgba(255, 193, 7, 0.1)", 
                    borderRadius: 3, 
                    border: "1px solid rgba(255, 193, 7, 0.3)",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <Info sx={{ color: "#ff9800", mr: 1.5, fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: "#f57c00", fontWeight: 600 }}>
                      📱 Vui lòng cập nhật số điện thoại để hoàn tất đặt vé
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}

          </Box>

          {/* Right Column - Enhanced Booking Summary */}
          <Box>
            <Paper 
              elevation={12} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                background: "linear-gradient(135deg, rgba(244, 143, 177, 0.08) 0%, white 100%)",
                border: "2px solid #f48fb1",
                position: "sticky",
                top: 20,
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  background: "linear-gradient(90deg, #f48fb1, #e91e63, #f48fb1)",
                }
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#f48fb1", mb: 1, textAlign: "center" }}>
                🎫 Chi tiết đặt vé
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
                Xem lại thông tin trước khi thanh toán
              </Typography>

                             {/* Trip Information */}
               <Box sx={{ mb: 3, p: 3, bgcolor: "rgba(244, 143, 177, 0.05)", borderRadius: 3 }}>
                 <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#2c3e50" }}>
                   🚌 {currentTrip.busName}
                 </Typography>
                 <Box sx={{ display: "grid", gap: 2 }}>
                   <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                     <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>🕐 Khởi hành:</Typography>
                     <Typography variant="body2" sx={{ fontWeight: 600 }}>
                       {new Date(currentTrip.timeStart).toLocaleTimeString("vi-VN", {
                         hour: "2-digit",
                         minute: "2-digit",
                       })} - {searchData.departureDate}
                     </Typography>
                   </Box>
                   <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                     <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>📍 Điểm đón:</Typography>
                     <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
                       {searchData.from || "⚠️ Chưa chọn"}
                     </Typography>
                   </Box>
                   <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                     <Typography variant="body2" sx={{ color: "#666", fontWeight: 500 }}>🎯 Điểm đến:</Typography>
                     <Typography variant="body2" sx={{ fontWeight: 600 }}>
                       {currentTrip.endLocation}
                     </Typography>
                   </Box>
                 </Box>
               </Box>

              <Divider sx={{ my: 3, borderColor: "rgba(244, 143, 177, 0.3)" }} />

              {/* Selected Seats */}
              <Box sx={{ mb: 3 }}>
                {selectedTrip?.tripType === "transfer" ? (
                  // Transfer trip seats display
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "#f48fb1" }}>
                      🪑 Ghế đã chọn ({selectedFirstLegSeats.length + selectedSecondLegSeats.length}):
                    </Typography>
                    
                    {/* First Leg Seats */}
                    {selectedFirstLegSeats.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#1976d2" }}>
                          🧩 Chặng 1 - {selectedTrip.firstTrip?.busName}:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedFirstLegSeats.map((seat) => (
                            <Chip
                              key={seat.id}
                              label={seat.seatNumber || seat.id}
                              sx={{ 
                                bgcolor: "#1976d2", 
                                color: "white", 
                                fontWeight: 600,
                                fontSize: "0.875rem"
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {/* Second Leg Seats */}
                    {selectedSecondLegSeats.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#7b1fa2" }}>
                          🧩 Chặng 2 - {selectedTrip.secondTrip?.busName}:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedSecondLegSeats.map((seat) => (
                            <Chip
                              key={seat.id}
                              label={seat.seatNumber || seat.id}
                              sx={{ 
                                bgcolor: "#7b1fa2", 
                                color: "white", 
                                fontWeight: 600,
                                fontSize: "0.875rem"
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </>
                ) : searchData.tripType === "roundTrip" ? (
                  // Round trip seats display
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "#f48fb1" }}>
                      🪑 Ghế đã chọn ({
                        ((selectedDepartureTrip as any)?.tripType === 'transfer' && (selectedReturnTrip as any)?.tripType === 'transfer')
                          ? (selectedFirstLegSeats.length + selectedSecondLegSeats.length + selectedReturnFirstLegSeats.length + selectedReturnSecondLegSeats.length)
                          : ((selectedDepartureTrip as any)?.tripType === 'transfer')
                            ? (selectedFirstLegSeats.length + selectedSecondLegSeats.length + selectedReturnSeats.length)
                            : ((selectedReturnTrip as any)?.tripType === 'transfer')
                              ? (selectedDepartureSeats.length + selectedReturnFirstLegSeats.length + selectedReturnSecondLegSeats.length)
                              : (selectedDepartureSeats.length + selectedReturnSeats.length)
                      }):
                    </Typography>
                    
                    {/* Departure Seats */}
                    {((selectedDepartureTrip as any)?.tripType === 'transfer') ? (
                      <>
                        {selectedFirstLegSeats.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#1976d2" }}>
                              🧩 Chặng 1:
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {selectedFirstLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id} sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, fontSize: "0.875rem" }} />
                              ))}
                            </Box>
                          </Box>
                        )}
                        {selectedSecondLegSeats.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#1976d2" }}>
                              🧩 Chặng 2:
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {selectedSecondLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id} sx={{ bgcolor: "#1976d2", color: "white", fontWeight: 600, fontSize: "0.875rem" }} />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    ) : (selectedDepartureSeats.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#1976d2" }}>
                          🛫 Chuyến đi:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedDepartureSeats.map((seat) => (
                            <Chip
                              key={seat.id}
                              label={seat.seatNumber || seat.id}
                              sx={{ 
                                bgcolor: "#1976d2", 
                                color: "white", 
                                fontWeight: 600,
                                fontSize: "0.875rem"
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                    
                    {/* Return Seats */}
                    {((selectedReturnTrip as any)?.tripType === 'transfer') ? (
                      <>
                        {selectedReturnFirstLegSeats.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#7b1fa2" }}>
                              🛬 Chuyến về • Chặng 1:
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {selectedReturnFirstLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id} sx={{ bgcolor: "#7b1fa2", color: "white", fontWeight: 600, fontSize: "0.875rem" }} />
                              ))}
                            </Box>
                          </Box>
                        )}
                        {selectedReturnSecondLegSeats.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#7b1fa2" }}>
                              🛬 Chuyến về • Chặng 2:
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {selectedReturnSecondLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id} sx={{ bgcolor: "#7b1fa2", color: "white", fontWeight: 600, fontSize: "0.875rem" }} />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    ) : (
                      selectedReturnSeats.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#7b1fa2" }}>
                          🛬 Chuyến về:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedReturnSeats.map((seat) => (
                            <Chip
                              key={seat.id}
                              label={seat.seatNumber || seat.id}
                              sx={{ 
                                bgcolor: "#7b1fa2", 
                                color: "white", 
                                fontWeight: 600,
                                fontSize: "0.875rem"
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      )
                    )}
                  </>
                ) : (
                  // Regular one-way trip seats display
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "#f48fb1" }}>
                      🪑 Ghế đã chọn ({selectedSeats.length}):
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedSeats.map((seat) => (
                        <Chip
                          key={seat.id}
                          label={seat.seatNumber || seat.id}
                          sx={{ 
                            bgcolor: "#f48fb1", 
                            color: "white", 
                            fontWeight: 600,
                            fontSize: "0.875rem"
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Box>

              <Divider sx={{ my: 3, borderColor: "rgba(244, 143, 177, 0.3)" }} />

              {/* Price Breakdown */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: "#f48fb1" }}>
                  💰 Chi tiết giá:
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">🎫 Giá vé:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPrice(priceDetails.basePrice)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">🚌 Phí đưa đón:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPrice(priceDetails.shuttleFee)}
                    </Typography>
                  </Box>

                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: "rgba(244, 143, 177, 0.5)" }} />

              {/* Total Amount */}
              <Box 
                sx={{ 
                  p: 3, 
                  background: "linear-gradient(135deg, #f48fb1 0%, #e91e63 100%)", 
                  borderRadius: 3,
                  textAlign: "center",
                  mb: 3,
                  color: "white"
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  TỔNG THANH TOÁN
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {formatPrice(priceDetails.total)}
                </Typography>
              </Box>

              {/* Selected Payment Method */}
              {paymentMethod && (
                <Box sx={{ p: 3, bgcolor: "rgba(25, 118, 210, 0.1)", borderRadius: 3, border: "1px solid rgba(25, 118, 210, 0.3)" }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                    💳 Phương thức thanh toán:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {paymentMethods.find((method) => method.id === paymentMethod)?.name}
                  </Typography>
                </Box>
              )}

              {/* Security Notice */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(76, 175, 80, 0.1)", borderRadius: 2, border: "1px solid rgba(76, 175, 80, 0.3)" }}>
                <Typography variant="caption" sx={{ color: "#4caf50", fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
                  🔒 Thanh toán được bảo mật 100%
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render booking result (success or failure)
  const renderBookingResult = () => {
    const isSuccess = paymentStatus === "success";
    
    // Show loading while fetching booking result
    if (paymentStatus && !bookingDataRestored) {
      return (
        <Box sx={{ my: 8, textAlign: "center" }}>
          <CircularProgress sx={{ color: '#f48fb1' }} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            {bookingResultLoading ? "Đang tải thông tin đặt vé..." : "Đang xử lý..."}
          </Typography>
        </Box>
      );
    }

    // Show error if failed to fetch booking result
    if (isSuccess && bookingResultError) {
      return (
        <Box sx={{ my: 8, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom sx={{ color: "#f44336", fontWeight: "bold" }}>
            ❌ Lỗi tải thông tin vé
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {bookingResultError}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = "/"}
            sx={{ bgcolor: "#f48fb1", "&:hover": { bgcolor: "#e91e63" } }}
          >
            Về trang chủ
          </Button>
        </Box>
      );
    }

    // For success payments, use API data if available
    if (isSuccess && bookingResult) {
      return (
        <Box sx={{ my: 8, textAlign: "center" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "#4caf50",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                boxShadow: "0 8px 25px rgba(76, 175, 80, 0.4)",
              }}
            >
              <Check sx={{ fontSize: 60 }} />
            </Box>
          </motion.div>

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#4caf50", fontWeight: "bold" }}
          >
            🎉 Đặt vé thành công!
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 4, color: "text.secondary" }}>
            {bookingResult.message || "Cảm ơn bạn đã đặt vé."}
          </Typography>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Box sx={{ maxWidth: 700, mx: "auto", mb: 5, position: "relative" }}>
                <Paper
                  elevation={5}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #fff 0%, #fce4ec 100%)",
                    border: "1px dashed #f48fb1",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "5px",
                      background: "linear-gradient(90deg, #f48fb1, #e91e63, #f48fb1)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s ease-in-out infinite",
                      "@keyframes shimmer": {
                        "0%": { backgroundPosition: "-200% 0" },
                        "100%": { backgroundPosition: "200% 0" },
                      },
                    },
                  }}
                >
                  {/* Ticket Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      pb: 2,
                      borderBottom: "1px dashed #f48fb1",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        component="img"
                        src="/images/pic4.png"
                        alt="XeTiic Logo"
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 2,
                          borderRadius: 1,
                          objectFit: "contain",
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Vé Xe BusTicket
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mã tham chiếu
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        #{bookingResult.referenceId}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Payment Info from API */}
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tổng tiền đã thanh toán
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f48fb1", mt: 1 }}>
                      {formatPrice(bookingResult.totalPrice)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Thanh toán lúc: {new Date(bookingResult.paymentDate).toLocaleString("vi-VN")}
                    </Typography>
                  </Box>

                  {/* Simplified booking info */}
                  <Box sx={{ textAlign: "center", p: 3, bgcolor: "rgba(244, 143, 177, 0.1)", borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#f48fb1" }}>
                      ✅ Đặt vé thành công
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Vé của bạn đã được đặt thành công. Vui lòng lưu lại mã tham chiếu để kiểm tra thông tin vé.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bạn có thể liên hệ với chúng tôi nếu cần hỗ trợ thêm.
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => (window.location.href = "/")}
              sx={{
                bgcolor: "#f48fb1",
                "&:hover": { bgcolor: "#e91e63" },
                px: 4,
                py: 1.5,
              }}
            >
              Về trang chủ
            </Button>
          </Box>
        </Box>
      );
    }

    // For failed payments, show result with API data if available
    if (!isSuccess) {
      // If we have booking result from API (failed payment case)
      if (bookingResult) {
        return (
          <Box sx={{ my: 8, textAlign: "center" }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: "#f44336",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                  boxShadow: "0 8px 25px rgba(244, 67, 54, 0.4)",
                }}
              >
                <Close sx={{ fontSize: 60 }} />
              </Box>
            </motion.div>

            <Typography
              variant="h4"
              gutterBottom
              sx={{ color: "#f44336", fontWeight: "bold" }}
            >
              ❌ Thanh toán thất bại
            </Typography>

            <Typography variant="subtitle1" sx={{ mb: 4, color: "text.secondary" }}>
              {bookingResult.message || paymentError || "Có lỗi xảy ra trong quá trình thanh toán"}
            </Typography>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Box sx={{ maxWidth: 700, mx: "auto", mb: 5, position: "relative" }}>
                <Paper
                  elevation={5}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #fff 0%, #ffebee 100%)",
                    border: "1px dashed #f44336",
                  }}
                >
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      pb: 2,
                      borderBottom: "1px dashed #f44336",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        component="img"
                        src="/images/pic4.png"
                        alt="XeTiic Logo"
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 2,
                          borderRadius: 1,
                          objectFit: "contain",
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Vé Xe BusTicket
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Mã tham chiếu
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        #{bookingResult.referenceId}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Failed Payment Info from API */}
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Số tiền giao dịch thất bại
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: "bold", color: "#f44336", mt: 1 }}>
                      {formatPrice(bookingResult.totalPrice)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Thời gian: {new Date(bookingResult.paymentDate).toLocaleString("vi-VN")}
                    </Typography>
                  </Box>

                  {/* Error message */}
                  <Box sx={{ textAlign: "center", p: 3, bgcolor: "rgba(244, 67, 54, 0.1)", borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: "#f44336" }}>
                      ❌ Giao dịch không thành công
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {bookingResult.message || "Thanh toán thất bại hoặc đã bị hủy."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vui lòng thử lại hoặc liên hệ hỗ trợ khách hàng nếu cần.
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </motion.div>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.history.back()}
                sx={{
                  borderColor: "#f44336",
                  color: "#f44336",
                  "&:hover": { borderColor: "#d32f2f", color: "#d32f2f" },
                  px: 4,
                  py: 1.5,
                }}
              >
                Thử lại
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => (window.location.href = "/")}
                sx={{
                  bgcolor: "#f48fb1",
                  "&:hover": { bgcolor: "#e91e63" },
                  px: 4,
                  py: 1.5,
                }}
              >
                Về trang chủ
              </Button>
            </Box>
          </Box>
        );
      }

      // Fallback: Simple error message without API data
      return (
        <Box sx={{ my: 8, textAlign: "center" }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                bgcolor: "#f44336",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
                boxShadow: "0 8px 25px rgba(244, 67, 54, 0.4)",
              }}
            >
              <Close sx={{ fontSize: 60 }} />
            </Box>
          </motion.div>

          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: "#f44336", fontWeight: "bold" }}
          >
            ❌ Thanh toán thất bại
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 4, color: "text.secondary" }}>
            {paymentError || "Có lỗi xảy ra trong quá trình thanh toán\nVui lòng thử lại hoặc liên hệ hỗ trợ khách hàng"}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.history.back()}
              sx={{
                borderColor: "#f44336",
                color: "#f44336",
                "&:hover": { borderColor: "#d32f2f", color: "#d32f2f" },
                px: 4,
                py: 1.5,
              }}
            >
              Thử lại
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => (window.location.href = "/")}
              sx={{
                bgcolor: "#f48fb1",
                "&:hover": { bgcolor: "#e91e63" },
                px: 4,
                py: 1.5,
              }}
            >
              Về trang chủ
            </Button>
          </Box>
        </Box>
      );
    }

    // Fallback: Use existing logic for cases where API data is not available
    const tripForDisplay = selectedTrip || selectedDepartureTrip || null;

    // Get seats for display based on trip type
    let seatsForDisplay: typeof selectedSeats = [];
    let totalPrice = 0;

    if (selectedTrip?.tripType === "transfer") {
      seatsForDisplay = [...selectedFirstLegSeats, ...selectedSecondLegSeats];
      totalPrice = (selectedTrip.firstTrip?.price || 0) * selectedFirstLegSeats.length +
        (selectedTrip.secondTrip?.price || 0) * selectedSecondLegSeats.length;
      console.log("🔄 Transfer trip - seatsForDisplay:", seatsForDisplay, "totalPrice:", totalPrice);
    } else if (searchData.tripType === "roundTrip") {
      const isDepartureTransfer = selectedDepartureTrip && (selectedDepartureTrip as any).tripType === "transfer";
      const isReturnTransfer = selectedReturnTrip && (selectedReturnTrip as any).tripType === "transfer";

      if (isDepartureTransfer && isReturnTransfer) {
        seatsForDisplay = [...selectedFirstLegSeats, ...selectedSecondLegSeats, ...selectedReturnFirstLegSeats, ...selectedReturnSecondLegSeats];
        totalPrice = ((selectedDepartureTrip as any)?.firstTrip?.price || 0) * selectedFirstLegSeats.length +
          ((selectedDepartureTrip as any)?.secondTrip?.price || 0) * selectedSecondLegSeats.length +
          ((selectedReturnTrip as any)?.firstTrip?.price || 0) * selectedReturnFirstLegSeats.length +
          ((selectedReturnTrip as any)?.secondTrip?.price || 0) * selectedReturnSecondLegSeats.length;
      } else if (isDepartureTransfer) {
        seatsForDisplay = [...selectedFirstLegSeats, ...selectedSecondLegSeats, ...selectedReturnSeats];
        totalPrice = ((selectedDepartureTrip as any)?.firstTrip?.price || 0) * selectedFirstLegSeats.length +
          ((selectedDepartureTrip as any)?.secondTrip?.price || 0) * selectedSecondLegSeats.length +
          (selectedReturnTrip?.price || 0) * selectedReturnSeats.length;
      } else if (isReturnTransfer) {
        seatsForDisplay = [...selectedDepartureSeats, ...selectedReturnFirstLegSeats, ...selectedReturnSecondLegSeats];
        totalPrice = (selectedDepartureTrip?.price || 0) * selectedDepartureSeats.length +
          ((selectedReturnTrip as any)?.firstTrip?.price || 0) * selectedReturnFirstLegSeats.length +
          ((selectedReturnTrip as any)?.secondTrip?.price || 0) * selectedReturnSecondLegSeats.length;
      } else {
        seatsForDisplay = [...selectedDepartureSeats, ...selectedReturnSeats];
        totalPrice = (selectedDepartureTrip?.price || 0) * selectedDepartureSeats.length +
          (selectedReturnTrip?.price || 0) * selectedReturnSeats.length;
      }
      console.log("🔄 Round trip - seatsForDisplay:", seatsForDisplay, "totalPrice:", totalPrice);
    } else {
      seatsForDisplay = selectedSeats.length > 0 ? selectedSeats : selectedDepartureSeats || [];
      totalPrice = (selectedTrip?.price || selectedDepartureTrip?.price || 0) * seatsForDisplay.length;
      console.log("➡️ One-way trip - seatsForDisplay:", seatsForDisplay, "totalPrice:", totalPrice);
    }

    // Determine origin and destination display based on trip type
    let originDisplay = searchData.fromStation || searchData.from || tripForDisplay?.fromLocation || "-";
    let destinationDisplay = searchData.toStation || searchData.to || tripForDisplay?.endLocation || "-";

    if (searchData.tripType === "roundTrip") {
      originDisplay = `${searchData.fromStation || searchData.from} ↔ ${searchData.toStation || searchData.to}`;
      destinationDisplay = `${searchData.toStation || searchData.to} ↔ ${searchData.fromStation || searchData.from}`;
    }

    const busNameDisplay = tripForDisplay?.busName || "-";
    const departDateDisplay = searchData.departureDate || (tripForDisplay ? new Date(tripForDisplay.timeStart).toLocaleDateString("vi-VN") : "-");
    const returnDateDisplay = searchData.returnDate || "-";

    return (
      <Box sx={{ my: 8, textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              bgcolor: isSuccess ? "#4caf50" : "#f44336",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: isSuccess 
                ? "0 8px 25px rgba(76, 175, 80, 0.4)" 
                : "0 8px 25px rgba(244, 67, 54, 0.4)",
            }}
          >
            {isSuccess ? (
              <Check sx={{ fontSize: 60 }} />
            ) : (
              <Close sx={{ fontSize: 60 }} />
            )}
          </Box>
        </motion.div>

        <Typography
          variant="h4"
          gutterBottom
          sx={{ 
            color: isSuccess ? "#4caf50" : "#f44336", 
            fontWeight: "bold" 
          }}
        >
          {isSuccess ? "🎉 Đặt vé thành công!" : "❌ Thanh toán thất bại"}
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 4, color: "text.secondary" }}>
          {isSuccess
            ? "Cảm ơn bạn đã đặt vé."
            : (paymentError || "Có lỗi xảy ra trong quá trình thanh toán\nVui lòng thử lại hoặc liên hệ hỗ trợ khách hàng")}
        </Typography>

        {isSuccess && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Enhanced Ticket Design for Success */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
          <Box
            sx={{
              maxWidth: 700,
              mx: "auto",
              mb: 5,
              position: "relative",
            }}
          >
            <Paper
              elevation={5}
              sx={{
                p: 4,
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, #fff 0%, #fce4ec 100%)",
                border: "1px dashed #f48fb1",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "5px",
                  background:
                    "linear-gradient(90deg, #f48fb1, #e91e63, #f48fb1)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 2s ease-in-out infinite",
                  "@keyframes shimmer": {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                  },
                },
              }}
            >
              {/* Ticket Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  pb: 2,
                  borderBottom: "1px dashed #f48fb1",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    component="img"
                    src="/images/pic4.png"
                    alt="XeTiic Logo"
                    sx={{
                      width: 40,
                      height: 40,
                      mr: 2,
                      borderRadius: 1,
                      objectFit: "contain",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Vé Xe BusTicket
                  </Typography>
                </Box>
                <Box />
              </Box>

              {/* Ticket Content */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Route Info */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                     <Box sx={{ textAlign: "center", flex: "1 1 auto" }}>
                      <Typography variant="body2" color="text.secondary">
                        Điểm đón
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mt: 0.5 }}
                      >
                         {originDisplay}
                      </Typography>
                      <Typography variant="body2">
                        {tripForDisplay && formatTimeSafe(tripForDisplay.timeStart)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mx: 2,
                        px: 2,
                      }}
                    >
                      <DirectionsBus
                        sx={{ color: "#f48fb1", fontSize: "1.5rem", mb: 0.5 }}
                      />
                      <Box
                        sx={{
                          width: { xs: "80px", sm: "120px" },
                          height: "2px",
                          bgcolor: "#f48fb1",
                          position: "relative",
                          "&::before, &::after": {
                            content: '""',
                            position: "absolute",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            bgcolor: "#f48fb1",
                            top: "50%",
                            transform: "translateY(-50%)",
                          },
                          "&::before": {
                            left: 0,
                          },
                          "&::after": {
                            right: 0,
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedTrip &&
                          (() => {
                            const start = new Date(selectedTrip.timeStart);
                            const end = new Date(selectedTrip.timeEnd);
                            const diffMs = end.getTime() - start.getTime();
                            const hours = Math.floor(diffMs / (1000 * 60 * 60));
                            const minutes = Math.floor(
                              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                            );
                            return `${hours}h${
                              minutes > 0 ? ` ${minutes}m` : ""
                            }`;
                          })()}
                      </Typography>
                    </Box>

                     <Box sx={{ textAlign: "center", flex: "1 1 auto" }}>
                      <Typography variant="body2" color="text.secondary">
                        Điểm đến
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mt: 0.5 }}
                      >
                         {destinationDisplay}
                      </Typography>
                      <Typography variant="body2">
                        {tripForDisplay && formatTimeSafe(tripForDisplay.timeEnd)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Details */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 2, sm: 3 },
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                     <Typography variant="body2" color="text.secondary">
                       Nhà xe
                     </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", mb: 1.5 }}
                    >
                       {busNameDisplay} {tripForDisplay?.tripId ? `• ${tripForDisplay.tripId}` : ""}
                    </Typography>

                     <Typography variant="body2" color="text.secondary">
                       Ngày khởi hành
                     </Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                       {departDateDisplay}
                       {searchData.tripType === "roundTrip" && returnDateDisplay !== "-" && (
                         <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                           <Typography variant="body2" color="text.secondary">
                             Ngày về: {returnDateDisplay}
                           </Typography>
                         </Box>
                       )}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    {(() => {
                      const isRoundTrip = searchData.tripType === "roundTrip";
                      const isDepartureTransfer = isRoundTrip && selectedDepartureTrip && (selectedDepartureTrip as any).tripType === "transfer";
                      const isReturnTransfer = isRoundTrip && selectedReturnTrip && (selectedReturnTrip as any).tripType === "transfer";
                      const isOneWayTransfer = selectedTrip?.tripType === "transfer";
                      const firstLegLabel = "🧩 Chặng 1";
                      const secondLegLabel = "🧩 Chặng 2";
                      const returnLabel = "🛬 Chuyến về";

                      // Debug log for template logic
                      console.log("🎫 Template logic check:", {
                        isRoundTrip,
                        isDepartureTransfer,
                        isReturnTransfer,
                        isOneWayTransfer,
                        "selectedTrip?.tripType": selectedTrip?.tripType,
                        "selectedDepartureTrip?.tripType": (selectedDepartureTrip as any)?.tripType,
                        "selectedReturnTrip?.tripType": (selectedReturnTrip as any)?.tripType,
                        "seatsForDisplay.length": seatsForDisplay.length,
                        "totalPrice": totalPrice
                      });

                      // Case 1: One-way transfer trip
                      if (isOneWayTransfer) {
                        const firstLegPrice = (selectedTrip?.firstTrip?.price || 0) * selectedFirstLegSeats.length;
                        const secondLegPrice = (selectedTrip?.secondTrip?.price || 0) * selectedSecondLegSeats.length;
                        return (
                          <>
                            <Typography variant="body2" color="text.secondary">{firstLegLabel} - {selectedTrip?.firstTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedFirstLegSeats.length > 0 ? selectedFirstLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#e91e63" }}>{formatPrice(firstLegPrice)}</Typography>

                            <Typography variant="body2" color="text.secondary">{secondLegLabel} - {selectedTrip?.secondTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedSecondLegSeats.length > 0 ? selectedSecondLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#e91e63" }}>{formatPrice(secondLegPrice)}</Typography>
                          </>
                        );
                      }

                      // Case 2: Round trip with departure transfer only
                      if (isRoundTrip && isDepartureTransfer && !isReturnTransfer) {
                        const firstLegPrice = (((selectedDepartureTrip as any)?.firstTrip?.price) || 0) * selectedFirstLegSeats.length;
                        const secondLegPrice = (((selectedDepartureTrip as any)?.secondTrip?.price) || 0) * selectedSecondLegSeats.length;
                        const returnPrice = ((selectedReturnTrip?.price) || 0) * selectedReturnSeats.length;
                        return (
                          <>
                            <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • {firstLegLabel} - {(selectedDepartureTrip as any)?.firstTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedFirstLegSeats.length > 0 ? selectedFirstLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#e91e63" }}>{formatPrice(firstLegPrice)}</Typography>

                            <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • {secondLegLabel} - {(selectedDepartureTrip as any)?.secondTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedSecondLegSeats.length > 0 ? selectedSecondLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#e91e63" }}>{formatPrice(secondLegPrice)}</Typography>

                            <Typography variant="body2" color="text.secondary">{returnLabel} - {selectedReturnTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedReturnSeats.length > 0 ? selectedReturnSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#e91e63" }}>{formatPrice(returnPrice)}</Typography>
                          </>
                        );
                      }

                      // Case 3: Round trip with return transfer only
                      if (isRoundTrip && !isDepartureTransfer && isReturnTransfer) {
                        const depPrice = (selectedDepartureTrip?.price || 0) * selectedDepartureSeats.length;
                        const retLeg1Price = (((selectedReturnTrip as any)?.firstTrip?.price) || 0) * selectedReturnFirstLegSeats.length;
                        const retLeg2Price = (((selectedReturnTrip as any)?.secondTrip?.price) || 0) * selectedReturnSecondLegSeats.length;
                        return (
                          <>
                            <Typography variant="body2" color="text.secondary">🛫 Chuyến đi - {selectedDepartureTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedDepartureSeats.length > 0 ? selectedDepartureSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#e91e63" }}>{formatPrice(depPrice)}</Typography>

                            <Typography variant="body2" color="text.secondary">{returnLabel} • {firstLegLabel} - {(selectedReturnTrip as any)?.firstTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedReturnFirstLegSeats.length > 0 ? selectedReturnFirstLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#e91e63" }}>{formatPrice(retLeg1Price)}</Typography>

                            <Typography variant="body2" color="text.secondary">{returnLabel} • {secondLegLabel} - {(selectedReturnTrip as any)?.secondTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedReturnSecondLegSeats.length > 0 ? selectedReturnSecondLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#e91e63" }}>{formatPrice(retLeg2Price)}</Typography>
                          </>
                        );
                      }

                      // Case 4: Round trip with both transfers
                      if (isRoundTrip && isDepartureTransfer && isReturnTransfer) {
                        const depLeg1Price = ((((selectedDepartureTrip as any)?.firstTrip?.price) || 0) * selectedFirstLegSeats.length);
                        const depLeg2Price = ((((selectedDepartureTrip as any)?.secondTrip?.price) || 0) * selectedSecondLegSeats.length);
                        const retLeg1Price = ((((selectedReturnTrip as any)?.firstTrip?.price) || 0) * selectedReturnFirstLegSeats.length);
                        const retLeg2Price = ((((selectedReturnTrip as any)?.secondTrip?.price) || 0) * selectedReturnSecondLegSeats.length);
                        return (
                          <>
                            <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • {firstLegLabel} - {(selectedDepartureTrip as any)?.firstTrip?.busName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {selectedFirstLegSeats.length > 0 ? selectedFirstLegSeats.map(seat => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#e91e63' }}>{formatPrice(depLeg1Price)}</Typography>

                            <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • {secondLegLabel} - {(selectedDepartureTrip as any)?.secondTrip?.busName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {selectedSecondLegSeats.length > 0 ? selectedSecondLegSeats.map(seat => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#e91e63' }}>{formatPrice(depLeg2Price)}</Typography>

                            <Typography variant="body2" color="text.secondary">{returnLabel} • {firstLegLabel} - {(selectedReturnTrip as any)?.firstTrip?.busName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {selectedReturnFirstLegSeats.length > 0 ? selectedReturnFirstLegSeats.map(seat => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#e91e63' }}>{formatPrice(retLeg1Price)}</Typography>

                            <Typography variant="body2" color="text.secondary">{returnLabel} • {secondLegLabel} - {(selectedReturnTrip as any)?.secondTrip?.busName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {selectedReturnSecondLegSeats.length > 0 ? selectedReturnSecondLegSeats.map(seat => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#e91e63' }}>{formatPrice(retLeg2Price)}</Typography>
                          </>
                        );
                      }

                      // Case 5: Regular round trip (both direct)
                      if (isRoundTrip && !isDepartureTransfer && !isReturnTransfer) {
                        const depPrice = (selectedDepartureTrip?.price || 0) * selectedDepartureSeats.length;
                        const retPrice = (selectedReturnTrip?.price || 0) * selectedReturnSeats.length;
                        return (
                          <>
                            <Typography variant="body2" color="text.secondary">🛫 Chuyến đi - {selectedDepartureTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedDepartureSeats.length > 0 ? selectedDepartureSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#e91e63" }}>{formatPrice(depPrice)}</Typography>

                            <Typography variant="body2" color="text.secondary">{returnLabel} - {selectedReturnTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedReturnSeats.length > 0 ? selectedReturnSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#e91e63" }}>{formatPrice(retPrice)}</Typography>
                          </>
                        );
                      }

                      // Case 6: Regular one-way trip
                      return (
                        <>
                          <Typography variant="body2" color="text.secondary">Số ghế</Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                            {(seatsForDisplay && seatsForDisplay.length > 0) ? seatsForDisplay.map((seat) => (
                              <Chip key={seat.id} label={seat.seatNumber || seat.id.toString().replace(/^leg[12]-/, '')} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                            )) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">Giá vé</Typography>
                          <Typography variant="body1" sx={{ fontWeight: "bold", color: "#e91e63" }}>{formatPrice(totalPrice)}</Typography>
                        </>
                      );
                    })()}
                  </Box>
                </Box>
              </Box>

              {/* Total Price Section */}
              <Box
                sx={{
                  mt: 3,
                  pt: 3,
                  borderTop: "2px dashed #f48fb1",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#e91e63",
                    mb: 1,
                  }}
                >
                  Tổng tiền
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    color: "#e91e63",
                    fontSize: "1.8rem",
                  }}
                >
                  {formatPrice(totalPrice)}
                </Typography>
              </Box>

              {/* QR removed per request */}

              {/* Ticket Footer */}
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  mt: 3,
                  color: "text.secondary",
                }}
              >
                Vui lòng đến trước giờ khởi hành 30 phút. Mang theo mã vé để đổi
                vé lên xe.
              </Typography>
            </Paper>

            {/* Ticket holes decoration */}
            <Box
              sx={{
                position: "absolute",
                left: -10,
                top: "50%",
                transform: "translateY(-50%)",
                display: { xs: "none", md: "block" },
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "white",
                    mb: 3,
                    boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)",
                  }}
                />
              ))}
            </Box>

            <Box
              sx={{
                position: "absolute",
                right: -10,
                top: "50%",
                transform: "translateY(-50%)",
                display: { xs: "none", md: "block" },
              }}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "white",
                    mb: 3,
                    boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)",
                  }}
                />
              ))}
            </Box>
          </Box>
        </motion.div>
        </motion.div>
        )}

        {/* Failure Template */}
        {!isSuccess && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {/* Enhanced Ticket Design for Failure */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Box
                sx={{
                  maxWidth: 700,
                  mx: "auto",
                  mb: 5,
                  position: "relative",
                }}
              >
                <Paper
                  elevation={5}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #fff 0%, #ffebee 100%)",
                    border: "1px dashed #f44336",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "5px",
                      background:
                        "linear-gradient(90deg, #f44336, #d32f2f, #f44336)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s ease-in-out infinite",
                      "@keyframes shimmer": {
                        "0%": { backgroundPosition: "-200% 0" },
                        "100%": { backgroundPosition: "200% 0" },
                      },
                    },
                  }}
                >
                  {/* Ticket Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      pb: 2,
                      borderBottom: "1px dashed #f44336",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        component="img"
                        src="/images/pic4.png"
                        alt="XeTiic Logo"
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 2,
                          borderRadius: 1,
                          objectFit: "contain",
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Vé Xe BusTicket
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Trạng thái
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "#f44336" }}
                      >
                        THẤT BẠI
                      </Typography>
                    </Box>
                  </Box>

                  {/* Payment Status Info */}
                  <Box sx={{ mb: 3, textAlign: "center" }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#f44336" }}>
                      ⚠️ Thanh toán không thành công
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Lý do:</strong> {paymentError || "Giao dịch không thành công"}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        <strong>Thời gian:</strong> <span id="current-time">-</span>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Ticket Content - Same as success but with failed status */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Route Info */}
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 2,
                          mb: 3,
                        }}
                      >
                        <Box sx={{ textAlign: "center", flex: "1 1 auto" }}>
                          <Typography variant="body2" color="text.secondary">
                            Điểm đi
                          </Typography>
                           <Typography
                             variant="h6"
                             sx={{ fontWeight: "bold", mt: 0.5 }}
                           >
                             {originDisplay}
                           </Typography>
                          <Typography variant="body2">
                            {tripForDisplay && formatTimeSafe(tripForDisplay.timeStart)}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            mx: 2,
                            px: 2,
                          }}
                        >
                          <DirectionsBus
                            sx={{ color: "#f44336", fontSize: "1.5rem", mb: 0.5 }}
                          />
                          <Box
                            sx={{
                              width: { xs: "80px", sm: "120px" },
                              height: "2px",
                              bgcolor: "#f44336",
                              position: "relative",
                              "&::before, &::after": {
                                content: '""',
                                position: "absolute",
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                bgcolor: "#f44336",
                                top: "50%",
                                transform: "translateY(-50%)",
                              },
                              "&::before": {
                                left: 0,
                              },
                              "&::after": {
                                right: 0,
                              },
                            }}
                          />
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {selectedTrip &&
                              (() => {
                                const start = new Date(selectedTrip.timeStart);
                                const end = new Date(selectedTrip.timeEnd);
                                const diffMs = end.getTime() - start.getTime();
                                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                const minutes = Math.floor(
                                  (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                                );
                                return `${hours}h${
                                  minutes > 0 ? ` ${minutes}m` : ""
                                }`;
                              })()}
                          </Typography>
                        </Box>

                                                <Box sx={{ textAlign: "center", flex: "1 1 auto" }}>
                          <Typography variant="body2" color="text.secondary">
                            Điểm đến
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", mt: 0.5 }}
                          >
                            {destinationDisplay}
                          </Typography>
                          <Typography variant="body2">
                            {tripForDisplay && formatTimeSafe(tripForDisplay.timeEnd)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Details */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 2, sm: 3 },
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Nhà xe
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", mb: 1.5 }}
                        >
                          {busNameDisplay} {tripForDisplay?.tripId ? `• ${tripForDisplay.tripId}` : ""}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Ngày khởi hành
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1.5 }}>
                          {departDateDisplay}
                          {searchData.tripType === "roundTrip" && returnDateDisplay !== "-" && (
                            <Box component="span" sx={{ display: "block", mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                Ngày về: {returnDateDisplay}
                              </Typography>
                            </Box>
                          )}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        {(() => {
                          const isRoundTrip = searchData.tripType === "roundTrip";
                          const isDepartureTransfer = isRoundTrip && selectedDepartureTrip && (selectedDepartureTrip as any).tripType === "transfer";
                          const isReturnTransfer = isRoundTrip && selectedReturnTrip && (selectedReturnTrip as any).tripType === "transfer";
                          const isOneWayTransfer = selectedTrip?.tripType === "transfer";
                          const firstLegLabel = "🧩 Chặng 1";
                          const secondLegLabel = "🧩 Chặng 2";
                          const returnLabel = "🛬 Chuyến về";

                          // Case 1: One-way transfer trip
                          if (isOneWayTransfer) {
                            const firstLegPrice = (selectedTrip?.firstTrip?.price || 0) * selectedFirstLegSeats.length;
                            const secondLegPrice = (selectedTrip?.secondTrip?.price || 0) * selectedSecondLegSeats.length;
                            return (
                              <>
                                <Typography variant="body2" color="text.secondary">{firstLegLabel} - {selectedTrip?.firstTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedFirstLegSeats.length > 0 ? selectedFirstLegSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#f44336" }}>{formatPrice(firstLegPrice)}</Typography>

                                <Typography variant="body2" color="text.secondary">{secondLegLabel} - {selectedTrip?.secondTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedSecondLegSeats.length > 0 ? selectedSecondLegSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#f44336" }}>{formatPrice(secondLegPrice)}</Typography>
                              </>
                            );
                          }

                          // Case 2: Round trip with departure transfer only
                          if (isRoundTrip && isDepartureTransfer && !isReturnTransfer) {
                            const firstLegPrice = (((selectedDepartureTrip as any)?.firstTrip?.price) || 0) * selectedFirstLegSeats.length;
                            const secondLegPrice = (((selectedDepartureTrip as any)?.secondTrip?.price) || 0) * selectedSecondLegSeats.length;
                            const returnPrice = ((selectedReturnTrip?.price) || 0) * selectedReturnSeats.length;
                            return (
                              <>
                                <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • {firstLegLabel} - {(selectedDepartureTrip as any)?.firstTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedFirstLegSeats.length > 0 ? selectedFirstLegSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#f44336" }}>{formatPrice(firstLegPrice)}</Typography>

                                <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • {secondLegLabel} - {(selectedDepartureTrip as any)?.secondTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedSecondLegSeats.length > 0 ? selectedSecondLegSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#f44336" }}>{formatPrice(secondLegPrice)}</Typography>

                                <Typography variant="body2" color="text.secondary">{returnLabel} - {selectedReturnTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedReturnSeats.length > 0 ? selectedReturnSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#f44336" }}>{formatPrice(returnPrice)}</Typography>
                              </>
                            );
                          }

                          // Case 3: Round trip with return transfer only
                          if (isRoundTrip && !isDepartureTransfer && isReturnTransfer) {
                            const depPrice = (selectedDepartureTrip?.price || 0) * selectedDepartureSeats.length;
                            const retLeg1Price = (((selectedReturnTrip as any)?.firstTrip?.price) || 0) * selectedReturnFirstLegSeats.length;
                            const retLeg2Price = (((selectedReturnTrip as any)?.secondTrip?.price) || 0) * selectedReturnSecondLegSeats.length;
                            return (
                              <>
                                <Typography variant="body2" color="text.secondary">🛫 Chuyến đi - {selectedDepartureTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedDepartureSeats.length > 0 ? selectedDepartureSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#f44336" }}>{formatPrice(depPrice)}</Typography>

                                <Typography variant="body2" color="text.secondary">{returnLabel} • {firstLegLabel} - {(selectedReturnTrip as any)?.firstTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedReturnFirstLegSeats.length > 0 ? selectedReturnFirstLegSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#f44336" }}>{formatPrice(retLeg1Price)}</Typography>

                                <Typography variant="body2" color="text.secondary">{returnLabel} • {secondLegLabel} - {(selectedReturnTrip as any)?.secondTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedReturnSecondLegSeats.length > 0 ? selectedReturnSecondLegSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#f44336" }}>{formatPrice(retLeg2Price)}</Typography>
                              </>
                            );
                          }

                          // Case 4: Round trip with both transfers
                          if (isRoundTrip && isDepartureTransfer && isReturnTransfer) {
                            const depLeg1Price = ((((selectedDepartureTrip as any)?.firstTrip?.price) || 0) * selectedFirstLegSeats.length);
                            const depLeg2Price = ((((selectedDepartureTrip as any)?.secondTrip?.price) || 0) * selectedSecondLegSeats.length);
                            const retLeg1Price = ((((selectedReturnTrip as any)?.firstTrip?.price) || 0) * selectedReturnFirstLegSeats.length);
                            const retLeg2Price = ((((selectedReturnTrip as any)?.secondTrip?.price) || 0) * selectedReturnSecondLegSeats.length);
                            return (
                              <>
                                <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • {firstLegLabel} - {(selectedDepartureTrip as any)?.firstTrip?.busName}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                  {selectedFirstLegSeats.length > 0 ? selectedFirstLegSeats.map(seat => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#ffebee', color: '#f44336', fontWeight: 'bold' }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#f44336' }}>{formatPrice(depLeg1Price)}</Typography>

                                <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • {secondLegLabel} - {(selectedDepartureTrip as any)?.secondTrip?.busName}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                  {selectedSecondLegSeats.length > 0 ? selectedSecondLegSeats.map(seat => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#ffebee', color: '#f44336', fontWeight: 'bold' }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#f44336' }}>{formatPrice(depLeg2Price)}</Typography>

                                <Typography variant="body2" color="text.secondary">{returnLabel} • {firstLegLabel} - {(selectedReturnTrip as any)?.firstTrip?.busName}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                  {selectedReturnFirstLegSeats.length > 0 ? selectedReturnFirstLegSeats.map(seat => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#ffebee', color: '#f44336', fontWeight: 'bold' }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#f44336' }}>{formatPrice(retLeg1Price)}</Typography>

                                <Typography variant="body2" color="text.secondary">{returnLabel} • {secondLegLabel} - {(selectedReturnTrip as any)?.secondTrip?.busName}</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                                  {selectedReturnSecondLegSeats.length > 0 ? selectedReturnSecondLegSeats.map(seat => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#ffebee', color: '#f44336', fontWeight: 'bold' }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#f44336' }}>{formatPrice(retLeg2Price)}</Typography>
                              </>
                            );
                          }

                          // Case 5: Regular round trip (both direct)
                          if (isRoundTrip && !isDepartureTransfer && !isReturnTransfer) {
                            const depPrice = (selectedDepartureTrip?.price || 0) * selectedDepartureSeats.length;
                            const retPrice = (selectedReturnTrip?.price || 0) * selectedReturnSeats.length;
                            return (
                              <>
                                <Typography variant="body2" color="text.secondary">🛫 Chuyến đi - {selectedDepartureTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedDepartureSeats.length > 0 ? selectedDepartureSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#f44336" }}>{formatPrice(depPrice)}</Typography>

                                <Typography variant="body2" color="text.secondary">{returnLabel} - {selectedReturnTrip?.busName}</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                  {selectedReturnSeats.length > 0 ? selectedReturnSeats.map((seat) => (
                                    <Chip key={seat.id} label={seat.seatNumber || seat.id} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                  )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: "#f44336" }}>{formatPrice(retPrice)}</Typography>
                              </>
                            );
                          }

                          // Case 6: Regular one-way trip
                          return (
                            <>
                              <Typography variant="body2" color="text.secondary">Số ghế</Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                {(seatsForDisplay && seatsForDisplay.length > 0) ? seatsForDisplay.map((seat) => (
                                  <Chip key={seat.id} label={seat.seatNumber || seat.id.toString().replace(/^leg[12]-/, '')} size="small" sx={{ bgcolor: "#ffebee", color: "#f44336", fontWeight: "bold" }} />
                                )) : (
                                  <Typography variant="body2" color="text.secondary">-</Typography>
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary">Số tiền không được thanh toán</Typography>
                              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#f44336" }}>{formatPrice(totalPrice)}</Typography>
                            </>
                          );
                        })()}
                      </Box>
                    </Box>
                  </Box>

                  {/* Total Price Section for Failed Payment */}
                  <Box
                    sx={{
                      mt: 3,
                      pt: 3,
                      borderTop: "2px dashed #f44336",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "#f44336",
                        mb: 1,
                      }}
                    >
                      Tổng tiền chưa thanh toán
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: "#f44336",
                        fontSize: "1.8rem",
                      }}
                    >
                      {formatPrice(totalPrice)}
                    </Typography>
                  </Box>

                  {/* Failure Notice */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mt: 3,
                      pt: 3,
                      borderTop: "1px dashed #f44336",
                      textAlign: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ color: "#f44336", fontWeight: "bold", mb: 1 }}>
                        ❌ Giao dịch không được xử lý
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Không có khoản tiền nào được trừ từ tài khoản của bạn.
                        <br />
                        Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setPaymentStatus(null);
                        setPaymentError("");
                        setActiveStep(1); // Quay lại bước chọn ghế
                      }}
                      sx={{
                        color: "#f44336",
                        borderColor: "#f44336",
                        "&:hover": {
                          borderColor: "#d32f2f",
                          bgcolor: "#ffebee",
                        },
                      }}
                    >
                      Thử lại
                    </Button>
                    
                    <Button
                      variant="contained"
                      onClick={() => router.push("/")}
                      sx={{
                        bgcolor: "#f44336",
                        "&:hover": {
                          bgcolor: "#d32f2f",
                        },
                      }}
                    >
                      Về trang chủ
                    </Button>
                  </Box>
                </Paper>

                {/* Ticket holes decoration for failed ticket */}
                <Box
                  sx={{
                    position: "absolute",
                    left: -10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: { xs: "none", md: "block" },
                  }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "white",
                        mb: 3,
                        boxShadow: "inset 0 0 5px rgba(244, 67, 54, 0.2)",
                      }}
                    />
                  ))}
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    right: -10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: { xs: "none", md: "block" },
                  }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        bgcolor: "white",
                        mb: 3,
                        boxShadow: "inset 0 0 5px rgba(244, 67, 54, 0.2)",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </motion.div>
          </motion.div>
        )}

        {/* Common Navigation Button for Success */}
        {isSuccess && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Button
              variant="contained"
              onClick={() => router.push("/")}
              sx={{
                bgcolor: "#4caf50",
                "&:hover": {
                  bgcolor: "#388e3c",
                },
                py: 1.5,
                px: 4,
                fontWeight: "bold",
                boxShadow: "0 8px 25px rgba(76, 175, 80, 0.4)",
              }}
            >
              Trở về trang chủ
            </Button>
          </motion.div>
        )}
      </Box>
    );
  };

  // Seat diagram component
  const renderSeatDiagram = (
    seats: SeatType[],
    isInteractive: boolean = true,
    onSeatClick?: (seat: SeatType) => void
  ) => {
    console.log("🎯 renderSeatDiagram called with:", {
      seatsCount: seats?.length || 0,
      isInteractive,
      seatLoading,
      seatError,
      seatsData: seats?.slice(0, 3) || "no seats",
    });

    if (seatLoading) {
      console.log("🎯 Showing loading state");
      return (
        <Box sx={{ position: "relative", overflow: "auto" }}>
          {/* Bus Front Skeleton */}
          <Box
            sx={{
              mb: 2,
              p: 2,
              border: "2px solid #f0f0f0",
              borderRadius: "40px 40px 8px 8px",
              bgcolor: "#fafafa",
              width: "fit-content",
              mx: "auto",
              minWidth: 300,
            }}
          >
            <Skeleton
              variant="text"
              width={120}
              height={24}
              sx={{ mx: "auto" }}
            />
          </Box>

          {/* Seat Layout Skeleton */}
          <Box
            sx={{
              maxWidth: 400,
              mx: "auto",
              mt: 4,
              border: "2px solid #e0e0e0",
              borderRadius: 2,
              p: 2,
              bgcolor: "#fafafa",
            }}
          >
            {/* Generate skeleton rows */}
            {[1, 2, 3, 4, 5].map((rowIndex) => (
              <Box
                key={rowIndex}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 1.5,
                  gap: 1,
                }}
              >
                {/* Row Label Skeleton */}
                <Skeleton variant="text" width={20} height={20} />

                {/* Seats Skeleton */}
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {[1, 2, 3, 4].map((seatIndex) => (
                    <Skeleton
                      key={seatIndex}
                      variant="rectangular"
                      width={45}
                      height={45}
                      sx={{ borderRadius: 2 }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Legend Skeleton */}
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            {[1, 2, 3].map((index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
                <Skeleton
                  variant="rectangular"
                  width={20}
                  height={20}
                  sx={{ mr: 1, borderRadius: 1 }}
                />
                <Skeleton variant="text" width={60} height={16} />
              </Box>
            ))}
          </Box>

          {/* Loading Status */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 3,
            }}
          >
            <CircularProgress
              size={20}
              sx={{ color: "#f48fb1", mr: 1.5 }}
              thickness={4}
            />
            <Typography
              variant="body2"
              sx={{ color: "#f48fb1", fontWeight: 500 }}
            >
              Đang tải sơ đồ ghế...
            </Typography>
          </Box>
        </Box>
      );
    }

    if (seatError) {
      console.log("🎯 Showing error state:", seatError);
      return renderErrorState(
        seatError,
        () => selectedTrip && fetchSeatAvailability(selectedTrip)
      );
    }

    if (!seats || seats.length === 0) {
      console.log("🎯 Showing empty seats message");
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          Không có thông tin ghế cho chuyến xe này.
        </Alert>
      );
    }

  // Determine which trip's meta (floor structure) to use: prefer seat.tripId of the first seat
  const derivedTripId = seats && seats.length && (seats[0] as any).tripId ? String((seats[0] as any).tripId) : undefined;
  const tripKey = derivedTripId || (selectedTrip ? selectedTrip.id.toString() : undefined);
  const rawMeta = tripKey ? (seatMapDataByTrip[tripKey] as any[] | undefined) : undefined;

    // Flatten raw floors -> seat level meta
    let metaSeatsFlattened: any[] = [];
    if (Array.isArray(rawMeta) && rawMeta.length && rawMeta[0]?.seats) {
      metaSeatsFlattened = rawMeta.flatMap((floor: any) =>
        (floor.seats || []).map((seat: any) => ({
          ...seat,
          floorIndex: seat.floorIndex ?? floor.floorIndex ?? 1,
        }))
      );
    } else if (Array.isArray(rawMeta)) {
      metaSeatsFlattened = rawMeta as any[];
    }

    // Build multi-map for duplicate seatIds across floors (A1 can appear on both floors)
    const metaMulti = new Map<string, any[]>();
    metaSeatsFlattened.forEach((ms) => {
      const key = String(ms.seatId ?? ms.seatNumber ?? ms.code ?? "");
      if (!key) return;
      if (!metaMulti.has(key)) metaMulti.set(key, []);
      metaMulti.get(key)!.push(ms);
    });

    console.log("🧬 meta flatten step2:", {
      tripKey,
      reason: derivedTripId ? 'from first seat.tripId' : (selectedTrip ? 'from selectedTrip.id' : 'none'),
      rawMetaType: typeof rawMeta,
      floorsDetected: Array.isArray(rawMeta) && rawMeta[0]?.seats ? rawMeta.length : 0,
      metaSeatsFlattened: metaSeatsFlattened.length,
      sample: metaSeatsFlattened.slice(0, 4),
    });

    // If we have raw floor meta (like preview), render directly (exact same style) and skip legacy mapping
    if (Array.isArray(rawMeta) && rawMeta.length && rawMeta[0]?.seats) {
      const seatMapSeatsRaw = metaSeatsFlattened.map((m, idx) => ({
        // Preserve ORIGINAL backend seat id (numeric) so selection -> payload is correct
        id: m.id ?? idx,
        seatId: `${m.floorIndex || 1}-${m.seatId || m.code || m.id || idx}`,
        isAvailable: m.isSeat ? !!m.isAvailable : false,
        isSeat: m.isSeat !== false, // treat undefined as true
        floorIndex: m.floorIndex || 1,
        rowIndex: m.rowIndex || 1,
        columnIndex: m.columnIndex || 1,
        originalSeatCode: m.seatId || m.code || String(m.id || idx)
      }));

  const tripSelectionList = tripKey ? (selectedCompositeSeatIdsMap[tripKey] || []) : selectedCompositeSeatIds;
  const selectedSeatIdsDirect = tripSelectionList;

      return (
        <SeatMap
          seats={seatMapSeatsRaw}
          onSeatClick={(meta: any) => {
            const compositeId = meta.seatId as string;
            if (tripKey) {
              setSelectedCompositeSeatIdsMap(prev => {
                const existing = prev[tripKey] || [];
                const next = existing.includes(compositeId)
                  ? existing.filter(id => id !== compositeId)
                  : [...existing, compositeId];
                return { ...prev, [tripKey]: next };
              });
            } else {
              // Fallback: single list
              setSelectedCompositeSeatIds(prev => prev.includes(compositeId)
                ? prev.filter(id => id !== compositeId)
                : [...prev, compositeId]
              );
            }
            if (onSeatClick) {
              // Synthesize SeatType for downstream pricing if needed
              const syntheticId = meta.id != null ? meta.id.toString() : meta.originalSeatCode;
              const synthetic: any = {
                id: syntheticId, // Use meta.id if available, fallback to originalSeatCode
                seatNumber: meta.originalSeatCode,
                row: String.fromCharCode(64 + (meta.rowIndex || 1)),
                column: meta.columnIndex || 1,
                isBooked: !meta.isAvailable,
                price: selectedTrip?.price || 0,
                seatType: 'regular',
                isSelected: selectedSeatIdsDirect.includes(compositeId),
                tripId: derivedTripId || selectedTrip?.id,
                floorIndex: meta.floorIndex,
                compositeSeatId: compositeId
              };
              onSeatClick(synthetic);
            }
          }}
          selectedSeats={selectedSeatIdsDirect}
          maxSeats={999}
          showLegend={true}
          compact={false}
          disabled={!isInteractive}
          floorDisplay="all"
          initialFloor={1}
          floorLabels={{ 1: 'Tầng 1', 2: 'Tầng 2' }}
        />
      );
    }

    // Build seat entries. If multiple metas for same baseId (different floors), create one entry per floor.
    const seatMapSeats: any[] = [];
    seats.forEach((seat, index) => {
      // baseId for matching meta: use display code (seatNumber like 1B3) not numeric id
      const baseId = String(seat.seatNumber || seat.id);
      // Preserve backend numeric id exactly (seat.id has been set to original apiSeat.id.toString())
      const backendIdNum = parseInt(String(seat.id), 10);
      const metas = metaMulti.get(baseId) || [];
      if (metas.length === 0) {
        // fallback single (floor 1) if no meta found
        seatMapSeats.push({
          id: !isNaN(backendIdNum) ? backendIdNum : index,
          seatId: `1-${baseId}`,
          isAvailable: !seat.isBooked,
          isSeat: true,
          floorIndex: 1,
          rowIndex: seat.row ? seat.row.charCodeAt(0) - 64 : 1,
          columnIndex: seat.column ?? 1,
          originalSeatCode: baseId,
        });
      } else if (metas.length === 1) {
        const meta = metas[0];
        seatMapSeats.push({
          id: !isNaN(backendIdNum) ? backendIdNum : index,
          seatId: `${meta.floorIndex}-${baseId}`,
          isAvailable: meta.isAvailable ?? !seat.isBooked,
          isSeat: meta.isSeat ?? true,
          floorIndex: meta.floorIndex ?? 1,
          rowIndex: meta.rowIndex ?? (seat.row ? seat.row.charCodeAt(0) - 64 : 1),
          columnIndex: meta.columnIndex ?? seat.column ?? 1,
          originalSeatCode: baseId,
        });
      } else {
        metas.forEach((meta, mIndex) => {
          seatMapSeats.push({
            id: !isNaN(backendIdNum) ? backendIdNum : (index * 10 + mIndex),
            seatId: `${meta.floorIndex}-${baseId}`,
            isAvailable: meta.isAvailable ?? !seat.isBooked,
            isSeat: meta.isSeat ?? true,
            floorIndex: meta.floorIndex ?? 1,
            rowIndex: meta.rowIndex ?? (seat.row ? seat.row.charCodeAt(0) - 64 : 1),
            columnIndex: meta.columnIndex ?? seat.column ?? 1,
            originalSeatCode: baseId,
          });
        });
      }
    });

    // Derive selectedSeatIds from new composite state if present, else from legacy isSelected flags
    let selectedSeatIds: string[] = tripKey
      ? (selectedCompositeSeatIdsMap[tripKey] || []).slice()
      : selectedCompositeSeatIds.slice();
    if (!selectedSeatIds.length) {
      seats.filter((s: any) => (s as any).isSelected).forEach((s) => {
        const baseId = String(s.seatNumber || s.id);
        const metas = metaMulti.get(baseId) || [];
        if (metas.length === 0) selectedSeatIds.push(`1-${baseId}`);
        else {
          // Only push the first meta to avoid auto-selecting same seat on all floors in legacy mode
          const meta = metas[0];
          selectedSeatIds.push(`${meta.floorIndex}-${baseId}`);
        }
      });
    }

    return (
      <SeatMap
        seats={seatMapSeats}
        onSeatClick={(meta: any) => {
          if (!isInteractive) return;
          const compositeId = meta.seatId as string; // already floor-prefixed
          if (tripKey) {
            setSelectedCompositeSeatIdsMap(prev => {
              const existing = prev[tripKey] || [];
              const next = existing.includes(compositeId)
                ? existing.filter(id => id !== compositeId)
                : [...existing, compositeId];
              return { ...prev, [tripKey]: next };
            });
          } else {
            setSelectedCompositeSeatIds(prev => prev.includes(compositeId)
              ? prev.filter(id => id !== compositeId)
              : [...prev, compositeId]
            );
          }
          if (onSeatClick) {
            const original = meta.originalSeatCode || String(meta.seatId).replace(/^\d+-/, '');
            const found = seats.find((s) => String(s.seatNumber || s.id) === original);
            if (found) {
              // Use the found seat object to preserve the correct numeric ID
              (found as any).floorIndex = meta.floorIndex;
              (found as any).compositeSeatId = compositeId;
              onSeatClick(found);
            } else {
              // Fallback: create synthetic seat but try to extract numeric ID from meta.id  
              const syntheticId = meta.id?.toString() || meta.originalSeatCode;
              const synthetic: any = {
                id: syntheticId, // Use meta.id if available, fallback to originalSeatCode
                seatNumber: meta.originalSeatCode,
                row: String.fromCharCode(64 + (meta.rowIndex || 1)),
                column: meta.columnIndex || 1,
                isBooked: !meta.isAvailable,
                price: selectedTrip?.price || 0,
                seatType: 'regular',
                isSelected: selectedSeatIds.includes(compositeId),
                tripId: derivedTripId || selectedTrip?.id,
                floorIndex: meta.floorIndex,
                compositeSeatId: compositeId,
              };
              onSeatClick(synthetic);
            }
          }
        }}
        selectedSeats={selectedSeatIds}
        maxSeats={999}
        showLegend={true}
        compact={false}
        disabled={!isInteractive}
        floorDisplay="toggle"
        initialFloor={1}
        floorLabels={{ 1: 'Tầng 1', 2: 'Tầng 2' }}
      />
    );
  };

  // Seat Dialog Component
  const renderSeatDialog = () => (
    <Dialog
      open={seatDialogOpen}
      onClose={handleCloseSeatDialog}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#f48fb1",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <EventSeat sx={{ mr: 1 }} />
          <Typography variant="h6">
            Sơ đồ ghế - {seatDialogTrip?.busName}
          </Typography>
        </Box>
        <IconButton onClick={handleCloseSeatDialog} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {seatDialogTrip && (
          <Box>
            <Box sx={{ mb: 3, p: 2, bgcolor: "#fce4ec", borderRadius: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                Thông tin chuyến xe
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2">
                    <strong>Tuyến:</strong> {searchData.from} → {searchData.to}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Khởi hành:</strong>{" "}
                    {new Date(seatDialogTrip.timeStart).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">
                    <strong>Ngày:</strong> {searchData.departureDate}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Giá vé:</strong> {formatPrice(seatDialogTrip.price)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Use dialog-specific seat data and loading states */}
            {dialogSeatLoading ? (
              renderSimpleLoading("Đang tải sơ đồ ghế...")
            ) : dialogSeatError ? (
              renderErrorState(
                dialogSeatError,
                () => seatDialogTrip && handleOpenSeatDialog(seatDialogTrip)
              )
            ) : seatDialogTrip.tripType === "transfer" && dialogFirstSeats.length + dialogSecondSeats.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Chặng 1: {seatDialogTrip.firstTrip?.fromLocation} → {seatDialogTrip.firstTrip?.endLocation}
                  </Typography>
                  {renderSeatDiagram(dialogFirstSeats, false)}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Chặng 2: {seatDialogTrip.secondTrip?.fromLocation} → {seatDialogTrip.secondTrip?.endLocation}
                  </Typography>
                  {renderSeatDiagram(dialogSecondSeats, false)}
                </Box>
              </Box>
            ) : (
              // Fallback for direct trips
              renderSeatDiagram(dialogSeats, false)
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleCloseSeatDialog} variant="outlined">
          Đóng
        </Button>
        <Button
          onClick={() => {
            if (seatDialogTrip) {
              handleSelectTrip(seatDialogTrip);
              handleCloseSeatDialog();
            }
          }}
          variant="contained"
          sx={{
            bgcolor: "#f48fb1",
            "&:hover": { bgcolor: "#e91e63" },
          }}
        >
          Chọn chuyến này
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Custom loading component
  function renderLoading() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.03) 0%, rgba(186, 104, 200, 0.03) 100%)',
            borderRadius: 4,
            overflow: 'hidden',
            my: 4
          }}
        >
          {/* Animated background elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(244, 143, 177, 0.1) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
                animation: 'float 20s infinite linear',
              },
              '@keyframes float': {
                '0%': { transform: 'translate(0, 0) rotate(0deg)' },
                '100%': { transform: 'translate(-30px, -30px) rotate(360deg)' },
              }
            }}
          />

          {/* Main loading content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              {/* Rotating bus icon */}
              <Box sx={{ display: 'inline-block', mb: 3 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f48fb1 0%, #ba68c8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 32px rgba(244, 143, 177, 0.3)',
                      position: 'relative',
                    }}
                  >
                    <DirectionsBus 
                      sx={{ 
                        fontSize: '32px', 
                        color: 'white',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                      }} 
                    />
                  </Box>
                </motion.div>
              </Box>

              {/* Loading text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#ba68c8', 
                    fontWeight: 600,
                    mb: 1,
                    textShadow: '0 2px 4px rgba(186, 104, 200, 0.2)'
                  }}
                >
                  Đang tải chuyến xe...
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 4
                  }}
                >
                  Vui lòng chờ trong giây lát
                </Typography>
              </motion.div>

              {/* Progress steps */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
                  {['Tìm kiếm', 'Xử lý', 'Hoàn thành'].map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.2, duration: 0.4 }}
                    >
                      <Box
                        sx={{
                          px: 3,
                          py: 1,
                          borderRadius: 20,
                          background: index === 1 ? 
                            'linear-gradient(135deg, #f48fb1 0%, #ba68c8 100%)' : 
                            'rgba(186, 104, 200, 0.1)',
                          color: index === 1 ? 'white' : '#ba68c8',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          border: index === 1 ? 'none' : '1px solid rgba(186, 104, 200, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {step}
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>

              {/* Animated progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1, duration: 2, ease: 'easeInOut' }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 4,
                    backgroundColor: 'rgba(186, 104, 200, 0.2)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Box
                    component={motion.div}
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #f48fb1 0%, #ba68c8 100%)',
                      borderRadius: 2,
                    }}
                    initial={{ width: '0%' }}
                    animate={{ width: '70%' }}
                    transition={{ delay: 1.2, duration: 2, ease: 'easeInOut' }}
                  />
                </Box>
              </motion.div>
            </Box>
          </motion.div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              component={motion.div}
              sx={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${i % 2 === 0 ? '#f48fb1' : '#ba68c8'} 0%, ${i % 2 === 0 ? '#ba68c8' : '#f48fb1'} 100%)`,
                left: `${20 + i * 10}%`,
                top: `${30 + Math.sin(i) * 20}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3
              }}
            />
          ))}
        </Box>
      </motion.div>
    );
  }

  // Loading message component
  function renderLoadingMessage(message: string) {
    return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        my: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "rgba(244, 143, 177, 0.08)",
        border: "1px solid rgba(244, 143, 177, 0.2)",
      }}
    >
      <CircularProgress size={20} sx={{ color: "#f48fb1" }} thickness={4} />
      <Typography variant="body2" sx={{ color: "#f48fb1", fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
    );
  }

  // Simple loading indicator for small components
  function renderSimpleLoading(message: string = "Đang tải...") {
    return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 2,
        gap: 1.5,
      }}
    >
      <CircularProgress size={20} sx={{ color: "#f48fb1" }} thickness={4} />
      <Typography variant="body2" sx={{ color: "#f48fb1", fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
    );
  }

  // Error state component
  function renderErrorState(message: string, onRetry?: () => void) {
    return (
    <Alert
      severity="error"
      sx={{
        my: 2,
        borderRadius: 3,
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
      action={
        onRetry && (
          <Button
            size="small"
            onClick={onRetry}
            sx={{
              color: "#d32f2f",
              fontWeight: 600,
              "&:hover": {
                bgcolor: "rgba(211, 47, 47, 0.04)",
              },
            }}
          >
            Thử lại
          </Button>
        )
      }
    >
      {message}
    </Alert>
    );
  }

  // Show loading state during server-side rendering to prevent hydration mismatch
  if (!isClient) {
    return (
      <Box sx={{ maxWidth: 'lg', mx: 'auto', py: 4, px: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 'lg', mx: 'auto', py: 4, px: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBack />}
              sx={{
                mb: { xs: 2, sm: 0 },
                mr: 2,
                color: "#f48fb1",
                "&:hover": {
                  bgcolor: "rgba(244, 143, 177, 0.08)",
                },
              }}
            >
              Trang chủ
            </Button>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                Đặt vé xe
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Hoàn tất đặt vé chỉ với vài bước đơn giản
              </Typography>
            </Box>
          </Box>
          <Box
            component="img"
            src="/images/pic4.png"
            alt="XeTiic Logo"
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              display: { xs: "none", sm: "block" },
              mr: 1.5,
              borderRadius: 1,
              objectFit: "contain",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
            }}
          />
        </Box>
      </motion.div>

      {completed ? (
        renderBookingResult()
      ) : (
        <>
          <Box sx={{ width: "100%", mb: 4 }}>
            <Stepper
              activeStep={activeStep}
              alternativeLabel={!isMobile}
              orientation={isMobile ? "vertical" : "horizontal"}
              sx={{
                "& .MuiStepLabel-root .Mui-completed": {
                  color: "#f48fb1", // circle color (COMPLETED)
                },
                "& .MuiStepLabel-root .Mui-active": {
                  color: "#f48fb1", // circle color (ACTIVE)
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {getStepContent()}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={
                activeStep === steps.length - 1 ? (
                  <ShoppingCart />
                ) : (
                  <ArrowForward />
                )
              }
              sx={{
                bgcolor: "#f48fb1",
                "&:hover": {
                  bgcolor: "#e91e63",
                },
              }}
            >
              {activeStep === steps.length - 1 ? "Hoàn tất đặt vé" : "Tiếp tục"}
            </Button>
          </Box>
        </>
      )}

      {/* Seat Dialog */}
      {renderSeatDialog()}

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          mt: 8,
          zIndex: 9999,
        }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.type}
          sx={{
            width: '100%',
            minWidth: '320px',
            borderRadius: 4,
            fontWeight: 600,
            fontSize: '1.1rem',
            py: 2,
            px: 3,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&.MuiAlert-standardSuccess': {
              background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 90%, #81c784 100%)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
                fontSize: '1.5rem',
              },
              '& .MuiIconButton-root': {
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              },
            },
            '&.MuiAlert-standardError': {
              background: 'linear-gradient(135deg, #f44336 0%, #e57373 90%, #ff8a80 100%)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
                fontSize: '1.5rem',
              },
              '& .MuiIconButton-root': {
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              },
            },
            '&.MuiAlert-standardInfo': {
              background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 90%, #90caf9 100%)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
                fontSize: '1.5rem',
              },
              '& .MuiIconButton-root': {
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              },
            },
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <BookingContent />
    </Suspense>
  );
}
