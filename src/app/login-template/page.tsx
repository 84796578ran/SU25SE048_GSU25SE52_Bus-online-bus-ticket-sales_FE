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
  Visibility,
  VisibilityOff,
  Google,
  Facebook,
  Email,
  Lock,
  ArrowBack,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { authService, LoginRequest } from '@/services/authService';

export default function LoginTemplatePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    gmail: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'default' | 'redirect_url'>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [isClearingGoogleSession, setIsClearingGoogleSession] = useState(false);
  
  // Debug option: Set to true to disable redirect and see API response
  const DEBUG_MODE = false; // Disabled for production
  
  // Google OAuth options
  const FORCE_ACCOUNT_SELECTION = true; // Set to false to use cached Google account

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current URL for redirect
  const getCurrentRedirectURL = () => {
    if (typeof window === 'undefined') {
      return 'http://localhost:3000/login-template';
    }

    // Check if we're in production (Azure)
    const currentHost = window.location.host;
    if (currentHost.includes('azurewebsites.net')) {
      return 'https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net/login-template';
    }

    // For development, use allowed localhost URLs
    const currentPort = window.location.port;
    if (currentPort === '3000' || currentPort === '3001') {
      return `http://localhost:${currentPort}/login-template`;
    }

    // Fallback to default port if current port is not allowed
    console.warn(`⚠️ Current port ${currentPort} not configured in Google Console. Using default localhost:3000`);
    return 'http://localhost:3000/login-template';
  };



  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      console.log('🔍 Checking for Google OAuth callback...');
      console.log('📍 Current URL:', window.location.href);
      console.log('📋 URL Search Params:', Object.fromEntries(searchParams.entries()));
      
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');
      
      console.log('🔐 OAuth Parameters:');
      console.log('  - Code:', code ? `${code.substring(0, 20)}...` : 'null');
      console.log('  - Error:', error);
      console.log('  - State:', state);
      
      if (error) {
        console.error('❌ Google OAuth error received:', error);
        setError(`Google đăng nhập thất bại: ${error}`);
        return;
      }
      
      if (code && !isProcessingOAuth) {
        console.log('✅ Google code received, starting login process...');
        
        // Prevent duplicate processing
        setIsProcessingOAuth(true);
        setIsGoogleLoading(true);
        setError('');
        setErrorType('default');
        
        // Clear URL parameters immediately to prevent code reuse
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Check OAuth flow timing
        const oauthStartTime = localStorage.getItem('google_oauth_start_time');
        const currentTime = Date.now();
        let oauthDuration = 0;
        
        if (oauthStartTime) {
          oauthDuration = currentTime - parseInt(oauthStartTime);
          console.log('⏰ OAuth Flow Timing:');
          console.log('  - Started at:', new Date(parseInt(oauthStartTime)).toISOString());
          console.log('  - Callback at:', new Date(currentTime).toISOString());
          console.log('  - Total duration:', oauthDuration, 'ms (', Math.round(oauthDuration / 1000), 'seconds )');
          
          if (oauthDuration > 600000) { // 10 minutes
            console.warn('⚠️ OAuth flow took more than 10 minutes - code likely expired!');
            setError('⚠️ Cảnh báo: Bạn đã mất hơn 10 phút để hoàn thành đăng nhập Google. Authorization code có thể đã hết hạn.');
          } else if (oauthDuration > 300000) { // 5 minutes  
            console.warn('⚠️ OAuth flow took more than 5 minutes - code might be expired!');
            setError('⚠️ Cảnh báo: Bạn đã mất hơn 5 phút để hoàn thành đăng nhập Google. Nếu gặp lỗi, thử lại ngay.');
          }
        } else {
          console.warn('⚠️ No OAuth start time found - unable to calculate duration');
        }

        // Check if code looks expired (too short/long)
        console.log('🔍 OAuth Code Analysis:');
        console.log('  - Code length:', code.length);
        console.log('  - Code preview:', code.substring(0, 50) + '...');
        console.log('  - Current time:', new Date().toISOString());
        
        // Check if we've already processed this code recently
        const lastProcessedCode = localStorage.getItem('last_google_code');
        const lastProcessedTime = localStorage.getItem('last_google_code_time');
        
        if (lastProcessedCode === code) {
          const timeDiff = Date.now() - parseInt(lastProcessedTime || '0');
          console.warn('⚠️ Code was already processed', timeDiff, 'ms ago');
          if (timeDiff < 30000) { // 30 seconds
            setError('❌ Code đã được sử dụng. Vui lòng thử đăng nhập Google lại.');
            setIsGoogleLoading(false);
            setIsProcessingOAuth(false);
            return;
          }
        }
        
        // Store current code to prevent reuse
        localStorage.setItem('last_google_code', code);
        localStorage.setItem('last_google_code_time', Date.now().toString());
        
        try {
          const redirectURL = getCurrentRedirectURL();
          console.log('🔄 Google Callback Debug Info:');
          console.log('  - Current host:', window.location.host);
          console.log('  - Current origin:', window.location.origin);  
          console.log('  - Current port:', window.location.port);
          console.log('  - Selected redirect URL:', redirectURL);
          
          // Validate redirect URL against allowed URLs
          const allowedUrls = [
            'https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net/login-template',
            'http://localhost:3000/login-template',
            'http://localhost:3001/login-template'
          ];
          
          if (!allowedUrls.includes(redirectURL)) {
            console.error('❌ Callback redirect URL is not in allowed list!');
            console.error('  - Selected:', redirectURL);
            console.error('  - Allowed URLs:', allowedUrls);
                         setErrorType('redirect_url');
             throw new Error(`Lỗi Google OAuth: Địa chỉ callback không được hỗ trợ!`);
          }
          
          const response = await authService.loginWithGoogle(code, redirectURL);
          
          console.log('🎉 Google login completed, response received:', response);
          

          
          if (DEBUG_MODE) {
            console.log('🚫 DEBUG MODE: Redirect disabled. Check API response below.');
            setError('✅ GOOGLE LOGIN SUCCESS! API Response hiển thị bên dưới. Redirect bị tắt để xem response.');
          } else {
            // On success, redirect to home page with success message
            console.log('🎉 Google login successful! Redirecting to home page...');
            const userName = response.fullName || 'bạn';
            const successMessage = `Xin chào ${userName}! Đăng nhập Google thành công.`;
            
            setTimeout(() => {
              window.location.href = `/?loginSuccess=true&message=${encodeURIComponent(successMessage)}`;
            }, 500);
          }
          
        } catch (err: any) {
          let errorMessage = 'Google đăng nhập thất bại. Vui lòng thử lại.';
          

          
          if (err?.status === 401) {
            errorMessage = 'Tài khoản Google không được ủy quyền.';
          } else if (err?.status === 400) {
            // Handle specific 400 error cases
            if (err?.message?.includes('invalid_grant')) {
              errorMessage = '❌ Google authorization code đã hết hạn hoặc không hợp lệ. Vui lòng thử đăng nhập Google lại.';
              console.error('🚨 INVALID_GRANT Error - Possible causes:');
              console.error('  1. Authorization code expired (Google codes expire in ~10 minutes)');
              console.error('  2. Code already used (each code can only be used once)'); 
              console.error('  3. Redirect URI mismatch');
              console.error('  4. Clock skew between client and server');
              console.error('  5. Invalid client credentials on server side');
            } else {
              errorMessage = 'Thông tin xác thực Google không hợp lệ.';
            }
          } else if (err?.message) {
            errorMessage = err.message;
          }
          
          
          
          setError(errorMessage);
          console.error('❌ Google login error:', err);
        } finally {
          setIsGoogleLoading(false);
          setIsProcessingOAuth(false);
          // Clean up OAuth timing data
          localStorage.removeItem('google_oauth_start_time');
          // URL parameters already cleared at start to prevent reuse
        }
      }
    };

    handleGoogleCallback();
  }, [searchParams]);

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
    setErrorType('default');

    try {
      // Validate input
      if (!loginData.gmail || !loginData.password) {
        throw new Error('Vui lòng điền đầy đủ thông tin đăng nhập');
      }

      if (!loginData.gmail.includes('@')) {
        throw new Error('Email không hợp lệ');
      }

      // Prepare login request data
      const loginRequest: LoginRequest = {
        gmail: loginData.gmail.trim(),
        password: loginData.password,
      };

      // Call the login API
      const response = await authService.login(loginRequest);
      
      console.log('🎉 Login completed, response received:', response);
      

      
      if (DEBUG_MODE) {
        console.log('🚫 DEBUG MODE: Redirect disabled. Check API response below.');
        setError('✅ LOGIN SUCCESS! API Response hiển thị bên dưới. Redirect bị tắt để xem response.');
      } else {
        // On success, redirect to home page with success message
        console.log('🎉 Login successful! Redirecting to home page...');
        const userName = response.fullName || 'bạn';
        const successMessage = `Xin chào ${userName}! Đăng nhập thành công.`;
        
        setTimeout(() => {
          window.location.href = `/?loginSuccess=true&message=${encodeURIComponent(successMessage)}`;
        }, 500);
      }
      
    } catch (err: any) {
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      

      
      if (err?.status === 401) {
        errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      } else if (err?.status === 400) {
        errorMessage = 'Thông tin đăng nhập không hợp lệ.';
      } else if (err?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === 'Google') {
      setIsGoogleLoading(true);
      setError('');
      setErrorType('default');
      
      // Store the start time of OAuth flow to track timing
      const oauthStartTime = Date.now();
      localStorage.setItem('google_oauth_start_time', oauthStartTime.toString());
      console.log('⏰ Starting Google OAuth flow at:', new Date(oauthStartTime).toISOString());
      
              try {
        const redirectURL = getCurrentRedirectURL();
        console.log('🔄 Google Auth Debug Info:');
        console.log('  - Current host:', window.location.host);
        console.log('  - Current origin:', window.location.origin);
        console.log('  - Current port:', window.location.port);
        console.log('  - Selected redirect URL:', redirectURL);
        console.log('  - Force account selection:', FORCE_ACCOUNT_SELECTION);
        
        // Validate redirect URL against allowed URLs
        const allowedUrls = [
          'https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net/login-template',
          'http://localhost:3000/login-template',
          'http://localhost:3001/login-template'
        ];
        
        if (!allowedUrls.includes(redirectURL)) {
          console.error('❌ Selected redirect URL is not in allowed list!');
          console.error('  - Selected:', redirectURL);
          console.error('  - Allowed URLs:', allowedUrls);
                     setErrorType('redirect_url');
           throw new Error(`Địa chỉ truy cập không được hỗ trợ cho Google OAuth!`);
        }
        
        // Use configurable account selection setting
        const response = await authService.getGoogleAuthLink(redirectURL, FORCE_ACCOUNT_SELECTION);
        
        console.log('✅ Got Google auth URL:', response.url);
        console.log('⚡ Time to get auth URL:', Date.now() - oauthStartTime, 'ms');
        
        // Redirect to Google authentication
        window.location.href = response.url;
      } catch (err: any) {
        let errorMessage = 'Không thể kết nối với Google. Vui lòng thử lại.';
        
        if (err?.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        setIsGoogleLoading(false);
        localStorage.removeItem('google_oauth_start_time'); // Clean up on error
        console.error('❌ Failed to get Google auth link:', err);
      }
    } else {
      console.log(`Login with ${provider} - Not implemented yet`);
      setError(`${provider} đăng nhập chưa được triển khai.`);
    }
  };

  const handleClearGoogleSession = async () => {
    setIsClearingGoogleSession(true);
    setError('');
    setErrorType('default');
    
    try {
      await authService.clearGoogleSession();
      setError('✅ Đã xóa phiên đăng nhập Google. Bây giờ bạn có thể chọn tài khoản khác khi đăng nhập.');
      
      // Clear any stored Google-related data
      localStorage.removeItem('last_google_code');
      localStorage.removeItem('last_google_code_time');
      
      console.log('🧹 Cleared all Google session data');
    } catch (err: any) {
      console.error('Failed to clear Google session:', err);
      setError('⚠️ Không thể xóa hoàn toàn phiên Google, nhưng vẫn có thể thử đăng nhập.');
    } finally {
      setIsClearingGoogleSession(false);
    }
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



              {/* Loading Alert for Google */}
              {isGoogleLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
                    Đang xử lý đăng nhập Google...
                  </Alert>
                </motion.div>
              )}

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 3,
                      '& .MuiAlert-message': {
                        width: '100%'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: errorType === 'redirect_url' ? 1 : 0 }}>
                        {error}
                      </Typography>
                      {errorType === 'redirect_url' && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                            📍 Vui lòng truy cập qua một trong các địa chỉ sau:
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
                            <Typography component="li" variant="body2" sx={{ fontFamily: 'monospace' }}>
                              http://localhost:3000
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ fontFamily: 'monospace' }}>
                              http://localhost:3001
                            </Typography>
                            <Typography component="li" variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                            🔍 Địa chỉ hiện tại: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
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
                        name="gmail"
                        type="email"
                        value={loginData.gmail}
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
                          disabled={isGoogleLoading || isLoading || isClearingGoogleSession}
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
                            '&:disabled': {
                              borderColor: 'rgba(219, 68, 55, 0.2)',
                              color: 'rgba(219, 68, 55, 0.5)',
                              background: 'rgba(219, 68, 55, 0.01)',
                            }
                          }}
                        >
                          {isGoogleLoading ? 'Đang kết nối Google...' : 'Google'}
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
                          disabled={isGoogleLoading || isLoading || isClearingGoogleSession}
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

                  {/* Clear Google Session Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="text"
                          size="small"
                          onClick={handleClearGoogleSession}
                          disabled={isClearingGoogleSession || isGoogleLoading || isLoading}
                          sx={{
                            color: '#666',
                            fontSize: '0.875rem',
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: '#db4437',
                              background: 'rgba(219, 68, 55, 0.05)',
                            },
                            '&:disabled': {
                              color: '#999',
                            }
                          }}
                        >
                          {isClearingGoogleSession ? '🔄 Đang xóa phiên Google...' : '🧹 Xóa phiên đăng nhập Google'}
                        </Button>
                      </motion.div>
                                             <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                         Dùng khi muốn đăng nhập với tài khoản Google khác
                       </Typography>
                    </Box>
                  </motion.div>
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
