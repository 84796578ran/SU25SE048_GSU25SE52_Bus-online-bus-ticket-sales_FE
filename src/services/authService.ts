import { apiClient } from './api';
import type { ApiResponse } from '../types/api';

// User authentication types
export interface LoginRequest {
  gmail: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  customerId: string;
  gmail: string;
  fullName: string;
  gender: string;
  token: string;
}

export interface RegisterRequest {
  gmail: string;
  phone: string;
  gender: string;
  fullName: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface GoogleAuthLinkResponse {
  url: string;
}

export interface GoogleLoginRequest {
  code: string;
  redirectURL: string;
}

export interface CustomerProfile {
  customerId: string;
  fullName: string;
  gmail: string;
  phone: string;
  gender: string ;
}

export interface UpdateProfileRequest {
  fullName: string;
  phone: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Authentication API calls
export const authService = {
  // User login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      console.log('📤 Sending login request to:', '/api/Customers/LoginWithGmail');
      console.log('📤 Login credentials:', { gmail: credentials.gmail, password: '***' });
      
      const response = await apiClient.post<LoginResponse>('/api/Customers/LoginWithGmail', credentials);
      
      console.log('📥 LOGIN API RESPONSE:', response);
      console.log('🔑 Token received:', response.token ? 'YES' : 'NO');
      console.log('👤 User data:', {
        id: response.id,
        customerId: response.customerId,
        gmail: response.gmail,
        fullName: response.fullName,
        gender: response.gender
      });
      
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify({
          id: response.id,
          customerId: response.customerId,
          gmail: response.gmail,
          fullName: response.fullName,
          gender: response.gender
        }));
        
