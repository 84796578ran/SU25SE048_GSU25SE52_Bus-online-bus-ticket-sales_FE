'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  TextField,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
  Chip,
  Rating,
  Avatar,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/services/api';
import {
  DirectionsBus,
  Search,
  Schedule,
  LocationOn,
  SwapHoriz,
  CalendarToday,
  People,
  Star,
  Security,
  Payment,
  Support,
  CheckCircle,
  TrendingUp,
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle,
  Logout,
} from '@mui/icons-material';
import { authService } from '@/services/authService';
import ratingService from '@/services/ratingService';
import companyService from '@/services/companyService';

// Types
interface Location {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  timeTransit: number;
  note: string;
  isDeleted: boolean;
}

interface Station {
  id: number;
  stationId: string;
  name: string;
  locationName: string;
  status: number;
  isDeleted: boolean;
}

// Rating interface defined locally to avoid import issues
interface Rating {
  id: number;
  ticketId: number;
  companyId: number;
  customerName: string;
  score: number;
  comment: string;
  createdAt: string;
}

// Company interface defined locally to avoid import issues
interface Company {
  id: number;
  companyId: string;
  name: string;
  numberOfRatings: number;
  averageRating: number;
  numberOfTrips: number;
}

export default function BusTicketHomePage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    }>
      <BusTicketHomePageContent />
    </Suspense>
  );
}

