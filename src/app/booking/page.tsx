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
  useMediaQuery
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
} from '@mui/icons-material';
import Link from 'next/link';

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
}

interface SeatType {
  id: string;
  row: string;
  column: number;
  isBooked: boolean;
  price: number;
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
const steps = ['Tìm chuyến xe', 'Chọn vé/chỗ ngồi', 'Trạm trung chuyển', 'Thanh toán'];

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

// Mock seats data
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
        price: 250000
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

  // Responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get search params from URL
  const searchParams = useSearchParams();

  // API function to fetch trips using search endpoint
  const fetchTrips = async (searchData: SearchDataType): Promise<TripType[]> => {
    try {
      // Build query parameters for the search API
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
      const result = await response.json();
      
      console.log('API Response:', result); // Debug log
      
      // Response structure: { isDirect: true, directTrips: [...], transferTrips: [], tripleTrips: [] }
      let allTrips: TripType[] = [];
      
      if (result) {
        // Combine all trip types with additional metadata
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
  const handleNext = () => {
    if (activeStep === 0 && !selectedTrip) {
      alert('Vui lòng chọn một chuyến xe');
      return;
    }
    
    if (activeStep === 1 && selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế');
      return;
    }
    
    if (activeStep === 2 && !shuttlePoint) {
      alert('Vui lòng chọn điểm đón');
      return;
    }
    
    if (activeStep === 3 && !paymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }
    
    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0);
      
      // If moving to seat selection, generate seats
      if (activeStep === 0) {
        setSeats(generateMockSeats());
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
        return renderShuttlePoints();
      case 3:
        return renderPayment();
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
            {searchData.tripType === 'roundTrip' && (
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
          </Box>
        </Paper>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          Các chuyến xe có sẵn
        </Typography>
        
        {loading ? (
          renderLoading()
        ) : trips.length > 0 ? (
          <Box>
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  sx={{ 
                    mb: 2, 
                    cursor: 'pointer',
                    border: selectedTrip?.id === trip.id ? '2px solid #f48fb1' : '1px solid #e0e0e0',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                  onClick={() => handleSelectTrip(trip)}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Main Trip Info - Compact Layout */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      {/* Time and Route */}
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        {/* Departure Time */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#4caf50',
                            mr: 1
                          }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {new Date(trip.timeStart).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>

                        {/* Duration and Route */}
                        <Box sx={{ 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          mx: 3,
                          position: 'relative'
                        }}>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                            {(() => {
                              const start = new Date(trip.timeStart);
                              const end = new Date(trip.timeEnd);
                              const diffMs = end.getTime() - start.getTime();
                              const hours = Math.floor(diffMs / (1000 * 60 * 60));
                              const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                              return `${hours} giờ${minutes > 0 ? ` ${minutes}p` : ''}`;
                            })()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            ({trip.busName})
                          </Typography>
                          {/* Dotted line */}
                          <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'repeating-linear-gradient(to right, #ddd 0, #ddd 4px, transparent 4px, transparent 8px)',
                            zIndex: -1
                          }} />
                        </Box>

                        {/* Arrival Time */}
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <Box sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: '#f44336',
                            mr: 1
                          }} />
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {new Date(trip.timeEnd).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Seats and Price */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            Ghế • Còn chỗ
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ color: '#f48fb1', fontWeight: 'bold' }}>
                          {formatPrice(trip.price)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Station Names */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchData.fromStation}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchData.toStation}
                      </Typography>
                    </Box>

                    {/* Route Description - Compact */}
                    {trip.routeDescription && (
                      <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(244, 143, 177, 0.05)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: '#f48fb1', fontSize: '0.85rem' }}>
                          Lịch trình:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                          {(() => {
                            const routeText = trip.routeDescription.replace('Lộ trình: ', '');
                            const locations = routeText.split(' - ').map(loc => loc.trim());
                            
                            return locations.map((location, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Box sx={{
                                  px: 1,
                                  py: 0.3,
                                  bgcolor: index === 0 ? '#4caf50' : index === locations.length - 1 ? '#f44336' : '#2196f3',
                                  color: 'white',
                                  borderRadius: 1,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold',
                                  textTransform: 'capitalize'
                                }}>
                                  {location}
                                </Box>
                                {index < locations.length - 1 && (
                                  <Box sx={{ 
                                    width: '12px', 
                                    height: '1px', 
                                    bgcolor: '#ddd', 
                                    mx: 0.3,
                                    position: 'relative',
                                    '&::after': {
                                      content: '""',
                                      position: 'absolute',
                                      right: '-2px',
                                      top: '-1.5px',
                                      width: 0,
                                      height: 0,
                                      borderLeft: '3px solid #ddd',
                                      borderTop: '2px solid transparent',
                                      borderBottom: '2px solid transparent',
                                    }
                                  }} />
                                )}
                              </Box>
                            ));
                          })()}
                        </Box>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" sx={{ fontSize: '0.75rem', py: 0.5, px: 2 }}>
                          Chọn ghế
                        </Button>
                        <Button size="small" variant="outlined" sx={{ fontSize: '0.75rem', py: 0.5, px: 2 }}>
                          Lịch trình
                        </Button>
                        <Button size="small" variant="outlined" sx={{ fontSize: '0.75rem', py: 0.5, px: 2 }}>
                          Chính sách
                        </Button>
                      </Box>
                      
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ 
                          bgcolor: selectedTrip?.id === trip.id ? '#e91e63' : '#f48fb1',
                          color: 'white',
                          fontWeight: 'bold',
                          px: 3,
                          py: 1,
                          '&:hover': {
                            bgcolor: '#e91e63',
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTrip(trip);
                        }}
                      >
                        {selectedTrip?.id === trip.id ? 'Đã chọn' : 'Chọn chuyến'}
                      </Button>
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
              {/* Bus diagram */}
              <Box sx={{ 
                mb: 2,
                p: 2,
                border: '2px solid #f48fb1',
                borderRadius: '40px 40px 8px 8px',
                bgcolor: '#fce4ec',
                width: 'fit-content',
                mx: 'auto'
              }}>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                  Tài xế
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', maxWidth: 400, mx: 'auto', mt: 4 }}>
                {seats.map((seat) => (
                  <Box sx={{ width: '25%', p: 1 }} key={seat.id}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={seat.isBooked}
                      onClick={() => handleSelectSeat(seat)}
                      sx={{
                        bgcolor: selectedSeats.find(s => s.id === seat.id) 
                          ? '#f48fb1' 
                          : seat.isBooked 
                            ? '#bdbdbd' 
                            : 'white',
                        color: selectedSeats.find(s => s.id === seat.id) 
                          ? 'white' 
                          : seat.isBooked 
                            ? 'white' 
                            : '#757575',
                        border: '1px solid #e0e0e0',
                        '&:hover': {
                          bgcolor: seat.isBooked 
                            ? '#bdbdbd' 
                            : 'rgba(244, 143, 177, 0.2)',
                        },
                        height: '50px'
                      }}
                    >
                      {seat.id}
                    </Button>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: 'white', border: '1px solid #e0e0e0', mr: 1 }} />
                  <Typography variant="body2">Ghế trống</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#f48fb1', mr: 1 }} />
                  <Typography variant="body2">Đã chọn</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 20, height: 20, bgcolor: '#bdbdbd', mr: 1 }} />
                  <Typography variant="body2">Đã đặt</Typography>
                </Box>
              </Box>
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

  // Render shuttle points
  const renderShuttlePoints = () => {
    if (!selectedTrip) return null;
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Chọn điểm đón
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { xs: '1', md: '2' } }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#f48fb1' }}>
                Điểm đón có sẵn
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
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Ghế đã chọn:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedSeats.map((seat) => (
                  <Chip 
                    key={seat.id}
                    label={seat.id} 
                    color="primary"
                    sx={{ bgcolor: '#f48fb1' }}
                  />
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Điểm đón:
              </Typography>
              
              {shuttlePoint ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {shuttlePoint.name}
                  </Typography>
                  <Typography variant="body2">{shuttlePoint.address}</Typography>
                  <Typography variant="body2">Giờ đón: {shuttlePoint.time}</Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: '#f48fb1' }}>
                    Phụ phí đưa đón: {formatPrice(shuttlePoint.extraFee)}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa chọn điểm đón
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Giá vé:</Typography>
                <Typography variant="body2">
                  {formatPrice(selectedSeats.length * selectedTrip.price)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Phí đưa đón:</Typography>
                <Typography variant="body2">
                  {formatPrice(shuttlePoint ? shuttlePoint.extraFee : 0)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Phí dịch vụ:</Typography>
                <Typography variant="body2">{formatPrice(10000)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', mt: 2 }}>
                <Typography variant="subtitle1">Tổng tiền:</Typography>
                <Typography variant="subtitle1" sx={{ color: '#f48fb1' }}>
                  {formatPrice(calculateTotalPrice().total)}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render payment
  const renderPayment = () => {
    if (!selectedTrip || !shuttlePoint) return null;
    
    const priceDetails = calculateTotalPrice();
    
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Thanh toán
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { xs: '1', md: '2' } }}>
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
                  <Typography variant="body2">{shuttlePoint.name}</Typography>
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
                    label={seat.id} 
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
    </Container>
  );
}
