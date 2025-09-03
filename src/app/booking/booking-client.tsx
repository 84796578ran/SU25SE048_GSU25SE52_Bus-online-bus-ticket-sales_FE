/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
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
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  useTheme,
  Skeleton,
  Snackbar,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  DirectionsBus,
  LocationOn,
  ArrowBack,
  ArrowForward,
  Check,
  CheckCircle,
  Info,
  ShoppingCart,
  CreditCard,
  Person,
} from "@mui/icons-material";
import Link from "next/link";
import { apiClient } from "@/services/api";
import { bookingService, VNPayPayloadType } from "@/services/bookingService";
import authService, { type CustomerProfile } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { TransferTrip, SearchResult, ApiSeat, BookingError } from "@/types/booking";

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

  rows.forEach((row, rowIndex) => {
    columns.forEach((col, colIndex) => {
      const backendSeatId = (rowIndex * columns.length) + colIndex + 1;
      const id = backendSeatId.toString(); // Use backend ID as string ID
      const isBooked = Math.random() > 0.7;
      seats.push({
        id,
        row,
        column: col,
        isBooked,
        price: 250000,
        seatNumber: `${row}${col}`,
        seatType: "regular",
      });
    });
  });

  return seats;
};

  // Removed pickup point hardcode

// Payment methods
const paymentMethods = [
  { id: "vnpay", name: "VNPay", icon: <CreditCard /> },
];

