'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Stack,
  Divider,
  Chip,
  Alert,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Rating,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Badge,
  Logout,
  Edit,
  Home,
  Settings,
  ArrowBack,
  AccountCircle,
  Save,
  Close,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authService, CustomerProfile as ApiCustomerProfile } from '@/services/authService';
import { bookingService } from '@/services/bookingService';
import ratingService from '@/services/ratingService';
import { DirectionsBus, EventSeat, Schedule, MonetizationOn } from '@mui/icons-material';

// Temporary interfaces for testing
interface CustomerProfile {
  customerId: string;
  fullName: string;
  gmail: string;
  phone?: string;
  gender?: string;
}

// Interface for new ticket structure
interface CustomerTicket {
  id: number;
  ticketId: string;
  reservationId: number;
  customerName: string;
  seatId: number;
  price: number;
  createDate: string;
  fromTripStation: string;
  toTripStation: string;
  status: number; // 0: Active, 3: Cancelled/Completed, etc.
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(false);
  const [ticketsError, setTicketsError] = useState<string>('');
  
  // Edit profile states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editError, setEditError] = useState('');
  
  // Rating states
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<CustomerTicket | null>(null);
  const [ratingScore, setRatingScore] = useState<number | null>(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState('');
  
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Helper functions for ticket processing
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Paid', color: '#4caf50', bgColor: '#e8f5e8' };
      case 2:
        return { label: 'Canceled', color: '#f44336', bgColor: '#ffebee' };
      case 5:
        return { label: 'Completed', color: '#ff9800', bgColor: '#fff3e0' };
      default:
        return { label: 'Không xác định', color: '#757575', bgColor: '#f5f5f5' };
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Group tickets by reservationId for better organization
  const groupTicketsByReservation = (tickets: CustomerTicket[]) => {
    const grouped = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.reservationId]) {
        acc[ticket.reservationId] = [];
      }
      acc[ticket.reservationId].push(ticket);
      return acc;
    }, {} as Record<number, CustomerTicket[]>);
    
    return Object.entries(grouped).map(([reservationId, tickets]) => ({
      reservationId: parseInt(reservationId),
      tickets: tickets.sort((a, b) => new Date(a.createDate).getTime() - new Date(b.createDate).getTime()),
      totalPrice: tickets.reduce((sum, t) => sum + t.price, 0),
      createDate: tickets[0].createDate // Use first ticket's date
    }));
  };

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        router.push('/login-template');
        return;
      }

      // Get user data from localStorage
      const userData = authService.getCurrentUser();
      console.log('🔍 Auth user data from localStorage:', userData);
      
      if (!userData || !userData.id) {
        console.error('❌ No valid user data found in localStorage');
        router.push('/login-template');
        return;
      }

      console.log('🔍 Loading profile for user ID:', userData.id, typeof userData.id);

      // FORCE RELOAD: Always load fresh profile from API, especially for Google login
      console.log('📡 === FORCE LOADING FRESH PROFILE FROM API ===');
      console.log('📡 User ID:', userData.id, 'Type:', typeof userData.id);
      console.log('📡 User data source:', userData);
      
      let profileData;
      
      try {
        // Clear any existing cache first to prevent conflicts
        const userSpecificKey = `user_profile_${userData.id}`;
        localStorage.removeItem(userSpecificKey);
        console.log('🗑️ Cleared existing cache before fresh load');
        
        const apiProfile = await authService.getCustomerProfile(userData.id);
        console.log('📥 === FRESH API PROFILE RESPONSE ===');
        console.log('📥 Full API response:', apiProfile);
        console.log('📥 API fullName:', apiProfile?.fullName);
        console.log('📥 API phone:', apiProfile?.phone);
        console.log('📥 API gmail:', apiProfile?.gmail);
        
        if (!apiProfile) {
          console.warn('⚠️ API returned null/undefined profile, trying fallback to userData');
          // Fallback to userData if API returns null
          profileData = {
            customerId: String(userData.customerId || userData.id),
            fullName: userData.fullName || '',
            gmail: userData.gmail || userData.email || '',
            phone: userData.phone || '',
            gender: userData.gender || ''
          };
          console.log('📱 Using userData fallback:', profileData);
        } else {
          profileData = apiProfile;
        }
        
        // Save fresh data to cache
        localStorage.setItem(userSpecificKey, JSON.stringify(profileData));
        console.log('💾 Saved FRESH profile to cache:', userSpecificKey);
        
      } catch (apiError: any) {
        console.error('❌ CRITICAL: Failed to load profile from API:', apiError);
        console.error('❌ API Error details:', {
          status: apiError?.status,
          message: apiError?.message,
          response: apiError?.response
        });
        
        console.warn('⚠️ API failed, using userData as last resort fallback');
        // Use userData as last resort fallback
        profileData = {
          customerId: String(userData.customerId || userData.id),
          fullName: userData.fullName || '',
          gmail: userData.gmail || userData.email || '',
          phone: userData.phone || '',
          gender: userData.gender || ''
        };
        console.log('📱 Using userData emergency fallback:', profileData);
      }
      
      // Convert to local interface with detailed logging
      console.log('🔄 Converting API profile data to local interface...');
      console.log('📝 profileData.fullName:', profileData?.fullName);
      console.log('📝 profileData.phone:', profileData?.phone);
      console.log('📝 profileData.gmail:', profileData?.gmail);
      
      const localProfile: CustomerProfile = {
        customerId: String(profileData?.customerId || userData.id),
        fullName: profileData?.fullName || '',
        gmail: profileData?.gmail || userData.gmail || '',
        phone: profileData?.phone || '',  // Changed from undefined to empty string
        gender: profileData?.gender || ''
      };
      
      console.log('✅ Final local profile:', localProfile);
      setProfile(localProfile);
      
      // Load ticket history after profile
      await loadTickets();
    } catch (err: any) {
      console.error('Profile load error:', err);
      setError(err?.message || 'Không thể tải thông tin profile');
      
      // If authentication error, redirect to login
      if (err?.status === 401) {
        router.push('/login-template');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      setTicketsError('');
      
      console.log('🎫 Loading customer tickets...');
      
      const data = await bookingService.getCustomerTickets();
      console.log('📥 Tickets data received:', data);
      
      // Ensure array - API might return different structures
      const list = Array.isArray(data) ? data : (data?.tickets || data?.data || []);
      
      console.log('🎫 Processed tickets list:', list);
      setTickets(list);
    } catch (err: any) {
      console.error('Load tickets error:', err);
      setTicketsError(err?.message || 'Không thể tải lịch sử vé');
      
      // Set empty array on error to avoid UI issues
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const forceRefreshProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const userData = authService.getCurrentUser();
      if (!userData || !userData.id) {
        setError('User not authenticated');
        return;
      }

      console.log('🔄 Force refreshing profile and tickets...');
      
      // Clear user-specific cache first
      const userSpecificKey = `user_profile_${userData.id}`;
      localStorage.removeItem(userSpecificKey);
      console.log('🗑️ Cleared cache before refresh:', userSpecificKey);

      // Force reload profile from API
      try {
        const apiProfile = await authService.getCustomerProfile(userData.id);
        console.log('📥 Fresh profile data:', apiProfile);
        
        // Convert to local interface
        const localProfile: CustomerProfile = {
          customerId: String(apiProfile?.customerId || userData.id),
          fullName: apiProfile?.fullName || '',
          gmail: apiProfile?.gmail || userData.gmail || '',
          phone: apiProfile?.phone || undefined,
          gender: apiProfile?.gender || undefined
        };
        
        setProfile(localProfile);
        
        // Save fresh data to cache
        localStorage.setItem(userSpecificKey, JSON.stringify(apiProfile));
        console.log('💾 Saved fresh data to cache');
        
        // Also refresh tickets
        await loadTickets();
        
        console.log('✅ Profile and tickets refreshed successfully');
      } catch (apiError) {
        console.error('❌ Failed to refresh profile:', apiError);
        setError('Không thể làm mới thông tin profile');
      }
    } catch (err: any) {
      console.error('Error in forceRefreshProfile:', err);
      setError('Có lỗi xảy ra khi làm mới thông tin');
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await authService.logout();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Still redirect even if logout API fails
      router.push('/');
    }
  };

  const getAvatarLetter = () => {
    return profile?.fullName?.charAt(0)?.toUpperCase() || 'U';
  };

  const getGenderDisplay = () => {
    if (!profile?.gender) return 'Chưa cập nhật';
    switch (profile.gender.toLowerCase()) {
      case 'male': return 'Nam';
      case 'female': return 'Nữ';
      case 'other': return 'Khác';
      default: return profile.gender;
    }
  };

  const handleEditProfile = () => {
    if (profile) {
      console.log('🔍 Opening edit dialog with profile:', profile);
      console.log('🔍 Profile customerId debug:', {
        value: profile.customerId,
        type: typeof profile.customerId,
        stringValue: String(profile.customerId),
        parseInt: parseInt(String(profile.customerId), 10),
        isNaN: isNaN(parseInt(String(profile.customerId), 10))
      });
      
      setEditFullName(profile.fullName);
      setEditPhone(profile.phone || '');
      setEditError('');
      setEditDialogOpen(true);
    } else {
      console.error('❌ No profile data available for editing');
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditFullName('');
    setEditPhone('');
    setEditError('');
  };

  // Rating functions
  const handleOpenRatingDialog = (ticket: CustomerTicket) => {
    setSelectedTicket(ticket);
    setRatingScore(5);
    setRatingComment('');
    setRatingError('');
    setRatingDialogOpen(true);
  };

  const handleCloseRatingDialog = () => {
    setRatingDialogOpen(false);
    setSelectedTicket(null);
    setRatingScore(5);
    setRatingComment('');
    setRatingError('');
  };

  const handleSubmitRating = async () => {
    if (!selectedTicket || !ratingScore) {
      setRatingError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setRatingLoading(true);
    setRatingError('');

    try {
      // Create rating data
      const ratingData = {
        ticketId: selectedTicket.id,
        score: ratingScore,
        comment: ratingComment.trim() || 'Không có bình luận'
      };

      console.log('📤 Submitting rating:', ratingData);

      // Submit rating via ratingService
      await ratingService.createRating(ratingData);

      console.log('✅ Rating submitted successfully');
      setSuccessMessage('Đánh giá đã được gửi thành công!');
      handleCloseRatingDialog();
      
      // Optionally reload tickets to reflect any changes
      await loadTickets();
    } catch (error) {
      console.error('❌ Error submitting rating:', error);
      setRatingError('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    // Validation
    if (!editFullName.trim()) {
      setEditError('Vui lòng nhập họ tên');
      return;
    }
    
    if (!editPhone.trim()) {
      setEditError('Vui lòng nhập số điện thoại');
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(editPhone.trim())) {
      setEditError('Số điện thoại không hợp lệ (10-11 số)');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      console.log('🔍 === DEBUG UPDATE PROFILE ===');
      console.log('🔍 Profile object:', profile);
      
      // Check localStorage directly for user ID
      const userDataForUpdate = authService.getCurrentUser();
      console.log('🔍 localStorage userData:', userDataForUpdate);
      
      // Use user ID instead of customerId for the API call
      let userId: number;
      if (userDataForUpdate?.id) {
        userId = parseInt(userDataForUpdate.id, 10);
        console.log('🔍 Using userId from localStorage:', userId);
      } else {
        console.error('❌ No valid user ID found in localStorage');
        setEditError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setEditLoading(false);
        return;
      }
      
      console.log('🔍 Final userId:', userId, typeof userId);
      
      if (isNaN(userId) || userId <= 0) {
        console.error('❌ Invalid userId, stopping update');
        setEditError('ID người dùng không hợp lệ. Vui lòng đăng nhập lại.');
        setEditLoading(false);
        return;
      }
      
      console.log('✅ UserId is valid, proceeding with API call');

      console.log('🚀 === CALLING UPDATE API ===');
      console.log('🚀 userId:', userId);
      console.log('🚀 Payload:', {
        fullName: editFullName.trim(),
        phone: editPhone.trim()
      });

      const updatedProfile = await authService.updateCustomerProfile(userId, {
        fullName: editFullName.trim(),
        phone: editPhone.trim()
      });

      console.log('📥 === UPDATE API RESPONSE ===');
      console.log('📥 Updated profile response:', updatedProfile);
      console.log('📥 Response type:', typeof updatedProfile);
      console.log('📥 Response is null/undefined?', updatedProfile === null || updatedProfile === undefined);

      // Since update API might return empty response, let's reload fresh data from get API
      console.log('🔄 Reloading fresh profile data after update...');
      
      try {
        // Force reload profile from API to get latest data
        console.log('🔄 === RELOADING PROFILE FROM API ===');
        console.log('🔄 Calling getCustomerProfile with userId:', userId);
        
        const freshProfile = await authService.getCustomerProfile(userId);
        
        console.log('📥 === FRESH PROFILE RESPONSE ===');
        console.log('📥 Full fresh profile response:', freshProfile);
        console.log('📥 Fresh fullName:', freshProfile?.fullName);
        console.log('📥 Fresh phone:', freshProfile?.phone);
        console.log('📥 Fresh gmail:', freshProfile?.gmail);
        
        // Convert to local interface
        const newProfileData: CustomerProfile = {
          customerId: String(freshProfile?.customerId || userDataForUpdate.id),
          fullName: freshProfile?.fullName || editFullName.trim(),
          gmail: freshProfile?.gmail || profile.gmail || '',
          phone: freshProfile?.phone || editPhone.trim(),
          gender: freshProfile?.gender || profile.gender || ''
        };
        
        console.log('✅ === FINAL PROFILE UPDATE ===');
        console.log('✅ Final updated profile data:', newProfileData);
        console.log('✅ Setting profile state to:', newProfileData);
        console.log('✅ Previous profile state was:', profile);
        
        setProfile(newProfileData);
        
        console.log('✅ Profile state should now be updated!');

        // Update localStorage with fresh data
        const currentUserData = authService.getCurrentUser();
        if (currentUserData) {
          // Update general user_data
          const updatedUserData = {
            ...currentUserData,
            fullName: newProfileData.fullName,
            phone: newProfileData.phone
          };
          
          // Update user-specific profile cache
          const userSpecificKey = `user_profile_${currentUserData.id}`;
          
          if (typeof window !== 'undefined') {
            console.log('💾 === UPDATING LOCALSTORAGE ===');
            console.log('💾 Updating user_data with:', updatedUserData);
            console.log('💾 Updating', userSpecificKey, 'with:', newProfileData);
            
            localStorage.setItem('user_data', JSON.stringify(updatedUserData));
            localStorage.setItem(userSpecificKey, JSON.stringify(newProfileData));
            
            // Verify what was actually saved
            const savedUserData = localStorage.getItem('user_data');
            const savedUserProfile = localStorage.getItem(userSpecificKey);
            
            console.log('💾 ✅ Verified saved user_data:', savedUserData);
            console.log('💾 ✅ Verified saved user profile:', savedUserProfile);
          }
        }
        
      } catch (reloadError) {
        console.warn('⚠️ Failed to reload fresh profile, using fallback data:', reloadError);
        
        // Fallback to using form data if reload fails
        const newProfileData = {
          ...profile,
          fullName: editFullName.trim(),
          phone: editPhone.trim()
        };
        setProfile(newProfileData);
      }

      console.log('🎉 === UPDATE COMPLETED ===');
      console.log('🎉 Setting success message');
      console.log('🎉 Closing edit dialog');
      
      setSuccessMessage('Cập nhật thông tin thành công!');
      handleCloseEditDialog();
      
      console.log('🎉 ✅ All states updated, dialog should close!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setEditError('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      console.log('🔧 === FINALLY BLOCK ===');
      console.log('🔧 Setting editLoading to false');
      setEditLoading(false);
      console.log('🔧 ✅ Finally block completed');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.02) 0%, rgba(244, 143, 177, 0.05) 50%, rgba(244, 143, 177, 0.02) 100%)'
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress 
              size={60} 
              sx={{ color: '#f48fb1', mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: '#f48fb1' }}>
              Đang tải thông tin...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.02) 0%, rgba(244, 143, 177, 0.05) 50%, rgba(244, 143, 177, 0.02) 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(244, 143, 177, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(244, 143, 177, 0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      },
    }}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(244, 143, 177, 0.1)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Container maxWidth="lg" sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <IconButton sx={{ color: '#f48fb1' }}>
                      <ArrowBack />
                    </IconButton>
                  </motion.div>
                </Link>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    component="img"
                    src="/images/pic4.png"
                    alt="XeTiic Logo"
                    sx={{ width: 32, height: 32, borderRadius: 1 }}
                  />
                  <Typography variant="h5" sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(45deg, #f48fb1 30%, #e91e63 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    XeTiic
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      startIcon={<Home />}
                      sx={{ 
                        color: '#f48fb1',
                        '&:hover': { bgcolor: 'rgba(244, 143, 177, 0.08)' }
                      }}
                    >
                      Trang chủ
                    </Button>
                  </motion.div>
                </Link>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    startIcon={<Logout />}
                    onClick={handleLogout}
                    sx={{ 
                      color: '#f48fb1',
                      '&:hover': { bgcolor: 'rgba(244, 143, 177, 0.08)' }
                    }}
                  >
                    Đăng xuất
                  </Button>
                </motion.div>
              </Stack>
            </Box>
          </Container>
        </Paper>
      </motion.div>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          </motion.div>
        )}

        {profile && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Profile Overview Card - Full Width */}
            <Box>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card sx={{ 
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(244, 143, 177, 0.2)',
                  boxShadow: '0 20px 40px rgba(244, 143, 177, 0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: 'linear-gradient(90deg, #f48fb1, #e91e63, #f48fb1)',
                  }
                }}>
                  <CardContent sx={{ p: 5 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: 'center',
                      gap: 4 
                    }}>
                      {/* Avatar Section */}
                      <Box sx={{ 
                        textAlign: 'center',
                        flex: { xs: 'none', md: '0 0 auto' },
                        width: { xs: '100%', md: 'auto' }
                      }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                        >
                          <Avatar
                            sx={{
                              width: 140,
                              height: 140,
                              bgcolor: 'linear-gradient(135deg, #f48fb1, #e91e63)',
                              fontSize: '3.5rem',
                              fontWeight: 'bold',
                              mx: 'auto',
                              mb: 2,
                              boxShadow: '0 15px 35px rgba(244, 143, 177, 0.4)',
                              border: '5px solid white',
                            }}
                          >
                            {getAvatarLetter()}
                          </Avatar>
                        </motion.div>
                      </Box>

                      {/* Profile Info */}
                      <Box sx={{ 
                        flex: 1,
                        textAlign: { xs: 'center', md: 'left' },
                        width: '100%'
                      }}>
                        <motion.div
                          initial={{ x: -30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <Typography variant="h3" sx={{ 
                            fontWeight: 800, 
                            mb: 1,
                            background: 'linear-gradient(45deg, #f48fb1 30%, #e91e63 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}>
                            {profile.fullName}
                          </Typography>

                          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2, fontWeight: 500 }}>
                            {profile.gmail}
                          </Typography>

                          <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            <Chip
                              icon={<Badge />}
                              label={`ID: ${profile.customerId}`}
                              variant="outlined"
                              sx={{
                                borderColor: '#f48fb1',
                                color: '#e91e63',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#f48fb1' }
                              }}
                            />
                            <Chip
                              label={getGenderDisplay()}
                              sx={{
                                bgcolor: 'rgba(244, 143, 177, 0.1)',
                                color: '#e91e63',
                                fontWeight: 600,
                              }}
                            />
                          </Stack>

                          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                            Thành viên từ {new Date().getFullYear()}. Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của XeTiic.
                          </Typography>
                        </motion.div>
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ 
                        flex: { xs: 'none', md: '0 0 auto' },
                        width: { xs: '100%', md: 'auto' },
                        minWidth: { md: '200px' }
                      }}>
                        <motion.div
                          initial={{ x: 30, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          <Stack spacing={2}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                variant="contained"
                                startIcon={<Edit />}
                                fullWidth
                                onClick={handleEditProfile}
                                sx={{
                                  background: 'linear-gradient(135deg, #f48fb1, #e91e63)',
                                  color: 'white',
                                  borderRadius: 3,
                                  py: 1.5,
                                  fontWeight: 600,
                                  boxShadow: '0 8px 20px rgba(244, 143, 177, 0.4)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #e87ca1, #d81b60)',
                                    boxShadow: '0 12px 25px rgba(244, 143, 177, 0.6)',
                                  }
                                }}
                              >
                                Chỉnh sửa thông tin
                              </Button>
                            </motion.div>
                            
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                variant="outlined"
                                startIcon={<Settings />}
                                fullWidth
                                onClick={handleEditProfile}
                                sx={{
                                  borderColor: '#f48fb1',
                                  color: '#f48fb1',
                                  borderRadius: 3,
                                  py: 1.5,
                                  fontWeight: 600,
                                  '&:hover': {
                                    borderColor: '#e91e63',
                                    bgcolor: 'rgba(244, 143, 177, 0.08)',
                                    color: '#e91e63'
                                  }
                                }}
                              >
                                Cài đặt tài khoản
                              </Button>
                              

                            </motion.div>
                          </Stack>
                        </motion.div>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Box>

            {/* Personal Information and Ticket History */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4
            }}>
              {/* Personal Information */}
              <Box sx={{ 
                flex: 1,
                width: { xs: '100%', md: '50%' }
              }}>
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card sx={{ 
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(244, 143, 177, 0.1)',
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        mb: 4,
                        color: '#e91e63',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}>
                        <AccountCircle sx={{ fontSize: '1.8rem' }} />
                        Thông tin chi tiết
                      </Typography>

                      <Stack spacing={3}>
                        {[
                          { icon: Person, label: 'Họ và tên', value: profile.fullName },
                          { icon: Email, label: 'Email', value: profile.gmail },
                          { icon: Phone, label: 'Số điện thoại', value: profile.phone || 'Chưa cập nhật' },
                          { icon: Badge, label: 'Mã khách hàng', value: profile.customerId }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 3,
                              p: 3,
                              borderRadius: 3,
                              bgcolor: 'rgba(244, 143, 177, 0.03)',
                              border: '1px solid rgba(244, 143, 177, 0.08)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: 'rgba(244, 143, 177, 0.06)',
                                border: '1px solid rgba(244, 143, 177, 0.15)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(244, 143, 177, 0.15)'
                              }
                            }}>
                              <Box sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'rgba(244, 143, 177, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <item.icon sx={{ color: '#f48fb1', fontSize: '1.5rem' }} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ 
                                  color: 'text.secondary', 
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  mb: 0.5 
                                }}>
                                  {item.label}
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                  fontWeight: 600,
                                  color: 'text.primary' 
                                }}>
                                  {item.value}
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>

              {/* Ticket History */}
              <Box sx={{ 
                flex: 1,
                width: { xs: '100%', md: '50%' }
              }}>
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Card sx={{
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(244, 143, 177, 0.1)',
                    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        mb: 4, 
                        color: '#e91e63',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        justifyContent: 'space-between'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <DirectionsBus sx={{ fontSize: '1.8rem' }} />
                          Lịch sử đặt vé
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={forceRefreshProfile}
                          disabled={loading || ticketsLoading}
                          sx={{
                            borderColor: '#f48fb1',
                            color: '#f48fb1',
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1.5,
                            '&:hover': {
                              borderColor: '#e91e63',
                              color: '#e91e63'
                            }
                          }}
                        >
                          {loading ? 'Đang tải...' : 'Làm mới'}
                        </Button>
                      </Typography>
              
                      {ticketsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                          <CircularProgress sx={{ color: '#f48fb1' }} />
                        </Box>
                      ) : ticketsError ? (
                        <Alert severity="error" sx={{ borderRadius: 3 }}>
                          {ticketsError}
                        </Alert>
                      ) : tickets.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 8,
                          color: 'text.secondary'
                        }}>
                          <DirectionsBus sx={{ fontSize: '4rem', mb: 2, opacity: 0.3 }} />
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Chưa có chuyến đi nào
                          </Typography>
                          <Typography variant="body2">
                            Hãy đặt vé chuyến đi đầu tiên của bạn!
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                          <Stack spacing={2}>
                            {groupTicketsByReservation(tickets.filter(ticket => [0, 2, 5].includes(ticket.status))).map((reservation, idx) => (
                              <motion.div
                                key={reservation.reservationId}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                              >
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    borderRadius: 3,
                                    border: '1px solid rgba(244, 143, 177, 0.15)',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      borderColor: '#f48fb1',
                                      boxShadow: '0 8px 20px rgba(244, 143, 177, 0.2)',
                                      transform: 'translateY(-2px)'
                                    }
                                  }}
                                >
                                  {/* Reservation Header */}
                                  <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                      <Typography variant="h6" sx={{ 
                                        fontWeight: 700,
                                        color: 'text.primary'
                                      }}>
                                        Đặt vé #{reservation.reservationId}
                                      </Typography>
                                      {/* Get status from first ticket */}
                                      {(() => {
                                        const statusInfo = getStatusInfo(reservation.tickets[0].status);
                                        return (
                                          <Chip
                                            label={statusInfo.label}
                                            size="small"
                                            sx={{
                                              bgcolor: statusInfo.bgColor,
                                              color: statusInfo.color,
                                              fontWeight: 600,
                                              fontSize: '0.75rem'
                                            }}
                                          />
                                        );
                                      })()}
                                    </Box>
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1
                                    }}>
                                      <Schedule sx={{ fontSize: '1rem' }} />
                                      {formatDate(reservation.createDate)}
                                    </Typography>
                                  </Box>

                                  {/* Tickets in this reservation */}
                                  <Stack spacing={1.5}>
                                    {reservation.tickets.map((ticket, ticketIdx) => (
                                      <Box 
                                        key={ticket.id}
                                        sx={{ 
                                          p: 2,
                                          borderRadius: 2,
                                          bgcolor: 'rgba(244, 143, 177, 0.05)',
                                          border: '1px solid rgba(244, 143, 177, 0.1)'
                                        }}
                                      >
                                        <Box sx={{ 
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: 2
                                        }}>
                                          <Box>
                                            <Typography variant="subtitle1" sx={{ 
                                              fontWeight: 600,
                                              color: 'text.primary',
                                              mb: 1
                                            }}>
                                              {ticket.fromTripStation} → {ticket.toTripStation}
                                            </Typography>
                                            <Typography variant="body2" sx={{ 
                                              color: 'text.secondary',
                                              fontFamily: 'monospace',
                                              mb: 1.5
                                            }}>
                                              Vé #{ticket.ticketId}
                                            </Typography>
                                          </Box>
                                          
                                          <Box sx={{ 
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                          }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <EventSeat sx={{ color: '#f48fb1', fontSize: '1.1rem' }} />
                                              <Typography variant="body2">
                                                Ghế {ticket.seatId}
                                              </Typography>
                                            </Stack>
                                          
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <MonetizationOn sx={{ color: '#f48fb1', fontSize: '1.1rem' }} />
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {formatPrice(ticket.price)}
                                              </Typography>
                                            </Stack>
                                          </Box>
                                          
                                          {/* Rating button for completed tickets */}
                                          {ticket.status === 5 && (
                                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                              <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<Star />}
                                                onClick={() => handleOpenRatingDialog(ticket)}
                                                sx={{
                                                  borderColor: '#ff9800',
                                                  color: '#ff9800',
                                                  fontSize: '0.75rem',
                                                  borderRadius: 2,
                                                  '&:hover': {
                                                    borderColor: '#f57c00',
                                                    bgcolor: 'rgba(255, 152, 0, 0.04)'
                                                  }
                                                }}
                                              >
                                                Đánh giá chuyến đi
                                              </Button>
                                            </Box>
                                          )}
                                        </Box>
                                      </Box>
                                    ))}
                                  </Stack>
                                  
                                  {/* Total Price */}
                                  <Box sx={{ 
                                    mt: 2, 
                                    pt: 2, 
                                    borderTop: '1px solid rgba(244, 143, 177, 0.2)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 600,
                                      color: 'text.secondary'
                                    }}>
                                      Tổng cộng ({reservation.tickets.length} vé)
                                    </Typography>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 700,
                                      color: '#e91e63'
                                    }}>
                                      {formatPrice(reservation.totalPrice)}
                                    </Typography>
                                  </Box>
                                </Paper>
                              </motion.div>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Box>
            </Box>
          </Box>
        )}
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          background: 'linear-gradient(45deg, #f48fb1 30%, #e91e63 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit />
            Chỉnh sửa thông tin
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {editError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {editError}
            </Alert>
          )}
          
          <Stack spacing={3}>
            <TextField
              label="Họ và tên"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <Person sx={{ color: '#f48fb1', mr: 1 }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#f48fb1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e91e63',
                  }
                }
              }}
            />
            
            <TextField
              label="Số điện thoại"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <Phone sx={{ color: '#f48fb1', mr: 1 }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#f48fb1',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e91e63',
                  }
                }
              }}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleCloseEditDialog}
            variant="outlined"
            startIcon={<Close />}
            sx={{
              borderColor: '#f48fb1',
              color: '#f48fb1',
              borderRadius: 2,
              '&:hover': {
                borderColor: '#e91e63',
                bgcolor: 'rgba(244, 143, 177, 0.08)',
                color: '#e91e63'
              }
            }}
          >
            Hủy
          </Button>
          
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            startIcon={editLoading ? <CircularProgress size={16} color="inherit" /> : <Save />}
            disabled={editLoading}
            sx={{
              background: 'linear-gradient(135deg, #f48fb1, #e91e63)',
              color: 'white',
              borderRadius: 2,
              minWidth: '120px',
              '&:hover': {
                background: 'linear-gradient(135deg, #e87ca1, #d81b60)',
              },
              '&:disabled': {
                background: 'rgba(244, 143, 177, 0.3)',
              }
            }}
          >
            {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog
        open={ratingDialogOpen}
        onClose={handleCloseRatingDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          background: 'linear-gradient(45deg, #ff9800 30%, #f57c00 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 700,
          fontSize: '1.5rem'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star />
            Đánh giá chuyến đi
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {ratingError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {ratingError}
            </Alert>
          )}
          
          {selectedTicket && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255, 152, 0, 0.05)', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Thông tin vé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTicket.fromTripStation} → {selectedTicket.toTripStation}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ghế {selectedTicket.seatId} • {formatPrice(selectedTicket.price)}
              </Typography>
            </Box>
          )}
          
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Đánh giá tổng thể
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  name="trip-rating"
                  value={ratingScore}
                  onChange={(event, newValue) => {
                    setRatingScore(newValue);
                  }}
                  precision={1}
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: '#ff9800',
                    },
                    '& .MuiRating-iconHover': {
                      color: '#f57c00',
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  ({ratingScore}/5 sao)
                </Typography>
              </Box>
            </Box>
            
            <TextField
              label="Nhận xét (tùy chọn)"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Chia sẻ trải nghiệm của bạn về chuyến đi này..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ff9800',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ff9800',
                  },
                }
              }}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseRatingDialog}
            sx={{ 
              color: 'text.secondary',
              borderRadius: 2,
              px: 3
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmitRating}
            variant="contained"
            disabled={ratingLoading || !ratingScore}
            startIcon={ratingLoading ? <CircularProgress size={16} /> : <Save />}
            sx={{
              background: 'linear-gradient(45deg, #ff9800 30%, #f57c00 90%)',
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(45deg, #f57c00 30%, #ef6c00 90%)',
              },
              '&:disabled': {
                background: '#e0e0e0',
                color: '#9e9e9e',
              }
            }}
          >
            {ratingLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 600
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}