'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search,
  DirectionsBus,
  EventSeat,
  LocationOn,
  Payment,
  ArrowBack,
  ArrowForward,
  Check,
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
} from '@mui/icons-material';
import Link from 'next/link';
import { apiClient } from '@/services/api';

// Define types
interface TripType {
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
  tripType?: 'direct' | 'transfer' | 'triple'; // Optional field for trip classification
  direction?: 'departure' | 'return'; // Optional field for round-trip direction
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
const steps = ['Tìm chuyến xe', 'Chọn ghế', 'Thanh toán'];

// Mock data for example
const mockBusTrips = [
  {
    id: 1,
    companyName: 'Phương Trang',
    departureTime: '07:00',
    arrivalTime: '14:00',
    duration: '7h',
    price: 250000,
    rating: 4.8,
    busType: 'Giường nằm cao cấp',
    availableSeats: 12,
    totalSeats: 40,
    departurePoint: 'Bến xe miền Đông',
    arrivalPoint: 'Bến xe miền Tây',
    image: '/images/bus-sample-1.jpg'
  },
  {
    id: 2,
    companyName: 'Hà Sơn',
    departureTime: '08:30',
    arrivalTime: '15:30',
    duration: '7h',
    price: 230000,
    rating: 4.7,
    busType: 'Ghế ngồi cao cấp',
    availableSeats: 8,
    totalSeats: 30,
    departurePoint: 'Bến xe miền Đông',
    arrivalPoint: 'Bến xe miền Tây',
    image: '/images/bus-sample-2.jpg'
  },
  {
    id: 3,
    companyName: 'Kumho',
    departureTime: '10:00',
    arrivalTime: '17:00',
    duration: '7h',
    price: 300000,
    rating: 4.9,
    busType: 'Limousine',
    availableSeats: 5,
    totalSeats: 20,
    departurePoint: 'Bến xe miền Đông',
    arrivalPoint: 'Bến xe miền Tây',
    image: '/images/bus-sample-3.jpg'
  }
];