function BusTicketHomePageContent() {
  // Client-side hydration check to prevent Material-UI hydration issues
  const [isClient, setIsClient] = useState(false);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tripType, setTripType] = useState('oneWay'); // 'oneWay' or 'roundTrip'
  const [searchData, setSearchData] = useState<{
    from: Location | null;
    to: Location | null;
    fromStation: Station | null;
    toStation: Station | null;
    departureDate: string;
    returnDate: string;
  }>({
    from: null,
    to: null,
    fromStation: null,
    toStation: null,
    departureDate: '',
    returnDate: ''
  });

  // Locations data from API
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Stations data from API
  const [fromStations, setFromStations] = useState<Station[]>([]);
  const [toStations, setToStations] = useState<Station[]>([]);
  const [loadingFromStations, setLoadingFromStations] = useState(false);
  const [loadingToStations, setLoadingToStations] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });

  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // State for ratings
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  // State for companies
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Framer Motion Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const slideIn = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  // Array of background images for slideshow
  const backgroundImages = [
    {
      backgroundImage: 'url("/images/pic1.jpg")',
      overlay: 'rgba(0, 0, 0, 0.3)',
      title: 'Đặt vé xe bus trực tuyến dễ dàng và thuận tiện',
      subtitle: 'Hệ thống đặt vé hiện đại, an toàn và tiện lợi'
    },
    {
      backgroundImage: 'url("/images/pic2.jpg")',
      overlay: 'rgba(0, 0, 0, 0.3)',
      title: 'Khám phá những hành trình mới lạ và hấp dẫn ',
      subtitle: 'Kết nối mọi miền đất nước với dịch vụ chất lượng cao'
    },
    {
      backgroundImage: 'url("/images/pic3.jpg")',
      overlay: 'rgba(0, 0, 0, 0.3)',
      title: 'Ưu đãi đặc biệt và nhiều sự lựa chọn, linh hoạt',
      subtitle: 'Giá vé tốt nhất, dịch vụ tuyệt vời cho mọi chuyến đi'
    }
  ];


  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch('https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net/api/Location?All=true');
      const result = await response.json();
      if (result.data) {
        setLocations(result.data.filter((location: Location) => !location.isDeleted));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      showNotification('Không thể tải danh sách địa điểm', 'error');
    } finally {
      setLoadingLocations(false);
    }
  };

  // Fetch ratings from API
  const fetchRatings = async () => {
    setRatingsLoading(true);
    try {
      console.log('🌟 Fetching ratings for homepage...');
      const ratingsData = await ratingService.getRecentRatings(6); // Get 6 most recent ratings
      
      console.log('🌟 Ratings fetched successfully:', ratingsData);
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      // Don't show error notification for ratings as it's not critical
      // Use fallback empty array (already set in state)
    } finally {
      setRatingsLoading(false);
    }
  };

  // Fetch companies from API
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      console.log('🏢 Fetching companies for homepage...');
      const companiesData = await companyService.getTopRatedCompanies(4); // Get 4 top rated companies
      
      console.log('🏢 Companies fetched successfully:', companiesData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Don't show error notification for companies as it's not critical
      // Use fallback empty array (already set in state)
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Fetch stations from API based on location
  const fetchStations = async (locationId: number, isFromStation: boolean = true) => {
    if (isFromStation) {
      setLoadingFromStations(true);
    } else {
      setLoadingToStations(true);
    }

    try {
      const response = await fetch(`https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net/api/Station/location/${locationId}/stations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // The API returns an array directly, not wrapped in a data property
      if (Array.isArray(result)) {
        const filteredStations = result.filter((station: Station) => 
          !station.isDeleted
          // Note: Removed status filter as we need to check what status values mean in your API
          // You can add back: && station.status === 1 if status 1 means active
        );
        
        if (isFromStation) {
          setFromStations(filteredStations);
          // Reset selected fromStation when location changes
          setSearchData(prev => ({
            ...prev,
            fromStation: null
          }));
        } else {
          setToStations(filteredStations);
          // Reset selected toStation when location changes
          setSearchData(prev => ({
            ...prev,
            toStation: null
          }));
        }
      } else {
        console.warn('Invalid response format:', result);
        showNotification('Dữ liệu trạm không hợp lệ', 'error');
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
      showNotification('Không thể tải danh sách trạm', 'error');
    } finally {
      if (isFromStation) {
        setLoadingFromStations(false);
      } else {
        setLoadingToStations(false);
      }
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    fetchLocations();
    fetchRatings(); // Fetch ratings for customer reviews section
    fetchCompanies(); // Fetch companies for top rated bus companies section
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    // Listen for window focus to refresh auth status
    const handleWindowFocus = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Check for success messages from URL params
  useEffect(() => {
    const loginSuccess = searchParams?.get('loginSuccess');
    const registerSuccess = searchParams?.get('registerSuccess');
    const paymentSuccess = searchParams?.get('paymentSuccess');
    const paymentFailed = searchParams?.get('paymentFailed');
    const message = searchParams?.get('message');

    if (loginSuccess === 'true') {
      setNotification({
        open: true,
        message: message || 'Đăng nhập thành công! Chào mừng bạn đến với XeTiic.',
        type: 'success'
      });
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('loginSuccess');
      newUrl.searchParams.delete('message');
      window.history.replaceState({}, '', newUrl.toString());
    }

    if (registerSuccess === 'true') {
      setNotification({
        open: true,
        message: message || 'Đăng ký tài khoản thành công! Chào mừng bạn đến với XeTiic.',
        type: 'success'
      });
      
      // Clean URL without refreshing page
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('registerSuccess');
      newUrl.searchParams.delete('message');
      window.history.replaceState({}, '', newUrl.toString());
    }

    if (paymentSuccess === 'true') {
      setNotification({
        open: true,
        message: message || 'Thanh toán thành công! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
        type: 'success'
      });
      
      // Clean URL without refreshing page
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('paymentSuccess');
      newUrl.searchParams.delete('message');
      window.history.replaceState({}, '', newUrl.toString());
    }

    if (paymentFailed === 'true') {
      setNotification({
        open: true,
        message: message || 'Thanh toán thất bại hoặc đã bị hủy. Vui lòng thử lại.',
        type: 'error'
      });
      
      // Clean URL without refreshing page
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('paymentFailed');
      newUrl.searchParams.delete('message');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [backgroundImages.length, isPaused]);

  const checkAuthStatus = () => {
    const authenticated = authService.isAuthenticated();
    const userData = authService.getCurrentUser();
    
    setIsAuthenticated(authenticated);
    setUserInfo(userData);

    // Check for recent login to show welcome message
    if (authenticated && userData) {
      const lastLoginCheck = localStorage.getItem('last_login_notification_shown');
      const currentToken = authService.getToken();
      
      if (!lastLoginCheck || lastLoginCheck !== currentToken) {
        // New login detected, but don't show notification if URL params already handled it
        const hasUrlParams = window.location.search.includes('loginSuccess') || window.location.search.includes('registerSuccess');
        
        if (!hasUrlParams) {
          setTimeout(() => {
            showNotification(`Xin chào ${userData.fullName || 'bạn'}! Chào mừng quay trở lại XeTiic.`);
            localStorage.setItem('last_login_notification_shown', currentToken || '');
          }, 1000);
        } else {
          // Mark as shown to prevent duplicate notifications
          localStorage.setItem('last_login_notification_shown', currentToken || '');
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Call authService logout which handles both API call and local storage cleanup
      await authService.logout();
      setIsAuthenticated(false);
      setUserInfo(null);
      
      // Clear notification-related localStorage
      localStorage.removeItem('last_login_notification_shown');
      
      // Show logout notification
      showNotification('Đăng xuất thành công. Hẹn gặp lại!', 'info');
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still update the UI state
      setIsAuthenticated(false);
      setUserInfo(null);
      localStorage.removeItem('last_login_notification_shown');
    }
  };

  const handleCloseNotification = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification(prev => ({ ...prev, open: false }));
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  // Helper function to format rating data for display
  const formatRatingForDisplay = (rating: Rating, index: number) => {
    // Use actual customer name from API
    const name = rating.customerName || 'Khách hàng';
    
    // Generate avatar letter from actual customer name
    const avatar = name.charAt(0).toUpperCase();
    
    // Format the date
    const createdDate = new Date(rating.createdAt);
    const timeAgo = formatTimeAgo(createdDate);
    
    return {
      id: rating.id,
      name,
      rating: rating.score,
      comment: rating.comment || 'Dịch vụ tốt, rất hài lòng!',
      avatar,
      timeAgo,
      originalRating: rating
    };
  };

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Hôm nay';
    } else if (diffInDays === 1) {
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} tuần trước`;
    } else {
      const months = Math.floor(diffInDays / 30);
      return `${months} tháng trước`;
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { label: 'Dịch vụ', href: '/aid' },
    { label: 'Liên hệ', href: '/contact' },
    { label: 'Giới thiệu', href: '/about' },
  ];

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwapLocations = () => {
    // Validate: prevent swapping if both locations are the same
    if (searchData.from && searchData.to && searchData.from.id === searchData.to.id) {
      showNotification('Không thể hoán đổi vị trí khi điểm đi và điểm đến giống nhau', 'error');
      return;
    }
    
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from,
      fromStation: prev.toStation,
      toStation: prev.fromStation
    }));
    // Swap stations arrays as well
    setFromStations(toStations);
    setToStations(fromStations);
  };

  const handleSearch = () => {
    console.log('Search data:', { tripType, ...searchData });

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save search data to localStorage for later use after login
      const searchDataToSave = {
        tripType,
        from: searchData.from,
        to: searchData.to,
        fromStation: searchData.fromStation,
        toStation: searchData.toStation,
        departureDate: searchData.departureDate,
        returnDate: searchData.returnDate,
        timestamp: Date.now()
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingSearchData', JSON.stringify(searchDataToSave));
      }
      
      // Show notification to user
      showNotification('Vui lòng đăng nhập để tiếp tục đặt vé', 'info');
      
      // Redirect to login page with return URL
      setTimeout(() => {
        window.location.href = '/login-template?redirect=/booking';
      }, 1500);
      
      return;
    }

    // Validate required fields before proceeding
    if (!searchData.from || !searchData.to || !searchData.fromStation || !searchData.toStation || !searchData.departureDate || (tripType === 'roundTrip' && !searchData.returnDate)) {
      showNotification('Vui lòng điền đầy đủ thông tin tìm kiếm', 'error');
      return;
    }

    // Convert search data to query params
    const params = new URLSearchParams();
    params.append('from', searchData.from?.name || '');
    params.append('fromId', searchData.from?.id?.toString() || '');
    params.append('to', searchData.to?.name || '');
    params.append('toId', searchData.to?.id?.toString() || '');
    params.append('fromStation', searchData.fromStation?.name || '');
    params.append('fromStationId', searchData.fromStation?.id?.toString() || '');
    params.append('toStation', searchData.toStation?.name || '');
    params.append('toStationId', searchData.toStation?.id?.toString() || '');
    
    // Convert date to ISO format for API (YYYY-MM-DD format)
    if (searchData.departureDate) {
      const departureDate = new Date(searchData.departureDate);
      const isoDate = departureDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      params.append('departureDate', isoDate);
    }
    
    params.append('tripType', tripType);

    if (tripType === 'roundTrip' && searchData.returnDate) {
      const returnDate = new Date(searchData.returnDate);
      const isoReturnDate = returnDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      params.append('returnDate', isoReturnDate);
    }

    // Navigate to search results page with query params
    window.location.href = `/booking?${params.toString()}`;
  };

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during server-side rendering to prevent hydration mismatch
  if (!isClient) {
    return (
      <>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              border: '6px solid #f3f3f3',
              borderTop: '6px solid #f48fb1',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <p style={{ color: '#f48fb1', fontSize: '18px' }}>Đang tải...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.95) 0%, rgba(233, 30, 99, 0.95) 50%, rgba(244, 143, 177, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { xs: 2, md: 4 } }}>
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  mr: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  }
                }}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Box
                      component="img"
                      src="/images/pic4.png"
                      alt="XeTiic Logo"
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1.5,
                        borderRadius: 1,
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                      }}
                    />
                  </motion.div>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(45deg, #fff 30%, #fce4ec 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      letterSpacing: '-0.5px',
                      fontSize: { xs: '1.3rem', sm: '1.5rem' },
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    XeTiic
                  </Typography>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      fontSize: '1.1rem',
                      display: { xs: 'block', sm: 'none' }
                    }}
                  >
                    BusTicket
                  </Typography>
                </Box>
              </Link>
            </motion.div>

            {/* Desktop Navigation Menu */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 2 }}>
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={item.href} style={{ textDecoration: 'none' }}>
                      <Button
                        color="inherit"
                        sx={{
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 500,
                          px: 3,
                          py: 1.5,
                          borderRadius: 3,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.15)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                            transition: 'left 0.5s ease',
                          },
                          '&:hover::before': {
                            left: '100%',
                          }
                        }}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  </motion.div>
                ))}
              </Box>
            </motion.div>

            {/* Spacer to push auth buttons to the right */}
            <Box sx={{ flexGrow: 1 }} />

            {/* Desktop Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
                {isAuthenticated ? (
                  // Show profile and logout when authenticated
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/profile" style={{ textDecoration: 'none' }}>
                        <Button
                          startIcon={<AccountCircle />}
                          sx={{
                            color: 'white',
                            borderRadius: 3,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            backdropFilter: 'blur(10px)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.2)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
                            }
                          }}
                        >
                          {userInfo?.fullName || 'Profile'}
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        startIcon={<Logout />}
                        onClick={handleLogout}
                        sx={{
                          color: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: 3,
                          px: 3,
                          py: 1,
                          fontWeight: 600,
                          textTransform: 'none',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: 'white',
                            background: 'rgba(255, 255, 255, 0.1)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
                          }
                        }}
                      >
                        Đăng xuất
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  // Show login and register when not authenticated
                  <>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/login-template" style={{ textDecoration: 'none' }}>
                        <Button
                          variant="outlined"
                          sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: 3,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            textTransform: 'none',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: 'white',
                              background: 'rgba(255, 255, 255, 0.1)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
                            }
                          }}
                        >
                          Đăng nhập
                        </Button>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/register-template" style={{ textDecoration: 'none' }}>
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: '#ff4081',
                            color: 'white',
                            borderRadius: 3,
                            px: 3,
                            py: 1,
                            fontWeight: 700,
                            textTransform: 'none',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#f5f5f5',
                              color: '#ff4081',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(244, 143, 177, 0.3)',
                            }
                          }}
                        >
                          Đăng ký
                        </Button>
                      </Link>
                    </motion.div>
                  </>
                )}
              </Box>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  edge="end"
                  onClick={handleMobileMenuToggle}
                  sx={{
                    ml: 1,
                    p: 1.5,
                    borderRadius: 2,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </motion.div>
          </Toolbar>
        </AppBar>
      </motion.div>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.95) 0%, rgba(233, 30, 99, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
          }
        }}
      >
        <Box sx={{ width: 300, pt: 2, height: '100%' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            pb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src="/images/pic4.png"
                alt="XeTiic Logo"
                sx={{
                  width: 28,
                  height: 28,
                  mr: 1.5,
                  borderRadius: 1,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                BusTicket
              </Typography>
            </Box>
            <IconButton
              onClick={handleMobileMenuClose}
              sx={{
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />

          <List sx={{ pt: 2 }}>
            {menuItems.map((item, index) => (
              <Link key={item.label} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItem
                  onClick={handleMobileMenuClose}
                  sx={{
                    mx: 2,
                    mb: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateX(8px)',
                    }
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: 'white',
                      fontSize: '1.1rem',
                    }}
                  />
                </ListItem>
              </Link>
            ))}
          </List>

          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.12)' }} />

          <Box sx={{ px: 3, pb: 3 }}>
            <Stack spacing={2}>
              {isAuthenticated ? (
                // Show profile and logout when authenticated
                <>
                  <Link href="/profile" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AccountCircle />}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
                        }
                      }}
                      onClick={handleMobileMenuClose}
                    >
                      {userInfo?.fullName || 'Profile'}
                    </Button>
                  </Link>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Logout />}
                    onClick={() => {
                      handleLogout();
                      handleMobileMenuClose();
                    }}
                    sx={{
                      bgcolor: '#ff4081',
                      color: 'white',
                      borderRadius: 3,
                      py: 1.5,
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#e91e63',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(244, 143, 177, 0.3)',
                      }
                    }}
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                // Show login and register when not authenticated
                <>
                  <Link href="/login-template" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(56, 142, 60, 0.25)',
                        }
                      }}
                      onClick={handleMobileMenuClose}
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register-template" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: '#ff4081',
                        color: 'white',
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 700,
                        textTransform: 'none',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#f5f5f5',
                          color: '#ff4081',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(244, 143, 177, 0.3)',
                        }
                      }}
                      onClick={handleMobileMenuClose}
                    >
                      Đăng ký
                    </Button>
                  </Link>
                </>
              )}
            </Stack>
          </Box>

          {/* Background decoration */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 100,
            height: 100,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        </Box>
      </Drawer>

      {/* Hero Section with Enhanced Search Trip Background & Slideshow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Box
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          sx={{
            backgroundImage: backgroundImages[currentSlide].backgroundImage,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: { xs: 'scroll', md: 'fixed' }, // Fixed cho desktop, scroll cho mobile
            color: 'white',
            py: { xs: 8, md: 12 },
            position: 'relative',
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            transition: 'all 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
            // Overlay để đảm bảo text đọc được
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: backgroundImages[currentSlide].overlay,
              pointerEvents: 'none',
              transition: 'background-color 1.5s ease',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
              animation: 'backgroundMove 20s linear infinite',
              pointerEvents: 'none',
              zIndex: 1,
            },
            '@keyframes backgroundMove': {
              '0%': { transform: 'translateX(-50px) translateY(-50px)' },
              '100%': { transform: 'translateX(0px) translateY(0px)' },
            }
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.8 }}
                >
                  <Typography
                    variant="h1"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem', lg: '4.5rem' },
                      fontWeight: 800,
                      fontFamily: 'var(--font-playfair-display), serif',
                      textShadow: '0 4px 20px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.5)',
                      mb: 3,
                      color: 'white',
                      transition: 'all 1.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      opacity: 1,
                      transform: 'translateY(0)',
                      position: 'relative',
                      zIndex: 2,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {backgroundImages[currentSlide].title}
                  </Typography>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' },
                      fontWeight: 400,
                      opacity: 0.95,
                      textShadow: '0 2px 15px rgba(0,0,0,0.7), 0 1px 5px rgba(0,0,0,0.5)',
                      maxWidth: '700px',
                      mx: 'auto',
                      lineHeight: 1.4,
                      letterSpacing: '0.5px',
                      transition: 'all 1.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      transform: 'translateY(0)',
                      color: 'white',
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    {backgroundImages[currentSlide].subtitle}
                  </Typography>
                </motion.div>
              </AnimatePresence>
            </Box>            {/* Enhanced Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Paper
                elevation={24}
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  borderRadius: 4,
                  maxWidth: 1000,
                  mx: 'auto',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 25px 50px rgba(0, 0, 0, 0.15),
                    0 0 0 1px rgba(255, 255, 255, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s ease-in-out infinite',
                    '@keyframes shimmer': {
                      '0%': { backgroundPosition: '-200% 0' },
                      '100%': { backgroundPosition: '200% 0' },
                    }
                  }
                }}
              >
                {/* Enhanced Trip Type Selector */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Box sx={{ mb: 5, textAlign: 'center' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        color: 'text.primary',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 40,
                          height: 3,
                          bgcolor: '#f48fb1',
                          borderRadius: 2,
                        }
                      }}
                    >
                      Chọn chuyến đi
                    </Typography>
                    <Box sx={{
                      display: 'inline-flex',
                      bgcolor: 'grey.50',
                      borderRadius: 3,
                      p: 0.8,
                      position: 'relative',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
                      gap: 1.5, // Thêm khoảng cách giữa 2 nút
                    }}>
                      <Button
                        variant={tripType === 'oneWay' ? 'contained' : 'text'}
                        onClick={() => setTripType('oneWay')}
                        sx={{
                          px: { xs: 4, md: 6 },
                          py: 1.2,
                          borderRadius: 2.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '1rem',
                          minWidth: { xs: 140, md: 170 },
                          width: { xs: 140, md: 170 },
                          whiteSpace: 'nowrap',
                          position: 'relative',
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          overflow: 'hidden',
                          ...(tripType === 'oneWay' ? {
                            bgcolor: '#f48fb1',
                            color: 'white',
                            boxShadow: '0 8px 25px rgba(244, 143, 177, 0.35), 0 3px 10px rgba(244, 143, 177, 0.2)',
                            transform: 'translateY(-2px)',
                            '&:hover': {
                              bgcolor: '#e91e63',
                              transform: 'translateY(-3px)',
                              boxShadow: '0 12px 35px rgba(244, 143, 177, 0.4), 0 5px 15px rgba(244, 143, 177, 0.3)',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                              transition: 'left 0.5s',
                            },
                            '&:hover::before': {
                              left: '100%',
                            }
                          } : {
                            color: 'text.secondary',
                            bgcolor: 'transparent',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              color: 'primary.main',
                              transform: 'translateY(-1px)',
                            }
                          })
                        }}
                      >
                        Một chiều
                      </Button>
                      <Button
                        variant={tripType === 'roundTrip' ? 'contained' : 'text'}
                        onClick={() => setTripType('roundTrip')}
                        sx={{
                          px: { xs: 4, md: 6 },
                          py: 1.2,
                          borderRadius: 2.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '1rem',
                          minWidth: { xs: 140, md: 170 },
                          width: { xs: 140, md: 170 },
                          position: 'relative',
                          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                          overflow: 'hidden',
                          ...(tripType === 'roundTrip' ? {
                            bgcolor: '#f48fb1',
                            color: 'white',
                            boxShadow: '0 8px 25px rgba(244, 143, 177, 0.35), 0 3px 10px rgba(244, 143, 177, 0.2)',
                            transform: 'translateY(-2px)',
                            '&:hover': {
                              bgcolor: '#e91e63',
                              transform: 'translateY(-3px)',
                              boxShadow: '0 12px 35px rgba(244, 143, 177, 0.4), 0 5px 15px rgba(244, 143, 177, 0.3)',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                              transition: 'left 0.5s',
                            },
                            '&:hover::before': {
                              left: '100%',
                            }
                          } : {
                            color: 'text.secondary',
                            bgcolor: 'transparent',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              color: 'primary.main',
                              transform: 'translateY(-1px)',
                            }
                          })
                        }}
                      >
                        Khứ hồi
                      </Button>
                    </Box>
                  </Box>
                </motion.div>                {/* Enhanced Search Fields */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* First Row: Departure and Arrival with Stations */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3, md: 3 }, alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Departure Section */}
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 42%', md: '1 1 38%' } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Autocomplete
                            fullWidth
                            options={locations}
                            getOptionLabel={(option) => option.name}
                            value={searchData.from}
                            onChange={(event, newValue) => {
                              // Validate: prevent selecting same location for both from and to
                              if (newValue && searchData.to && newValue.id === searchData.to.id) {
                                showNotification('Không thể chọn cùng một địa điểm cho điểm đi và điểm đến', 'error');
                                return;
                              }
                              
                              setSearchData(prev => ({
                                ...prev,
                                from: newValue
                              }));
                              // Fetch stations when location is selected
                              if (newValue) {
                                fetchStations(newValue.id, true);
                              } else {
                                setFromStations([]);
                                setSearchData(prev => ({
                                  ...prev,
                                  fromStation: null
                                }));
                              }
                            }}
                            loading={loadingLocations}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Điểm đi"
                                placeholder="VD: Hà Nội"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <LocationOn sx={{ mr: 1, color: '#f48fb1' }} />
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(244, 143, 177, 0.02)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.04)',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#f48fb1',
                                      }
                                    },
                                    '&.Mui-focused': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.06)',
                                      boxShadow: '0 0 0 3px rgba(244, 143, 177, 0.1)',
                                    }
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontWeight: 600,
                                  }
                                }}
                              />
                            )}
                          />
                          <Autocomplete
                            fullWidth
                            options={fromStations}
                            getOptionLabel={(option) => option.name}
                            value={searchData.fromStation}
                            onChange={(event, newValue) => {
                              setSearchData(prev => ({
                                ...prev,
                                fromStation: newValue
                              }));
                            }}
                            loading={loadingFromStations}
                            disabled={!searchData.from}
                            noOptionsText={!searchData.from ? "Vui lòng chọn điểm đi trước" : "Không có trạm nào"}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Trạm đi"
                                placeholder="VD: Bến xe Mỹ Đình"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <DirectionsBus sx={{ mr: 1, color: '#f48fb1' }} />
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(244, 143, 177, 0.02)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.04)',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#f48fb1',
                                      }
                                    },
                                    '&.Mui-focused': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.06)',
                                      boxShadow: '0 0 0 3px rgba(244, 143, 177, 0.1)',
                                    }
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontWeight: 600,
                                  }
                                }}
                              />
                            )}
                          />
                        </Box>
                      </Box>

                      {/* Swap Button */}
                      <Box sx={{
                        flex: '0 0 auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: { xs: '100%', sm: 'auto' },
                        order: { xs: 3, sm: 2 },
                        height: { xs: 'auto', sm: '120px' }
                      }}>
                        <IconButton
                          color="primary"
                          onClick={handleSwapLocations}
                          sx={{
                            bgcolor: '#f48fb1',
                            color: 'white',
                            width: 56,
                            height: 56,
                            boxShadow: '0 4px 12px rgba(244, 143, 177, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#e91e63',
                              transform: 'rotate(180deg) scale(1.1)',
                              boxShadow: '0 6px 20px rgba(244, 143, 177, 0.4)',
                            }
                          }}
                        >
                          <SwapHoriz sx={{ fontSize: 28 }} />
                        </IconButton>
                      </Box>

                      {/* Arrival Section */}
                      <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 42%', md: '1 1 38%' }, order: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <Autocomplete
                            fullWidth
                            options={locations}
                            getOptionLabel={(option) => option.name}
                            value={searchData.to}
                            onChange={(event, newValue) => {
                              // Validate: prevent selecting same location for both from and to
                              if (newValue && searchData.from && newValue.id === searchData.from.id) {
                                showNotification('Không thể chọn cùng một địa điểm cho điểm đi và điểm đến', 'error');
                                return;
                              }
                              
                              setSearchData(prev => ({
                                ...prev,
                                to: newValue
                              }));
                              // Fetch stations when location is selected
                              if (newValue) {
                                fetchStations(newValue.id, false);
                              } else {
                                setToStations([]);
                                setSearchData(prev => ({
                                  ...prev,
                                  toStation: null
                                }));
                              }
                            }}
                            loading={loadingLocations}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Điểm đến"
                                placeholder="VD: Hồ Chí Minh"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <LocationOn sx={{ mr: 1, color: '#f48fb1' }} />
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(244, 143, 177, 0.02)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.04)',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#f48fb1',
                                      }
                                    },
                                    '&.Mui-focused': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.06)',
                                      boxShadow: '0 0 0 3px rgba(244, 143, 177, 0.1)',
                                    }
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontWeight: 600,
                                  }
                                }}
                              />
                            )}
                          />
                          <Autocomplete
                            fullWidth
                            options={toStations}
                            getOptionLabel={(option) => option.name}
                            value={searchData.toStation}
                            onChange={(event, newValue) => {
                              setSearchData(prev => ({
                                ...prev,
                                toStation: newValue
                              }));
                            }}
                            loading={loadingToStations}
                            disabled={!searchData.to}
                            noOptionsText={!searchData.to ? "Vui lòng chọn điểm đến trước" : "Không có trạm nào"}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Trạm đến"
                                placeholder="VD: Bến xe Miền Đông"
                                InputProps={{
                                  ...params.InputProps,
                                  startAdornment: (
                                    <>
                                      <DirectionsBus sx={{ mr: 1, color: '#f48fb1' }} />
                                      {params.InputProps.startAdornment}
                                    </>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(244, 143, 177, 0.02)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.04)',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#f48fb1',
                                      }
                                    },
                                    '&.Mui-focused': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.06)',
                                      boxShadow: '0 0 0 3px rgba(244, 143, 177, 0.1)',
                                    }
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontWeight: 600,
                                  }
                                }}
                              />
                            )}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Second Row: Dates and Search - Improved spacing */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3, md: 4 }, alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Departure Date - Improved layout */}
                      <Box sx={{
                        flex: {
                          xs: '1 1 100%',
                          sm: tripType === 'roundTrip' ? '1 1 45%' : '1 1 40%', // Increased to balance with search button
                          md: tripType === 'roundTrip' ? '1 1 22%' : '1 1 38%'  // Increased for better balance
                        }
                      }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                          <DatePicker
                            enableAccessibleFieldDOMStructure={false}
                            label="Ngày đi"
                            value={searchData.departureDate ? dayjs(searchData.departureDate) : null}
                            onChange={(newValue: dayjs.Dayjs | null) => {
                              const dateValue = newValue ? newValue.format('YYYY-MM-DD') : '';
                              handleInputChange('departureDate', dateValue);
                            }}
                            minDate={dayjs()}
                            format="DD/MM/YYYY"
                            slots={{
                              textField: TextField,
                            }}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                InputProps: {
                                  startAdornment: <CalendarToday sx={{ mr: 1, color: '#f48fb1', fontSize: '1.2rem' }} />,
                                },
                                sx: {
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: 'rgba(244, 143, 177, 0.02)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.04)',
                                      '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#f48fb1',
                                      }
                                    },
                                    '&.Mui-focused': {
                                      backgroundColor: 'rgba(244, 143, 177, 0.06)',
                                      boxShadow: '0 0 0 3px rgba(244, 143, 177, 0.1)',
                                    }
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontWeight: 600,
                                  }
                                }
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Box>

                      {/* Return Date - Only show when roundTrip */}
                      {tripType === 'roundTrip' && (
                        <Box sx={{
                          flex: {
                            xs: '1 1 100%',
                            sm: '1 1 45%',
                            md: '1 1 30%'  // Increased for better balance in roundTrip mode
                          }
                        }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                            <DatePicker
                              enableAccessibleFieldDOMStructure={false}
                              label="Ngày về"
                              value={searchData.returnDate ? dayjs(searchData.returnDate) : null}
                              onChange={(newValue: dayjs.Dayjs | null) => {
                                const dateValue = newValue ? newValue.format('YYYY-MM-DD') : '';
                                handleInputChange('returnDate', dateValue);
                              }}
                              minDate={searchData.departureDate ? dayjs(searchData.departureDate) : dayjs()}
                              format="DD/MM/YYYY"
                              slots={{
                                textField: TextField,
                              }}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  InputProps: {
                                    startAdornment: <CalendarToday sx={{ mr: 1, color: '#f48fb1' }} />,
                                  },
                                  sx: {
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 3,
                                      backgroundColor: 'rgba(244, 143, 177, 0.02)',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        backgroundColor: 'rgba(244, 143, 177, 0.04)',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: '#f48fb1',
                                        }
                                      },
                                      '&.Mui-focused': {
                                        backgroundColor: 'rgba(244, 143, 177, 0.06)',
                                        boxShadow: '0 0 0 3px rgba(244, 143, 177, 0.1)',
                                      }
                                    },
                                    '& .MuiInputLabel-root': {
                                      fontWeight: 600,
                                    }
                                  }
                                }
                              }}
                            />
                          </LocalizationProvider>
                        </Box>
                      )}



                      {/* Search Button - Optimized size */}
                      <Box sx={{
                        flex: {
                          xs: '1 1 48%',
                          sm: tripType === 'roundTrip' ? '1 1 20%' : '1 1 25%', // Reduced width for better proportion
                          md: tripType === 'roundTrip' ? '1 1 15%' : '1 1 22%'  // Reduced width for better proportion
                        }
                      }}>
                        <Button
                          fullWidth
                          variant="contained"
                          size="medium" // Changed from large to medium
                          startIcon={<Search fontSize="small" />} // Reduced icon size
                          onClick={handleSearch}
                          sx={{
                            height: 56,
                            borderRadius: 2,
                            fontSize: '0.95rem', // Slightly smaller font
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #f48fb1, #e91e63)',
                            px: 2, // Reduced horizontal padding
                            '&:hover': {
                              background: 'linear-gradient(45deg, #e91e63, #f48fb1)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(244, 143, 177, 0.3)',
                            },
                          }}
                        >
                          Tìm kiếm
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Nhà xe đánh giá cao nhất:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {(companies.length > 0 ? companies.slice(0, 5) : [
                          { name: 'Phương Trang', averageRating: 4.8 },
                          { name: 'Kumho', averageRating: 4.9 },
                          { name: 'Hà Sơn', averageRating: 4.7 },
                          { name: 'Hoàng Long', averageRating: 4.6 },
                          { name: 'Sao Việt', averageRating: 4.5 }
                        ]).map((company, index) => (
                          <motion.div
                            key={company.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 1.3 + index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Chip
                              icon={<DirectionsBus sx={{ fontSize: '0.9rem' }} />}
                              label={`${company.name} (${company.averageRating || 0}★)`}
                              variant="outlined"
                              clickable
                              size="small"
                              sx={{
                                '&:hover': {
                                  bgcolor: '#e91e63',
                                  color: 'white',
                                  borderColor: '#f48fb1'
                                }
                              }}
                            />
                          </motion.div>
                        ))}
                      </Stack>
                    </Box>
                  </motion.div>
                </motion.div>
              </Paper>
            </motion.div>

            {/* Slide Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  mt: 4,
                  position: 'relative',
                  zIndex: 3
                }}
              >
                {backgroundImages.map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.6 + index * 0.1 }}
                    whileHover={{ scale: currentSlide === index ? 1.4 : 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Box
                      onClick={() => setCurrentSlide(index)}
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: currentSlide === index
                          ? 'rgba(255, 255, 255, 1)'
                          : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.4s ease',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: currentSlide === index
                          ? '0 4px 15px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.2)'
                          : '0 2px 8px rgba(0, 0, 0, 0.2)',
                        transform: currentSlide === index ? 'scale(1.3)' : 'scale(1)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.8)',
                          transform: currentSlide === index ? 'scale(1.4)' : 'scale(1.2)',
                          boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Container>
        </Box>
      </motion.div>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 5, fontWeight: 'bold' }}>
            Tại sao chọn chúng tôi?
          </Typography>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              mb: 8,
              justifyContent: 'center',
            }}
          >
            {[
              {
                icon: Security,
                title: 'An toàn & Tin cậy',
                description: 'Hợp tác với các nhà xe uy tín, đảm bảo chất lượng dịch vụ và an toàn cho hành khách'
              },
              {
                icon: Payment,
                title: 'Thanh toán dễ dàng',
                description: 'Hỗ trợ nhiều phương thức thanh toán: Thẻ ATM, Visa, MasterCard, Ví điện tử'
              },
              {
                icon: Support,
                title: 'Hỗ trợ 24/7',
                description: 'Đội ngũ tư vấn chuyên nghiệp, sẵn sàng hỗ trợ khách hàng mọi lúc mọi nơi'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 280, maxWidth: '350px' }}>
                  <Card sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    boxShadow: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-5px)',
                    }
                  }}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <feature.icon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                    </motion.div>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Card>
                </Box>
              </motion.div>
            ))}
          </Box>
        </motion.div>

        {/* Top Rated Bus Companies */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 5, fontWeight: 'bold' }}>
            Nhà xe đánh giá cao nhất
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 3,
            mb: 8,
          }}
        >
          {companiesLoading ? (
            // Loading state - show 4 skeleton cards
            Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={`loading-${index}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DirectionsBus color="primary" sx={{ mr: 1, fontSize: 28 }} />
                    <Box sx={{ bgcolor: '#e0e0e0', height: 24, borderRadius: 1, width: '60%' }} />
                  </Box>
                  <Box sx={{ bgcolor: '#e0e0e0', height: 16, borderRadius: 1, mb: 1 }} />
                  <Box sx={{ bgcolor: '#e0e0e0', height: 16, borderRadius: 1, width: '80%', mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ bgcolor: '#e0e0e0', height: 16, borderRadius: 1, width: '40%' }} />
                    <Box sx={{ bgcolor: '#e0e0e0', height: 20, borderRadius: 1, width: '30%' }} />
                  </Box>
                </Card>
              </motion.div>
            ))
          ) : companies.length > 0 ? (
            // Show actual companies from API
            companies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Card sx={{
                  p: 3,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-5px)',
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DirectionsBus color="primary" sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {company.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {company.numberOfRatings > 0 
                      ? `Được đánh giá bởi ${company.numberOfRatings} khách hàng`
                      : `${company.numberOfTrips} chuyến xe hoạt động`
                    }
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#f48fb1' }}>
                      {company.numberOfTrips}+ tuyến
                    </Typography>
                    {company.numberOfRatings > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={company.averageRating} precision={0.1} size="small" readOnly />
                        <Typography variant="caption" color="text.secondary">
                          ({company.averageRating.toFixed(1)})
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Chưa có đánh giá
                      </Typography>
                    )}
                  </Box>
                </Card>
              </motion.div>
            ))
          ) : (
            // Fallback when no companies available - show default companies
            [
              { name: 'Phương Trang', routes: '50+ tuyến', description: 'Phục vụ chuyên nghiệp, đội xe mới', rating: 4.8 },
              { name: 'Hà Sơn', routes: '30+ tuyến', description: 'An toàn và đúng giờ', rating: 4.7 },
              { name: 'Kumho', routes: '45+ tuyến', description: 'Dịch vụ 5 sao, xe giường nằm cao cấp', rating: 4.9 },
              { name: 'Hoàng Long', routes: '25+ tuyến', description: 'Chất lượng vượt trội, giá cả hợp lý', rating: 4.6 },
            ].map((company, index) => (
              <motion.div
                key={`fallback-${index}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Card sx={{
                  p: 3,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-5px)',
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DirectionsBus color="primary" sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {company.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {company.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#f48fb1' }}>
                      {company.routes}
                    </Typography>
                    <Rating value={company.rating} precision={0.1} size="medium" readOnly />
                  </Box>
                </Card>
              </motion.div>
            ))
          )}
        </Box>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Box sx={{ bgcolor: '#f48fb1', color: 'white', p: 4, borderRadius: 3, mb: 8 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  md: 'repeat(4, 1fr)',
                },
                gap: 4,
                textAlign: 'center',
              }}
            >
              {[
                { number: '1M+', label: 'Khách hàng tin tưởng' },
                { number: '1000+', label: 'Tuyến đường' },
                { number: '500+', label: 'Nhà xe đối tác' },
                { number: '24/7', label: 'Hỗ trợ khách hàng' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Box>
                    <Typography variant="h3" fontWeight="bold">{stat.number}</Typography>
                    <Typography variant="body1">{stat.label}</Typography>
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </motion.div>

        {/* Customer Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 5, fontWeight: 'bold' }}>
            Khách hàng nói gì về chúng tôi
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {ratingsLoading ? (
            // Loading state - show 3 skeleton cards
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`loading-${index}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: '#e0e0e0' }}>
                      <CircularProgress size={24} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ bgcolor: '#e0e0e0', height: 20, borderRadius: 1, mb: 1 }} />
                      <Box sx={{ bgcolor: '#e0e0e0', height: 16, borderRadius: 1, width: '60%' }} />
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: '#e0e0e0', height: 16, borderRadius: 1, mb: 1 }} />
                  <Box sx={{ bgcolor: '#e0e0e0', height: 16, borderRadius: 1, width: '80%' }} />
                </Card>
              </motion.div>
            ))
          ) : ratings.length > 0 ? (
            // Show actual ratings from API
            ratings.slice(0, 6).map((rating, index) => {
              const formattedReview = formatRatingForDisplay(rating, index);
              return (
                <motion.div
                  key={formattedReview.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <Card sx={{
                    p: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-5px)',
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Avatar sx={{ mr: 2, bgcolor: '#f48fb1' }}>{formattedReview.avatar}</Avatar>
                      </motion.div>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">{formattedReview.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Rating value={formattedReview.rating} size="small" readOnly />
                          <Typography variant="caption" color="text.secondary">
                            {formattedReview.timeAgo}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      "{formattedReview.comment}"
                    </Typography>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            // Fallback when no ratings available - show default reviews
            [
              { name: 'Nguyễn Văn A', rating: 5, comment: 'Dịch vụ tuyệt vời, đặt vé dễ dàng và xe đúng giờ.', avatar: 'A' },
              { name: 'Trần Thị B', rating: 5, comment: 'Giá cả hợp lý, hỗ trợ khách hàng nhiệt tình.', avatar: 'B' },
              { name: 'Lê Văn C', rating: 4, comment: 'App dễ sử dụng, thanh toán nhanh chóng.', avatar: 'C' },
            ].map((review, index) => (
              <motion.div
                key={`fallback-${index}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Card sx={{
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-5px)',
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: '#388e3c' }}>{review.avatar}</Avatar>
                    </motion.div>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{review.name}</Typography>
                      <Rating value={review.rating} size="small" readOnly />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    "{review.comment}"
                  </Typography>
                </Card>
              </motion.div>
            ))
          )}
        </Box>
      </Container>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4, mt: 8 }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' }, maxWidth: '33%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DirectionsBus sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="bold">BusTicket Online</Typography>
                  </Box>
                  <Typography variant="body2" color="grey.400">
                    Nền tảng đặt vé xe bus trực tuyến hàng đầu Việt Nam
                  </Typography>
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                // Removed invalid 'flex' property from style to fix lint error
              >
                <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 67%' } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 25%' } }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Về chúng tôi</Typography>
                      <Typography variant="body2" color="grey.400">Giới thiệu</Typography>
                      <Typography variant="body2" color="grey.400">Điều khoản</Typography>
                      <Typography variant="body2" color="grey.400">Bảo mật</Typography>
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 25%' } }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Hỗ trợ</Typography>
                      <Typography variant="body2" color="grey.400">Trung tâm trợ giúp</Typography>
                      <Typography variant="body2" color="grey.400">Liên hệ</Typography>
                      <Typography variant="body2" color="grey.400">Góp ý</Typography>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            </Box>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Divider sx={{ my: 3, bgcolor: 'grey.700' }} />
              <Typography variant="body2" color="grey.400" align="center">
                © 2025 XeTiic. Tất cả quyền được bảo lưu.
              </Typography>
            </motion.div>
          </Container>
        </Box>
      </motion.div>

      {/* Success/Error Notifications */}
      <AnimatePresence>
        {notification.open && (
          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ 
              mt: 8,
              zIndex: 9999,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.9 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 30,
                duration: 0.4
              }}
            >
              <Alert
                onClose={handleCloseNotification}
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
            </motion.div>
          </Snackbar>
        )}
      </AnimatePresence>
    </Box>
  );
}
