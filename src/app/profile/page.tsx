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
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authService, CustomerProfile } from '@/services/authService';
import { bookingService } from '@/services/bookingService';
import { DirectionsBus, EventSeat, Schedule, MonetizationOn } from '@mui/icons-material';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(false);
  const [ticketsError, setTicketsError] = useState<string>('');
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      if (!userData || !userData.id) {
        router.push('/login-template');
        return;
      }

      // Load profile from API
      const profileData = await authService.getCustomerProfile(userData.id);
      setProfile(profileData);
      // Load ticket history after profile
      await loadTickets();
    } catch (err: any) {
      console.error('Profile load error:', err);
      setError(err?.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      setTicketsError('');
      const data = await bookingService.getCustomerTickets();
      // Ensure array
      const list = Array.isArray(data) ? data : (data?.tickets || []);
      setTickets(list);
    } catch (err: any) {
      console.error('Load tickets error:', err);
      setTicketsError(err?.message || 'Không thể tải lịch sử vé');
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
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
            <Grid container spacing={4}>
              {/* Profile Overview Card - Full Width */}
              <Grid item xs={12}>
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
                      <Grid container spacing={4} alignItems="center">
                        {/* Avatar Section */}
                        <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
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
                        </Grid>

                        {/* Profile Info */}
                        <Grid item xs={12} md={6}>
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

                            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
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
                        </Grid>

                        {/* Action Buttons */}
                        <Grid item xs={12} md={3}>
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
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Personal Information */}
              <Grid item xs={12} md={6}>
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
              </Grid>

              {/* Ticket History */}
              <Grid item xs={12} md={6}>
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
                      }}>
                        <DirectionsBus sx={{ fontSize: '1.8rem' }} />
                        Lịch sử đặt vé
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
                            {tickets.map((t, idx) => (
                              <motion.div
                                key={t.id || idx}
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
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 700,
                                      color: 'text.primary',
                                      mb: 0.5
                                    }}>
                                      {t.fromLocation || t.from || '-'} → {t.endLocation || t.to || '-'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      fontFamily: 'monospace' 
                                    }}>
                                      #{t.ticketCode || t.code || '-'}
                                    </Typography>
                                  </Box>
                                  
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={6}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Schedule sx={{ color: '#f48fb1', fontSize: '1.1rem' }} />
                                        <Typography variant="body2">
                                          {t.timeStart ? new Date(t.timeStart).toLocaleDateString('vi-VN') : '-'}
                                        </Typography>
                                      </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <EventSeat sx={{ color: '#f48fb1', fontSize: '1.1rem' }} />
                                        <Typography variant="body2">
                                          {(t.seats && t.seats.length) ? t.seats.join(', ') : (t.seatNumbers || '-')}
                                        </Typography>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                  
                                  <Box sx={{ 
                                    mt: 2, 
                                    pt: 2, 
                                    borderTop: '1px solid rgba(244, 143, 177, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <Chip
                                      label="Hoàn thành"
                                      size="small"
                                      sx={{
                                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                                        color: '#4caf50',
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                      }}
                                    />
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 700,
                                      color: '#e91e63'
                                    }}>
                                      {typeof t.price === 'number' ? t.price.toLocaleString('vi-VN') + ' đ' : (t.totalPrice || '-')}
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
              </Grid>
            </Grid>
          )}
         </Container>
       </Box>
     </motion.div>
   );
 } 