  // Mock seats data (fallback)
  const generateMockSeats = (): SeatType[] => {
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const columns = [1, 2, 3, 4];
    const seats: SeatType[] = [];

    rows.forEach(row => {
      columns.forEach(col => {
        const id = `${row}${col}`;
        // Randomly mark some seats as booked
        const isBooked = Math.random() > 0.7;
        seats.push({
          id,
          row,
          column: col,
          isBooked,
          price: 250000,
          seatNumber: `${row}${col}`,
          seatType: 'regular'
        });
      });
    });

    return seats;
  };

// Mock shuttle points
const mockShuttlePoints = [
  { id: 1, name: 'Quận 1', address: '123 Nguyễn Huệ, Quận 1', time: '06:00', extraFee: 0 },
  { id: 2, name: 'Quận 2', address: '456 Trần Não, Quận 2', time: '06:15', extraFee: 20000 },
  { id: 3, name: 'Quận 7', address: '789 Nguyễn Thị Thập, Quận 7', time: '06:30', extraFee: 30000 },
  { id: 4, name: 'Quận 9', address: '101 Lê Văn Việt, Quận 9', time: '06:15', extraFee: 40000 },
];

// Mock payment methods
const mockPaymentMethods = [
  { id: 'banking', name: 'Chuyển khoản ngân hàng', icon: <CreditCard /> },
  { id: 'momo', name: 'Ví MoMo', icon: <ShoppingCart /> },
  { id: 'zalopay', name: 'ZaloPay', icon: <Payment /> },
  { id: 'cash', name: 'Tiền mặt', icon: <Payment /> },
];

export default function BookingPage() {
  // State
  const [activeStep, setActiveStep] = useState<number>(0);
  const [searchData, setSearchData] = useState<SearchDataType>({
    from: '',
    to: '',
    fromId: '',
    toId: '',
    fromStation: '',
    toStation: '',
    fromStationId: '',
    toStationId: '',
    departureDate: '',
    returnDate: '',
    tripType: 'oneWay'
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [trips, setTrips] = useState<TripType[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripType | null>(null);
  const [seats, setSeats] = useState<SeatType[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]);
  const [shuttlePoint, setShuttlePoint] = useState<ShuttlePointType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [completed, setCompleted] = useState<boolean>(false);
  
  // Seat diagram states
  const [seatLoading, setSeatLoading] = useState<boolean>(false);
  const [seatError, setSeatError] = useState<string>('');
  const [seatDialogOpen, setSeatDialogOpen] = useState<boolean>(false);
  const [seatDialogTrip, setSeatDialogTrip] = useState<TripType | null>(null);
  
  // Seat availability by trip id for displaying in trip cards
  const [seatAvailabilityByTrip, setSeatAvailabilityByTrip] = useState<Record<string, {available: number, total: number}>>({});
  const [loadingSeatsByTrip, setLoadingSeatsByTrip] = useState<Record<string, boolean>>({});

  // Responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get search params from URL
  const searchParams = useSearchParams();

  // API function to fetch trips using search endpoint
  const fetchTrips = async (searchData: SearchDataType): Promise<TripType[]> => {
    try {
      let result;
      
      if (searchData.tripType === 'roundTrip' && searchData.returnDate) {
        // Use round-trip API
        console.log('🔄 Fetching round trips...', searchData);
        
        result = await apiClient.searchRoundTrips({
          fromLocationId: searchData.fromId,
          fromStationId: searchData.fromStationId,
          toLocationId: searchData.toId,
          toStationId: searchData.toStationId,
          date: searchData.departureDate,
          returnDate: searchData.returnDate
        });
      } else {
        // Use one-way API (existing logic)
        console.log('➡️ Fetching one-way trips...', searchData);
        
        const params = new URLSearchParams();
        
        if (searchData.fromId) params.append('FromLocationId', searchData.fromId);
        if (searchData.fromStationId) params.append('FromStationId', searchData.fromStationId);
        if (searchData.toId) params.append('ToLocationId', searchData.toId);
        if (searchData.toStationId) params.append('ToStationId', searchData.toStationId);
        if (searchData.departureDate) params.append('Date', searchData.departureDate);
        
        // Add pagination parameters
        params.append('DirectTripsPagination.Page', '0');
        params.append('DirectTripsPagination.Amount', '50');
        params.append('DirectTripsPagination.All', 'true');
        params.append('TransferTripsPagination.Page', '0');
        params.append('TransferTripsPagination.Amount', '50');
        params.append('TransferTripsPagination.All', 'true');
        params.append('TripleTripsPagination.Page', '0');
        params.append('TripleTripsPagination.Amount', '50');
        params.append('TripleTripsPagination.All', 'true');

        const response = await fetch(`https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net/api/Trip/search?${params.toString()}`);
        result = await response.json();
      }
      
      console.log('API Response:', result); // Debug log
      
      // Handle different response structures for one-way vs round-trip
      let allTrips: TripType[] = [];
      
      if (result) {
        if (searchData.tripType === 'roundTrip' && searchData.returnDate) {
          // Round-trip response structure: { departure: {...}, return: {...} }
          console.log('Processing round-trip response:', result);
          
          // Process departure trips
          if (result.departure) {
            if (result.departure.directTrips && result.departure.directTrips.length > 0) {
              allTrips = [...allTrips, ...result.departure.directTrips.map((trip: TripType) => ({
                ...trip,
                tripType: 'direct',
                direction: 'departure'
              }))];
            }
            
            if (result.departure.transferTrips && result.departure.transferTrips.length > 0) {
              allTrips = [...allTrips, ...result.departure.transferTrips.map((trip: TripType) => ({
                ...trip,
                tripType: 'transfer',
                direction: 'departure'
              }))];
            }
            
            if (result.departure.tripleTrips && result.departure.tripleTrips.length > 0) {
              allTrips = [...allTrips, ...result.departure.tripleTrips.map((trip: TripType) => ({
                ...trip,
                tripType: 'triple',
                direction: 'departure'
              }))];
            }
          }
          
          // Process return trips
          if (result.return) {
            if (result.return.directTrips && result.return.directTrips.length > 0) {
              allTrips = [...allTrips, ...result.return.directTrips.map((trip: TripType) => ({
                ...trip,
                tripType: 'direct',
                direction: 'return'
              }))];
            }
            
            if (result.return.transferTrips && result.return.transferTrips.length > 0) {
              allTrips = [...allTrips, ...result.return.transferTrips.map((trip: TripType) => ({
                ...trip,
                tripType: 'transfer',
                direction: 'return'
              }))];
            }
            
            if (result.return.tripleTrips && result.return.tripleTrips.length > 0) {
              allTrips = [...allTrips, ...result.return.tripleTrips.map((trip: TripType) => ({
                ...trip,
                tripType: 'triple',
                direction: 'return'
              }))];
            }
          }
        } else {
          // One-way response structure: { isDirect: true, directTrips: [...], transferTrips: [], tripleTrips: [] }
          console.log('Processing one-way response:', result);
          
          if (result.directTrips && result.directTrips.length > 0) {
            allTrips = [...allTrips, ...result.directTrips.map((trip: TripType) => ({
              ...trip,
              tripType: 'direct'
            }))];
          }
          
          if (result.transferTrips && result.transferTrips.length > 0) {
            allTrips = [...allTrips, ...result.transferTrips.map((trip: TripType) => ({
              ...trip,
              tripType: 'transfer'
            }))];
          }
          
          if (result.tripleTrips && result.tripleTrips.length > 0) {
            allTrips = [...allTrips, ...result.tripleTrips.map((trip: TripType) => ({
              ...trip,
              tripType: 'triple'
            }))];
          }
        }
      }
      
      return allTrips;
    } catch (error) {
      console.error('Error fetching trips:', error);
      return [];
    }
  };

  // Effect to load data from URL parameters
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const fromId = searchParams.get('fromId');
    const toId = searchParams.get('toId');
    const fromStation = searchParams.get('fromStation');
    const toStation = searchParams.get('toStation');
    const fromStationId = searchParams.get('fromStationId');
    const toStationId = searchParams.get('toStationId');
    const departureDate = searchParams.get('departureDate');
    const returnDate = searchParams.get('returnDate');
    const tripType = searchParams.get('tripType') || 'oneWay';

    // Set search data from URL params
    const searchDataFromUrl: SearchDataType = {
      from: from || '',
      to: to || '',
      fromId: fromId || '',
      toId: toId || '',
      fromStation: fromStation || '',
      toStation: toStation || '',
      fromStationId: fromStationId || '',
      toStationId: toStationId || '',
      departureDate: departureDate || '',
      returnDate: returnDate || '',
      tripType: tripType
    };

    setSearchData(searchDataFromUrl);

    // Fetch trip data from API if we have required parameters
    const loadTrips = async () => {
      setLoading(true);
      try {
        const tripsData = await fetchTrips(searchDataFromUrl);
        setTrips(tripsData);
        
        // Load seat availability for trip cards if we have trip data
        if (tripsData && tripsData.length > 0) {
          console.log('🎫 Starting to load seat availability for trips...');
          // Load seat availability in background (don't await to avoid blocking UI)
          loadSeatAvailabilityForTrips(tripsData, searchDataFromUrl).catch(error => {
            console.error('❌ Error loading seat availability for trips:', error);
          });
        }
      } catch (error) {
        console.error('Error loading trips:', error);
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
    if (activeStep === 0 && !selectedTrip) {
      alert('Vui lòng chọn một chuyến xe');
      return;
    }
    
    if (activeStep === 1 && selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế');
      return;
    }
    
    if (activeStep === 2 && (!shuttlePoint || !paymentMethod)) {
      if (!shuttlePoint) {
        alert('Vui lòng chọn điểm đón');
        return;
      }
      if (!paymentMethod) {
        alert('Vui lòng chọn phương thức thanh toán');
        return;
      }
    }
    
    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
      
      // If moving to seat selection, fetch real seat data
      if (activeStep === 0 && selectedTrip) {
        console.log('🎯 Moving to step 2 - Loading seats for selected trip:', {
          tripId: selectedTrip.id,
          tripIdString: selectedTrip.tripId,
          busName: selectedTrip.busName
        });
        
        try {
          const seatData = await fetchSeatAvailability(selectedTrip);
          console.log('🎯 Seat data fetched for step 2:', {
            count: seatData.length,
            sample: seatData.slice(0, 3)
          });
          setSeats(seatData);
          console.log('🎯 Seats state updated for step 2');
        } catch (error) {
          console.error('Error loading seats:', error);
          // Fallback to mock data if API fails
          const mockSeats = generateMockSeats();
          setSeats(mockSeats);
          console.log('🎯 Using mock seats due to API error:', mockSeats.length);
        }
      }
    } else {
      // Complete booking
      setCompleted(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  // Handle trip selection
  const handleSelectTrip = (trip: TripType) => {
    setSelectedTrip(trip);
  };

  // Handle seat selection
  const handleSelectSeat = (seat: SeatType) => {
    if (seat.isBooked) return;
    
    const alreadySelected = selectedSeats.find(s => s.id === seat.id);
    
    if (alreadySelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Handle shuttle point selection
  const handleSelectShuttlePoint = (point: ShuttlePointType) => {
    setShuttlePoint(point);
  };

  // Handle payment method selection
  const handleSelectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
  };

  // Fetch seat availability from API
  const fetchSeatAvailability = async (trip: TripType): Promise<SeatType[]> => {
    try {
      setSeatLoading(true);
      setSeatError('');
      
      console.log('🎫 Fetching seat availability for trip:', {
        'trip.id (will use this)': trip.id,
        'trip.tripId (string, not used)': trip.tripId,
        fromStationId: searchData.fromStationId,
        toStationId: searchData.toStationId,
        'API expects numeric tripId': true
      });

      // Determine correct tripId to use - try extracting from tripId string
      let tripIdToUse = trip.id;
      
      if (trip.tripId && typeof trip.tripId === 'string') {
        const numericMatch = trip.tripId.match(/\d+/);
        if (numericMatch) {
          const extractedId = parseInt(numericMatch[0]);
          console.log('🎫 Extracted numeric ID from tripId in fetchSeatAvailability:', {
            'trip.tripId': trip.tripId,
            'extracted': extractedId,
            'trip.id (fallback)': trip.id,
            'will use': extractedId
          });
          tripIdToUse = extractedId;
        }
      }
      
      console.log('🎫 Using tripId (final decision):', tripIdToUse, typeof tripIdToUse);

      const seatData = await apiClient.getSeatAvailability(
        tripIdToUse,
        searchData.fromStationId,
        searchData.toStationId
      );

      console.log('🎫 Seat API response:', seatData);

      // Transform API response to our SeatType format
      if (Array.isArray(seatData) && seatData.length > 0) {
        console.log('🎫 Raw API seat data sample:', seatData.slice(0, 3));
        
        const transformedSeats: SeatType[] = seatData.map((apiSeat: ApiSeatResponse, index: number) => {
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
            seatType: 'regular', // Default seat type
            isSelected: false
          };
          
          return transformedSeat;
        });
        
        console.log('🎫 Transformed seats:', {
          count: transformedSeats.length,
          sample: transformedSeats.slice(0, 3),
          bookedCount: transformedSeats.filter(s => s.isBooked).length,
          availableCount: transformedSeats.filter(s => !s.isBooked).length
        });
        
        return transformedSeats;
      } else {
        console.warn('🎫 Unexpected seat data format:', seatData);
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching seat availability:', error);
      setSeatError('Không thể tải thông tin ghế. Vui lòng thử lại.');
      return [];
    } finally {
      setSeatLoading(false);
    }
  };

  // Load seat availability for all trips (for trip cards display)
  const loadSeatAvailabilityForTrips = async (trips: TripType[], searchDataForSeats: SearchDataType) => {
    console.log('🎫 Loading seat availability for', trips.length, 'trips...', {
      fromStationId: searchDataForSeats.fromStationId,
      toStationId: searchDataForSeats.toStationId
    });
    
    // Validation: ensure we have required station IDs
    if (!searchDataForSeats.fromStationId || !searchDataForSeats.toStationId) {
      console.warn('⚠️ Cannot load seat availability: missing station IDs', {
        fromStationId: searchDataForSeats.fromStationId,
        toStationId: searchDataForSeats.toStationId
      });
      return;
    }
    
    // Load seat availability for first few trips to avoid too many API calls
    const tripsToLoad = trips.slice(0, 5); // Limit to first 5 trips
    
    for (const trip of tripsToLoad) {
      try {
        // Set loading state for this trip
        setLoadingSeatsByTrip(prev => ({
          ...prev,
          [trip.id.toString()]: true
        }));
        
        console.log('🎫 Loading seats for trip', trip.id, 'with params:', {
          'trip.id (used as tripId)': trip.id,
          'trip.tripId (string ID)': trip.tripId,
          'trip object': trip,
          fromStationId: searchDataForSeats.fromStationId,
          toStationId: searchDataForSeats.toStationId
        });
        
        // Determine correct tripId to use
        let tripIdToUse = trip.id;
        
        // Try to extract number from tripId string if it exists
        if (trip.tripId && typeof trip.tripId === 'string') {
          const numericMatch = trip.tripId.match(/\d+/);
          if (numericMatch) {
            const extractedId = parseInt(numericMatch[0]);
            console.log('🎫 Extracted numeric ID from tripId:', {
              'trip.tripId': trip.tripId,
              'extracted': extractedId,
              'will use': extractedId
            });
            tripIdToUse = extractedId;
          }
        }
        
        console.log('🎫 Final tripId decision:', {
          'trip.id': trip.id,
          'trip.tripId': trip.tripId,
          'using': tripIdToUse
        });

        // Call API directly with the searchData we received
        const seatData = await apiClient.getSeatAvailability(
          tripIdToUse,
          searchDataForSeats.fromStationId,
          searchDataForSeats.toStationId
        );
        
        console.log('🎫 Seat data received for trip', trip.id, ':', {
          dataType: typeof seatData,
          isArray: Array.isArray(seatData),
          length: Array.isArray(seatData) ? seatData.length : 'N/A'
        });
        
        // Transform the data similar to fetchSeatAvailability
        const transformedSeats = Array.isArray(seatData) ? seatData.map((apiSeat: any, index: number) => {
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
            seatType: 'regular',
            isSelected: false
          };
                 }) : [];
        
        const availableSeats = transformedSeats.filter(seat => !seat.isBooked).length;
        const totalSeats = transformedSeats.length;
        
        setSeatAvailabilityByTrip(prev => ({
          ...prev,
          [trip.id.toString()]: {
            available: availableSeats,
            total: totalSeats
          }
        }));
        
        console.log('🎫 Loaded seat info for trip', trip.id, ':', {
          available: availableSeats,
          total: totalSeats
        });
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('❌ Error loading seats for trip', trip.id, ':', error);
      } finally {
        // Clear loading state for this trip
        setLoadingSeatsByTrip(prev => ({
          ...prev,
          [trip.id.toString()]: false
        }));
      }
    }
  };

  // Handle seat diagram dialog
  const handleOpenSeatDialog = async (trip: TripType) => {
    setSeatDialogTrip(trip);
    setSeatDialogOpen(true);
    
    console.log('🎫 Opening seat dialog for trip:', {
      'trip.id (numeric, will use)': trip.id,
      'trip.tripId (string, display only)': trip.tripId,
      'busName': trip.busName
    });
    
    try {
      // Fetch seat data when dialog opens and update seats state
      console.log('🎯 Fetching seats for dialog preview...');
      const seatData = await fetchSeatAvailability(trip);
      console.log('🎯 Dialog - Got seat data:', {
        count: seatData.length,
        sample: seatData.slice(0, 3)
      });
      setSeats(seatData); // Set seats state so dialog can display them
      console.log('🎯 Dialog - Seats state updated for preview');
      
      // Update seat availability info for trip card display
      const availableSeats = seatData.filter(seat => !seat.isBooked).length;
      const totalSeats = seatData.length;
      setSeatAvailabilityByTrip(prev => ({
        ...prev,
        [trip.id.toString()]: {
          available: availableSeats,
          total: totalSeats
        }
      }));
      
      console.log('🎫 Seat availability updated for trip', trip.id, ':', {
        available: availableSeats,
        total: totalSeats
      });
    } catch (error) {
      console.error('❌ Error loading seats for dialog:', error);
      setSeatError('Không thể tải sơ đồ ghế');
    }
  };

  const handleCloseSeatDialog = () => {
    setSeatDialogOpen(false);
    setSeatDialogTrip(null);
  };

  // Format price as VND
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'đ');
  };

  const calculateTotalPrice = () => {
    let basePrice = 0;
    
    if (selectedTrip) {
      basePrice = selectedSeats.length * selectedTrip.price;
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
      total: basePrice + shuttleFee + serviceFee
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
        return 'Unknown step';
    }
  };

  // Render search and trips
  const renderSearchTrips = () => {
    return (
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#f48fb1' }}>
            Thông tin tìm kiếm
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Điểm khởi hành"
                value={searchData.from}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: '#f48fb1' }} />,
                  readOnly: true
                }}
              />
              <TextField
                fullWidth
                label="Trạm đi"
                value={searchData.fromStation}
                InputProps={{
                  startAdornment: <DirectionsBus sx={{ mr: 1, color: '#f48fb1' }} />,
                  readOnly: true
                }}
                sx={{ mt: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Điểm đến"
                value={searchData.to}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: '#f48fb1' }} />,
                  readOnly: true
                }}
              />
              <TextField
                fullWidth
                label="Trạm đến"
                value={searchData.toStation}
                InputProps={{
                  startAdornment: <DirectionsBus sx={{ mr: 1, color: '#f48fb1' }} />,
                  readOnly: true
                }}
                sx={{ mt: 2 }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                label="Ngày khởi hành"
                value={searchData.departureDate}
                InputProps={{
                  readOnly: true
                }}
              />
            </Box>
            {searchData.tripType === 'roundTrip' && searchData.returnDate && (
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
                <TextField
                  fullWidth
                  label="Ngày về"
                  value={searchData.returnDate}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </Box>
            )}
            {/* Trip Type Information */}
            <Box sx={{ width: '100%', mt: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                px: 2, 
                py: 1.5, 
                bgcolor: searchData.tripType === 'roundTrip' ? 'rgba(156, 39, 176, 0.08)' : 'rgba(33, 150, 243, 0.08)',
                borderRadius: 2,
                border: searchData.tripType === 'roundTrip' ? '1px solid rgba(156, 39, 176, 0.2)' : '1px solid rgba(33, 150, 243, 0.2)'
              }}>
                {searchData.tripType === 'roundTrip' ? (
                  <>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: '#7b1fa2', 
                      mr: 1.5 
                    }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                      🔄 Vé khứ hồi • {searchData.departureDate} - {searchData.returnDate}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: '#1976d2', 
                      mr: 1.5 
                    }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      ➡️ Vé một chiều • {searchData.departureDate}
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Các chuyến xe có sẵn
          </Typography>
          {trips.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Tìm thấy {trips.length} chuyến xe
              </Typography>
              {searchData.tripType === 'roundTrip' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    size="small"
                    label={`Chiều đi: ${trips.filter(t => t.direction === 'departure').length}`}
                    sx={{
                      bgcolor: 'rgba(33, 150, 243, 0.1)',
                      color: '#1976d2',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip 
                    size="small"
                    label={`Chiều về: ${trips.filter(t => t.direction === 'return').length}`}
                    sx={{
                      bgcolor: 'rgba(156, 39, 176, 0.1)',
                      color: '#7b1fa2',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
        
        {loading ? (
          renderLoading()
        ) : trips.length > 0 ? (
          <Box>
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    mb: 3, 
                    cursor: 'pointer',
                    border: selectedTrip?.id === trip.id ? '3px solid #f48fb1' : '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 4,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: selectedTrip?.id === trip.id 
                      ? 'linear-gradient(135deg, rgba(244, 143, 177, 0.03) 0%, rgba(233, 30, 99, 0.05) 100%)' 
                      : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                    boxShadow: selectedTrip?.id === trip.id 
                      ? '0 8px 32px rgba(244, 143, 177, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&::before': selectedTrip?.id === trip.id ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #f48fb1, #e91e63, #f48fb1)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 3s ease-in-out infinite',
                      '@keyframes shimmer': {
                        '0%': { backgroundPosition: '-200% 0' },
                        '100%': { backgroundPosition: '200% 0' },
                      }
                    } : {},
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.01)',
                      boxShadow: '0 12px 40px rgba(244, 143, 177, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
                      '& .trip-card-actions': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                      '& .trip-type-badge': {
                        transform: 'scale(1.05)',
                      }
                    }
                  }}
                  onClick={() => handleSelectTrip(trip)}
                >
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    {/* Header with Trip Type Badge */}
                    <Box sx={{ 
                      p: 3, 
                      pb: 2,
                      background: selectedTrip?.id === trip.id 
                        ? 'linear-gradient(135deg, rgba(244, 143, 177, 0.08) 0%, rgba(233, 30, 99, 0.12) 100%)'
                        : 'transparent',
                      position: 'relative',
                    }}>
                      {/* Trip Type Badge */}
                      <Box 
                        className="trip-type-badge"
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          alignItems: 'flex-end'
                        }}
                      >
                        {/* Direction Badge for Round Trip */}
                        {searchData.tripType === 'roundTrip' && trip.direction && (
                          <Box sx={{
                            px: 1.5,
                            py: 0.3,
                            borderRadius: 1.5,
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: 0.3,
                            transition: 'transform 0.3s ease',
                            ...(trip.direction === 'departure' ? {
                              bgcolor: 'rgba(33, 150, 243, 0.15)',
                              color: '#1976d2',
                              border: '1px solid rgba(33, 150, 243, 0.3)'
                            } : {
                              bgcolor: 'rgba(156, 39, 176, 0.15)',
                              color: '#7b1fa2',
                              border: '1px solid rgba(156, 39, 176, 0.3)'
                            })
                          }}>
                            {trip.direction === 'departure' ? '✈️ Chiều đi' : '🔄 Chiều về'}
                          </Box>
                        )}
                        
                        {/* Trip Type Badge */}
                        <Box sx={{
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          transition: 'transform 0.3s ease',
                          ...(trip.tripType === 'direct' ? {
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: '#388e3c',
                            border: '1px solid rgba(76, 175, 80, 0.3)'
                          } : trip.tripType === 'transfer' ? {
                            bgcolor: 'rgba(255, 193, 7, 0.1)', 
                            color: '#f57c00',
                            border: '1px solid rgba(255, 193, 7, 0.3)'
                          } : {
                            bgcolor: 'rgba(33, 150, 243, 0.1)',
                            color: '#1976d2',
                            border: '1px solid rgba(33, 150, 243, 0.3)'
                          })
                        }}>
                          {trip.tripType === 'direct' ? '🚌 Thẳng' : 
                           trip.tripType === 'transfer' ? '🔄 Chuyển' : 
                           '🔁 Ba chặng'}
                        </Box>
                      </Box>

                      {/* Main Time & Route Section */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'center' },
                        gap: { xs: 3, md: 2 },
                        pr: { xs: 0, md: searchData.tripType === 'roundTrip' ? 16 : 12 } // Extra space for round-trip badges
                      }}>
                        {/* Departure */}
                        <Box sx={{ 
                          flex: '0 0 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: { xs: 'flex-start', md: 'center' },
                          minWidth: 120
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: '#4caf50',
                              mr: 1.5,
                              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: 2,
                                borderRadius: '50%',
                                bgcolor: 'white',
                              }
                            }} />
                            <Typography variant="h4" sx={{ 
                              fontWeight: 800, 
                              color: '#2e7d32',
                              fontSize: { xs: '1.8rem', md: '2.2rem' },
                              lineHeight: 1,
                            }}>
                              {new Date(trip.timeStart).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: '#424242',
                            fontSize: '0.95rem'
                          }}>
                            {searchData.fromStation}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5
                          }}>
                            <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                            {searchData.from}
                          </Typography>
                        </Box>

                                                 {/* Journey Details */}
                         <Box sx={{ 
                           flex: 1,
                           display: 'flex', 
                           flexDirection: 'column', 
                           alignItems: 'center',
                           justifyContent: 'center',
                           position: 'relative',
                           py: { xs: 2, md: 1 }
                         }}>
                           {/* Journey Line with Bus Icon */}
                           <Box sx={{ 
                             display: 'flex', 
                             alignItems: 'center', 
                             width: '100%',
                             minWidth: { xs: 200, md: 300 },
                             position: 'relative'
                           }}>
                             {/* Animated line */}
                             <Box sx={{
                               flex: 1,
                               height: 3,
                               background: 'linear-gradient(90deg, #4caf50 0%, #f48fb1 50%, #f44336 100%)',
                               borderRadius: 2,
                               position: 'relative',
                               overflow: 'hidden',
                               '&::after': {
                                 content: '""',
                                 position: 'absolute',
                                 top: 0,
                                 left: '-20px',
                                 width: '40px',
                                 height: '100%',
                                 background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                                 animation: 'slide 3s ease-in-out infinite',
                                 '@keyframes slide': {
                                   '0%': { left: '-40px' },
                                   '100%': { left: '100%' },
                                 }
                               }
                             }} />
                             
                             {/* Moving bus icon */}
                             <Box sx={{
                               position: 'absolute',
                               top: '50%',
                               left: '50%',
                               transform: 'translate(-50%, -50%)',
                               bgcolor: 'white',
                               borderRadius: '50%',
                               p: 1,
                               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                               zIndex: 1
                             }}>
                               <DirectionsBus sx={{ 
                                 color: '#f48fb1', 
                                 fontSize: 20,
                               }} />
                             </Box>
                           </Box>

                           {/* Bus Name */}
                           <Typography variant="body2" sx={{ 
                             mt: 1.5,
                             color: '#666',
                             fontWeight: 500,
                             bgcolor: 'rgba(244, 143, 177, 0.08)',
                             px: 2,
                             py: 0.5,
                             borderRadius: 2,
                             fontSize: '0.85rem'
                           }}>
                             🚐 {trip.busName}
                           </Typography>
                         </Box>

                        {/* Arrival */}
                        <Box sx={{ 
                          flex: '0 0 auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: { xs: 'flex-end', md: 'center' },
                          minWidth: 120,
                          textAlign: { xs: 'right', md: 'center' }
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h4" sx={{ 
                              fontWeight: 800, 
                              color: '#d32f2f',
                              fontSize: { xs: '1.8rem', md: '2.2rem' },
                              lineHeight: 1,
                              mr: 1.5
                            }}>
                              {new Date(trip.timeEnd).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                            <Box sx={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              bgcolor: '#f44336',
                              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: 2,
                                borderRadius: '50%',
                                bgcolor: 'white',
                              }
                            }} />
                          </Box>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 600, 
                            color: '#424242',
                            fontSize: '0.95rem'
                          }}>
                            {searchData.toStation}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5
                          }}>
                            <LocationOn sx={{ fontSize: 14, mr: 0.5 }} />
                            {searchData.to}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Price Section */}
                    <Box sx={{ 
                      px: 3,
                      py: 2,
                      bgcolor: selectedTrip?.id === trip.id 
                        ? 'rgba(244, 143, 177, 0.05)' 
                        : 'rgba(0, 0, 0, 0.02)',
                      borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventSeat sx={{ color: '#f48fb1', fontSize: 20 }} />
                          {loadingSeatsByTrip[trip.id.toString()] ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={16} sx={{ color: '#f48fb1' }} />
                              <Typography variant="body2" color="text.secondary">
                                Đang tải...
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {seatAvailabilityByTrip[trip.id.toString()] 
                                ? `${seatAvailabilityByTrip[trip.id.toString()].available}/${seatAvailabilityByTrip[trip.id.toString()].total} ghế trống`
                                : 'Xem ghế trống'
                              }
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime sx={{ color: '#f48fb1', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            {searchData.departureDate}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary">
                            Giá từ
                          </Typography>
                          <Typography variant="h5" sx={{ 
                            color: '#f48fb1', 
                            fontWeight: 800,
                            fontSize: '1.5rem',
                            lineHeight: 1
                          }}>
                            {formatPrice(trip.price)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Route Description */}
                    {trip.routeDescription && (
                      <Box sx={{ 
                        px: 3, 
                        py: 2,
                        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                        bgcolor: 'rgba(244, 143, 177, 0.02)'
                      }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600, 
                          mb: 1.5, 
                          color: '#f48fb1', 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <LocalShipping sx={{ fontSize: 18 }} />
                          Lịch trình chi tiết:
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          flexWrap: 'wrap', 
                          gap: 1.5,
                          overflowX: 'auto',
                          pb: 1
                        }}>
                          {(() => {
                            const routeText = trip.routeDescription.replace('Lộ trình: ', '');
                            const locations = routeText.split(' - ').map(loc => loc.trim());
                            
                            return locations.map((location, index) => (
                              <Box key={index} sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                flexShrink: 0
                              }}>
                                <Chip
                                  label={location}
                                  size="small"
                                  sx={{
                                    bgcolor: index === 0 
                                      ? 'rgba(76, 175, 80, 0.15)' 
                                      : index === locations.length - 1 
                                        ? 'rgba(244, 67, 54, 0.15)' 
                                        : 'rgba(33, 150, 243, 0.15)',
                                    color: index === 0 
                                      ? '#2e7d32' 
                                      : index === locations.length - 1 
                                        ? '#d32f2f' 
                                        : '#1976d2',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 28,
                                    borderRadius: 2,
                                    '& .MuiChip-label': {
                                      px: 1.5
                                    }
                                  }}
                                />
                                {index < locations.length - 1 && (
                                  <ArrowForward sx={{ 
                                    color: '#bbb', 
                                    fontSize: 16, 
                                    mx: 0.5 
                                  }} />
                                )}
                              </Box>
                            ));
                          })()}
                        </Box>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box 
                      className="trip-card-actions"
                      sx={{ 
                        px: 3,
                        py: 2.5,
                        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                        opacity: 0.7,
                        transform: 'translateY(5px)',
                        transition: 'all 0.3s ease',
                        bgcolor: selectedTrip?.id === trip.id 
                          ? 'rgba(244, 143, 177, 0.08)' 
                          : 'transparent'
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1.5,
                        flexWrap: 'wrap'
                      }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<EventSeat />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSeatDialog(trip);
                          }}
                          sx={{ 
                            fontSize: '0.8rem', 
                            py: 0.8, 
                            px: 2,
                            borderColor: 'rgba(244, 143, 177, 0.3)',
                            color: '#f48fb1',
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: '#f48fb1',
                              bgcolor: 'rgba(244, 143, 177, 0.05)'
                            }
                          }}
                        >
                          Sơ đồ ghế
                        </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<Info />}
                          sx={{ 
                            fontSize: '0.8rem', 
                            py: 0.8, 
                            px: 2,
                            borderColor: 'rgba(244, 143, 177, 0.3)',
                            color: '#f48fb1',
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: '#f48fb1',
                              bgcolor: 'rgba(244, 143, 177, 0.05)'
                            }
                          }}
                        >
                          Chính sách
                        </Button>
                      </Box>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={selectedTrip?.id === trip.id ? <Check /> : <ShoppingCart />}
                          sx={{ 
                            background: selectedTrip?.id === trip.id 
                              ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                              : 'linear-gradient(135deg, #f48fb1 0%, #e91e63 100%)',
                            color: 'white',
                            fontWeight: 700,
                            px: 4,
                            py: 1.2,
                            borderRadius: 3,
                            fontSize: '0.95rem',
                            textTransform: 'none',
                            boxShadow: selectedTrip?.id === trip.id 
                              ? '0 4px 16px rgba(76, 175, 80, 0.3)'
                              : '0 4px 16px rgba(244, 143, 177, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: selectedTrip?.id === trip.id 
                                ? 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
                                : 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: selectedTrip?.id === trip.id 
                                ? '0 6px 20px rgba(76, 175, 80, 0.4)'
                                : '0 6px 20px rgba(244, 143, 177, 0.4)',
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTrip(trip);
                          }}
                        >
                          {selectedTrip?.id === trip.id ? 'Đã chọn chuyến' : 'Chọn chuyến này'}
                        </Button>
                      </motion.div>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Không tìm thấy chuyến xe</AlertTitle>
            Không có chuyến xe nào phù hợp với tiêu chí tìm kiếm của bạn.
          </Alert>
        )}
      </Box>
    );
  };

  // Render seat selection
  const renderSeatSelection = () => {
    if (!selectedTrip) return null;
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Chọn ghế - {selectedTrip.busName} ({new Date(selectedTrip.timeStart).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })} - {new Date(selectedTrip.timeEnd).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })})
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { xs: '1', md: '2' } }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                position: 'relative',
                overflow: 'auto'
              }}
            >
              {/* Enhanced seat diagram with API integration */}
              {renderSeatDiagram(seats, true, handleSelectSeat)}
            </Paper>
          </Box>
          
          <Box sx={{ flex: { xs: '1', md: '1' } }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#f48fb1' }}>
                Chi tiết đặt chỗ
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedTrip.busName} - {selectedTrip.tripId}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Khởi hành:</Typography>
                  <Typography variant="body2">
                    {new Date(selectedTrip.timeStart).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {searchData.departureDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Điểm đi:</Typography>
                  <Typography variant="body2">{searchData.fromStation}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Điểm đến:</Typography>
                  <Typography variant="body2">{searchData.toStation}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Ghế đã chọn:
              </Typography>
              
              {selectedSeats.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {selectedSeats.map((seat) => (
                    <Chip 
                      key={seat.id}
                      label={seat.id} 
                      color="primary"
                      onDelete={() => handleSelectSeat(seat)}
                      sx={{ bgcolor: '#f48fb1' }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa chọn ghế nào
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <Typography variant="subtitle1">Tổng tiền:</Typography>
                <Typography variant="subtitle1" sx={{ color: '#f48fb1' }}>
                  {formatPrice(selectedSeats.length * selectedTrip.price)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };



  // Render payment with shuttle points
  const renderPaymentWithShuttle = () => {
    if (!selectedTrip) return null;
    
    const priceDetails = calculateTotalPrice();
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Điểm đón & Thanh toán
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { xs: '1', md: '2' } }}>
            {/* Shuttle Points Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#f48fb1' }}>
                Chọn điểm đón
              </Typography>
              
              {mockShuttlePoints.map((point) => (
                <Card
                  key={point.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    border: shuttlePoint?.id === point.id ? '2px solid #f48fb1' : '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                  onClick={() => handleSelectShuttlePoint(point)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {point.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {point.address}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <AccessTime sx={{ fontSize: '0.875rem', mr: 0.5, color: '#f48fb1' }} />
                          <Typography variant="body2">
                            Giờ đón: {point.time}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {point.extraFee > 0 ? (
                          <Typography variant="subtitle1" sx={{ color: '#f48fb1' }}>
                            {formatPrice(point.extraFee)}
                          </Typography>
                        ) : (
                          <Chip size="small" label="Miễn phí" color="success" />
                        )}
                        {shuttlePoint?.id === point.id && (
                          <Check sx={{ color: '#f48fb1', mt: 2 }} />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Paper>

            {/* Payment Methods Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#f48fb1' }}>
                Phương thức thanh toán
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {mockPaymentMethods.map((method) => (
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }} key={method.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: paymentMethod === method.id ? '2px solid #f48fb1' : '1px solid #e0e0e0',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        },
                        height: '100%',
                      }}
                      onClick={() => handleSelectPaymentMethod(method.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ mr: 2, color: '#f48fb1' }}>{method.icon}</Box>
                          <Typography variant="subtitle1">{method.name}</Typography>
                          {paymentMethod === method.id && (
                            <Check sx={{ ml: 'auto', color: '#f48fb1' }} />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Paper>
            
            {/* Contact Information Section */}
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#f48fb1' }}>
                Thông tin liên hệ
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      placeholder="Nhập họ và tên người đặt"
                      required
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </Box>
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Email"
                    placeholder="Nhập email"
                    type="email"
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    placeholder="Nhập ghi chú (nếu có)"
                    multiline
                    rows={3}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
          
          {/* Booking Summary */}
          <Box sx={{ flex: { xs: '1', md: '1' } }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#f48fb1' }}>
                Thông tin đặt vé
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedTrip.busName} - {selectedTrip.tripId}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Khởi hành:</Typography>
                  <Typography variant="body2">
                    {new Date(selectedTrip.timeStart).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {searchData.departureDate}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Điểm đi:</Typography>
                  <Typography variant="body2">{shuttlePoint?.name || 'Chưa chọn'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Điểm đến:</Typography>
                  <Typography variant="body2">{selectedTrip.endLocation}</Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Ghế đã chọn:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedSeats.map((seat) => (
                  <Chip 
                    key={seat.id}
                    label={seat.seatNumber || seat.id} 
                    color="primary"
                    sx={{ bgcolor: '#f48fb1' }}
                  />
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Giá vé:</Typography>
                <Typography variant="body2">
                  {formatPrice(priceDetails.basePrice)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Phí đưa đón:</Typography>
                <Typography variant="body2">
                  {formatPrice(priceDetails.shuttleFee)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Phí dịch vụ:</Typography>
                <Typography variant="body2">{formatPrice(priceDetails.serviceFee)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', mt: 2 }}>
                <Typography variant="subtitle1">Tổng tiền:</Typography>
                <Typography variant="subtitle1" sx={{ color: '#f48fb1' }}>
                  {formatPrice(priceDetails.total)}
                </Typography>
              </Box>
              
              {/* Payment Method Display */}
              {paymentMethod && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#fce4ec', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#f48fb1' }}>
                    Phương thức thanh toán đã chọn:
                  </Typography>
                  <Typography variant="body2">
                    {mockPaymentMethods.find(method => method.id === paymentMethod)?.name}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render booking success
  const renderBookingSuccess = () => {
    // Generate random booking code
    const bookingCode = `XTB${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    return (
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box 
            sx={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              bgcolor: '#f48fb1',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 25px rgba(244, 143, 177, 0.4)'
            }}
          >
            <Check sx={{ fontSize: 60 }} />
          </Box>
        </motion.div>
        
        <Typography variant="h4" gutterBottom sx={{ color: '#f48fb1', fontWeight: 'bold' }}>
          Đặt vé thành công!
        </Typography>
        
        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Cảm ơn bạn đã đặt vé. Mã đặt vé của bạn là <Box component="span" sx={{ fontWeight: 'bold', color: '#f48fb1' }}>{bookingCode}</Box>
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
              mx: 'auto', 
              mb: 5, 
              position: 'relative',
            }}
          >
            <Paper 
              elevation={5} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #fff 0%, #fce4ec 100%)',
                border: '1px dashed #f48fb1',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '5px',
                  background: 'linear-gradient(90deg, #f48fb1, #e91e63, #f48fb1)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s ease-in-out infinite',
                  '@keyframes shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                  }
                }
              }}
            >
              {/* Ticket Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '1px dashed #f48fb1' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    component="img"
                    src="/images/pic4.png"
                    alt="XeTiic Logo"
                    sx={{
                      width: 40,
                      height: 40,
                      mr: 2,
                      borderRadius: 1,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Vé Xe BusTicket
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mã đặt vé
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e91e63' }}>
                    {bookingCode}
                  </Typography>
                </Box>
              </Box>
              
              {/* Ticket Content */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Route Info */}
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 3 
                  }}>
                    <Box sx={{ textAlign: 'center', flex: '1 1 auto' }}>
                      <Typography variant="body2" color="text.secondary">Điểm đi</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                        {shuttlePoint?.name}
                      </Typography>
                      <Typography variant="body2">
                        {selectedTrip && new Date(selectedTrip.timeStart).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      mx: 2,
                      px: 2
                    }}>
                      <DirectionsBus sx={{ color: '#f48fb1', fontSize: '1.5rem', mb: 0.5 }} />
                      <Box sx={{ 
                        width: { xs: '80px', sm: '120px' }, 
                        height: '2px', 
                        bgcolor: '#f48fb1', 
                        position: 'relative',
                        '&::before, &::after': {
                          content: '""',
                          position: 'absolute',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          bgcolor: '#f48fb1',
                          top: '50%',
                          transform: 'translateY(-50%)'
                        },
                        '&::before': {
                          left: 0
                        },
                        '&::after': {
                          right: 0
                        }
                      }} />
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {selectedTrip && (() => {
                          const start = new Date(selectedTrip.timeStart);
                          const end = new Date(selectedTrip.timeEnd);
                          const diffMs = end.getTime() - start.getTime();
                          const hours = Math.floor(diffMs / (1000 * 60 * 60));
                          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                          return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
                        })()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ textAlign: 'center', flex: '1 1 auto' }}>
                      <Typography variant="body2" color="text.secondary">Điểm đến</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                        {selectedTrip?.endLocation}
                      </Typography>
                      <Typography variant="body2">
                        {selectedTrip && new Date(selectedTrip.timeEnd).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* Details */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">Nhà xe</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                      {selectedTrip?.busName} • {selectedTrip?.tripId}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">Ngày khởi hành</Typography>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      {searchData.departureDate}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">Số ghế</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
                      {selectedSeats.map(seat => (
                        <Chip 
                          key={seat.id}
                          label={seat.id} 
                          size="small"
                          sx={{ bgcolor: '#fce4ec', color: '#e91e63', fontWeight: 'bold' }}
                        />
                      ))}
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">Giá vé</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#e91e63' }}>
                      {formatPrice(calculateTotalPrice().total)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* QR Code Placeholder */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                mt: 3,
                pt: 3,
                borderTop: '1px dashed #f48fb1' 
              }}>
                <Box sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: '#000',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'linear-gradient(to right, #000 30%, transparent 30%), linear-gradient(to right, #000 30%, transparent 30%), linear-gradient(to bottom, #000 30%, transparent 30%), linear-gradient(to bottom, #000 30%, transparent 30%)',
                    backgroundSize: '15px 3px, 15px 3px, 3px 15px, 3px 15px',
                    backgroundPosition: 'top left, bottom left, top left, top right',
                    backgroundRepeat: 'repeat-x, repeat-x, repeat-y, repeat-y',
                  }
                }} />
              </Box>
              
              {/* Ticket Footer */}
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'text.secondary' }}>
                Vui lòng đến trước giờ khởi hành 30 phút. Mang theo mã vé để đổi vé lên xe.
              </Typography>
            </Paper>
            
            {/* Ticket holes decoration */}
            <Box sx={{ 
              position: 'absolute', 
              left: -10, 
              top: '50%', 
              transform: 'translateY(-50%)',
              display: { xs: 'none', md: 'block' }
            }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: 'white', 
                    mb: 3, 
                    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)' 
                  }} 
                />
              ))}
            </Box>
            
            <Box sx={{ 
              position: 'absolute', 
              right: -10, 
              top: '50%', 
              transform: 'translateY(-50%)',
              display: { xs: 'none', md: 'block' }
            }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Box 
                  key={i} 
                  sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: 'white', 
                    mb: 3, 
                    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)' 
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
              bgcolor: '#f48fb1',
              '&:hover': {
                bgcolor: '#e91e63'
              },
              py: 1.5,
              px: 4,
              fontWeight: 'bold',
              boxShadow: '0 8px 25px rgba(244, 143, 177, 0.4)'
            }}
          >
            Trở về trang chủ
          </Button>
        </motion.div>
      </Box>
    );
  };

    // Seat diagram component
  const renderSeatDiagram = (seats: SeatType[], isInteractive: boolean = true, onSeatClick?: (seat: SeatType) => void) => {
    console.log('🎯 renderSeatDiagram called with:', {
      seatsCount: seats?.length || 0,
      isInteractive,
      seatLoading,
      seatError,
      seatsData: seats?.slice(0, 3) || 'no seats'
    });

    if (seatLoading) {
      console.log('🎯 Showing loading state');
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#f48fb1' }} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Đang tải sơ đồ ghế...
          </Typography>
        </Box>
      );
    }

    if (seatError) {
      console.log('🎯 Showing error state:', seatError);
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {seatError}
          <Button 
            size="small" 
            onClick={() => selectedTrip && fetchSeatAvailability(selectedTrip)}
            sx={{ ml: 2 }}
          >
            Thử lại
          </Button>
        </Alert>
      );
    }

    if (!seats || seats.length === 0) {
      console.log('🎯 Showing empty seats message');
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          Không có thông tin ghế cho chuyến xe này.
        </Alert>
      );
    }

    // Group seats by row for better layout
    console.log('🎯 Processing seats for diagram:', {
      totalSeats: seats.length,
      sampleSeats: seats.slice(0, 3)
    });

    const seatsByRow = seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    }, {} as Record<string, SeatType[]>);

    const rows = Object.keys(seatsByRow).sort();
    
    console.log('🎯 Grouped seats by row:', {
      rows: rows,
      seatsByRow: Object.keys(seatsByRow).reduce((acc, key) => {
        acc[key] = seatsByRow[key].length;
        return acc;
      }, {} as Record<string, number>)
    });

    return (
      <Box sx={{ position: 'relative', overflow: 'auto' }}>
        {/* Bus Front */}
        <Box sx={{ 
          mb: 2,
          p: 2,
          border: '2px solid #f48fb1',
          borderRadius: '40px 40px 8px 8px',
          bgcolor: '#fce4ec',
          width: 'fit-content',
          mx: 'auto',
          minWidth: 300
        }}>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
            🚐 Tài xế
          </Typography>
        </Box>
        
        {/* Seat Layout */}
        <Box sx={{ 
          maxWidth: 400, 
          mx: 'auto', 
          mt: 4,
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          p: 2,
          bgcolor: '#fafafa'
        }}>
          {rows.map((rowKey) => {
            const rowSeats = seatsByRow[rowKey].sort((a, b) => a.column - b.column);
            return (
              <Box key={rowKey} sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                mb: 1.5,
                gap: 1
              }}>
                {/* Row Label */}
                <Typography variant="body2" sx={{ 
                  minWidth: 20, 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  color: '#666'
                }}>
                  {rowKey}
                </Typography>
                
                {/* Seats */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {rowSeats.map((seat, index) => {
                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                    const isBooked = seat.isBooked;
                    
                    return (
                      <Box key={seat.id} sx={{ position: 'relative' }}>
                        <Button
                          variant="contained"
                          disabled={isBooked || !isInteractive}
                          onClick={() => onSeatClick && onSeatClick(seat)}
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
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: isBooked 
                              ? 'not-allowed' 
                              : isInteractive 
                                ? 'pointer' 
                                : 'default',
                            bgcolor: isSelected 
                              ? '#f48fb1' 
                              : isBooked 
                                ? '#bdbdbd' 
                                : 'white',
                            color: isSelected 
                              ? 'white' 
                              : isBooked 
                                ? 'white' 
                                : '#757575',
                            border: isSelected ? '2px solid #e91e63' : '1px solid #e0e0e0',
                            borderRadius: 2,
                            position: 'relative',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              bgcolor: isBooked 
                                ? '#a0a0a0' // Darker gray for disabled seats
                                : isSelected
                                  ? '#e91e63'
                                  : '#f48fb1', // Pink for available seats
                              color: isBooked 
                                ? 'white'
                                : 'white',
                              transform: !isBooked && isInteractive ? 'scale(1.05)' : 'none',
                              boxShadow: !isBooked && isInteractive 
                                ? '0 4px 12px rgba(244, 143, 177, 0.3)' 
                                : 'none',
                              '&::after': isBooked ? {
                                content: '"🚫"',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '1.2rem',
                                zIndex: 1
                              } : {}
                            },
                            '&:disabled': {
                              bgcolor: '#bdbdbd',
                              color: 'white',
                              cursor: 'not-allowed'
                            }
                          }}
                        >
                          {seat.seatNumber || seat.id}
                        </Button>
                        
                        {/* Seat Type Indicator */}
                        {seat.seatType && seat.seatType !== 'regular' && (
                          <Box sx={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: seat.seatType === 'vip' ? '#ffd700' : '#2196f3',
                            fontSize: '0.6rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {seat.seatType === 'vip' ? '⭐' : '💺'}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                
                {/* Add aisle after 2nd seat for typical bus layout */}
                {rowSeats.length > 2 && (
                  <Box sx={{ 
                    width: 20, 
                    height: 2, 
                    bgcolor: '#e0e0e0', 
                    borderRadius: 1,
                    mx: 1 
                  }} />
                )}
              </Box>
            );
          })}
        </Box>
        
        {/* Legend */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: 'white', border: '1px solid #e0e0e0', mr: 1, borderRadius: 1 }} />
            <Typography variant="body2">Ghế trống</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#f48fb1', mr: 1, borderRadius: 1 }} />
            <Typography variant="body2">Đã chọn</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#bdbdbd', mr: 1, borderRadius: 1 }} />
            <Typography variant="body2">Đã đặt</Typography>
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
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#f48fb1', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <EventSeat sx={{ mr: 1 }} />
          <Typography variant="h6">
            Sơ đồ ghế - {seatDialogTrip?.busName}
          </Typography>
        </Box>
        <IconButton onClick={handleCloseSeatDialog} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        {seatDialogTrip && (
          <Box>
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fce4ec', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Thông tin chuyến xe
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="body2">
                    <strong>Tuyến:</strong> {searchData.from} → {searchData.to}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Khởi hành:</strong> {new Date(seatDialogTrip.timeStart).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
            
            {/* Non-interactive seat diagram for preview */}
            {renderSeatDiagram(seats, false)}
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
            bgcolor: '#f48fb1',
            '&:hover': { bgcolor: '#e91e63' }
          }}
        >
          Chọn chuyến này
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Custom loading component
  const renderLoading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', my: 4 }}>
      <Box sx={{ position: 'relative', width: 100, height: 100 }}>
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: '#f48fb1',
            opacity: 0.7,
          }}
        />
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <DirectionsBus sx={{ color: 'white', fontSize: 40 }} />
        </motion.div>
      </Box>
      <Typography variant="h6" sx={{ mt: 3, color: '#f48fb1', fontWeight: 'bold' }}>
        Đang tải dữ liệu...
      </Typography>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBack />}
              sx={{ 
                mb: { xs: 2, sm: 0 },
                mr: 2,
                color: '#f48fb1',
                '&:hover': {
                  bgcolor: 'rgba(244, 143, 177, 0.08)'
                }
              }}
            >
              Trang chủ
            </Button>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
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
              display: { xs: 'none', sm: 'block' },
              mr: 1.5,
              borderRadius: 1,
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
            }}
          />
        </Box>
      </motion.div>

      {completed ? (
        renderBookingSuccess()
      ) : (
        <>
          <Box sx={{ width: '100%', mb: 4 }}>
            <Stepper activeStep={activeStep} 
              alternativeLabel={!isMobile}
              orientation={isMobile ? "vertical" : "horizontal"}
              sx={{
              '& .MuiStepLabel-root .Mui-completed': {
                color: '#f48fb1', // circle color (COMPLETED)
              },
              '& .MuiStepLabel-root .Mui-active': {
                color: '#f48fb1', // circle color (ACTIVE)
              },
            }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          
          {getStepContent()}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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
              endIcon={activeStep === steps.length - 1 ? <ShoppingCart /> : <ArrowForward />}
              sx={{ 
                bgcolor: '#f48fb1',
                '&:hover': {
                  bgcolor: '#e91e63'
                }
              }}
            >
              {activeStep === steps.length - 1 ? 'Hoàn tất đặt vé' : 'Tiếp tục'}
            </Button>
          </Box>
        </>
      )}
      
      {/* Seat Dialog */}
      {renderSeatDialog()}
    </Container>
  );
}
