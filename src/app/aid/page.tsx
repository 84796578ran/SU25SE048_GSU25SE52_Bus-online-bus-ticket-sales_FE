'use client';
import { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  DirectionsBus,
  Menu as MenuIcon,
  Close as CloseIcon,
  Security,
  Payment,
  Support,
  LocalOffer,
  CheckCircle,
} from '@mui/icons-material';
import Link from 'next/link';

export default function ServicesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();

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

  const services = [
    {
      title: 'Đặt vé trực tuyến',
      description: 'Đặt vé xe bus nhanh chóng và tiện lợi qua website hoặc ứng dụng di động',
      icon: <DirectionsBus sx={{ fontSize: 48 }} />,
      features: ['Đặt vé 24/7', 'Thanh toán online', 'Xác nhận tức thì', 'E-ticket']
    },
    {
      title: 'Chọn chỗ ngồi',
      description: 'Tự do lựa chọn vị trí ghế ngồi phù hợp với nhu cầu của bạn',
      icon: <CheckCircle sx={{ fontSize: 48 }} />,
      features: ['Sơ đồ ghế trực quan', 'Ghế VIP và thường', 'Ghế cửa sổ/lối đi', 'Giá theo vị trí']
    },
    {
      title: 'Thanh toán đa dạng',
      description: 'Hỗ trợ nhiều phương thức thanh toán an toàn và tiện lợi',
      icon: <Payment sx={{ fontSize: 48 }} />,
      features: ['Thẻ ATM/Visa/Master', 'Ví điện tử', 'Chuyển khoản', 'Thanh toán tại quầy']
    },
    {
      title: 'Hỗ trợ khách hàng',
      description: 'Đội ngũ hỗ trợ chuyên nghiệp sẵn sàng giúp đỡ 24/7',
      icon: <Support sx={{ fontSize: 48 }} />,
      features: ['Hotline 24/7', 'Chat trực tuyến', 'Email hỗ trợ', 'FAQ chi tiết']
    },
    {
      title: 'Ưu đãi và khuyến mãi',
      description: 'Nhiều chương trình ưu đãi hấp dẫn cho khách hàng thân thiết',
      icon: <LocalOffer sx={{ fontSize: 48 }} />,
      features: ['Giảm giá sinh viên', 'Ưu đãi đặt sớm', 'Tích điểm thưởng', 'Khuyến mãi theo mùa']
    },
    {
      title: 'Bảo mật thông tin',
      description: 'Cam kết bảo vệ thông tin cá nhân và giao dịch của khách hàng',
      icon: <Security sx={{ fontSize: 48 }} />,
      features: ['Mã hóa SSL', 'Bảo mật PCI DSS', 'Xác thực 2 lớp', 'Chính sách riêng tư']
    }
  ];

  return (
    <Box>
      {/* Header */}
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
                    bgcolor: item.href === '/aid' ? 'rgba(255,255,255,0.15)' : 'transparent',
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
                    boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
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
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItem 
                  onClick={handleMobileMenuClose}
                  sx={{
                    mx: 2,
                    mb: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    bgcolor: item.href === '/aid' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
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
                      boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
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

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.9) 0%, rgba(233, 30, 99, 0.9) 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
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
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom 
            align="center" 
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              mb: 3,
            }}
          >
            Dịch vụ của chúng tôi
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            align="center" 
            sx={{ 
              opacity: 0.95,
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              lineHeight: 1.4,
            }}
          >
            Trải nghiệm đặt vé xe bus hoàn hảo với đầy đủ tiện ích hiện đại
          </Typography>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 4,
          }}
        >
          {services.map((service) => (
            <Card 
              key={service.title} 
              sx={{ 
                p: 4, 
                height: '100%', 
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(244, 143, 177, 0.1)',
                '&:hover': { 
                  boxShadow: '0 12px 40px rgba(244, 143, 177, 0.15)',
                  transform: 'translateY(-8px)',
                  borderColor: '#e91e63',
                } 
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box 
                  sx={{ 
                    color: '#e91e63', 
                    mb: 2,
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(244, 143, 177, 0.1)',
                    display: 'inline-flex',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {service.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold" color="#c2185b">
                  {service.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {service.description}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {service.features.map((feature) => (
                  <Chip
                    key={feature}
                    label={feature}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(244, 143, 177, 0.1)',
                      color: '#c2185b',
                      border: '1px solid rgba(244, 143, 177, 0.2)',
                      '&:hover': {
                        bgcolor: '#e91e63',
                        color: 'white',
                      }
                    }}
                  />
                ))}
              </Box>
            </Card>
          ))}
        </Box>

        {/* CTA Section */}
        <Paper 
          elevation={0}
          sx={{ 
            textAlign: 'center', 
            mt: 8, 
            p: 6, 
            background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.95) 0%, rgba(233, 30, 99, 0.95) 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            }
          }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            fontWeight="bold"
            sx={{ 
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              mb: 2,
            }}
          >
            Sẵn sàng đặt vé?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 4,
              opacity: 0.95,
              textShadow: '0 1px 5px rgba(0,0,0,0.2)',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Hãy trải nghiệm dịch vụ đặt vé xe bus tuyệt vời của chúng tôi ngay hôm nay
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button 
                variant="contained" 
                size="large" 
                sx={{ 
                  minWidth: 200,
                  bgcolor: 'white',
                  color: '#e91e63',
                  fontWeight: 'bold',
                  py: 1.5,
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    bgcolor: '#f5f5f5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
                  }
                }}
              >
                Đặt vé ngay
              </Button>
            </Link>
            <Link href="/contact" style={{ textDecoration: 'none' }}>
              <Button 
                variant="outlined" 
                size="large" 
                sx={{ 
                  minWidth: 200,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  fontWeight: 'bold',
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Liên hệ tư vấn
              </Button>
            </Link>
          </Stack>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="img"
                src="/images/pic4.png"
                alt="XeTiic Logo"
                sx={{
                  width: 24,
                  height: 24,
                  mr: 1,
                  borderRadius: 1,
                  objectFit: 'contain'
                }}
              />
              <Typography variant="h6" fontWeight="bold">XeTiic</Typography>
            </Box>
            <Typography variant="body2" color="grey.400">
              © 2025 XeTiic. Tất cả quyền được bảo lưu.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
