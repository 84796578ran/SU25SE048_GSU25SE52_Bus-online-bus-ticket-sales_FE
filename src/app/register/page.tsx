'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  TextField,
  Button,
  Link as MuiLink,
  Divider,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Alert,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Stack,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  DirectionsBus,
  Menu as MenuIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Email,
  Lock,
  Person,
  Phone,
  CalendarToday,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { label: 'Trang chủ', href: '/' },
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!registerData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!registerData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!registerData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(registerData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!registerData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (registerData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!registerData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!registerData.agreeTerms) {
      newErrors.agreeTerms = 'Vui lòng đồng ý với điều khoản sử dụng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make actual API call
      console.log('Register data:', registerData);
      
      setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      
      // Reset form after success
      setTimeout(() => {
        window.location.href = '/login-template';
      }, 2000);
      
    } catch (err) {
      setErrors({ general: 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Register with ${provider}`);
    // Implement social registration logic here
  };

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.95) 0%, rgba(27, 94, 32, 0.95) 50%, rgba(102, 187, 106, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 }, px: { xs: 2, md: 4 } }}>
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
              <DirectionsBus sx={{ 
                mr: 1.5, 
                fontSize: '2rem',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
              }} />
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #fff 30%, #c8e6c9 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.3rem', sm: '1.5rem' },
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                BusTicket Online
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
          
          {/* Desktop Navigation Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexGrow: 1, ml: 2 }}>
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
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
                      boxShadow: '0 6px 20px rgba(56, 142, 60, 0.25)',
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
            ))}
          </Box>

          {/* Desktop Auth Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
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
                    boxShadow: '0 6px 20px rgba(56, 142, 60, 0.25)',
                  }
                }}
              >
                Đăng nhập
              </Button>
            </Link>
            <Button 
              variant="contained" 
              sx={{ 
                bgcolor: 'white', 
                color: '#388e3c',
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Đăng ký
            </Button>
          </Box>

          {/* Mobile Menu Button */}
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
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{ 
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.95) 0%, rgba(27, 94, 32, 0.95) 100%)',
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
              <DirectionsBus sx={{ 
                mr: 1.5, 
                color: 'white',
                fontSize: '1.8rem',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
              }} />
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
              <Link href="/login-template" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={handleMobileMenuClose}
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
                >
                  Đăng nhập
                </Button>
              </Link>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleMobileMenuClose}
                sx={{ 
                  bgcolor: 'white', 
                  color: '#388e3c',
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                Đăng ký
              </Button>
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

      {/* Main Content */}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.02) 0%, rgba(102, 187, 106, 0.05) 50%, rgba(27, 94, 32, 0.02) 100%)',
          position: 'relative',
          py: 4,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(56, 142, 60, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(102, 187, 106, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(56, 142, 60, 0.01) 60px, rgba(56, 142, 60, 0.01) 120px)',
            animation: 'backgroundMove 30s linear infinite',
            pointerEvents: 'none',
          },
          '@keyframes backgroundMove': {
            '0%': { transform: 'translateX(-120px) translateY(-120px)' },
            '100%': { transform: 'translateX(0px) translateY(0px)' },
          }
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Card
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
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
                height: '4px',
                background: 'linear-gradient(90deg, #388e3c, #66bb6a, #388e3c)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 3s ease-in-out infinite',
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '-200% 0' },
                  '100%': { backgroundPosition: '200% 0' },
                }
              }
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Box sx={{ 
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.1) 0%, rgba(102, 187, 106, 0.15) 100%)',
                border: '2px solid rgba(56, 142, 60, 0.1)',
                mb: 3,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #388e3c, #66bb6a)',
                  zIndex: -1,
                  opacity: 0.1,
                  animation: 'pulse 2s ease-in-out infinite',
                },
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', opacity: 0.1 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.2 },
                  '100%': { transform: 'scale(1)', opacity: 0.1 },
                }
              }}>
                <DirectionsBus sx={{ 
                  fontSize: 48, 
                  color: '#388e3c',
                  filter: 'drop-shadow(0 2px 8px rgba(56, 142, 60, 0.3))'
                }} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2, 
                  background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 20px rgba(56, 142, 60, 0.1)',
                }}
              >
                Đăng ký tài khoản
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 400,
                  opacity: 0.8,
                  fontSize: '1.1rem',
                  lineHeight: 1.5,
                }}
              >
                Tạo tài khoản mới để trải nghiệm
                <br />
                dịch vụ đặt vé xe bus tuyệt vời
              </Typography>
            </Box>

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {/* General Error Alert */}
            {errors.general && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.general}
              </Alert>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                {/* Full Name */}
                <TextField
                  fullWidth
                  label="Họ và tên"
                  name="fullName"
                  value={registerData.fullName}
                  onChange={handleInputChange}
                  required
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: '#388e3c' }} />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Nhập họ và tên đầy đủ"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(56, 142, 60, 0.02)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(56, 142, 60, 0.04)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#388e3c',
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(56, 142, 60, 0.06)',
                        boxShadow: '0 0 0 3px rgba(56, 142, 60, 0.1)',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                    }
                  }}
                />

                {/* Email & Phone */}
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={registerData.email}
                    onChange={handleInputChange}
                    required
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#388e3c' }} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="example@email.com"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(56, 142, 60, 0.02)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(56, 142, 60, 0.04)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#388e3c',
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(56, 142, 60, 0.06)',
                          boxShadow: '0 0 0 3px rgba(56, 142, 60, 0.1)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={registerData.phone}
                    onChange={handleInputChange}
                    required
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: '#388e3c' }} />
                        </InputAdornment>
                      ),
                    }}
                    placeholder="0901234567"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(56, 142, 60, 0.02)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(56, 142, 60, 0.04)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#388e3c',
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(56, 142, 60, 0.06)',
                          boxShadow: '0 0 0 3px rgba(56, 142, 60, 0.1)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                      }
                    }}
                  />
                </Box>

                {/* Gender & Birth Date */}
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontWeight: 600 }}>Giới tính</InputLabel>
                    <Select
                      name="gender"
                      value={registerData.gender}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, gender: e.target.value }))}
                      label="Giới tính"
                      sx={{
                        borderRadius: 3,
                        backgroundColor: 'rgba(56, 142, 60, 0.02)',
                        '&:hover': {
                          backgroundColor: 'rgba(56, 142, 60, 0.04)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#388e3c',
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(56, 142, 60, 0.06)',
                          boxShadow: '0 0 0 3px rgba(56, 142, 60, 0.1)',
                        }
                      }}
                    >
                      <MenuItem value="male">Nam</MenuItem>
                      <MenuItem value="female">Nữ</MenuItem>
                      <MenuItem value="other">Khác</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Ngày sinh"
                    name="birthDate"
                    type="date"
                    value={registerData.birthDate}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: '#388e3c' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(56, 142, 60, 0.02)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(56, 142, 60, 0.04)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#388e3c',
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: 'rgba(56, 142, 60, 0.06)',
                          boxShadow: '0 0 0 3px rgba(56, 142, 60, 0.1)',
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 600,
                      }
                    }}
                  />
                </Box>

                {/* Password */}
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={handleInputChange}
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#388e3c' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#388e3c' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Ít nhất 6 ký tự"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(56, 142, 60, 0.02)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(56, 142, 60, 0.04)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#388e3c',
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(56, 142, 60, 0.06)',
                        boxShadow: '0 0 0 3px rgba(56, 142, 60, 0.1)',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                    }
                  }}
                />

                {/* Confirm Password */}
                <TextField
                  fullWidth
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={registerData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#388e3c' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ color: '#388e3c' }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Nhập lại mật khẩu"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      backgroundColor: 'rgba(56, 142, 60, 0.02)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(56, 142, 60, 0.04)',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#388e3c',
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'rgba(56, 142, 60, 0.06)',
                        boxShadow: '0 0 0 3px rgba(56, 142, 60, 0.1)',
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 600,
                    }
                  }}
                />

                {/* Terms Agreement */}
                <FormControlLabel
                  control={
                    <Checkbox
                      name="agreeTerms"
                      checked={registerData.agreeTerms}
                      onChange={handleInputChange}
                      sx={{
                        color: '#388e3c',
                        '&.Mui-checked': {
                          color: '#388e3c',
                        }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                      Tôi đồng ý với{' '}
                      <MuiLink 
                        href="#" 
                        sx={{ 
                          color: '#388e3c',
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            textDecoration: 'underline',
                            color: '#2e7d32',
                          }
                        }}
                      >
                        Điều khoản sử dụng
                      </MuiLink>{' '}
                      và{' '}
                      <MuiLink 
                        href="#" 
                        sx={{ 
                          color: '#388e3c',
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            textDecoration: 'underline',
                            color: '#2e7d32',
                          }
                        }}
                      >
                        Chính sách bảo mật
                      </MuiLink>
                    </Typography>
                  }
                  sx={{ alignItems: 'flex-start', mt: 1 }}
                />
                {errors.agreeTerms && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, fontWeight: 500 }}>
                    {errors.agreeTerms}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
                    boxShadow: '0 8px 25px rgba(56, 142, 60, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(56, 142, 60, 0.4)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      transition: 'left 0.5s ease',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                    '&:disabled': {
                      background: 'rgba(56, 142, 60, 0.5)',
                      transform: 'none',
                      boxShadow: '0 4px 15px rgba(56, 142, 60, 0.2)',
                    }
                  }}
                >
                  {isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
                </Button>
              </Stack>
            </form>

            {/* Social Registration */}
            <Box sx={{ mt: 5 }}>
              <Divider sx={{ my: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    px: 2,
                    bgcolor: 'white'
                  }}
                >
                  Hoặc đăng ký với
                </Typography>
              </Divider>

              <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Google />}
                  onClick={() => handleSocialLogin('Google')}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: 'rgba(219, 68, 55, 0.3)',
                    color: '#db4437',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'rgba(219, 68, 55, 0.02)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#db4437',
                      background: 'rgba(219, 68, 55, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(219, 68, 55, 0.2)',
                    },
                  }}
                >
                  Google
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Facebook />}
                  onClick={() => handleSocialLogin('Facebook')}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: 'rgba(59, 89, 152, 0.3)',
                    color: '#3b5998',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'rgba(59, 89, 152, 0.02)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#3b5998',
                      background: 'rgba(59, 89, 152, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(59, 89, 152, 0.2)',
                    },
                  }}
                >
                  Facebook
                </Button>
              </Stack>
            </Box>

            {/* Login Link */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                }}
              >
                Đã có tài khoản?{' '}
                <Link href="/login-template" style={{ textDecoration: 'none' }}>
                  <MuiLink
                    component="span"
                    sx={{ 
                      color: '#388e3c',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#2e7d32',
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Đăng nhập ngay
                  </MuiLink>
                </Link>
              </Typography>
            </Box>
          </Card>
        </Container>
      </Box>
    </Box>
  );
}
