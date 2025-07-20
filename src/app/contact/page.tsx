'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Send,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  DirectionsBus,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý gửi form ở đây
    console.log('Form Data:', formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const contactInfo = [
    {
      icon: <LocationOn />,
      title: 'Địa chỉ',
      content: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
      details: 'Tầng 5, Tòa nhà XYZ'
    },
    {
      icon: <Phone />,
      title: 'Điện thoại',
      content: '+84 28 1234 5678',
      details: 'Hotline 24/7'
    },
    {
      icon: <Email />,
      title: 'Email',
      content: 'contact@busticket.vn',
      details: 'Phản hồi trong 24h'
    },
    {
      icon: <AccessTime />,
      title: 'Giờ làm việc',
      content: 'Thứ 2 - Chủ nhật',
      details: '06:00 - 22:00'
    },
  ];

  return (
    <Box>
      {/* Navigation Bar */}
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
                    bgcolor: item.href === '/contact' ? 'rgba(255,255,255,0.15)' : 'transparent',
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

      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.9) 0%, rgba(233, 30, 99, 0.9) 100%)',
            color: 'white',
            py: { xs: 8, md: 12 },
            textAlign: 'center',
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
            sx={{
              fontWeight: 'bold',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            Liên hệ với chúng tôi
          </Typography>
          <Typography
            variant="h5"
            sx={{
              opacity: 0.95,
              maxWidth: '700px',
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              lineHeight: 1.4,
            }}
          >
            Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {/* Success Alert */}
        {showSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 4 }}
            onClose={() => setShowSuccess(false)}
          >
            Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: 4,
          }}
        >
          {/* Contact Info */}
          <Box sx={{ flex: { lg: 1 } }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}
            >
              Thông tin liên hệ
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(56, 142, 60, 0.1)',
                    boxShadow: '0 4px 20px rgba(56, 142, 60, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(244, 143, 177, 0.2)',
                      borderColor: 'rgba(244, 143, 177, 0.3)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: '#e91e63',
                        color: 'white',
                        borderRadius: '50%',
                        p: 1.5,
                        minWidth: 'auto',
                        boxShadow: '0 4px 15px rgba(244, 143, 177, 0.3)',
                      }}
                    >
                      {info.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, color: '#e91e63' }}>
                        {info.title}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {info.content}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {info.details}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>

            {/* Social Media */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Kết nối với chúng tôi
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { icon: <Facebook />, color: '#1877f2' },
                  { icon: <Twitter />, color: '#1da1f2' },
                  { icon: <Instagram />, color: '#e4405f' },
                  { icon: <LinkedIn />, color: '#0077b5' },
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    sx={{
                      bgcolor: social.color,
                      color: 'white',
                      '&:hover': {
                        bgcolor: social.color,
                        opacity: 0.8,
                        transform: 'scale(1.1)',
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Contact Form */}
          <Box sx={{ flex: { lg: 1.2 } }}>
            <Card
              sx={{
                p: 4,
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}
              >
                Gửi tin nhắn
              </Typography>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Chủ đề"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />

                  <TextField
                    fullWidth
                    label="Tin nhắn"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    multiline
                    rows={4}
                    variant="outlined"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Send />}
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                      },
                    }}
                  >
                    Gửi tin nhắn
                  </Button>
                </Box>
              </form>
            </Card>
          </Box>
        </Box>

        {/* Map Section */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center', color: 'primary.main' }}
          >
            Vị trí của chúng tôi
          </Typography>
          <Card
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              height: { xs: 300, md: 400 },
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                [Google Maps sẽ được tích hợp tại đây]
              </Typography>
              <Chip
                label="Sắp ra mắt"
                color="primary"
                sx={{ position: 'absolute', top: 16, right: 16 }}
              />
            </Box>
          </Card>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ mt: 8 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center', color: 'primary.main' }}
          >
            Câu hỏi thường gặp
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                question: 'Làm thế nào để đặt vé xe bus?',
                answer: 'Bạn có thể đặt vé trực tuyến qua website của chúng tôi hoặc gọi đến hotline để được hỗ trợ.'
              },
              {
                question: 'Có thể hủy vé sau khi đã đặt không?',
                answer: 'Có, bạn có thể hủy vé trước 2 giờ khởi hành. Phí hủy vé sẽ được áp dụng theo chính sách.'
              },
              {
                question: 'Thanh toán như thế nào?',
                answer: 'Chúng tôi hỗ trợ nhiều hình thức thanh toán: thẻ ATM, thẻ tín dụng, ví điện tử, chuyển khoản.'
              },
              {
                question: 'Có chính sách đổi vé không?',
                answer: 'Có, bạn có thể đổi vé miễn phí một lần trong vòng 24h sau khi đặt (tùy tình trạng chỗ trống).'
              },
            ].map((faq, index) => (
              <Card
                key={index}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 4px 15px rgba(25, 118, 210, 0.1)',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {faq.question}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>
      </Box>
    </Box>
  );
}
