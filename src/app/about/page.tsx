'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  Avatar,
  Chip,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Security,
  Schedule,
  Star,
  People,
  EmojiEvents,
  Support,
  LocationOn,
} from '@mui/icons-material';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { number: '10+', label: 'Năm kinh nghiệm', icon: <EmojiEvents /> },
    { number: '500K+', label: 'Khách hàng hài lòng', icon: <People /> },
    { number: '50+', label: 'Tuyến đường', icon: <LocationOn /> },
    { number: '99.5%', label: 'Tỷ lệ đúng giờ', icon: <Schedule /> },
  ];

  const values = [
    {
      icon: <Security />,
      title: 'An toàn',
      description: 'Cam kết mang đến hành trình an toàn nhất cho mọi hành khách',
      color: '#4caf50'
    },
    {
      icon: <Schedule />,
      title: 'Đúng giờ',
      description: 'Tôn trọng thời gian của khách hàng với dịch vụ đúng giờ',
      color: '#2196f3'
    },
    {
      icon: <Star />,
      title: 'Chất lượng',
      description: 'Dịch vụ chất lượng cao với đội ngũ nhân viên chuyên nghiệp',
      color: '#ff9800'
    },
    {
      icon: <Support />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ hỗ trợ khách hàng hoạt động 24/7',
      color: '#9c27b0'
    },
  ];

  const team = [
    {
      name: 'Nguyễn Văn A',
      position: 'Tổng Giám Đốc',
      image: '/api/placeholder/150/150',
      description: '15+ năm kinh nghiệm trong ngành vận tải'
    },
    {
      name: 'Trần Thị B',
      position: 'Giám Đốc Vận Hành',
      image: '/api/placeholder/150/150',
      description: 'Chuyên gia về quản lý đội xe và tuyến đường'
    },
    {
      name: 'Lê Văn C',
      position: 'Giám Đốc Công Nghệ',
      image: '/api/placeholder/150/150',
      description: 'Kiến trúc sư hệ thống đặt vé trực tuyến'
    },
    {
      name: 'Phạm Thị D',
      position: 'Giám Đốc Khách Hàng',
      image: '/api/placeholder/150/150',
      description: 'Chuyên gia về trải nghiệm khách hàng'
    },
  ];

  const milestones = [
    { year: '2014', event: 'Thành lập công ty với 5 xe đầu tiên' },
    { year: '2016', event: 'Mở rộng ra 10 tỉnh thành' },
    { year: '2018', event: 'Ra mắt hệ thống đặt vé trực tuyến' },
    { year: '2020', event: 'Đạt 100,000 khách hàng thường xuyên' },
    { year: '2022', event: 'Triển khai xe điện thân thiện môi trường' },
    { year: '2024', event: 'Mở rộng ra toàn quốc với 50+ tuyến đường' },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
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
            </Box>
          </Link>
          
          {/* Desktop Navigation Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexGrow: 1, ml: 2 }}>
            {[
              { label: 'Trang chủ', href: '/' },
              { label: 'Dịch vụ', href: '/aid' },
              { label: 'Liên hệ', href: '/contact' },
              { label: 'Giới thiệu', href: '/about' },
            ].map((item, index) => (
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
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
                    },
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
                  '&:hover': {
                    borderColor: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
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
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
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
            Về chúng tôi
          </Typography>
          <Typography
            variant="h5"
            sx={{
              opacity: 0.95,
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              lineHeight: 1.4,
            }}
          >
            Chúng tôi là công ty vận tải hàng đầu Việt Nam, cam kết mang đến
            những chuyến đi an toàn, thoải mái và đúng giờ cho hàng triệu hành khách
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              label="Đáng tin cậy" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }} 
            />
            <Chip 
              label="Chuyên nghiệp" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }} 
            />
            <Chip 
              label="An toàn" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }} 
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {/* Stats Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 'bold', textAlign: 'center', mb: 6, color: '#f48fb1' }}
          >
            Thành tựu của chúng tôi
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {stats.map((stat, index) => (
              <Card
                key={index}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: '#f48fb1',
                    color: 'white',
                    borderRadius: '50%',
                    p: 2,
                    display: 'inline-flex',
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 'bold', color: '#f48fb1', mb: 1 }}
                >
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Mission & Vision */}
        <Box sx={{ mb: 8 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 4,
            }}
          >
            <Card
              sx={{
                flex: 1,
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', mb: 3, color: '#f48fb1' }}
              >
                Sứ mệnh
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                Chúng tôi cam kết mang đến dịch vụ vận tải chất lượng cao, 
                kết nối mọi người với những điểm đến yêu thích một cách an toàn, 
                thoải mái và tiện lợi. Chúng tôi không ngừng đổi mới và cải tiến 
                để phục vụ khách hàng tốt nhất.
              </Typography>
            </Card>
            <Card
              sx={{
                flex: 1,
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 'bold', mb: 3, color: '#f48fb1' }}
              >
                Tầm nhìn
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                Trở thành công ty vận tải hàng đầu Đông Nam Á, được khách hàng 
                tin tưởng và lựa chọn hàng đầu. Chúng tôi hướng đến việc ứng dụng 
                công nghệ hiện đại và phương tiện thân thiện với môi trường.
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* Core Values */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 'bold', textAlign: 'center', mb: 6, color: '#f48fb1' }}
          >
            Giá trị cốt lõi
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
              gap: 3,
            }}
          >
            {values.map((value, index) => (
              <Card
                key={index}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  border: '2px solid transparent',
                  '&:hover': {
                    borderColor: value.color,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 30px ${value.color}20`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                  <Box
                    sx={{
                      bgcolor: value.color,
                      color: 'white',
                      borderRadius: '50%',
                      p: 2,
                      minWidth: 'auto',
                    }}
                  >
                    {value.icon}
                  </Box>
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 'bold', mb: 1, color: value.color }}
                    >
                      {value.title}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      {value.description}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Timeline */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 'bold', textAlign: 'center', mb: 6, color: '#f48fb1' }}
          >
            Hành trình phát triển
          </Typography>
          <Box sx={{ position: 'relative' }}>
            {milestones.map((milestone, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 4,
                  position: 'relative',
                  '&::before': index < milestones.length - 1 ? {
                    content: '""',
                    position: 'absolute',
                    left: 50,
                    top: 60,
                    width: 2,
                    height: 60,
                    bgcolor: 'primary.main',
                    opacity: 0.3,
                  } : {},
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 100,
                    height: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {milestone.year}
                </Box>
                <Card
                  sx={{
                    ml: 3,
                    p: 3,
                    flex: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {milestone.event}
                  </Typography>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Team Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 'bold', textAlign: 'center', mb: 6, color: '#f48fb1' }}
          >
            Đội ngũ lãnh đạo
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {team.map((member, index) => (
              <Card
                key={index}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {member.name.charAt(0)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {member.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  {member.position}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Certifications */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 'bold', textAlign: 'center', mb: 6, color: 'primary.main' }}
          >
            Chứng nhận & Giải thưởng
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
              { title: 'ISO 9001:2015', subtitle: 'Hệ thống quản lý chất lượng' },
              { title: 'Top 10', subtitle: 'Doanh nghiệp vận tải uy tín 2024' },
              { title: '5 sao', subtitle: 'Đánh giá dịch vụ khách hàng' },
            ].map((cert, index) => (
              <Card
                key={index}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)',
                }}
              >
                <EmojiEvents sx={{ fontSize: 60, color: '#f57c00', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {cert.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {cert.subtitle}
                </Typography>
              </Card>
            ))}
          </Box>
        </Box>

        {/* CTA Section */}
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Sẵn sàng cho chuyến đi tiếp theo?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Đặt vé ngay hôm nay và trải nghiệm dịch vụ tuyệt vời của chúng tôi
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Đặt vé ngay
          </Button>
        </Card>
      </Container>
    </Box>
  );
}
