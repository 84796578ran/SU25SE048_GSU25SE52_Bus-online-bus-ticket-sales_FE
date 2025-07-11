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
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  DirectionsBus,
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Email,
  Lock,
  ArrowBack,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginTemplatePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would make actual API call
      console.log('Login data:', loginData);
      
      // On success, redirect to home page
      window.location.href = '/';
      
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.02) 0%, rgba(102, 187, 106, 0.05) 50%, rgba(27, 94, 32, 0.02) 100%)',
        position: 'relative',
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
      }}
    >
      {/* Back to Home Button */}
      <Link href="/" style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, textDecoration: 'none' }}>
        <IconButton
          sx={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 142, 60, 0.2)',
            color: '#388e3c',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'rgba(56, 142, 60, 0.1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(56, 142, 60, 0.25)',
            }
          }}
        >
          <ArrowBack />
        </IconButton>
      </Link>

      {/* Left Side - Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 6 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          {/* Logo and Brand */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            mb: 5,
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              p: 2,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.1) 0%, rgba(102, 187, 106, 0.15) 100%)',
              border: '2px solid rgba(56, 142, 60, 0.1)',
              transition: 'all 0.3s ease',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: 3,
                background: 'linear-gradient(45deg, #388e3c, #66bb6a)',
                zIndex: -1,
                opacity: 0.1,
                animation: 'pulse 2s ease-in-out infinite',
              },
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 0.1 },
                '50%': { transform: 'scale(1.05)', opacity: 0.2 },
                '100%': { transform: 'scale(1)', opacity: 0.1 },
              }
            }}>
              <DirectionsBus sx={{ 
                mr: 2, 
                fontSize: '2.5rem',
                color: '#388e3c',
                filter: 'drop-shadow(0 2px 8px rgba(56, 142, 60, 0.3))'
              }} />
              <Typography 
                variant="h4" 
                component="div" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  fontSize: { xs: '1.8rem', sm: '2.2rem' },
                }}
              >
                BusTicket Online
              </Typography>
            </Box>
          </Box>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 2, 
                background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', sm: '3rem' },
                letterSpacing: '-0.02em',
                textShadow: '0 4px 20px rgba(56, 142, 60, 0.1)',
              }}
            >
              Đăng nhập
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 400,
                opacity: 0.8,
                fontSize: '1.2rem',
                lineHeight: 1.5,
              }}
            >
              Chào mừng bạn quay trở lại!
              <br />
              Đăng nhập để tiếp tục hành trình.
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={loginData.email}
                onChange={handleInputChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#388e3c' }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Nhập email của bạn"
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
                label="Mật khẩu"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={handleInputChange}
                required
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
                placeholder="Nhập mật khẩu"
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={loginData.rememberMe}
                      onChange={handleInputChange}
                      sx={{
                        color: '#388e3c',
                        '&.Mui-checked': {
                          color: '#388e3c',
                        }
                      }}
                    />
                  }
                  label="Ghi nhớ đăng nhập"
                  sx={{ 
                    '& .MuiFormControlLabel-label': {
                      fontWeight: 500,
                      color: 'text.secondary'
                    }
                  }}
                />
                <MuiLink
                  component="button"
                  type="button"
                  variant="body2"
                  sx={{ 
                    textDecoration: 'none',
                    color: '#388e3c',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#2e7d32',
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Quên mật khẩu?
                </MuiLink>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 2.5,
                  fontSize: '1.2rem',
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
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Stack>
          </form>

          {/* Social Login */}
          <Box sx={{ mt: 5 }}>
            <Divider sx={{ my: 3 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  px: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                Hoặc đăng nhập với
              </Typography>
            </Divider>

            <Stack direction="row" spacing={3} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Google />}
                onClick={() => handleSocialLogin('Google')}
                sx={{
                  py: 2,
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
                  py: 2,
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

          {/* Register Link */}
          <Box sx={{ mt: 5, textAlign: 'center' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '1.1rem',
                lineHeight: 1.6,
              }}
            >
              Chưa có tài khoản?{' '}
              <Link href="/register-template" style={{ textDecoration: 'none' }}>
                <MuiLink
                  component="span"
                  sx={{ 
                    color: '#388e3c',
                    fontWeight: 700,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#2e7d32',
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Đăng ký ngay
                </MuiLink>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Side - Image/Illustration */}
      <Box
        sx={{
          flex: '0 0 50%',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.1) 0%, rgba(102, 187, 106, 0.15) 50%, rgba(27, 94, 32, 0.1) 100%)',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(56, 142, 60, 0.05) 40px, rgba(56, 142, 60, 0.05) 80px)',
            animation: 'patternMove 20s linear infinite',
            pointerEvents: 'none',
          },
          '@keyframes patternMove': {
            '0%': { transform: 'translateX(-80px) translateY(-80px)' },
            '100%': { transform: 'translateX(0px) translateY(0px)' },
          }
        }}
      >
        {/* Background Decorative Elements */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 142, 60, 0.2) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          }
        }} />
        
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 80,
          height: 80,
          borderRadius: '30%',
          background: 'radial-gradient(ellipse, rgba(102, 187, 106, 0.25) 0%, transparent 70%)',
          animation: 'float 4s ease-in-out infinite reverse',
        }} />

        {/* Main Illustration Container */}
        <Box
          sx={{
            width: '80%',
            maxWidth: 400,
            height: '60%',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 6,
            border: '2px solid rgba(56, 142, 60, 0.1)',
            boxShadow: `
              0 25px 50px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
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
          {/* Bus Icon Illustration */}
          <Box sx={{
            p: 4,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.1) 0%, rgba(102, 187, 106, 0.2) 100%)',
            border: '3px solid rgba(56, 142, 60, 0.1)',
            mb: 4,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -6,
              left: -6,
              right: -6,
              bottom: -6,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #388e3c, #66bb6a)',
              zIndex: -1,
              opacity: 0.1,
              animation: 'pulse 3s ease-in-out infinite',
            },
          }}>
            <DirectionsBus sx={{ 
              fontSize: 120, 
              color: '#388e3c',
              filter: 'drop-shadow(0 4px 12px rgba(56, 142, 60, 0.3))'
            }} />
          </Box>

          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              textAlign: 'center',
              mb: 2,
              background: 'linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { md: '2rem', lg: '2.5rem' },
            }}
          >
            Đặt vé xe bus
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              textAlign: 'center',
              fontWeight: 400,
              px: 3,
              lineHeight: 1.6,
              fontSize: '1.1rem',
            }}
          >
            Nhanh chóng • Tiện lợi • An toàn
            <br />
            Hệ thống đặt vé trực tuyến hiện đại
          </Typography>

          {/* Decorative dots */}
          <Box sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}>
            {[1, 2, 3].map((dot) => (
              <Box
                key={dot}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#388e3c',
                  opacity: dot === 2 ? 1 : 0.3,
                  animation: dot === 2 ? 'pulse 2s ease-in-out infinite' : 'none',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
