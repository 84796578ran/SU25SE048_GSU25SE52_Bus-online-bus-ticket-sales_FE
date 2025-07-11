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
  MenuItem,
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
  Person,
  Phone,
  PersonAdd,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterTemplatePage() {
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

  const handleSocialRegister = (provider: string) => {
    console.log(`Register with ${provider}`);
    // Implement social registration logic here
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(56, 142, 60, 0.03) 0%, rgba(102, 187, 106, 0.08) 50%, rgba(27, 94, 32, 0.03) 100%)',
      }}
    >
      {/* Back to Home Button */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <IconButton
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(56, 142, 60, 0.1)',
              color: '#388e3c',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(56, 142, 60, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 30px rgba(56, 142, 60, 0.2)',
              }
            }}
          >
            <ArrowBack />
          </IconButton>
        </Link>
      </Box>

      {/* Left Side - Register Form */}
      <Box
        sx={{
          flex: { xs: 1, md: 1 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, md: 4 },
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: { xs: 'none', md: '1px solid rgba(56, 142, 60, 0.1)' },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(56, 142, 60, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none',
          }
        }}
      >
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Card
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 25px 50px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
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
            <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                <PersonAdd sx={{ 
                  fontSize: 40, 
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
                  fontSize: '1rem',
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
              <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
                {success}
              </Alert>
            )}

            {/* General Error Alert */}
            {errors.general && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                {errors.general}
              </Alert>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
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
                  placeholder="Nhập số điện thoại"
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

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    select
                    label="Giới tính"
                    name="gender"
                    value={registerData.gender}
                    onChange={handleInputChange}
                    sx={{
                      flex: 1,
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
                    <MenuItem value="male">Nam</MenuItem>
                    <MenuItem value="female">Nữ</MenuItem>
                    <MenuItem value="other">Khác</MenuItem>
                  </TextField>

                  <TextField
                    type="date"
                    label="Ngày sinh"
                    name="birthDate"
                    value={registerData.birthDate}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      flex: 1,
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
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                      Tôi đồng ý với{' '}
                      <MuiLink
                        component="button"
                        type="button"
                        variant="body2"
                        sx={{ 
                          color: '#388e3c',
                          fontWeight: 600,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
                          }
                        }}
                      >
                        Điều khoản sử dụng
                      </MuiLink>
                      {' '}và{' '}
                      <MuiLink
                        component="button"
                        type="button"
                        variant="body2"
                        sx={{ 
                          color: '#388e3c',
                          fontWeight: 600,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline',
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
                  <Typography variant="body2" sx={{ color: 'error.main', fontSize: '0.875rem', mt: -2, ml: 4 }}>
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
            <Box sx={{ mt: 4 }}>
              <Divider sx={{ my: 3 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontWeight: 500,
                    px: 2,
                    bgcolor: 'white',
                    fontSize: '0.9rem'
                  }}
                >
                  Hoặc đăng ký với
                </Typography>
              </Divider>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Google />}
                  onClick={() => handleSocialRegister('Google')}
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
                  onClick={() => handleSocialRegister('Facebook')}
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    borderColor: 'rgba(66, 103, 178, 0.3)',
                    color: '#4267B2',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'rgba(66, 103, 178, 0.02)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#4267B2',
                      background: 'rgba(66, 103, 178, 0.08)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(66, 103, 178, 0.2)',
                    },
                  }}
                >
                  Facebook
                </Button>
              </Stack>
            </Box>

            {/* Login Link */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.95rem',
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

      {/* Right Side - Image/Illustration */}
      <Box
        sx={{
          flex: { xs: 0, md: 1 },
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
            backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(56, 142, 60, 0.2) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(102, 187, 106, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(56, 142, 60, 0.02) 80px, rgba(56, 142, 60, 0.02) 160px)',
            animation: 'backgroundMove 40s linear infinite',
            pointerEvents: 'none',
          },
          '@keyframes backgroundMove': {
            '0%': { transform: 'translateX(-160px) translateY(-160px)' },
            '100%': { transform: 'translateX(0px) translateY(0px)' },
          }
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            p: 4,
          }}
        >
          {/* Bus Icon Illustration */}
          <Box
            sx={{
              display: 'inline-flex',
              p: 4,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              mb: 4,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -8,
                left: -8,
                right: -8,
                bottom: -8,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(56, 142, 60, 0.3), rgba(102, 187, 106, 0.3))',
                zIndex: -1,
                animation: 'pulse 3s ease-in-out infinite',
              },
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', opacity: 0.7 },
                '50%': { transform: 'scale(1.1)', opacity: 1 },
                '100%': { transform: 'scale(1)', opacity: 0.7 },
              }
            }}
          >
            <DirectionsBus 
              sx={{ 
                fontSize: 120, 
                color: 'white',
                filter: 'drop-shadow(0 4px 20px rgba(56, 142, 60, 0.5))'
              }} 
            />
          </Box>

          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: 3,
              color: 'white',
              fontSize: { md: '2.5rem', lg: '3rem' },
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            Tham gia cùng chúng tôi
          </Typography>
          
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: 400,
              fontSize: '1.2rem',
              lineHeight: 1.4,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              maxWidth: 350,
              mx: 'auto',
            }}
          >
            Khám phá những hành trình
            <br />
            mới cùng BusTicket Online
          </Typography>

          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              right: '10%',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              animation: 'float 4s ease-in-out infinite',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-20px)' },
                '100%': { transform: 'translateY(0px)' },
              }
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              bottom: '30%',
              left: '15%',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              animation: 'float 3s ease-in-out infinite 1s',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
