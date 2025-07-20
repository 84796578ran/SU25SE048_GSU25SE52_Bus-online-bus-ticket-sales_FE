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

export default function ProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
    } catch (err: any) {
      console.error('Profile load error:', err);
      setError(err?.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
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
             <Box sx={{ 
               display: 'flex', 
               flexDirection: { xs: 'column', md: 'row' }, 
               gap: 4 
             }}>
               {/* Profile Card */}
               <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
                 <motion.div
                   initial={{ x: -50, opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   transition={{ duration: 0.6, delay: 0.2 }}
                 >
                   <Card sx={{ 
                     borderRadius: 4,
                     background: 'rgba(255, 255, 255, 0.95)',
                     backdropFilter: 'blur(20px)',
                     border: '1px solid rgba(255, 255, 255, 0.3)',
                     boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                     position: 'relative',
                     overflow: 'hidden',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       right: 0,
                       height: '4px',
                       background: 'linear-gradient(90deg, #f48fb1, #e91e63, #f48fb1)',
                     }
                   }}>
                     <CardContent sx={{ p: 4, textAlign: 'center' }}>
                       <motion.div
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                       >
                         <Avatar
                           sx={{
                             width: 120,
                             height: 120,
                             bgcolor: '#f48fb1',
                             fontSize: '3rem',
                             fontWeight: 'bold',
                             mx: 'auto',
                             mb: 3,
                             boxShadow: '0 8px 25px rgba(244, 143, 177, 0.3)',
                             border: '4px solid white',
                           }}
                         >
                           {getAvatarLetter()}
                         </Avatar>
                       </motion.div>

                       <motion.div
                         initial={{ y: 20, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         transition={{ duration: 0.5, delay: 0.6 }}
                       >
                         <Typography variant="h4" sx={{ 
                           fontWeight: 700, 
                           mb: 1,
                           background: 'linear-gradient(45deg, #f48fb1 30%, #e91e63 90%)',
                           backgroundClip: 'text',
                           WebkitBackgroundClip: 'text',
                           WebkitTextFillColor: 'transparent',
                         }}>
                           {profile.fullName}
                         </Typography>

                         <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                           {profile.gmail}
                         </Typography>

                         <Chip
                           icon={<Badge />}
                           label={profile.customerId}
                           sx={{
                             bgcolor: 'rgba(244, 143, 177, 0.1)',
                             color: '#e91e63',
                             fontWeight: 600,
                             mb: 3,
                           }}
                         />

                         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                           <Button
                             variant="outlined"
                             startIcon={<Edit />}
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
                               }
                             }}
                           >
                             Chỉnh sửa profile
                           </Button>
                         </motion.div>
                       </motion.div>
                     </CardContent>
                   </Card>
                 </motion.div>
               </Box>

               {/* Profile Details */}
               <Box sx={{ flex: 1 }}>
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card sx={{ 
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 700, 
                        mb: 3,
                        color: '#e91e63',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                        <AccountCircle />
                        Thông tin cá nhân
                      </Typography>

                      <Stack spacing={3}>
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(244, 143, 177, 0.02)',
                            border: '1px solid rgba(244, 143, 177, 0.1)',
                          }}>
                            <Person sx={{ color: '#f48fb1', fontSize: '1.5rem' }} />
                            <Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                Họ và tên
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {profile.fullName}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(244, 143, 177, 0.02)',
                            border: '1px solid rgba(244, 143, 177, 0.1)',
                          }}>
                            <Email sx={{ color: '#f48fb1', fontSize: '1.5rem' }} />
                            <Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                Email
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {profile.gmail}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(244, 143, 177, 0.02)',
                            border: '1px solid rgba(244, 143, 177, 0.1)',
                          }}>
                            <Phone sx={{ color: '#f48fb1', fontSize: '1.5rem' }} />
                            <Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                Số điện thoại
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {profile.phone || 'Chưa cập nhật'}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.9 }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(244, 143, 177, 0.02)',
                            border: '1px solid rgba(244, 143, 177, 0.1)',
                          }}>
                            <Badge sx={{ color: '#f48fb1', fontSize: '1.5rem' }} />
                            <Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                Giới tính
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {getGenderDisplay()}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>

                        <Divider sx={{ my: 2 }} />

                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 1.0 }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(244, 143, 177, 0.02)',
                            border: '1px solid rgba(244, 143, 177, 0.1)',
                          }}>
                            <Badge sx={{ color: '#f48fb1', fontSize: '1.5rem' }} />
                            <Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                Mã khách hàng
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {profile.customerId}
                              </Typography>
                            </Box>
                          </Box>
                        </motion.div>
                                             </Stack>
                     </CardContent>
                   </Card>
                 </motion.div>
               </Box>
             </Box>
           )}
         </Container>
       </Box>
     </motion.div>
   );
 } 