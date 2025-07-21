import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export interface AuthUser {
  id: number;
  customerId: string;
  gmail: string;
  fullName: string;
  gender: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = authService.getToken();
      const userData = authService.getCurrentUser();
      
      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (gmail: string, password: string) => {
    try {
      const response = await authService.login({ gmail, password });
      
      const userData: AuthUser = {
        id: response.id,
        customerId: response.customerId,
        gmail: response.gmail,
        fullName: response.fullName,
        gender: response.gender,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const loginWithGoogle = async (code: string, redirectURL: string) => {
    try {
      const response = await authService.loginWithGoogle(code, redirectURL);
      
      const userData: AuthUser = {
        id: response.id,
        customerId: response.customerId,
        gmail: response.gmail,
        fullName: response.fullName,
        gender: response.gender,
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const getGoogleAuthLink = async (redirectURL: string, forceAccountSelection: boolean = true) => {
    try {
      return await authService.getGoogleAuthLink(redirectURL, forceAccountSelection);
    } catch (error) {
      throw error;
    }
  };

  const clearGoogleSession = async () => {
    try {
      return await authService.clearGoogleSession();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, still update local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    getGoogleAuthLink,
    clearGoogleSession,
    logout,
    checkAuthStatus,
  };
}; 