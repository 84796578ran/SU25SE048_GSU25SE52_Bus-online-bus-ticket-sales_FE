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
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.02) 0%, rgba(244, 143, 177, 0.05) 50%, rgba(244, 143, 177, 0.02) 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(244, 143, 177, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(244, 143, 177, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Back to Home Button */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}
        >
          <Link href="/" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton
                sx={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(244, 143, 177, 0.2)',
                  color: '#F48FB1',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(244, 143, 177, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(244, 143, 177, 0.25)',
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
            </motion.div>
          </Link>
        </motion.div>

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
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ width: '100%', maxWidth: '480px' }}
          >
            <Box sx={{ width: '100%', maxWidth: 480 }}>
              {/* Logo and Brand */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
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
                    background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.1) 0%, rgba(233, 30, 99, 0.15) 100%)',
                    border: '2px solid rgba(244, 143, 177, 0.1)',
                    transition: 'all 0.3s ease',
                  }}>
                    <Box
                      component="img"
                      src="/images/pic4.png"
                      alt="XeTiic Logo"
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        borderRadius: 1,
                        objectFit: 'contain',
                      }}
                    />
                    <Typography 
                      variant="h4" 
                      component="div" 
                      sx={{ 
                        fontWeight: 800,
                        background: 'linear-gradient(45deg, #f48fb1 30%, #e91e63 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.5px',
                        fontSize: { xs: '1.8rem', sm: '2.2rem' },
                      }}
                    >
                      XeTiic
                    </Typography>
                  </Box>
                </Box>
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Box sx={{ textAlign: 'center', mb: 5 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      mb: 2, 
                      background: 'linear-gradient(45deg, #f48fb1 30%, #e91e63 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '2.5rem', sm: '3rem' },
                      letterSpacing: '-0.02em',
                      textShadow: '0 4px 20px rgba(244, 143, 177, 0.1)',
                    }}
                  >
                    Chào mừng đến với XeTiic
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
              </motion.div>

              {/* Error Alert */}
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

              {/* Login Form */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <form onSubmit={handleSubmit}>
                  <Stack spacing={4}>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
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
                              <Email sx={{ color: '#e91e63' }} />
                            </InputAdornment>
                          ),
                        }}
                        placeholder="Nhập email của bạn"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(244, 143, 177, 0.02)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 143, 177, 0.04)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e91e63',
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
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
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
                              <Lock sx={{ color: '#e91e63' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ color: '#e91e63' }}
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
                            backgroundColor: 'rgba(244, 143, 177, 0.02)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 143, 177, 0.04)',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e91e63',
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
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              name="rememberMe"
                              checked={loginData.rememberMe}
                              onChange={handleInputChange}
                              sx={{
                                color: '#e91e63',
                                '&.Mui-checked': {
                                  color: '#e91e63',
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
                            color: '#e91e63',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: '#d81b60',
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          Quên mật khẩu?
                        </MuiLink>
                      </Box>
                    </motion.div>

                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={isLoading}
                          sx={{
                            py: 2.5,
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            borderRadius: 3,
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #f48fb1 0%, #e91e63 100%)',
                            boxShadow: '0 8px 25px rgba(244, 143, 177, 0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #ec407a 0%, #d81b60 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 35px rgba(233, 30, 99, 0.4)',
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
                background: 'rgba(233, 30, 99, 0.5)',
                transform: 'none',
                boxShadow: '0 4px 15px rgba(233, 30, 99, 0.2)',
              }
                          }}
                        >
                          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Stack>
                </form>
              </motion.div>

              {/* Social Login */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
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
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.2 }}
                      style={{ width: '50%' }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
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
                      </motion.div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                      style={{ width: '50%' }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
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
                      </motion.div>
                    </motion.div>
                  </Stack>
                </Box>
              </motion.div>

              {/* Register Link */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
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
                          color: '#e91e63',
                          fontWeight: 700,
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: '#d81b60',
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Đăng ký ngay
                      </MuiLink>
                    </Link>
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Box>

        {/* Right Side - Image/Illustration */}
        <Box
          sx={{
            flex: '0 0 50%',
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.03) 0%, rgba(233, 30, 99, 0.06) 50%, rgba(244, 143, 177, 0.03) 100%)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(244, 143, 177, 0.02) 40px, rgba(244, 143, 177, 0.02) 80px)',
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
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(244, 143, 177, 0.2) 0%, transparent 70%)',
            }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              position: 'absolute',
              bottom: '20%',
              right: '15%',
              width: 80,
              height: 80,
              borderRadius: '30%',
              background: 'radial-gradient(ellipse, rgba(233, 30, 99, 0.25) 0%, transparent 70%)',
            }}
          />

          {/* Main Illustration Container */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Box
              sx={{
                width: '80%',
                maxWidth: 400,
                height: '60%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {/* Logo Only */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                <Box 
                  sx={{
                    p: 6,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(244, 143, 177, 0.05) 0%, rgba(233, 30, 99, 0.1) 100%)',
                    border: '2px solid rgba(233, 30, 99, 0.15)',
                    boxShadow: '0 10px 30px rgba(233, 30, 99, 0.15)',
                    position: 'relative'
                  }}
                >
                  <Box
                    component="img"
                    src="/images/pic4.png"
                    alt="XeTiic Logo"
                    sx={{
                      width: 220,
                      height: 220,
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 5px 15px rgba(233, 30, 99, 0.25))'
                    }}
                  />
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
}
