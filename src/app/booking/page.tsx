"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
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
  CreditCard,
  Star,
  StarBorder,
  Visibility,
  Person,
} from "@mui/icons-material";
import Link from "next/link";
import { apiClient } from "@/services/api";
import { bookingService, VNPayPayloadType } from "@/services/bookingService";
import { useAuth } from "@/hooks/useAuth";

// Define types
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
}

interface TripType extends BaseTripType {
  tripType?: "direct" | "transfer" | "triple"; // Optional field for trip classification
  direction?: "departure" | "return"; // Optional field for round-trip direction
  // Fields for transfer trips
  firstTrip?: BaseTripType;
  secondTrip?: BaseTripType;
  totalPrice?: number;
  totalDuration?: string;
}

interface SeatType {
  id: string;
  row: string;
  column: number;
  isBooked: boolean;
  price: number;
  seatNumber?: string;
  seatType?: string;
  isSelected?: boolean;
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
      const id = `${row}${col}`;
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

// Mock shuttle points
const mockShuttlePoints = [
  {
    id: 1,
    name: "Quận 1",
    address: "123 Nguyễn Huệ, Quận 1",
    time: "06:00",
    extraFee: 0,
  },
  {
    id: 2,
    name: "Quận 2",
    address: "456 Trần Não, Quận 2",
    time: "06:15",
    extraFee: 20000,
  },
  {
    id: 3,
    name: "Quận 7",
    address: "789 Nguyễn Thị Thập, Quận 7",
    time: "06:30",
    extraFee: 30000,
  },
  {
    id: 4,
    name: "Quận 9",
    address: "101 Lê Văn Việt, Quận 9",
    time: "06:15",
    extraFee: 40000,
  },
];

// Payment methods
const paymentMethods = [
  { id: "vnpay", name: "VNPay", icon: <CreditCard /> },
];

export default function BookingPage() {
  // VNPayPayloadType được import từ bookingService.ts

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
  const [seats, setSeats] = useState<SeatType[]>([]); // Keep for one-way compatibility
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]); // Keep for one-way compatibility
  const [shuttlePoint, setShuttlePoint] = useState<ShuttlePointType | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [completed, setCompleted] = useState<boolean>(false);
  const [vnpayPayload, setVnpayPayload] = useState<VNPayPayloadType | null>(
    null
  );

  // Seat diagram states
  const [seatLoading, setSeatLoading] = useState<boolean>(false);
  const [seatError, setSeatError] = useState<string>("");
  const [seatDialogOpen, setSeatDialogOpen] = useState<boolean>(false);
  const [seatDialogTrip, setSeatDialogTrip] = useState<TripType | null>(null);

  // Dialog specific seat data - separate from main seats state to avoid conflicts
  const [dialogSeats, setDialogSeats] = useState<SeatType[]>([]);
  const [dialogSeatLoading, setDialogSeatLoading] = useState<boolean>(false);
  const [dialogSeatError, setDialogSeatError] = useState<string>("");

  // Authentication hook
  const { user, isAuthenticated } = useAuth();

  // Seat availability by trip id for displaying in trip cards
  const [seatAvailabilityByTrip, setSeatAvailabilityByTrip] = useState<
    Record<string, { available: number; total: number }>
  >({});
  const [loadingSeatsByTrip, setLoadingSeatsByTrip] = useState<
    Record<string, boolean>
  >({});

  // Responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Get search params from URL
  const searchParams = useSearchParams();

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
              const processedDepartureTrips = result.departure.transferTrips.map((trip: TripType) => ({
                ...trip,
                tripType: "transfer",
                direction: "departure",
              }));
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

  // Effect to check for VNPay payment return parameters
  useEffect(() => {
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
      window.location.href =
        "/booking/confirm?" + window.location.search.substring(1);
      return;
    }
  }, [searchParams]);

  // Effect to load data from URL parameters
  useEffect(() => {
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

  // Handle step navigation
  const handleNext = async () => {
    // Step 1: Trip selection validation
    if (activeStep === 0) {
      if (searchData.tripType === "roundTrip") {
        // Round-trip validation: need both departure and return trips
        if (!selectedDepartureTrip) {
          alert("Vui lòng chọn chuyến đi");
          return;
        }
        if (!selectedReturnTrip) {
          alert("Vui lòng chọn chuyến về");
          return;
        }
      } else {
        // One-way validation
        if (!selectedTrip && !selectedDepartureTrip) {
          alert("Vui lòng chọn một chuyến xe");
          return;
        }
      }
    }

    // Step 2: Seat selection validation
    if (activeStep === 1) {
      if (searchData.tripType === "roundTrip") {
        // Round-trip validation: need seats for both trips
        if (selectedDepartureSeats.length === 0) {
          alert("Vui lòng chọn ít nhất một ghế cho chuyến đi");
          return;
        }
        if (selectedReturnSeats.length === 0) {
          alert("Vui lòng chọn ít nhất một ghế cho chuyến về");
          return;
        }
      } else {
        // One-way validation
        const currentSelectedSeats = selectedSeats.length > 0 ? selectedSeats : selectedDepartureSeats;
        if (currentSelectedSeats.length === 0) {
          alert("Vui lòng chọn ít nhất một ghế");
          return;
        }
      }
    }

    // Step 3: Payment validation
    if (activeStep === 2 && (!shuttlePoint || !paymentMethod)) {
      if (!shuttlePoint) {
        alert("Vui lòng chọn điểm đón");
        return;
      }
      if (!paymentMethod) {
        alert("Vui lòng chọn phương thức thanh toán");
        return;
      }
    }

    // Add loading state for step transitions
    setSeatLoading(true);

    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });

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

            setDepartureSeats(departureSeatData);
            setReturnSeats(returnSeatData);
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

            const response = await bookingService.createReservation(
              vnpayPayload
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
                  window.location.href = paymentUrl;
                  return; // Dừng thực thi tiếp để chuyển trang
                } else {
                  console.warn("⚠️ Không tìm thấy paymentUrl trong response:", {
                    paymentUrl: response.paymentUrl,
                    payment_url: response.payment_url,
                    vnpayUrl: response.vnpayUrl,
                    redirectUrl: response.redirectUrl,
                    url: response.url
                  });

                  // Hiển thị thông báo chi tiết cho user
                  const responseFields = Object.keys(response).join(', ');
                  alert(
                    `API trả về thành công nhưng không có URL thanh toán.\n\nCác field có trong response: ${responseFields}\n\nVui lòng kiểm tra console để biết chi tiết hoặc liên hệ support.`
                  );
                }
              }
            } else {
              console.error("❌ Response rỗng hoặc null");
              alert("Lỗi: Không nhận được response từ server");
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

            alert(
              "Có lỗi xảy ra khi xử lý thanh toán. Vui lòng xem console để biết chi tiết."
            );
          }
        }

        // Chỉ để test, tạm thời vẫn chuyển sang màn hình hoàn tất
        setCompleted(true);
      } catch (error) {
        console.error("Error during payment processing:", error);
        alert("Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.");
      } finally {
        setSeatLoading(false);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Handle shuttle point selection
  const handleSelectShuttlePoint = (point: ShuttlePointType) => {
    setShuttlePoint(point);
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
        if (!selectedDepartureTrip || selectedDepartureSeats.length === 0) {
          alert("Vui lòng chọn chuyến đi và ghế cho chuyến đi!");
          return;
        }
        if (!selectedReturnTrip || selectedReturnSeats.length === 0) {
          alert("Vui lòng chọn chuyến về và ghế cho chuyến về!");
          return;
        }

        // Thông tin chuyến đi
        tripSeats = [
          {
            tripId: selectedDepartureTrip.id,
            fromStationId: parseInt(searchData.fromStationId),
            toStationId: parseInt(searchData.toStationId),
            seatIds: selectedDepartureSeats.map((seat) => parseInt(seat.id)),
          },
        ];

        // Thông tin chuyến về - sử dụng dữ liệu thực tế
        returnTripSeats = [
          {
            tripId: selectedReturnTrip.id,
            fromStationId: parseInt(searchData.toStationId), // Đảo ngược vì là chuyến về
            toStationId: parseInt(searchData.fromStationId), // Đảo ngược vì là chuyến về
            seatIds: selectedReturnSeats.map((seat) => parseInt(seat.id)),
          },
        ];

        console.log("🎫 Round trip payload prepared:", {
          departure: {
            tripId: selectedDepartureTrip.id,
            busName: selectedDepartureTrip.busName,
            seatsCount: selectedDepartureSeats.length,
            seatIds: selectedDepartureSeats.map((seat) => seat.id),
          },
          return: {
            tripId: selectedReturnTrip.id,
            busName: selectedReturnTrip.busName,
            seatsCount: selectedReturnSeats.length,
            seatIds: selectedReturnSeats.map((seat) => seat.id),
          },
        });
      } else {
        // Chuyến một chiều - sử dụng selectedTrip và selectedSeats
        if (!selectedTrip || selectedSeats.length === 0) {
          alert("Vui lòng chọn chuyến xe và ghế!");
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

        returnTripSeats = []; // Rỗng cho chuyến một chiều

        console.log("🎫 One way trip payload prepared:", {
          tripId: selectedTrip.id,
          busName: selectedTrip.busName,
          seatsCount: selectedSeats.length,
          seatIds: selectedSeats.map((seat) => seat.id),
        });
      }

      // Tạo payload
      const userId = JSON.parse(localStorage.getItem("user_data") || "{}")?.id;

      const payload: VNPayPayloadType = {
        customerId: userId,
        isReturn: isRoundTrip,
        tripSeats: tripSeats,
        returnTripSeats: returnTripSeats,
      };

      console.log("VNPay API payload prepared:", payload);

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
        fromStationId: searchData.fromStationId,
        toStationId: searchData.toStationId,
        "API expects numeric tripId": true,
      });

      // Use trip.id directly as it's the correct numeric ID for the API
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
          (apiSeat: ApiSeatResponse, index: number) => {
            // Create seat layout: assume 4 seats per row (typical bus layout)
            const seatsPerRow = 4;
            const seatIndex = index; // Use array index for consistent ordering
            const rowIndex = Math.floor(seatIndex / seatsPerRow);
            const columnIndex = (seatIndex % seatsPerRow) + 1;
            const rowLetter = String.fromCharCode(65 + rowIndex); // A, B, C, D...

            // Generate seat number in format A1, A2, B1, B2, etc.
            const displaySeatNumber = `${rowLetter}${columnIndex}`;

            // Use API id as unique identifier
            const seatId = apiSeat.id.toString();

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
                "Logic check": `!${apiSeat.isAvailable
                  } = ${!apiSeat.isAvailable}`,
              });
            }

            return transformedSeat;
          }
        );

        console.log("🎫 Transformed seats:", {
          count: transformedSeats.length,
          sample: transformedSeats.slice(0, 3),
          bookedCount: transformedSeats.filter((s) => s.isBooked).length,
          availableCount: transformedSeats.filter((s) => !s.isBooked).length,
        });

        return transformedSeats;
      } else {
        console.warn("🎫 Unexpected seat data format:", seatData);
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
        setLoadingSeatsByTrip((prev) => ({
          ...prev,
          [trip.id.toString()]: true,
        }));

        console.log("🎫 Loading seats for trip", trip.id, "with params:", {
          "trip.id (used as tripId)": trip.id,
          "trip.tripId (string ID)": trip.tripId,
          "trip object": trip,
          fromStationId: searchDataForSeats.fromStationId,
          toStationId: searchDataForSeats.toStationId,
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
        let fromStationIdToUse = searchDataForSeats.fromStationId;
        let toStationIdToUse = searchDataForSeats.toStationId;

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
          ? seatData.map((apiSeat: any, index: number) => {
            const seatsPerRow = 4;
            const rowIndex = Math.floor(index / seatsPerRow);
            const columnIndex = (index % seatsPerRow) + 1;
            const rowLetter = String.fromCharCode(65 + rowIndex);

            return {
              id: apiSeat.id.toString(),
              row: rowLetter,
              column: columnIndex,
              isBooked: !apiSeat.isAvailable,
              price: trip.price,
              seatNumber: `${rowLetter}${columnIndex}`,
              seatType: "regular",
              isSelected: false,
            };
          })
          : [];

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

  // Handle seat diagram dialog
  const handleOpenSeatDialog = async (trip: TripType) => {
    setSeatDialogTrip(trip);
    setSeatDialogOpen(true);
    setDialogSeatLoading(true);
    setDialogSeatError("");

    console.log("🎫 Opening seat dialog for trip:", {
      "trip.id (numeric, will use)": trip.id,
      "trip.tripId (string, display only)": trip.tripId,
      busName: trip.busName,
    });

    try {
      // Use trip.id directly as it's the correct numeric ID for the API
      const tripIdToUse = trip.id;

      console.log("🎫 Using trip.id for seat dialog API:", {
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
          (apiSeat: ApiSeatResponse, index: number) => {
            const seatsPerRow = 4;
            const rowIndex = Math.floor(index / seatsPerRow);
            const columnIndex = (index % seatsPerRow) + 1;
            const rowLetter = String.fromCharCode(65 + rowIndex);
            const displaySeatNumber = `${rowLetter}${columnIndex}`;

            const transformedSeat = {
              id: apiSeat.id.toString(),
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
                "Logic check": `!${apiSeat.isAvailable
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
                  {new Date(trip.firstTrip.timeStart).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
                  {new Date(trip.firstTrip.timeEnd).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
                  {new Date(trip.secondTrip.timeStart).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
                  {new Date(trip.secondTrip.timeEnd).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {trip.secondTrip.endLocation}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenSeatDialog(trip);
                }}
                sx={{
                  borderColor: "#f48fb1",
                  color: "#f48fb1",
                  fontSize: "0.75rem",
                }}
              >
                Xem ghế
              </Button>
              {isSelected && (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <CheckCircle sx={{ color: "#f48fb1", fontSize: 28 }} />
                </Box>
              )}
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
      // Round trip calculation
      if (selectedDepartureTrip && selectedDepartureSeats.length > 0) {
        basePrice += selectedDepartureSeats.length * selectedDepartureTrip.price;
      }
      if (selectedReturnTrip && selectedReturnSeats.length > 0) {
        basePrice += selectedReturnSeats.length * selectedReturnTrip.price;
      }
    } else {
      // One-way trip calculation
      const currentTrip = selectedTrip || selectedDepartureTrip;
      const currentSeats = selectedSeats.length > 0 ? selectedSeats : selectedDepartureSeats;

      if (currentTrip && currentSeats.length > 0) {
        basePrice = currentSeats.length * currentTrip.price;
      }
    }

    let shuttleFee = 0;
    if (shuttlePoint) {
      shuttleFee = shuttlePoint.extraFee;
    }

    const serviceFee = 10000; // Fixed service fee

    return {
      basePrice,
      shuttleFee,
      serviceFee,
      total: basePrice + shuttleFee + serviceFee,
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
                                      sx={{
                                        color: "#f48fb1",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {formatPrice(trip.price)}
                                    </Typography>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenSeatDialog(trip);
                                      }}
                                      sx={{
                                        mt: 1,
                                        borderColor: "#1976d2",
                                        color: "#1976d2",
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      Xem ghế
                                    </Button>
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
                                        {new Date(
                                          trip.timeStart
                                        ).toLocaleTimeString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
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
                                        sx={{
                                          color: "#f48fb1",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {formatPrice(trip.price)}
                                      </Typography>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenSeatDialog(trip);
                                        }}
                                        sx={{
                                          mt: 1,
                                          borderColor: "#7b1fa2",
                                          color: "#7b1fa2",
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        Xem ghế
                                      </Button>
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
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSeatDialog(trip);
                                  }}
                                  sx={{
                                    mt: 1,
                                    borderColor: "#f48fb1",
                                    color: "#f48fb1",
                                    fontSize: "0.75rem",
                                  }}
                                >
                                  Xem ghế
                                </Button>
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

    // Check if we should show dual seat diagrams for round trip
    const shouldShowDualDiagrams = isRoundTrip &&
      selectedDepartureTrip &&
      selectedReturnTrip &&
      departureSeats.length > 0 &&
      returnSeats.length > 0;

    if (shouldShowDualDiagrams) {
      // Dual seat diagram mode for round trip
      return (
        <Box sx={{ mt: 4 }}>
          {/* Title for dual selection */}
          <Typography variant="h5" gutterBottom sx={{ color: "#f48fb1", fontWeight: 700, textAlign: "center", mb: 4 }}>
            🎫 Chọn ghế cho cả hai chuyến
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
                Chuyến đi: {selectedDepartureTrip.busName}
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
                Chuyến về: {selectedReturnTrip.busName}
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
            {/* Departure Trip Seat Selection */}
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
                🛫 Chuyến đi - {selectedDepartureTrip.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {new Date(selectedDepartureTrip.timeStart).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                - {new Date(selectedDepartureTrip.timeEnd).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} • {searchData.departureDate}
              </Typography>

              {/* Departure seat diagram */}
              {renderSeatDiagram(
                departureSeats.map(seat => ({
                  ...seat,
                  isSelected: selectedDepartureSeats.some(s => s.id === seat.id)
                })),
                true,
                handleSelectDepartureSeat
              )}

              {/* Selected departure seats summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(25, 118, 210, 0.08)", borderRadius: 2, border: "1px solid rgba(25, 118, 210, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#1976d2" }}>
                  Ghế đã chọn ({selectedDepartureSeats.length}):
                </Typography>
                {selectedDepartureSeats.length > 0 ? (
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
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#1976d2" }}>
                  {formatPrice(selectedDepartureSeats.length * selectedDepartureTrip.price)}
                </Typography>
              </Box>
            </Paper>

            {/* Return Trip Seat Selection */}
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
                🛬 Chuyến về - {selectedReturnTrip.busName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {new Date(selectedReturnTrip.timeStart).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                - {new Date(selectedReturnTrip.timeEnd).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} • {searchData.returnDate}
              </Typography>

              {/* Return seat diagram */}
              {renderSeatDiagram(
                returnSeats.map(seat => ({
                  ...seat,
                  isSelected: selectedReturnSeats.some(s => s.id === seat.id)
                })),
                true,
                handleSelectReturnSeat
              )}

              {/* Selected return seats summary */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "rgba(123, 31, 162, 0.08)", borderRadius: 2, border: "1px solid rgba(123, 31, 162, 0.2)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#7b1fa2" }}>
                  Ghế đã chọn ({selectedReturnSeats.length}):
                </Typography>
                {selectedReturnSeats.length > 0 ? (
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
                )}
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: "#7b1fa2" }}>
                  {formatPrice(selectedReturnSeats.length * selectedReturnTrip.price)}
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
              {/* Departure summary */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                  🛫 Chuyến đi
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {selectedDepartureSeats.length} ghế
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>
                  {formatPrice(selectedDepartureSeats.length * selectedDepartureTrip.price)}
                </Typography>
              </Box>

              {/* Return summary */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#7b1fa2", mb: 1 }}>
                  🛬 Chuyến về
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {selectedReturnSeats.length} ghế
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2" }}>
                  {formatPrice(selectedReturnSeats.length * selectedReturnTrip.price)}
                </Typography>
              </Box>

              {/* Total */}
              <Box sx={{ textAlign: "center", p: 3, bgcolor: "#f48fb1", borderRadius: 3, color: "white" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  TỔNG CỘNG
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  {formatPrice(
                    (selectedDepartureSeats.length * selectedDepartureTrip.price) +
                    (selectedReturnSeats.length * selectedReturnTrip.price)
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
                          label={seat.id}
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
      activeStep
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
                    🚌 Chọn điểm đón
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chọn địa điểm thuận tiện để được đón
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gap: 2 }}>
                {mockShuttlePoints.map((point) => (
                  <Card
                    key={point.id}
                    sx={{
                      cursor: "pointer",
                      border: shuttlePoint?.id === point.id
                        ? "3px solid #f48fb1"
                        : "2px solid transparent",
                      borderRadius: 3,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      background: shuttlePoint?.id === point.id
                        ? "linear-gradient(135deg, rgba(244, 143, 177, 0.1) 0%, rgba(244, 143, 177, 0.05) 100%)"
                        : "white",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(244, 143, 177, 0.25)",
                        borderColor: "#f48fb1",
                      },
                    }}
                    onClick={() => handleSelectShuttlePoint(point)}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "#2c3e50" }}>
                            {point.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            📍 {point.address}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <AccessTime sx={{ fontSize: 18, mr: 1, color: "#f48fb1" }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Giờ đón: {point.time}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: "right", ml: 2 }}>
                          {point.extraFee > 0 ? (
                            <Typography variant="h6" sx={{ color: "#f48fb1", fontWeight: 700, mb: 1 }}>
                              {formatPrice(point.extraFee)}
                            </Typography>
                          ) : (
                            <Chip
                              size="medium"
                              label="🆓 Miễn phí"
                              sx={{
                                bgcolor: "#4caf50",
                                color: "white",
                                fontWeight: 600,
                                mb: 1
                              }}
                            />
                          )}
                          {shuttlePoint?.id === point.id && (
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                bgcolor: "#f48fb1",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mx: "auto"
                              }}
                            >
                              <Check sx={{ color: "white", fontSize: 20 }} />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
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

            {/* Enhanced Contact Information Section */}
            <Paper
              elevation={8}
              sx={{
                p: 4,
                borderRadius: 4,
                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, white 100%)",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(90deg, #4caf50, #66bb6a, #4caf50)",
                }
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2
                  }}
                >
                  <Person sx={{ color: "#4caf50", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#4caf50", mb: 0.5 }}>
                    👤 Thông tin liên hệ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thông tin để xác nhận và liên lạc về chuyến đi
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gap: 3 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                  <TextField
                    fullWidth
                    label="👤 Họ và tên"
                    placeholder="Nhập họ và tên người đặt"
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "#4caf50" },
                        "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="📱 Số điện thoại"
                    placeholder="Nhập số điện thoại"
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        "&:hover fieldset": { borderColor: "#4caf50" },
                        "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
                    }}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="📧 Email"
                  placeholder="Nhập email để nhận thông tin vé"
                  type="email"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover fieldset": { borderColor: "#4caf50" },
                      "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
                  }}
                />
                <TextField
                  fullWidth
                  label="📝 Ghi chú"
                  placeholder="Nhập ghi chú cho chuyến đi (nếu có)"
                  multiline
                  rows={3}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      "&:hover fieldset": { borderColor: "#4caf50" },
                      "&.Mui-focused fieldset": { borderColor: "#4caf50" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#4caf50" },
                  }}
                />
              </Box>
            </Paper>
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
                      {shuttlePoint?.name || "⚠️ Chưa chọn"}
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
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2">⚙️ Phí dịch vụ:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPrice(priceDetails.serviceFee)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: "rgba(244, 143, 177, 0.5)" }} />

              {/* Total Amount */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: "linear-gradient(135deg, #f48fb1 0%, #e91e63 100%)",
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

  // Render booking success
  const renderBookingSuccess = () => {
    // Generate random booking code
    const bookingCode = `XTB${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0")}`;

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
              bgcolor: "#f48fb1",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              boxShadow: "0 8px 25px rgba(244, 143, 177, 0.4)",
            }}
          >
            <Check sx={{ fontSize: 60 }} />
          </Box>
        </motion.div>

        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: "#f48fb1", fontWeight: "bold" }}
        >
          Đặt vé thành công!
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Cảm ơn bạn đã đặt vé. Mã đặt vé của bạn là{" "}
          <Box component="span" sx={{ fontWeight: "bold", color: "#f48fb1" }}>
            {bookingCode}
          </Box>
        </Typography>

        {/* Enhanced Ticket Design */}
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
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã đặt vé
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#e91e63" }}
                  >
                    {bookingCode}
                  </Typography>
                </Box>
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
                        Điểm đi
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mt: 0.5 }}
                      >
                        {shuttlePoint?.name}
                      </Typography>
                      <Typography variant="body2">
                        {selectedTrip &&
                          new Date(selectedTrip.timeStart).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                            return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""
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
                        {selectedTrip?.endLocation}
                      </Typography>
                      <Typography variant="body2">
                        {selectedTrip &&
                          new Date(selectedTrip.timeEnd).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
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
                      {selectedSeats.map((seat) => (
                        <Chip
                          key={seat.id}
                          label={seat.id}
                          size="small"
                          sx={{
                            bgcolor: "#fce4ec",
                            color: "#e91e63",
                            fontWeight: "bold",
                          }}
                        />
                      ))}
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Giá vé
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#e91e63" }}
                    >
                      {formatPrice(calculateTotalPrice().total)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* QR Code Placeholder */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 3,
                  pt: 3,
                  borderTop: "1px dashed #f48fb1",
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: "#000",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage:
                        "linear-gradient(to right, #000 30%, transparent 30%), linear-gradient(to right, #000 30%, transparent 30%), linear-gradient(to bottom, #000 30%, transparent 30%), linear-gradient(to bottom, #000 30%, transparent 30%)",
                      backgroundSize: "15px 3px, 15px 3px, 3px 15px, 3px 15px",
                      backgroundPosition:
                        "top left, bottom left, top left, top right",
                      backgroundRepeat:
                        "repeat-x, repeat-x, repeat-y, repeat-y",
                    },
                  }}
                />
              </Box>

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

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button
            variant="contained"
            component={Link}
            href="/"
            sx={{
              bgcolor: "#f48fb1",
              "&:hover": {
                bgcolor: "#e91e63",
              },
              py: 1.5,
              px: 4,
              fontWeight: "bold",
              boxShadow: "0 8px 25px rgba(244, 143, 177, 0.4)",
            }}
          >
            Trở về trang chủ
          </Button>
        </motion.div>
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
                    const isSelected = selectedSeats.find(
                      (s) => s.id === seat.id
                    );
                    const isBooked = seat.isBooked;

                    // Debug logging for first few seats to check data
                    if (index < 3) {
                      console.log(
                        `🔍 Seat rendering debug - Row ${rowKey}, Seat ${index + 1
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
                      <Box key={seat.id} sx={{ position: "relative" }}>
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
                                ? "white" // Chữ trắng cho ghế đã đặt
                                : "#424242", // Chữ xám đậm cho ghế trống
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
                              bgcolor: "#9e9e9e", // Màu xám cho ghế disabled (chỉ ghế đã đặt)
                              color: "white",
                              cursor: "not-allowed",
                              "&::after": {
                                content: '"✖"',
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "1rem",
                                zIndex: 1,
                                color: "white",
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
            {dialogSeatLoading
              ? renderSimpleLoading("Đang tải sơ đồ ghế...")
              : dialogSeatError
                ? renderErrorState(
                  dialogSeatError,
                  () => seatDialogTrip && handleOpenSeatDialog(seatDialogTrip)
                )
                : /* Non-interactive seat diagram for preview using dialog seats */
                renderSeatDiagram(dialogSeats, false)}
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
      <Box sx={{ my: 4 }}>
        {/* Trip Search Results Skeleton */}
        <Box sx={{ mb: 3 }}>
          {[1, 2, 3].map((index) => (
            <Card key={index} sx={{ mb: 3, borderRadius: 4 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Header Skeleton */}
                <Box sx={{ p: 3, pb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "stretch", md: "center" },
                      gap: { xs: 3, md: 2 },
                      pr: { xs: 0, md: 12 },
                    }}
                  >
                    {/* Departure Skeleton */}
                    <Box
                      sx={{
                        flex: "0 0 auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: { xs: "flex-start", md: "center" },
                        minWidth: 120,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Skeleton
                          variant="circular"
                          width={16}
                          height={16}
                          sx={{ mr: 1.5 }}
                        />
                        <Skeleton variant="text" width={80} height={40} />
                      </Box>
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>

                    {/* Journey Skeleton */}
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        py: { xs: 2, md: 1 },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          minWidth: { xs: 200, md: 300 },
                          position: "relative",
                        }}
                      >
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={3}
                          sx={{ borderRadius: 2 }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "white",
                            borderRadius: "50%",
                            p: 1,
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <Skeleton variant="circular" width={20} height={20} />
                        </Box>
                      </Box>
                      <Skeleton
                        variant="text"
                        width={120}
                        height={20}
                        sx={{ mt: 1.5 }}
                      />
                    </Box>

                    {/* Arrival Skeleton */}
                    <Box
                      sx={{
                        flex: "0 0 auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: { xs: "flex-end", md: "center" },
                        minWidth: 120,
                        textAlign: { xs: "right", md: "center" },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Skeleton
                          variant="text"
                          width={80}
                          height={40}
                          sx={{ mr: 1.5 }}
                        />
                        <Skeleton variant="circular" width={16} height={16} />
                      </Box>
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>
                  </Box>

                  {/* Type badges skeleton */}
                  <Box sx={{ position: "absolute", top: 16, right: 16 }}>
                    <Skeleton
                      variant="rectangular"
                      width={80}
                      height={24}
                      sx={{ borderRadius: 2, mb: 0.5 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={20}
                      sx={{ borderRadius: 1.5 }}
                    />
                  </Box>
                </Box>

                {/* Price Section Skeleton */}
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    bgcolor: "rgba(0, 0, 0, 0.02)",
                    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Skeleton variant="circular" width={20} height={20} />
                      <Skeleton variant="text" width={100} height={16} />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Skeleton variant="circular" width={20} height={20} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Skeleton variant="text" width={40} height={16} />
                      <Skeleton variant="text" width={100} height={24} />
                    </Box>
                  </Box>
                </Box>

                {/* Action Buttons Skeleton */}
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Skeleton
                      variant="rectangular"
                      width={100}
                      height={32}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width={90}
                      height={32}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </motion.div>

          {/* Floating particles */ }
          { [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
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

  {/* Loading Status */ }
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      py: 3,
    }}
  >
    <CircularProgress
      size={24}
      sx={{ color: "#f48fb1", mr: 2 }}
      thickness={4}
    />
    <Typography variant="body1" sx={{ color: "#f48fb1", fontWeight: 500 }}>
      Đang tìm chuyến xe phù hợp...
    </Typography>
  </Box>
    </Box >
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

return (
  <Container maxWidth="lg" sx={{ py: 4 }}>
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
      renderBookingSuccess()
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
  </Container>
);
}