        console.log('✅ Login successful, token saved to localStorage');
        console.log('💾 Saved token:', response.token);
      } else {
        console.warn('⚠️ No token received in response!');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      console.error('❌ Error details:', {
        status: error?.status,
        message: error?.message,
        data: error?.data
      });
      throw new Error(error?.message || 'Login failed. Please check your credentials.');
    }
  },

  // Get customer profile by ID
  getCustomerProfile: async (customerId: number): Promise<CustomerProfile | null> => {
    try {
      console.log('📤 Getting customer profile for ID:', customerId, typeof customerId);
      console.log('📤 Full API endpoint:', `/api/Customers/${customerId}`);
      
      const response = await apiClient.get<ApiResponse<CustomerProfile>>(`/api/Customers/${customerId}`);
      
      console.log('📥 Customer profile RAW response:', response);
      console.log('📥 Customer profile data only:', response.data);
      console.log('📥 Profile fullName:', response.data?.fullName);
      console.log('📥 Profile phone:', response.data?.phone);
      
      // Check if response.data is null/undefined
      if (!response.data) {
        console.warn('⚠️ API returned successful response but data is null/undefined');
        console.log('⚠️ Full response object:', JSON.stringify(response, null, 2));
        return null; // Return null explicitly so caller can handle fallback
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Get profile failed:', error);
      console.error('❌ Error status:', error?.status);
      console.error('❌ Error response:', error?.response?.data);
      throw new Error(error?.message || 'Failed to load profile information.');
    }
  },

  // User registration
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post<RegisterResponse>('/api/Customers/Registration', userData);
      return response;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error?.message || 'Registration failed. Please try again.');
    }
  },

  // Get Google authentication link
  getGoogleAuthLink: async (redirectURL: string, forceAccountSelection: boolean = true): Promise<GoogleAuthLinkResponse> => {
    try {
      const encodedRedirectURL = encodeURIComponent(redirectURL);
      
      // Build URL with optional parameters
      let url = `/api/Customers/GetGoogleAuthenticationLink?redirectURL=${encodedRedirectURL}`;
      
      // Add parameters to force account selection if needed
      if (forceAccountSelection) {
        url += '&prompt=select_account';
        console.log('🔄 Forcing Google account selection');
      }
      
      console.log('📤 Requesting Google auth link with redirect URL:', redirectURL);
      console.log('📤 Encoded redirect URL:', encodedRedirectURL);
      console.log('📤 Force account selection:', forceAccountSelection);
      console.log('📤 Final URL:', url);
      
      const response = await apiClient.get<GoogleAuthLinkResponse>(url);
      
      // If server doesn't support prompt parameter, manually modify the URL
      if (response.url && forceAccountSelection && !response.url.includes('prompt=')) {
        const separator = response.url.includes('?') ? '&' : '?';
        response.url += `${separator}prompt=select_account`;
        console.log('🔧 Manually added prompt=select_account to URL');
      }
      
      console.log('✅ Google auth link retrieved successfully:', response.url);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to get Google auth link:', error);
      throw new Error(error?.message || 'Failed to get Google authentication link.');
    }
  },

  // Force logout from Google (clear Google session)
  clearGoogleSession: async (): Promise<void> => {
    try {
      console.log('🔄 Clearing Google session...');
      
      // Method 1: Open Google logout in hidden iframe (doesn't work due to X-Frame-Options)
      // Method 2: Open Google logout in new window and close it
      const logoutWindow = window.open(
        'https://accounts.google.com/logout',
        'google_logout',
        'width=1,height=1,scrollbars=no,resizable=no'
      );
      
      // Close the logout window after a short delay
      setTimeout(() => {
        if (logoutWindow && !logoutWindow.closed) {
          logoutWindow.close();
        }
      }, 2000);
      
      console.log('✅ Google logout window opened');
    } catch (error: any) {
      console.warn('⚠️ Failed to clear Google session:', error);
      // This is not critical, so we don't throw
    }
  },

  // Login with Google OAuth
  loginWithGoogle: async (code: string, redirectURL: string): Promise<LoginResponse> => {
    const requestData: GoogleLoginRequest = {
      code,
      redirectURL
    };
    
    try {
      console.log('📤 Sending Google login request:', { code: code.substring(0, 10) + '...', redirectURL });
      
      const response = await apiClient.post<LoginResponse>('/api/Customers/LoginWithGoogle', requestData);
      
      console.log('📥 GOOGLE LOGIN API RESPONSE:', response);
      console.log('🔑 Token received:', response.token ? 'YES' : 'NO');
      console.log('👤 User data:', {
        id: response.id,
        customerId: response.customerId,
        gmail: response.gmail,
        fullName: response.fullName,
        gender: response.gender
      });
      
      // Save token to localStorage (same as regular login)
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data', JSON.stringify({
          id: response.id,
          customerId: response.customerId,
          gmail: response.gmail,
          fullName: response.fullName,
          gender: response.gender
        }));
        
        console.log('✅ Google login successful, token saved to localStorage');
        console.log('💾 Saved token:', response.token);
      } else {
        console.warn('⚠️ No token received in Google response!');
      }
      
      return response;
    } catch (error: any) {
      console.error('❌ Google login failed:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      console.error('❌ Request that failed:', {
        endpoint: '/api/Customers/LoginWithGoogle',
        method: 'POST',
        body: requestData,
        headers: 'Check Network tab for full headers'
      });
      
      if (error?.status === 400) {
        console.error('🚨 BAD REQUEST (400) Details:');
        console.error('- Possible causes:');
        console.error('  1. Invalid redirect URL format');
        console.error('  2. Google code expired or invalid');
        console.error('  3. Redirect URL mismatch with Google Console');
        console.error('  4. Missing or invalid request parameters');
        console.error('- Server response:', error?.data);
        
        let detailedMessage = 'Bad Request (400): ';
        if (error?.data?.message) {
          detailedMessage += error.data.message;
        } else if (error?.data?.error) {
          detailedMessage += error.data.error;
        } else {
          detailedMessage += 'Invalid request parameters. Check redirect URL and Google code.';
        }
        
        throw new Error(detailedMessage);
      }
      
      throw new Error(error?.message || 'Google login failed. Please try again.');
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      // Get current user data before clearing to clean user-specific cache
      const userData = authService.getCurrentUser();
      
      // Call logout API endpoint
      await apiClient.post<void>('/api/Customers/logout', {});
      console.log('✅ Logout API call successful');
      
      // Clear tokens from localStorage after successful API call
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Clear user-specific profile cache and any other user-related data
      if (userData && userData.id) {
        const userSpecificKey = `user_profile_${userData.id}`;
        localStorage.removeItem(userSpecificKey);
        console.log('🗑️ Cleared user-specific cache:', userSpecificKey);
        
        // Clear any other user-specific data if exists
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`user_profile_${userData.id}`)) {
            localStorage.removeItem(key);
            console.log('🗑️ Cleared additional user cache:', key);
          }
        });
      }
      
      console.log('✅ Logout successful, tokens cleared');
    } catch (error: any) {
      console.error('Logout API error:', error);
      // Still clear local tokens even if API call fails
      const userData = authService.getCurrentUser();
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      
      // Clear user-specific profile cache
      if (userData && userData.id) {
        const userSpecificKey = `user_profile_${userData.id}`;
        localStorage.removeItem(userSpecificKey);
        console.log('🗑️ Cleared user-specific cache:', userSpecificKey);
      }
      
      console.log('✅ Local tokens cleared despite API error');
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Get current user data from localStorage
  getCurrentUser: (): any => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', userData);
    return response.data;
  },

  // Update customer profile (new API) - uses user ID, not customerId
  updateCustomerProfile: async (userId: number, profileData: UpdateProfileRequest): Promise<CustomerProfile> => {
    try {
      console.log('📤 Updating customer profile:', { userId, profileData });
      const response = await apiClient.put<ApiResponse<CustomerProfile>>(`/api/Customers/${userId}/profile`, profileData);
      console.log('📥 Customer profile API response:', response);
      console.log('📥 Customer profile response.data:', response.data);
      
      // Handle case where API returns success but no data
      if (!response.data) {
        console.warn('⚠️ API returned success but no data, creating fallback response');
        return {
          customerId: String(userId),
          fullName: profileData.fullName,
          gmail: '', // We don't have this from the update
          phone: profileData.phone,
          gender: '' // We don't have this from the update
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error updating customer profile:', error);
      throw error;
    }
  },

  // Update customer phone number only
  updateCustomerPhoneNumber: async (userId: number, phoneNumber: string): Promise<void> => {
    try {
      console.log('📱 Updating customer phone number:', { userId, phoneNumber });
      const response = await apiClient.put<ApiResponse<void>>(`/api/Customers/${userId}/phone-number`, phoneNumber, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('📥 Phone number updated successfully:', response);
    } catch (error) {
      console.error('❌ Error updating customer phone number:', error);
      throw error;
    }
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/auth/reset-password', {
      token,
      newPassword,
    });
  },
};

export default authService;