export default function BookingPage() {

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
  const [returnDateDisplay, setReturnDateDisplay] = useState<string>("-");
  
  // Separate trip selections for round-trip
  const [departureTrips, setDepartureTrips] = useState<TripType[]>([]);
  const [returnTrips, setReturnTrips] = useState<TripType[]>([]);
  // const [trips, setTrips] = useState<TripType[]>([]); // Keep for backward compatibility - not used
  
  // Separate trip selections for round-trip
  const [selectedDepartureTrip, setSelectedDepartureTrip] = useState<TripType | null>(null);
  const [selectedReturnTrip, setSelectedReturnTrip] = useState<TripType | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripType | null>(null); // Keep for one-way compatibility
  
  // Separate seat management for departure and return trips
  const [departureSeats, setDepartureSeats] = useState<SeatType[]>([]);
  const [returnSeats, setReturnSeats] = useState<SeatType[]>([]);
  const [selectedDepartureSeats, setSelectedDepartureSeats] = useState<SeatType[]>([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState<SeatType[]>([]);
  
  // Separate seat management for transfer trip legs
  const [firstLegSeats, setFirstLegSeats] = useState<SeatType[]>([]);
  const [secondLegSeats, setSecondLegSeats] = useState<SeatType[]>([]);
  const [selectedFirstLegSeats, setSelectedFirstLegSeats] = useState<SeatType[]>([]);
  const [selectedSecondLegSeats, setSelectedSecondLegSeats] = useState<SeatType[]>([]);
  // Return transfer leg seats
  const [returnFirstLegSeats, setReturnFirstLegSeats] = useState<SeatType[]>([]);
  const [returnSecondLegSeats, setReturnSecondLegSeats] = useState<SeatType[]>([]);
  const [selectedReturnFirstLegSeats, setSelectedReturnFirstLegSeats] = useState<SeatType[]>([]);
  const [selectedReturnSecondLegSeats, setSelectedReturnSecondLegSeats] = useState<SeatType[]>([]);

  // Fallback partition for return transfer trip if not already partitioned
  useEffect(() => {
    const rt: any = selectedReturnTrip;
    const isReturnTransfer = rt && (rt.tripType === 'transfer' || (rt.firstTrip && rt.secondTrip));
    if (searchData.tripType === 'roundTrip' && isReturnTransfer) {
      const needPartition = returnSeats.length > 0 && (returnFirstLegSeats.length === 0 || returnSecondLegSeats.length === 0);
      if (needPartition) {
        const leg1Id = rt.firstTrip?.id;
        const leg2Id = rt.secondTrip?.id;
        if (leg1Id && leg2Id) {
          const part1 = returnSeats.filter((s: any) => s.tripId === leg1Id);
          const part2 = returnSeats.filter((s: any) => s.tripId === leg2Id);
          if (part1.length + part2.length > 0) {
            console.log('🛠 Partitioning returnSeats into legs (fallback)', { total: returnSeats.length, part1: part1.length, part2: part2.length, leg1Id, leg2Id });
            setReturnFirstLegSeats(part1);
            setReturnSecondLegSeats(part2);
          } else {
            console.log('⚠️ Fallback partition found no matching tripId markers in returnSeats sample', returnSeats.slice(0,5));
          }
        } else {
          console.log('⚠️ Cannot partition return transfer seats: missing leg ids', { leg1Id, leg2Id });
        }
      }
    }
  }, [searchData.tripType, selectedReturnTrip, returnSeats, returnFirstLegSeats.length, returnSecondLegSeats.length]);
  
  const [seats, setSeats] = useState<SeatType[]>([]); // Keep for one-way compatibility
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]); // Keep for one-way compatibility
  // Removed pickup point selection per request
  const [shuttlePoint, setShuttlePoint] = useState<ShuttlePointType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [completed, setCompleted] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null);
  const [paymentError, setPaymentError] = useState<string>("");
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({
      open: true,
      message,
      severity: type
    });
  };

  const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };
  const [vnpayPayload, setVnpayPayload] = useState<VNPayPayloadType | null>(
    null
  );
  // Flag to ensure we only render success ticket after restoring booking data
  const [bookingDataRestored, setBookingDataRestored] = useState<boolean>(false);

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

  // Authentication hook
  const { user, isAuthenticated } = useAuth();
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [localUserData, setLocalUserData] = useState<any>(null);

  // Phone number state for Google login users
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState<string>("");
  const [isPhoneEditable, setIsPhoneEditable] = useState<boolean>(false);
  const [isPhoneUpdating, setIsPhoneUpdating] = useState<boolean>(false);

  // Seat availability by trip id for displaying in trip cards
  const [seatAvailabilityByTrip, setSeatAvailabilityByTrip] = useState<
    Record<string, { available: number; total: number }>
  >({});
  const [loadingSeatsByTrip, setLoadingSeatsByTrip] = useState<
    Record<string, boolean>
  >({});

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
                .map((transferTrip: TransferTrip, index: number) => {
                  const { firstTrip, secondTrip } = transferTrip;

                  if (!firstTrip || !secondTrip) {
                    console.warn(
                      `⚠️ Departure transfer trip ${index} missing firstTrip or secondTrip:`,
                      transferTrip
                    );
                    return null;
                  }

                  const totalPrice = (firstTrip.price || 0) + (secondTrip.price || 0);
                  const startTime = new Date(firstTrip.timeStart || firstTrip.departureTime || new Date().toISOString());
                  const endTime = new Date(secondTrip.timeEnd || secondTrip.arrivalTime || new Date().toISOString());
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
                    status: Math.min(firstTrip.status || 0, secondTrip.status || 0),
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
              const processedReturnTrips = result.return.transferTrips.map((transferTrip: TransferTrip, index: number) => {
                const { firstTrip, secondTrip } = transferTrip;
                
                if (!firstTrip || !secondTrip) {
                  console.warn(`⚠️ Return transfer trip ${index} missing firstTrip or secondTrip:`, transferTrip);
                  return null;
                }

                const totalPrice = (firstTrip.price || 0) + (secondTrip.price || 0);
                const startTime = new Date(firstTrip.timeStart || '');
                const endTime = new Date(secondTrip.timeEnd || '');
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
                  status: Math.min(firstTrip.status || 0, secondTrip.status || 0),
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
            const processedTrips = result.transferTrips.map((transferTrip: TransferTrip, index: number) => {
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
              const startTime = new Date(firstTrip.timeStart || '');
              const endTime = new Date(secondTrip.timeEnd || '');
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
                status: Math.min(firstTrip.status || 0, secondTrip.status || 0), // Use most restrictive status
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
    color: string
  ) => (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: `3px solid ${color}`, background: `linear-gradient(135deg, ${color}22 0%, white 100%)` }}>
      <Typography variant="h6" gutterBottom sx={{ color, fontWeight: 700 }}>
        {title} {busName ? `- ${busName}` : ''}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {date}
      </Typography>
      {renderSeatDiagram(
        seats.map(seat => ({ ...seat, isSelected: selectedSeats.some(s => s.id === seat.id) })),
        true,
        onSelect
      )}
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

    // Try to restore booking data from localStorage (without pickup requirement)
        try {
          if (typeof window !== 'undefined') {
            const savedBookingData = localStorage.getItem('bookingData');
            if (savedBookingData) {
              const bookingData = JSON.parse(savedBookingData);
              console.log("📥 Restoring booking data from localStorage:", bookingData);
              
              // Restore booking state
              setSearchData(bookingData.searchData);
              setSelectedTrip(bookingData.selectedTrip);
              setSelectedDepartureTrip(bookingData.selectedDepartureTrip);
              setSelectedReturnTrip(bookingData.selectedReturnTrip);
              setSelectedSeats(bookingData.selectedSeats || []);
              setSelectedDepartureSeats(bookingData.selectedDepartureSeats || []);
              setSelectedReturnSeats(bookingData.selectedReturnSeats || []);
              setSelectedFirstLegSeats(bookingData.selectedFirstLegSeats || []);
              setSelectedSecondLegSeats(bookingData.selectedSecondLegSeats || []);
              setSelectedReturnFirstLegSeats(bookingData.selectedReturnFirstLegSeats || []);
              setSelectedReturnSecondLegSeats(bookingData.selectedReturnSecondLegSeats || []);
              setShuttlePoint(null);
              setCustomerPhoneNumber(bookingData.customerPhoneNumber);
              
              localStorage.removeItem('bookingData');
              setBookingDataRestored(true);
            }
            else {
              // Nothing to restore but still allow rendering
              setBookingDataRestored(true);
            }
          }
        } catch (error) {
          console.error("❌ Error restoring booking data:", error);
          setBookingDataRestored(true); // Avoid blocking UI if restore fails
        }

      // Set payment status and completed state
      setPaymentStatus(paymentStatusParam as "success" | "failed");
      if (paymentErrorParam) {
        setPaymentError(decodeURIComponent(paymentErrorParam));
      }
      // Delay marking completed until after booking data restored to avoid empty template
      // If already restored (e.g., no data) we can mark immediately
      if (bookingDataRestored) {
        setCompleted(true);
      }
      // Otherwise a separate effect below will setCompleted once restored
      setActiveStep(2); // Set to payment step

              // Clean up URL parameters
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete("paymentStatus");
          url.searchParams.delete("paymentError");
          window.history.replaceState({}, "", url.toString());
        }
    }
  }, [searchParams]);

  // When restoration finishes after payment status detected, mark completed
  useEffect(() => {
    if (paymentStatus && !completed && bookingDataRestored) {
      setCompleted(true);
    }
  }, [bookingDataRestored, paymentStatus, completed]);

  // Effect to load data from URL parameters
  useEffect(() => {
    if (!searchParams) return;
    
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
        // setTrips(allTrips); // Keep for backward compatibility - not used

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
        // setTrips([]); // not used
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
        timeElement.textContent = new Date().toLocaleString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
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
            if ((selectedDepartureTrip as any)?.tripType === 'transfer') {
              // Partition by tripId (added to each seat when fetched) instead of legacy prefixes
              const depFirst = departureSeatData.filter(s => s.tripId === (selectedDepartureTrip as any).firstTrip?.id);
              const depSecond = departureSeatData.filter(s => s.tripId === (selectedDepartureTrip as any).secondTrip?.id);
              setFirstLegSeats(depFirst);
              setSecondLegSeats(depSecond);
              setDepartureSeats([...depFirst, ...depSecond]);
              console.log("🎯 Departure transfer seats partitioned:", { depFirst: depFirst.length, depSecond: depSecond.length, total: depFirst.length + depSecond.length });
            } else {
              setDepartureSeats(departureSeatData);
              console.log("🎯 Departure direct seats set:", { count: departureSeatData.length });
            }

            // Return
            if ((selectedReturnTrip as any)?.tripType === 'transfer') {
              const retFirst = returnSeatData.filter(s => s.tripId === (selectedReturnTrip as any).firstTrip?.id);
              const retSecond = returnSeatData.filter(s => s.tripId === (selectedReturnTrip as any).secondTrip?.id);
              setReturnFirstLegSeats(retFirst);
              setReturnSecondLegSeats(retSecond);
              setReturnSeats([...retFirst, ...retSecond]);
              console.log("🎯 Return transfer seats partitioned:", { retFirst: retFirst.length, retSecond: retSecond.length, total: retFirst.length + retSecond.length });
            } else {
              setReturnSeats(returnSeatData);
              console.log("🎯 Return direct seats set:", { count: returnSeatData.length });
            }
            setSeats(departureSeatData); 
            
            console.log("🎯 Seats state updated for round trip");
          } catch (error) {
            console.error("Error loading seats for round trip:", error);
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

            // Build a safe return URL based on current origin (avoid forcing https in localhost)
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
            // Build safe return URL (same logic as in page.tsx)
            const baseFromEnv = process.env.NEXT_PUBLIC_BASE_URL?.trim();
            let returnBase = baseFromEnv || currentOrigin;
            if (/localhost|127\.0\.0\.1/i.test(returnBase)) {
              const port = typeof window !== 'undefined' ? window.location.port || '3000' : '3000';
              returnBase = `http://localhost:${port}`;
            }
            const returnUrl = `${returnBase.replace(/\/$/, '')}/booking/confirm`;
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
          } catch (error: BookingError | unknown) {
            console.error("❌ Lỗi khi gọi API thanh toán:", error);

            // Log chi tiết lỗi để debug
            if (error && typeof error === 'object' && 'response' in error) {
              const err = error as any;
              console.error("- Response error:", err.response?.data);
              console.error("- Status:", err.response?.status);
              console.error("- Headers:", err.response?.headers);
            } else if (error && typeof error === 'object' && 'request' in error) {
              const err = error as any;
              console.error("- Request error:", err.request);
            } else {
              console.error("- Error message:", error);
            }

            setPaymentStatus("failed");
            setPaymentError((error as any)?.message || "Có lỗi xảy ra khi xử lý thanh toán");
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
    const alreadySelected = selectedFirstLegSeats.some((s) => s.id === seat.id);
    setSelectedFirstLegSeats(
      alreadySelected
        ? selectedFirstLegSeats.filter((s) => s.id !== seat.id)
        : [...selectedFirstLegSeats, seat]
    );
  };

  const handleSelectSecondLegSeat = (seat: SeatType) => {
    if (seat.isBooked) return;
    const alreadySelected = selectedSecondLegSeats.some((s) => s.id === seat.id);
    setSelectedSecondLegSeats(
      alreadySelected
        ? selectedSecondLegSeats.filter((s) => s.id !== seat.id)
        : [...selectedSecondLegSeats, seat]
    );
  };

  // Handle shuttle point selection
  // Pickup selection removed

  // Handle phone number save/update
  const handleSavePhoneNumber = async () => {
    if (!customerPhoneNumber || customerPhoneNumber.trim().length === 0) {
      showNotification("Vui lòng nhập số điện thoại", "error");
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerPhoneNumber.replace(/\s/g, ''))) {
      showNotification("Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số", "error");
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
        showNotification("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.", "error");
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
      showNotification("Cập nhật số điện thoại thành công!", "success");
      
    } catch (error) {
      console.error("❌ Error saving phone number:", error);
      showNotification("Có lỗi xảy ra khi lưu số điện thoại. Vui lòng thử lại.", "error");
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
        // Chuyến khứ hồi - sử dụng departure và return trip riêng biệt
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
              seatIds: selectedFirstLegSeats.map(seat => parseInt(String(seat.id),10)).filter(n=>!isNaN(n)),
            },
            {
              tripId: (selectedDepartureTrip as any).secondTrip.id,
              fromStationId: (selectedDepartureTrip as any).secondTrip.fromStationId,
              toStationId: (selectedDepartureTrip as any).secondTrip.toStationId,
              seatIds: selectedSecondLegSeats.map(seat => parseInt(String(seat.id),10)).filter(n=>!isNaN(n)),
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
            seatIds: selectedDepartureSeats.map((seat) => parseInt(seat.id)),
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
                seatIds: selectedReturnFirstLegSeats.map(seat => parseInt(String(seat.id),10)).filter(n=>!isNaN(n)),
              },
              {
                tripId: (selectedReturnTrip as any).secondTrip.id,
                fromStationId: (selectedReturnTrip as any).secondTrip.fromStationId,
                toStationId: (selectedReturnTrip as any).secondTrip.toStationId,
                seatIds: selectedReturnSecondLegSeats.map(seat => parseInt(String(seat.id),10)).filter(n=>!isNaN(n)),
              },
            ];
          } else {
        returnTripSeats = [
          {
            tripId: selectedReturnTrip.id,
            fromStationId: parseInt(searchData.toStationId), // Đảo ngược vì là chuyến về
            toStationId: parseInt(searchData.fromStationId), // Đảo ngược vì là chuyến về
            seatIds: selectedReturnSeats.map((seat) => parseInt(seat.id)),
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
              seatIds: selectedFirstLegSeats.map(seat => seat.id),
            },
            secondLeg: {
              tripId: (selectedDepartureTrip as any).secondTrip.id,
              busName: (selectedDepartureTrip as any).secondTrip.busName,
              seatsCount: selectedSecondLegSeats.length,
              seatIds: selectedSecondLegSeats.map(seat => seat.id),
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
                seatIds: selectedReturnFirstLegSeats.map(seat => seat.id),
              },
              secondLeg: {
                tripId: (selectedReturnTrip as any).secondTrip.id,
                busName: (selectedReturnTrip as any).secondTrip.busName,
                seatsCount: selectedReturnSecondLegSeats.length,
                seatIds: selectedReturnSecondLegSeats.map(seat => seat.id),
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

          tripSeats = [
            // Chặng 1
            {
              tripId: selectedTrip.firstTrip!.id,
              fromStationId: selectedTrip.firstTrip!.fromStationId,
              toStationId: selectedTrip.firstTrip!.toStationId,
              seatIds: selectedFirstLegSeats.map((seat) => {
                // (prefix legacy removed)
                const originalId = seat.id; // already raw
                return parseInt(originalId);
              }),
            },
            // Chặng 2
            {
              tripId: selectedTrip.secondTrip!.id,
              fromStationId: selectedTrip.secondTrip!.fromStationId,
              toStationId: selectedTrip.secondTrip!.toStationId,
              seatIds: selectedSecondLegSeats.map((seat) => {
                // (prefix legacy removed)
                const originalId = seat.id; // already raw
                return parseInt(originalId);
              }),
            },
          ];

          console.log("🎫 Transfer trip payload prepared:", {
            firstLeg: {
              tripId: selectedTrip.firstTrip!.id,
              busName: selectedTrip.firstTrip!.busName,
              seatsCount: selectedFirstLegSeats.length,
              seatIds: selectedFirstLegSeats.map(seat => seat.id),
            },
            secondLeg: {
              tripId: selectedTrip.secondTrip!.id,
              busName: selectedTrip.secondTrip!.busName,
              seatsCount: selectedSecondLegSeats.length,
              seatIds: selectedSecondLegSeats.map(seat => seat.id),
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
              seatIds: selectedSeats.map((seat) => parseInt(seat.id)),
            },
          ];

          console.log("🎫 One way trip payload prepared:", {
            tripId: selectedTrip.id,
            busName: selectedTrip.busName,
            seatsCount: selectedSeats.length,
            seatIds: selectedSeats.map((seat) => seat.id),
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

      console.log("VNPay API payload prepared:", payload);
      console.log("📱 Customer phone number for booking:", customerPhoneNumber);

      setVnpayPayload(payload);
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

        // Fetch seats for first trip (use leg-specific stations)
        const firstTripSeats = await apiClient.getSeatAvailability(
          trip.firstTrip!.id,
          trip.firstTrip!.fromStationId,
          trip.firstTrip!.toStationId
        );

        // Fetch seats for second trip (use leg-specific stations)
        const secondTripSeats = await apiClient.getSeatAvailability(
          trip.secondTrip!.id,
          trip.secondTrip!.fromStationId,
          trip.secondTrip!.toStationId
        );

        console.log("🎫 Transfer trip seat data:", {
          "firstTrip seats count": Array.isArray(firstTripSeats) ? firstTripSeats.length : 0,
          "secondTrip seats count": Array.isArray(secondTripSeats) ? secondTripSeats.length : 0,
        });

        // Transform first leg seats
        let transformedFirstSeats: SeatType[] = [];
        if (Array.isArray(firstTripSeats)) {
          transformedFirstSeats = firstTripSeats.map((apiSeat: any, index: number) => {
            // Use API rowIndex and columnIndex instead of calculating from array index
            const rowLetter = String.fromCharCode(64 + (apiSeat.rowIndex || 1)); // 64 + 1 = 65 = 'A'
            const columnIndex = apiSeat.columnIndex || 1;
            const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;
            return {
              id: String(apiSeat.id),
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
        }

        // Transform second leg seats
        let transformedSecondSeats: SeatType[] = [];
        if (Array.isArray(secondTripSeats)) {
          transformedSecondSeats = secondTripSeats.map((apiSeat: any, index: number) => {
            // Use API rowIndex and columnIndex instead of calculating from array index
            const rowLetter = String.fromCharCode(64 + (apiSeat.rowIndex || 1)); // 64 + 1 = 65 = 'A'
            const columnIndex = apiSeat.columnIndex || 1;
            const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;

            return {
              id: String(apiSeat.id),
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
        }

        // Store seats separately for transfer trips (differentiate outbound/return)
        if (trip.direction === 'return') {
          setReturnFirstLegSeats(transformedFirstSeats);
          setReturnSecondLegSeats(transformedSecondSeats);
          console.log("🎫 Return transfer seats stored:", {
            returnFirstLeg: transformedFirstSeats.length,
            returnSecondLeg: transformedSecondSeats.length,
          });
        } else {
          setFirstLegSeats(transformedFirstSeats);
          setSecondLegSeats(transformedSecondSeats);
          console.log("🎫 Outbound transfer seats stored:", {
            firstLeg: transformedFirstSeats.length,
            secondLeg: transformedSecondSeats.length,
          });
        }

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

      const seatData = await apiClient.getSeatAvailability(
        tripIdToUse,
        fromStationIdToUse,
        toStationIdToUse
      );

      console.log("🎫 Seat API response:", seatData);

      // Transform API response to our SeatType format
      if (Array.isArray(seatData) && seatData.length > 0) {
        console.log("🎫 Raw API seat data sample:", seatData.slice(0, 3));

        const transformedSeats: SeatType[] = seatData.map(
          (apiSeat: any, index: number) => {
            // Use API rowIndex and columnIndex instead of calculating from array index
            const rowLetter = String.fromCharCode(64 + (apiSeat.rowIndex || 1)); // 64 + 1 = 65 = 'A'
            const columnIndex = apiSeat.columnIndex || 1;
            const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;

            // Use API id as unique identifier
            const seatId = String(apiSeat.id);

            const transformedSeat = {
              id: seatId,
              row: rowLetter,
              column: columnIndex,
              isBooked: !apiSeat.isAvailable,
              price: trip.price, // Use trip price as default
              seatNumber: displaySeatNumber,
              seatType: "regular", // Default seat type
              isSelected: false,
            };

            // Debug logging for transformation
            if (index < 10) {
              console.log(`🔍 Seat ${index + 1} transform:`, {
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

        console.log("🎫 Transformed seats:", {
          "total seats": transformedSeats.length,
          "available seats": transformedSeats.filter(seat => !seat.isBooked).length,
          "booked seats": transformedSeats.filter(seat => seat.isBooked).length,
        });

        // Persist into direction-specific arrays for direct trips (ensures departureSeats populated for reverse triple)
        if (trip.direction === 'return') {
          setReturnSeats(transformedSeats);
        } else {
          setDepartureSeats(transformedSeats);
        }

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

        // Set loading state for this trip
  const tripKey = String(trip.id); // safe stringify accessible in finally
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

        // Call API with the correct station IDs
        const seatData = await apiClient.getSeatAvailability(
          tripIdToUse,
          fromStationIdToUse,
          toStationIdToUse
        );

        console.log("🎫 Seat data received for trip", trip.id, ":", {
          dataType: typeof seatData,
          isArray: Array.isArray(seatData),
          length: Array.isArray(seatData) ? seatData.length : "N/A",
        });

        // Transform the data similar to fetchSeatAvailability
        const transformedSeats = Array.isArray(seatData)
          ? seatData.reduce((acc: any[], apiSeat: any, index: number) => {
              if (!apiSeat || apiSeat.id == null) {
                if (index < 5) {
                  console.warn('⚠️ Skipping seat with undefined id in trip', trip.id, apiSeat);
                }
                return acc; // skip invalid seat
              }
              // Use API rowIndex and columnIndex instead of calculating from array index
              const rowLetter = String.fromCharCode(64 + (apiSeat.rowIndex || 1)); // 64 + 1 = 65 = 'A'
              const columnIndex = apiSeat.columnIndex || 1;
              const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;
              acc.push({
                id: String(apiSeat.id),
                row: rowLetter,
                column: columnIndex,
                isBooked: !apiSeat.isAvailable,
                price: trip.price,
                seatNumber: displaySeatNumber,
                seatType: 'regular',
                isSelected: false,
              });
              return acc;
            }, [])
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
        const safeKey = String(trip.id);
        setLoadingSeatsByTrip((prev) => ({
          ...prev,
          [safeKey]: false,
        }));
      }
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

        const transformSeats = (
          apiSeats: any[],
          price: number,
          legTripId: number
        ): SeatType[] =>
          (apiSeats || []).map((apiSeat: any, index: number) => {
            // Use API rowIndex and columnIndex instead of calculating from array index
            const rowLetter = String.fromCharCode(64 + (apiSeat.rowIndex || 1)); // 64 + 1 = 65 = 'A'
            const columnIndex = apiSeat.columnIndex || 1;
            const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;
            return {
              id: String(apiSeat.id),
              row: rowLetter,
              column: columnIndex,
              isBooked: !apiSeat.isAvailable,
              price,
              seatNumber: displaySeatNumber,
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
        setDialogSeats([...firstSeats, ...secondSeats]);
        setDialogSeatLoading(false);
        return;
      }

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

      // Fetch fresh seat data specifically for dialog
      const seatData = await apiClient.getSeatAvailability(
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

      // Transform API response with detailed logging
      if (Array.isArray(seatData) && seatData.length > 0) {
        const transformedSeats: SeatType[] = seatData.map(
          (apiSeat: any, index: number) => {
            // Use API rowIndex and columnIndex instead of calculating from array index
            const rowLetter = String.fromCharCode(64 + (apiSeat.rowIndex || 1)); // 64 + 1 = 65 = 'A'
            const columnIndex = apiSeat.columnIndex || 1;
            const displaySeatNumber = apiSeat.seatId || `${rowLetter}${columnIndex}`;

            const transformedSeat = {
              id: String(apiSeat.id),
              row: rowLetter,
              column: columnIndex,
              isBooked: !apiSeat.isAvailable, // KEY LOGIC: isAvailable: true -> isBooked: false (ghế trống)
              price: trip.price,
              seatNumber: displaySeatNumber,
              seatType: "regular",
              isSelected: false,
            };

            // Debug logging for transformation
            if (index < 10) {
              console.log(`🔍 Seat ${index + 1} transform:`, {
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

            {/* Seat diagram button removed; show only selection indicator when selected */}
            {isSelected && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CheckCircle sx={{ color: "#f48fb1", fontSize: 28 }} />
              </Box>
            )}
            {(trip.firstTrip?.routeDescription || trip.secondTrip?.routeDescription) && (
              <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                <Info sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {(trip.firstTrip?.routeDescription || trip.secondTrip?.routeDescription) as string} • Có thể đi một phần của chuyến
                </Typography>
              </Box>
            )}
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

    const shuttleFee = 0;
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
                                  {/* Seat diagram button removed */}
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
                              {trip.routeDescription && (
                                <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                                  <Info sx={{ fontSize: 16, color: "text.secondary" }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {trip.routeDescription} • Có thể đi một phần của chuyến
                                  </Typography>
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
                                    {/* Seat diagram button removed */}
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
                              {/* Seat diagram button removed */}
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
  // Broaden transfer detection: either explicit tripType === 'transfer' OR presence of firstTrip & secondTrip
  const isTransferTrip = !!(selectedTrip && ((selectedTrip as any).tripType === 'transfer' || ((selectedTrip as any).firstTrip && (selectedTrip as any).secondTrip)));
  const isDepartureTransfer = !!(isRoundTrip && selectedDepartureTrip && (((selectedDepartureTrip as any).tripType === 'transfer') || ((selectedDepartureTrip as any).firstTrip && (selectedDepartureTrip as any).secondTrip)));
  const isReturnTransfer = !!(isRoundTrip && selectedReturnTrip && (((selectedReturnTrip as any).tripType === 'transfer') || ((selectedReturnTrip as any).firstTrip && (selectedReturnTrip as any).secondTrip)));
  // Fallback detection: returnSeats already merged but contain seats for more than one tripId
  const returnDistinctTripIds = isRoundTrip ? new Set((returnSeats || []).map((s: any)=> s.tripId)).size : 0;
    
    // Check if we should show dual seat diagrams for round trip OR transfer trip
    const isMixedRoundTrip = isRoundTrip && ((isDepartureTransfer && !isReturnTransfer) || (!isDepartureTransfer && isReturnTransfer));
    const shouldShowDualDiagrams = (
      (isRoundTrip && !isMixedRoundTrip && !isDepartureTransfer && !isReturnTransfer && selectedDepartureTrip && selectedReturnTrip && departureSeats.length > 0 && returnSeats.length > 0)
    ) || (
      (!isRoundTrip && isTransferTrip && selectedTrip?.firstTrip && selectedTrip?.secondTrip && firstLegSeats.length > 0 && secondLegSeats.length > 0)
    );

    const shouldShowQuadDiagrams = isRoundTrip && isDepartureTransfer && isReturnTransfer &&
      firstLegSeats.length > 0 && secondLegSeats.length > 0 && returnFirstLegSeats.length > 0 && returnSecondLegSeats.length > 0;

    // Triple diagrams: transfer departure (2 legs) + return
  const shouldShowTripleDiagrams = (
      isDepartureTransfer && selectedReturnTrip &&
      firstLegSeats.length > 0 && secondLegSeats.length > 0 && returnSeats.length > 0
    );

    // Triple diagrams (reverse): departure direct + return transfer (2 legs)
    // Hiển thị 3 sơ đồ: chuyến đi (thẳng) + 2 chặng chuyến về (nối)
    // Trước đây yêu cầu tất cả mảng ghế phải > 0 mới render => khi dữ liệu load lệch sẽ chỉ thấy 1/2 sơ đồ.
    // Nới lỏng để chỉ cần phân loại loại chuyến là đủ; phần thân sẽ tự hiển thị trạng thái rỗng nếu chưa có ghế.
    let shouldShowTripleDiagramsReturnTransfer: boolean = !!(
      isRoundTrip && !isDepartureTransfer && isReturnTransfer && selectedDepartureTrip && selectedReturnTrip
    );
    // If not yet partitioned but we can infer two legs via distinct tripIds in returnSeats => still show triple layout
    if (!shouldShowTripleDiagramsReturnTransfer && isRoundTrip && !isDepartureTransfer && isReturnTransfer && returnDistinctTripIds > 1) {
      shouldShowTripleDiagramsReturnTransfer = true;
    }

    // Extra diagnostic if reverse triple expected but not showing yet
    if (isRoundTrip && !isDepartureTransfer && isReturnTransfer && typeof window !== 'undefined') {
      if (!shouldShowTripleDiagramsReturnTransfer) {
        console.log('🛠 Expected reverse triple (direct outbound + transfer return) but condition not yet met', {
          departureSeatsLen: departureSeats.length,
          returnFirstLegSeatsLen: returnFirstLegSeats.length,
          returnSecondLegSeatsLen: returnSecondLegSeats.length,
          reasons: {
            noDepartureSeats: departureSeats.length === 0,
            noReturnFirst: returnFirstLegSeats.length === 0,
            noReturnSecond: returnSecondLegSeats.length === 0,
          },
          rawReturnSeatsLen: returnSeats.length,
          sampleReturnSeats: returnSeats.slice(0,5).map(s=>({id:s.id, tripId:(s as any).tripId}))
        });
      }
    }

    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      try {
        console.log('🧪 Seat layout mode decision', {
          isRoundTrip,
          isDepartureTransfer,
          isReturnTransfer,
            isMixedRoundTrip,
          lengths: {
            departureSeats: departureSeats.length,
            returnSeats: returnSeats.length,
            firstLegSeats: firstLegSeats.length,
            secondLegSeats: secondLegSeats.length,
            returnFirstLegSeats: returnFirstLegSeats.length,
            returnSecondLegSeats: returnSecondLegSeats.length
          },
          shouldShowQuadDiagrams,
          shouldShowTripleDiagrams,
          shouldShowTripleDiagramsReturnTransfer,
          shouldShowDualDiagrams
        });
      } catch {}
    }

    if (shouldShowQuadDiagrams) {
      return (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 4 }}>
            🎫 Chọn ghế: Chặng 1 + Chặng 2 (chuyến đi - nối) + Chặng 1 + Chặng 2 (chuyến về - nối)
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 4 }}>
            {/* Outbound Leg 1 */}
            {renderSeatPanel('🧩 Chặng 1 - Chuyến đi', (selectedDepartureTrip as any)?.firstTrip?.busName, searchData.departureDate, firstLegSeats, selectedFirstLegSeats, handleSelectFirstLegSeat, '#1976d2')}
            {/* Outbound Leg 2 */}
            {renderSeatPanel('🧩 Chặng 2 - Chuyến đi', (selectedDepartureTrip as any)?.secondTrip?.busName, searchData.departureDate, secondLegSeats, selectedSecondLegSeats, handleSelectSecondLegSeat, '#1976d2')}
            {/* Return Leg 1 */}
            {renderSeatPanel('🧩 Chặng 1 - Chuyến về', (selectedReturnTrip as any)?.firstTrip?.busName, searchData.returnDate, returnFirstLegSeats, selectedReturnFirstLegSeats, (seat)=>setSelectedReturnFirstLegSeats(t=> t.some(s=>s.id===seat.id)? t.filter(s=>s.id!==seat.id):[...t, seat]), '#7b1fa2')}
            {/* Return Leg 2 */}
            {renderSeatPanel('🧩 Chặng 2 - Chuyến về', (selectedReturnTrip as any)?.secondTrip?.busName, searchData.returnDate, returnSecondLegSeats, selectedReturnSecondLegSeats, (seat)=>setSelectedReturnSecondLegSeats(t=> t.some(s=>s.id===seat.id)? t.filter(s=>s.id!==seat.id):[...t, seat]), '#7b1fa2')}
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

  if (shouldShowTripleDiagramsReturnTransfer) {
      return (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 4 }}>
            🎫 Chọn ghế: Chuyến đi (thẳng) + Chặng 1 + Chặng 2 (chuyến về - nối)
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
                Chặng 1 về: {(selectedReturnTrip as any)?.firstTrip?.busName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 3, py: 2, borderRadius: 3, bgcolor: "rgba(123, 31, 162, 0.1)", border: "2px solid #7b1fa2" }}>
              <CheckCircle sx={{ color: "#7b1fa2", fontSize: 24 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Chặng 2 về: {(selectedReturnTrip as any)?.secondTrip?.busName}
              </Typography>
            </Box>
          </Box>

          {/* Triple Seat Diagrams (reverse) */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 4, mb: 4 }}>
            {/* Departure direct */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #1976d2", background: "linear-gradient(135deg, rgba(25, 118, 210, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: 700 }}>
                🛫 Chuyến đi - {selectedDepartureTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedDepartureTrip && (
                  <>
                    {formatTimeSafe(selectedDepartureTrip.timeStart)} - {formatTimeSafe(selectedDepartureTrip.timeEnd)} • {searchData.departureDate}
                  </>
                )}
              </Typography>
              {departureSeats.length > 0 ? (
                renderSeatDiagram(
                  departureSeats.map(seat => ({ ...seat, isSelected: selectedDepartureSeats.some(s => s.id === seat.id) })),
                  true,
                  handleSelectDepartureSeat
                )
              ) : (
                <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
                  <Skeleton variant="rounded" height={200} />
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign:'center' }}>Đang tải sơ đồ ghế chuyến đi...</Typography>
                </Box>
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
                  {formatPrice(selectedDepartureSeats.length * (selectedDepartureTrip?.price || 0))}
                </Typography>
              </Box>
            </Paper>

            {/* Return leg 1 */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #7b1fa2", background: "linear-gradient(135deg, rgba(123, 31, 162, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2", fontWeight: 700 }}>
                🧩 Chặng 1 - {(selectedReturnTrip as any)?.firstTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {(selectedReturnTrip as any)?.firstTrip && (
                  <>
                    {formatTimeSafe((selectedReturnTrip as any).firstTrip.timeStart)} - {formatTimeSafe((selectedReturnTrip as any).firstTrip.timeEnd)} • {searchData.returnDate}
                  </>
                )}
              </Typography>
              {returnFirstLegSeats.length > 0 ? (
                renderSeatDiagram(
                  returnFirstLegSeats.map(seat => ({ ...seat, isSelected: selectedReturnFirstLegSeats.some(s => s.id === seat.id) })),
                  true,
                  (seat) => setSelectedReturnFirstLegSeats(t => t.some(s => s.id === seat.id) ? t.filter(s => s.id !== seat.id) : [...t, seat])
                )
              ) : (
                <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
                  <Skeleton variant="rounded" height={200} />
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign:'center' }}>Đang tải sơ đồ ghế chặng 1 về...</Typography>
                </Box>
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(123, 31, 162, 0.08)", borderRadius: 2, border: "1px solid rgba(123, 31, 162, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#7b1fa2" }}>
                  Ghế đã chọn ({selectedReturnFirstLegSeats.length}):
                </Typography>
                {selectedReturnFirstLegSeats.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedReturnFirstLegSeats.map((seat) => (
                      <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => setSelectedReturnFirstLegSeats(t => t.filter(s => s.id !== seat.id))} sx={{ bgcolor: "#7b1fa2", color: "white", fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
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

            {/* Return leg 2 */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, border: "3px solid #7b1fa2", background: "linear-gradient(135deg, rgba(123, 31, 162, 0.02) 0%, white 100%)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "#7b1fa2", fontWeight: 700 }}>
                🧩 Chặng 2 - {(selectedReturnTrip as any)?.secondTrip?.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {(selectedReturnTrip as any)?.secondTrip && (
                  <>
                    {formatTimeSafe((selectedReturnTrip as any).secondTrip.timeStart)} - {formatTimeSafe((selectedReturnTrip as any).secondTrip.timeEnd)} • {searchData.returnDate}
                  </>
                )}
              </Typography>
              {returnSecondLegSeats.length > 0 ? (
                renderSeatDiagram(
                  returnSecondLegSeats.map(seat => ({ ...seat, isSelected: selectedReturnSecondLegSeats.some(s => s.id === seat.id) })),
                  true,
                  (seat) => setSelectedReturnSecondLegSeats(t => t.some(s => s.id === seat.id) ? t.filter(s => s.id !== seat.id) : [...t, seat])
                )
              ) : (
                <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
                  <Skeleton variant="rounded" height={200} />
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign:'center' }}>Đang tải sơ đồ ghế chặng 2 về...</Typography>
                </Box>
              )}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(123, 31, 162, 0.08)", borderRadius: 2, border: "1px solid rgba(123, 31, 162, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#7b1fa2" }}>
                  Ghế đã chọn ({selectedReturnSecondLegSeats.length}):
                </Typography>
                {selectedReturnSecondLegSeats.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedReturnSecondLegSeats.map((seat) => (
                      <Chip key={seat.id} label={seat.seatNumber || seat.id} onDelete={() => setSelectedReturnSecondLegSeats(t => t.filter(s => s.id !== seat.id))} sx={{ bgcolor: "#7b1fa2", color: "white", fontWeight: 600, '& .MuiChip-deleteIcon': { color: 'white' } }} />
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

          {/* Total Summary for 3 sections (reverse) */}
          <Paper elevation={6} sx={{ p: 4, borderRadius: 3, background: "linear-gradient(135deg, rgba(244, 143, 177, 0.1) 0%, white 100%)", border: "2px solid #f48fb1" }}>
            <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 3 }}>
              💰 Tổng quan thanh toán
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3, alignItems: "end" }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>🛫 Chuyến đi</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedDepartureSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>{formatPrice(selectedDepartureSeats.length * (selectedDepartureTrip?.price || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7b1fa2", mb: 1 }}>🧩 Chặng 1 về</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedReturnFirstLegSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2" }}>{formatPrice(selectedReturnFirstLegSeats.length * (((selectedReturnTrip as any)?.firstTrip?.price) || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7b1fa2", mb: 1 }}>🧩 Chặng 2 về</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{`${selectedReturnSecondLegSeats.length} ghế`}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2" }}>{formatPrice(selectedReturnSecondLegSeats.length * (((selectedReturnTrip as any)?.secondTrip?.price) || 0))}</Typography>
              </Box>
              <Box sx={{ textAlign: "center", p: 3, bgcolor: "#f48fb1", borderRadius: 3, color: "white" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>TỔNG CỘNG</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {formatPrice(
                    (selectedDepartureSeats.length * (selectedDepartureTrip?.price || 0)) +
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
                  
                  if (currentSeats.length > 0) {
                    return (
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                      >
                        {currentSeats.map((seat) => (
                          <Chip
                            key={seat.id}
                            label={seat.id}
                            color="primary"
                            onDelete={() => {
                              if (isRoundTrip) {
                                if (isDepartureSelection) {
                                  handleSelectDepartureSeat(seat);
                                } else {
                                  handleSelectReturnSeat(seat);
                                }
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
                    );
                  } else {
                    return (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ py: 2 }}
                      >
                        Chưa chọn ghế nào
                      </Typography>
                    );
                  }
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
    if (paymentStatus && !bookingDataRestored) {
      return (
        <Box sx={{ my: 8, textAlign: "center" }}>
          <CircularProgress sx={{ color: '#f48fb1' }} />
          <Typography variant="body2" sx={{ mt: 2 }}>Đang khôi phục dữ liệu vé...</Typography>
        </Box>
      );
    }
    // booking code removed per request

    const handleBackToHome = () => {
      router.push("/");
    };

    // Compute robust display data for the ticket
    const tripForDisplay = selectedTrip || selectedDepartureTrip || null;
    
    // Debug: Log current seat states
    console.log("🎫 DEBUG - Seat states for template:", {
      "selectedTrip?.tripType": selectedTrip?.tripType,
      "searchData.tripType": searchData.tripType,
      "selectedSeats.length": selectedSeats.length,
      "selectedDepartureSeats.length": selectedDepartureSeats.length,
      "selectedFirstLegSeats.length": selectedFirstLegSeats.length,
      "selectedSecondLegSeats.length": selectedSecondLegSeats.length,
      "selectedReturnSeats.length": selectedReturnSeats.length,
      "selectedSeats": selectedSeats,
      "selectedFirstLegSeats": selectedFirstLegSeats,
      "selectedSecondLegSeats": selectedSecondLegSeats,
    });
    
    // Get seats for display based on trip type
    let seatsForDisplay: typeof selectedSeats = [];
    if (selectedTrip?.tripType === "transfer") {
      // Transfer trip: combine both leg seats
      seatsForDisplay = [...selectedFirstLegSeats, ...selectedSecondLegSeats];
      console.log("🔄 Transfer trip - seatsForDisplay:", seatsForDisplay);
    } else if (searchData.tripType === "roundTrip") {
      // Round trip: combine all seats based on transfer status
      const isDepartureTransfer = selectedDepartureTrip && (selectedDepartureTrip as any).tripType === "transfer";
      const isReturnTransfer = selectedReturnTrip && (selectedReturnTrip as any).tripType === "transfer";
      
      if (isDepartureTransfer && isReturnTransfer) {
        // Both departure and return are transfers
        seatsForDisplay = [...selectedFirstLegSeats, ...selectedSecondLegSeats, ...selectedReturnFirstLegSeats, ...selectedReturnSecondLegSeats];
      } else if (isDepartureTransfer) {
        // Only departure is transfer
        seatsForDisplay = [...selectedFirstLegSeats, ...selectedSecondLegSeats, ...selectedReturnSeats];
      } else if (isReturnTransfer) {
        // Only return is transfer
        seatsForDisplay = [...selectedDepartureSeats, ...selectedReturnFirstLegSeats, ...selectedReturnSecondLegSeats];
      } else {
        // Neither is transfer (regular round trip)
      seatsForDisplay = [...selectedDepartureSeats, ...selectedReturnSeats];
      }
      console.log("🔄 Round trip - seatsForDisplay:", seatsForDisplay);
    } else {
      // Regular one-way trip
      seatsForDisplay = selectedSeats.length > 0 ? selectedSeats : selectedDepartureSeats || [];
      console.log("➡️ One-way trip - seatsForDisplay:", seatsForDisplay);
    }
    
    const originDisplay =
      searchData.fromStation || searchData.from || tripForDisplay?.fromLocation || "-";
    const destinationDisplay =
      searchData.toStation || searchData.to || tripForDisplay?.endLocation || "-";
    const busNameDisplay = tripForDisplay?.busName || "-";
    const departDateDisplay = searchData.departureDate || (tripForDisplay ? new Date(tripForDisplay.timeStart).toLocaleDateString("vi-VN") : "-");

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
              <CheckCircle sx={{ fontSize: 60 }} />
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
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    {(() => {
                      const isRoundTrip = searchData.tripType === "roundTrip";
                      const isDepartureTransfer = isRoundTrip && selectedDepartureTrip && (selectedDepartureTrip as any).tripType === "transfer";
                      const isReturnTransfer = isRoundTrip && selectedReturnTrip && (selectedReturnTrip as any).tripType === "transfer";
                      const firstLegLabel = "🧩 Chặng 1";
                      const secondLegLabel = "🧩 Chặng 2";
                      const returnLabel = "🛬 Chuyến về";

                      // Debug log for template logic
                      console.log("🎫 Template logic check:", {
                        isRoundTrip,
                        isDepartureTransfer,
                        isReturnTransfer,
                        "selectedDepartureTrip?.tripType": (selectedDepartureTrip as any)?.tripType,
                        "selectedReturnTrip?.tripType": (selectedReturnTrip as any)?.tripType,
                        "seatsForDisplay.length": seatsForDisplay.length
                      });

                      if (isDepartureTransfer && !isReturnTransfer) {
                        const firstLegPrice = (((selectedDepartureTrip as any)?.firstTrip?.price) || 0) * selectedFirstLegSeats.length;
                        const secondLegPrice = (((selectedDepartureTrip as any)?.secondTrip?.price) || 0) * selectedSecondLegSeats.length;
                        const returnPrice = ((selectedReturnTrip?.price) || 0) * selectedReturnSeats.length;
                        return (
                          <>
                            <Typography variant="body2" color="text.secondary">{firstLegLabel} - {(selectedDepartureTrip as any)?.firstTrip?.busName}</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                              {selectedFirstLegSeats.length > 0 ? selectedFirstLegSeats.map((seat) => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: "#e91e63" }}>{formatPrice(firstLegPrice)}</Typography>

                            <Typography variant="body2" color="text.secondary">{secondLegLabel} - {(selectedDepartureTrip as any)?.secondTrip?.busName}</Typography>
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

                      if (isDepartureTransfer && isReturnTransfer) {
                        const depLeg1Price = ((((selectedDepartureTrip as any)?.firstTrip?.price) || 0) * selectedFirstLegSeats.length);
                        const depLeg2Price = ((((selectedDepartureTrip as any)?.secondTrip?.price) || 0) * selectedSecondLegSeats.length);
                        const retLeg1Price = ((((selectedReturnTrip as any)?.firstTrip?.price) || 0) * selectedReturnFirstLegSeats.length);
                        const retLeg2Price = ((((selectedReturnTrip as any)?.secondTrip?.price) || 0) * selectedReturnSecondLegSeats.length);
                        return (
                          <>
                            <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • Chặng 1 - {(selectedDepartureTrip as any)?.firstTrip?.busName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {selectedFirstLegSeats.length > 0 ? selectedFirstLegSeats.map(seat => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#e91e63' }}>{formatPrice(depLeg1Price)}</Typography>

                            <Typography variant="body2" color="text.secondary">🛫 Chuyến đi • Chặng 2 - {(selectedDepartureTrip as any)?.secondTrip?.busName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {selectedSecondLegSeats.length > 0 ? selectedSecondLegSeats.map(seat => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#e91e63' }}>{formatPrice(depLeg2Price)}</Typography>

                            <Typography variant="body2" color="text.secondary">🛬 Chuyến về • Chặng 1 - {(selectedReturnTrip as any)?.firstTrip?.busName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {selectedReturnFirstLegSeats.length > 0 ? selectedReturnFirstLegSeats.map(seat => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 2, color: '#e91e63' }}>{formatPrice(retLeg1Price)}</Typography>

                            <Typography variant="body2" color="text.secondary">🛬 Chuyến về • Chặng 2 - {(selectedReturnTrip as any)?.secondTrip?.busName}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                              {selectedReturnSecondLegSeats.length > 0 ? selectedReturnSecondLegSeats.map(seat => (
                                <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }} />
                              )) : <Typography variant="body2" color="text.secondary">-</Typography>}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#e91e63' }}>{formatPrice(retLeg2Price)}</Typography>
                          </>
                        );
                      }

                      if (isRoundTrip && !isDepartureTransfer && !isReturnTransfer) {
                        // Regular round trip (both direct)
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

                      // One-way fallback
                      return (
                        <>
                          <Typography variant="body2" color="text.secondary">Số ghế</Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                      {(seatsForDisplay && seatsForDisplay.length > 0) ? seatsForDisplay.map((seat) => (
                              <Chip key={seat.id} label={seat.seatNumber || seat.id.toString()} size="small" sx={{ bgcolor: "#fce4ec", color: "#e91e63", fontWeight: "bold" }} />
                      )) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </Box>
                          <Typography variant="body2" color="text.secondary">Giá vé</Typography>
                          <Typography variant="body1" sx={{ fontWeight: "bold", color: "#e91e63" }}>{formatPrice(calculateTotalPrice().total)}</Typography>
                        </>
                      );
                    })()}
                  </Box>
                </Box>
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
                             {searchData.from}
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
                             {searchData.to}
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
                          {selectedTrip?.busName} • {selectedTrip?.tripId}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Ngày khởi hành
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1.5 }}>
                          {searchData.departureDate}
                        </Typography>
                      </Box>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Số ghế
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mb: 1.5,
                          }}
                        >
                           {(seatsForDisplay && seatsForDisplay.length > 0) ? seatsForDisplay.map((seat) => (
                            <Chip
                              key={seat.id}
                              label={seat.seatNumber || seat.id.replace(/^leg[12]-/, '')}
                              size="small"
                              sx={{
                                bgcolor: "#ffebee",
                                color: "#f44336",
                                fontWeight: "bold",
                              }}
                            />
                          )) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Số tiền không được thanh toán
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "bold", color: "#f44336" }}
                        >
                          {formatPrice(calculateTotalPrice().total)}
                        </Typography>
                      </Box>
                    </Box>
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

    // Group seats by row for better layout
    console.log("🎯 Processing seats for diagram:", {
      totalSeats: seats.length,
      sampleSeats: seats.slice(0, 3),
    });

    const seatsByRow = seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    }, {} as Record<string, SeatType[]>);

    const rows = Object.keys(seatsByRow).sort();

    console.log("🎯 Grouped seats by row:", {
      rows: rows,
      seatsByRow: Object.keys(seatsByRow).reduce((acc, key) => {
        acc[key] = seatsByRow[key].length;
        return acc;
      }, {} as Record<string, number>),
    });

    return (
      <Box sx={{ position: "relative", overflow: "auto" }}>
        {/* Bus Front */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            border: "2px solid #f48fb1",
            borderRadius: "40px 40px 8px 8px",
            bgcolor: "#fce4ec",
            width: "fit-content",
            mx: "auto",
            minWidth: 300,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ textAlign: "center", fontWeight: "bold" }}
          >
            🚐 Tài xế
          </Typography>
        </Box>

        {/* Seat Layout */}
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
          {rows.map((rowKey) => {
            const rowSeats = seatsByRow[rowKey].sort(
              (a, b) => a.column - b.column
            );
            return (
              <Box
                key={rowKey}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mb: 1.5,
                  gap: 1,
                }}
              >
                {/* Row Label */}
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 20,
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "#666",
                  }}
                >
                  {rowKey}
                </Typography>

                {/* Seats */}
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {rowSeats.map((seat, index) => {
                    // FIX: tránh hiện tượng chọn ghế ở chặng 1 bị "mirror" sang chặng 2 / chuyến về
                    // Nếu seat đã được truyền kèm cờ isSelected (được xác định riêng cho panel), ta ưu tiên dùng nó.
                    // Chỉ fallback về selectedSeats (global - dùng cho chế độ oneWay cũ) khi không có isSelected.
                    // Trong bối cảnh multi-chặng (transfer / roundTrip) ta KHÔNG fallback vào selectedSeats toàn cục
                    const inMultiSegmentContext = (
                      (selectedDepartureTrip && selectedReturnTrip) ||
                      (selectedTrip && selectedTrip.tripType === 'transfer')
                    );
                    const isSelected =
                      typeof (seat as any).isSelected === 'boolean'
                        ? (seat as any).isSelected
                        : (inMultiSegmentContext ? false : selectedSeats.some((s) => s.id === seat.id));
                    const isBooked = seat.isBooked;

                    // Debug logging for first few seats to check data
                    if (index < 3) {
                      console.log(
                        `🔍 Seat rendering debug - Row ${rowKey}, Seat ${
                          index + 1
                        }:`,
                        {
                          seatId: seat.id,
                          seatNumber: seat.seatNumber,
                          isBooked: seat.isBooked,
                          isSelected: !!isSelected,
                          isInteractive: isInteractive,
                          disabled: isBooked || !isInteractive,
                          expectedColor: isSelected
                            ? "PINK"
                            : isBooked
                            ? "GRAY"
                            : "WHITE",
                          seat: seat,
                        }
                      );
                    }

                    return (
                      <Box key={`${rowKey}-${seat.id}-${seat.seatNumber || ''}-${index}`} sx={{ position: "relative" }}>
                        <Button
                          variant="contained"
                          disabled={isBooked} // Chỉ disable ghế đã đặt, không disable vì isInteractive
                          onClick={() =>
                            isInteractive && onSeatClick && onSeatClick(seat)
                          }
                          title={
                            isBooked
                              ? `Ghế ${seat.seatNumber} - Đã đặt`
                              : isSelected
                              ? `Ghế ${seat.seatNumber} - Đã chọn`
                              : `Ghế ${seat.seatNumber} - Có thể chọn`
                          }
                          sx={{
                            minWidth: 45,
                            height: 45,
                            padding: 0,
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            cursor: isBooked
                              ? "not-allowed"
                              : isInteractive
                              ? "pointer"
                              : "default",
                            // Fixed color logic:
                            // - Ghế đã chọn: màu hồng
                            // - Ghế đã đặt: màu xám
                            // - Ghế trống: màu trắng
                            bgcolor: isSelected
                              ? "#f48fb1" // Màu hồng cho ghế đã chọn
                              : isBooked
                              ? "#9e9e9e" // Màu xám cho ghế đã đặt
                              : "white", // Màu trắng cho ghế trống
                            color: isSelected
                              ? "white" // Chữ trắng cho ghế đã chọn
                              : isBooked
                              ? "#000" // Chữ đen cho ghế đã đặt
                              : "white", // Chữ trắng cho ghế trống (theo yêu cầu)
                            border: isSelected
                              ? "2px solid #e91e63"
                              : isBooked
                              ? "1px solid #757575"
                              : "1px solid #e0e0e0",
                            borderRadius: 2,
                            position: "relative",
                            transition: "all 0.2s ease-in-out",
                            boxShadow: isSelected
                              ? "0 2px 8px rgba(244, 143, 177, 0.3)"
                              : isBooked
                              ? "none"
                              : "0 1px 3px rgba(0, 0, 0, 0.1)",
                            "&:hover": isInteractive
                              ? {
                                  bgcolor: isBooked
                                    ? "#757575" // Xám đậm hơn cho ghế đã đặt khi hover
                                    : isSelected
                                    ? "#e91e63" // Hồng đậm cho ghế đã chọn khi hover
                                    : "#f48fb1", // Hồng cho ghế trống khi hover
                                  color: "white",
                                  transform: !isBooked ? "scale(1.05)" : "none",
                                  boxShadow: !isBooked
                                    ? "0 4px 12px rgba(244, 143, 177, 0.4)"
                                    : "none",
                                }
                              : {},
                            "&:disabled": {
                              bgcolor: "#9e9e9e", // Màu xám cho ghế đã đặt
                              color: "#000", // Chữ đen cho ghế đã đặt
                              cursor: "not-allowed",
                              "&::after": {
                                content: '"✖"',
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "1rem",
                                zIndex: 1,
                                color: "#000", // Dấu X màu đen
                                fontWeight: "bold",
                              },
                            },
                          }}
                        >
                          {seat.seatNumber || seat.id}
                        </Button>

                        {/* Seat Type Indicator */}
                        {seat.seatType && seat.seatType !== "regular" && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: -5,
                              right: -5,
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor:
                                seat.seatType === "vip" ? "#ffd700" : "#2196f3",
                              fontSize: "0.6rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {seat.seatType === "vip" ? "⭐" : "💺"}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>

                {/* Add aisle after 2nd seat for typical bus layout */}
                {rowSeats.length > 2 && (
                  <Box
                    sx={{
                      width: 20,
                      height: 2,
                      bgcolor: "#e0e0e0",
                      borderRadius: 1,
                      mx: 1,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>

        {/* Legend */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "white",
                border: "1px solid #e0e0e0",
                mr: 1,
                borderRadius: 1,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Ghế trống
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#f48fb1",
                mr: 1,
                borderRadius: 1,
                border: "1px solid #e91e63",
                boxShadow: "0 2px 4px rgba(244, 143, 177, 0.3)",
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#f48fb1" }}
            >
              Đã chọn
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#9e9e9e",
                mr: 1,
                borderRadius: 1,
                border: "1px solid #757575",
                position: "relative",
                "&::after": {
                  content: '"✖"',
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "0.7rem",
                  color: "white",
                  fontWeight: "bold",
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#757575" }}
            >
              Đã đặt
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Seat dialog removed as per request
  const renderSeatDialog = () => null;

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

  {/* Seat Dialog removed */}
    
    {/* Notification Snackbar */}
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        onClose={handleCloseNotification}
        severity={notification.severity}
        sx={{ width: '100%' }}
        variant="filled"
      >
        {notification.message}
      </Alert>
    </Snackbar>
    </Box>
  );
}
