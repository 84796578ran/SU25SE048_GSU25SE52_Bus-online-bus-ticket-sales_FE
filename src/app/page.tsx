'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
} from '@mui/material';
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
} from '@mui/icons-material';

export default function BusTicketHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tripType, setTripType] = useState('oneWay'); // 'oneWay' or 'roundTrip'
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departureDate: '',
    returnDate: '',
    passengers: 1
  });

  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
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

  // Auto-change slides every 5 seconds (pause when hover)
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [backgroundImages.length, isPaused]);

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
    setSearchData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const handleSearch = () => {
    console.log('Search data:', { tripType, ...searchData });
    // Implement search logic here
  };
  return (
    <Box>
      {/* Header */}
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
          {/* Logo */}
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
            <Link href="/register-template" style={{ textDecoration: 'none' }}>
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
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(56, 142, 60, 0.3)',
                  }
                }}
              >
                Đăng ký
              </Button>
            </Link>
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
                    bgcolor: 'white',
                    color: '#388e3c',
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#f5f5f5',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(56, 142, 60, 0.3)',
                    }
                  }}
                  onClick={handleMobileMenuClose}
                >
                  Đăng ký
                </Button>
              </Link>
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
          </Box>

          {/* Enhanced Search Form */}
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
                    bgcolor: '#388e3c',
                    borderRadius: 2,
                  }
                }}
              >
                Loại chuyến đi
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
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    overflow: 'hidden',
                    ...(tripType === 'oneWay' ? {
                      bgcolor: '#388e3c',
                      color: 'white',
                      boxShadow: '0 8px 25px rgba(56, 142, 60, 0.35), 0 3px 10px rgba(56, 142, 60, 0.2)',
                      transform: 'translateY(-2px)',
                      '&:hover': {
                        bgcolor: '#2e7d32',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 35px rgba(56, 142, 60, 0.4), 0 5px 15px rgba(56, 142, 60, 0.3)',
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
                      bgcolor: '#388e3c',
                      color: 'white',
                      boxShadow: '0 8px 25px rgba(56, 142, 60, 0.35), 0 3px 10px rgba(56, 142, 60, 0.2)',
                      transform: 'translateY(-2px)',
                      '&:hover': {
                        bgcolor: '#2e7d32',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 35px rgba(56, 142, 60, 0.4), 0 5px 15px rgba(56, 142, 60, 0.3)',
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

            {/* Enhanced Search Fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* First Row: From, Swap, To */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 40%', md: '1 1 35%' } }}>
                  <TextField
                    fullWidth
                    label="Điểm đi"
                    variant="outlined"
                    value={searchData.from}
                    onChange={(e) => handleInputChange('from', e.target.value)}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: '#388e3c' }} />,
                    }}
                    placeholder="VD: Hà Nội"
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

                <Box sx={{ 
                  flex: '0 0 auto', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  width: { xs: '100%', sm: 'auto' },
                  order: { xs: 3, sm: 2 }
                }}>
                  <IconButton 
                    color="primary" 
                    onClick={handleSwapLocations}
                    sx={{ 
                      bgcolor: '#388e3c', 
                      color: 'white',
                      width: 56,
                      height: 56,
                      boxShadow: '0 4px 12px rgba(56, 142, 60, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        bgcolor: '#2e7d32',
                        transform: 'rotate(180deg) scale(1.1)',
                        boxShadow: '0 6px 20px rgba(56, 142, 60, 0.4)',
                      }
                    }}
                  >
                    <SwapHoriz sx={{ fontSize: 28 }} />
                  </IconButton>
                </Box>

                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 40%', md: '1 1 35%' }, order: { xs: 2, sm: 3 } }}>
                  <TextField
                    fullWidth
                    label="Điểm đến"
                    variant="outlined"
                    value={searchData.to}
                    onChange={(e) => handleInputChange('to', e.target.value)}
                    InputProps={{
                      startAdornment: <LocationOn sx={{ mr: 1, color: '#388e3c' }} />,
                    }}
                    placeholder="VD: Hồ Chí Minh"
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
              </Box>

              {/* Second Row: Dates, Passengers, Search */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'end' }}>
                {/* Departure Date */}
                <Box sx={{ 
                  flex: { 
                    xs: '1 1 100%', 
                    sm: tripType === 'roundTrip' ? '1 1 45%' : '1 1 32%',
                    md: tripType === 'roundTrip' ? '1 1 22%' : '1 1 30%'
                  }
                }}>
                  <TextField
                    fullWidth
                    label="Ngày đi"
                    type="date"
                    value={searchData.departureDate}
                    onChange={(e) => handleInputChange('departureDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: '#388e3c' }} />,
                    }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
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

                {/* Return Date - Only show when roundTrip */}
                {tripType === 'roundTrip' && (
                  <Box sx={{ 
                    flex: { 
                      xs: '1 1 100%', 
                      sm: '1 1 45%',
                      md: '1 1 22%'
                    }
                  }}>
                    <TextField
                      fullWidth
                      label="Ngày về"
                      type="date"
                      value={searchData.returnDate}
                      onChange={(e) => handleInputChange('returnDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: <CalendarToday sx={{ mr: 1, color: '#388e3c' }} />,
                      }}
                      inputProps={{
                        min: searchData.departureDate || new Date().toISOString().split('T')[0]
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
                )}

                {/* Passengers */}
                <Box sx={{ 
                  flex: { 
                    xs: '1 1 48%', 
                    sm: tripType === 'roundTrip' ? '1 1 30%' : '1 1 32%',
                    md: tripType === 'roundTrip' ? '1 1 22%' : '1 1 30%'
                  }
                }}>
                  <TextField
                    fullWidth
                    label="Số lượng người"
                    select
                    value={searchData.passengers}
                    onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
                    SelectProps={{ native: true }}
                    InputProps={{
                      startAdornment: <People sx={{ mr: 1, color: '#388e3c' }} />,
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
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} người
                      </option>
                    ))}
                  </TextField>
                </Box>

                {/* Search Button */}
                <Box sx={{ 
                  flex: { 
                    xs: '1 1 48%', 
                    sm: tripType === 'roundTrip' ? '1 1 30%' : '1 1 32%',
                    md: tripType === 'roundTrip' ? '1 1 22%' : '1 1 30%'
                  }
                }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<Search />}
                    onClick={handleSearch}
                    sx={{ 
                      height: 56, 
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #388e3c, #66bb6a)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #2e7d32, #388e3c)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(56, 142, 60, 0.3)',
                      },
                    }}
                  >
                    Tìm kiếm
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tuyến đường phổ biến:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[
                  'Hà Nội → TP.HCM',
                  'Hà Nội → Đà Nẵng', 
                  'TP.HCM → Nha Trang',
                  'Hà Nội → Hải Phòng',
                  'TP.HCM → Đà Lạt'
                ].map((route) => (
                  <Chip
                    key={route}
                    label={route}
                    variant="outlined"
                    clickable
                    size="small"
                    onClick={() => {
                      const [from, to] = route.split(' → ');
                      setSearchData(prev => ({ ...prev, from, to }));
                    }}
                    sx={{ 
                      '&:hover': { 
                        bgcolor: '#66bb6a', 
                        color: 'white',
                        borderColor: '#388e3c'
                      } 
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Paper>
          
          {/* Slide Indicators */}
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
              <Box
                key={index}
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
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Features Section */}
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 5, fontWeight: 'bold' }}>
          Tại sao chọn chúng tôi?
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            mb: 8,
            justifyContent: 'center',
          }}
        >
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 280 }}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%', boxShadow: 3 }}>
              <Security color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight="bold">
                An toàn & Tin cậy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hợp tác với các nhà xe uy tín, đảm bảo chất lượng dịch vụ và an toàn cho hành khách
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 280 }}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%', boxShadow: 3 }}>
              <Payment color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Thanh toán dễ dàng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hỗ trợ nhiều phương thức thanh toán: Thẻ ATM, Visa, MasterCard, Ví điện tử
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 30%' }, minWidth: 280 }}>
            <Card sx={{ p: 3, textAlign: 'center', height: '100%', boxShadow: 3 }}>
              <Support color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Hỗ trợ 24/7
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đội ngũ tư vấn chuyên nghiệp, sẵn sàng hỗ trợ khách hàng mọi lúc mọi nơi
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* Popular Routes */}
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 5, fontWeight: 'bold' }}>
          Tuyến đường phổ biến
        </Typography>
        
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
          {[
            { from: 'Hà Nội', to: 'Hồ Chí Minh', price: '450.000đ', time: '26h', rating: 4.8 },
            { from: 'Hà Nội', to: 'Đà Nẵng', price: '280.000đ', time: '14h', rating: 4.7 },
            { from: 'Hồ Chí Minh', to: 'Nha Trang', price: '180.000đ', time: '8h', rating: 4.9 },
            { from: 'Hà Nội', to: 'Hải Phòng', price: '120.000đ', time: '2h', rating: 4.6 },
          ].map((route, index) => (
            <Card key={index} sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" fontWeight="bold">
                  {route.from} → {route.to}
                </Typography>
              </Box>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {route.price}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Schedule sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  {route.time}
                </Typography>
                <Rating value={route.rating} precision={0.1} size="small" readOnly />
              </Box>
            </Card>
          ))}
        </Box>

        {/* Statistics */}
        <Box sx={{ bgcolor: '#388e3c', color: 'white', p: 4, borderRadius: 3, mb: 8 }}>
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
            <Box>
              <Typography variant="h3" fontWeight="bold">1M+</Typography>
              <Typography variant="body1">Khách hàng tin tưởng</Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight="bold">1000+</Typography>
              <Typography variant="body1">Tuyến đường</Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight="bold">500+</Typography>
              <Typography variant="body1">Nhà xe đối tác</Typography>
            </Box>
            <Box>
              <Typography variant="h3" fontWeight="bold">24/7</Typography>
              <Typography variant="body1">Hỗ trợ khách hàng</Typography>
            </Box>
          </Box>
        </Box>

        {/* Customer Reviews */}
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 5, fontWeight: 'bold' }}>
          Khách hàng nói gì về chúng tôi
        </Typography>
        
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
          {[
            { name: 'Nguyễn Văn A', rating: 5, comment: 'Dịch vụ tuyệt vời, đặt vé dễ dàng và xe đúng giờ.', avatar: 'A' },
            { name: 'Trần Thị B', rating: 5, comment: 'Giá cả hợp lý, hỗ trợ khách hàng nhiệt tình.', avatar: 'B' },
            { name: 'Lê Văn C', rating: 4, comment: 'App dễ sử dụng, thanh toán nhanh chóng.', avatar: 'C' },
          ].map((review, index) => (
            <Card key={index} sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: '#388e3c' }}>{review.avatar}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">{review.name}</Typography>
                  <Rating value={review.rating} size="small" readOnly />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                "{review.comment}"
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
            }}
          >
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DirectionsBus sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">BusTicket Online</Typography>
              </Box>
              <Typography variant="body2" color="grey.400">
                Nền tảng đặt vé xe bus trực tuyến hàng đầu Việt Nam
              </Typography>
            </Box>
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
          </Box>
          <Divider sx={{ my: 3, bgcolor: 'grey.700' }} />
          <Typography variant="body2" color="grey.400" align="center">
            © 2025 BusTicket Online. Tất cả quyền được bảo lưu.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
