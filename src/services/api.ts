import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bobts-server-e7dxfwh7e5g9e3ad.malaysiawest-01.azurewebsites.net';

// Create axios instance with default configuration
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    try {
      const userDataRaw = typeof window !== 'undefined' ? localStorage.getItem('user_data') : null;
      if (userDataRaw && config.headers) {
        const userData = JSON.parse(userDataRaw);
        if (userData?.customerId) {
          (config.headers as any)['X-Customer-Id'] = userData.customerId;
        }
        if (userData?.id) {
          (config.headers as any)['X-User-Id'] = userData.id;
        }
      }
    } catch {}
    
    console.log('📤 API Request Details:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
      params: config.params,
    });
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response for debugging
    console.log('📥 API Response Success:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
      headers: response.headers,
    });
    
    return response;
  },
  (error: AxiosError) => {
    // Enhanced error logging
    console.error('❌ API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      requestData: error.config?.data,
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
    });
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn('🔒 Authentication failed - clearing tokens');
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        // You can add redirect logic here if needed
        // window.location.href = '/login';
      }
    }
    
    // Return a more user-friendly error
    const customError = {
      message: (error.response?.data as any)?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
      details: error.response?.data,
    };
    
    return Promise.reject(customError);
  }
);
class ApiClient {
  private instance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.instance = axiosInstance;
  }

  // Generic GET request
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic POST request
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic PUT request
  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.put<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic PATCH request
  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.patch<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Generic DELETE request
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.instance.delete<T>(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Upload file
  async uploadFile<T>(endpoint: string, file: File, config?: AxiosRequestConfig): Promise<T> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await this.instance.post<T>(endpoint, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config?.headers,
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Seat availability API
  async getSeatAvailability(tripId: string | number, fromStationId: string | number, toStationId: string | number): Promise<any> {
    try {
      // Validate required parameters with detailed logging
      console.log('🔍 getSeatAvailability called with params:', {
        tripId,
        fromStationId,
        toStationId,
        'tripId type': typeof tripId,
        'fromStationId type': typeof fromStationId,
        'toStationId type': typeof toStationId
      });

      if (tripId === null || tripId === undefined || tripId === '') {
        throw new Error(`tripId is required, received: ${tripId} (type: ${typeof tripId})`);
      }
      if (fromStationId === null || fromStationId === undefined || fromStationId === '') {
        throw new Error(`fromStationId is required, received: ${fromStationId} (type: ${typeof fromStationId})`);
      }
      if (toStationId === null || toStationId === undefined || toStationId === '') {
        throw new Error(`toStationId is required, received: ${toStationId} (type: ${typeof toStationId})`);
      }

      const params = new URLSearchParams({
        tripId: tripId.toString(),
        fromStationId: fromStationId.toString(),
        toStationId: toStationId.toString()
      });

      const fullUrl = `/api/Trip/seat-availability?${params.toString()}`;

      console.log('🌐 Making (NEW) seat availability API call:', {
        fullUrl,
        completeURL: `${this.instance.defaults.baseURL}${fullUrl}`,
        params: params.toString()
      });

      const response = await this.instance.get(fullUrl);

      // Response may be array of floor objects or already flattened
      let data = response.data;
      if (Array.isArray(data) && data.length && data[0].seats) {
        // Flatten floors
        const flattened = data.flatMap((floor: any) =>
          Array.isArray(floor.seats) ? floor.seats.map((s: any) => ({ ...s, floorIndex: floor.floorIndex })) : []
        );
        data = flattened;
      }

      console.log('🌐 Seat availability API response (normalized):', {
        status: response.status,
        originalIsArray: Array.isArray(response.data),
        normalizedCount: Array.isArray(data) ? data.length : 'N/A'
      });

      return data;
    } catch (error) {
      console.error(`❌ Error fetching seat availability for trip ${tripId}:`, error);
      throw error;
    }
  }

  // New seat-available API for seat map display
  async getSeatAvailable(tripId: string | number, fromStationId: string | number, toStationId: string | number, options?: { raw?: boolean }): Promise<any> {
    try {
      // Validate required parameters
      console.log('🔍 getSeatAvailable called with params:', {
        tripId,
        fromStationId,
        toStationId,
        'tripId type': typeof tripId,
        'fromStationId type': typeof fromStationId,
        'toStationId type': typeof toStationId
      });

      if (tripId === null || tripId === undefined || tripId === '') {
        throw new Error(`tripId is required, received: ${tripId} (type: ${typeof tripId})`);
      }
      if (fromStationId === null || fromStationId === undefined || fromStationId === '') {
        throw new Error(`fromStationId is required, received: ${fromStationId} (type: ${typeof fromStationId})`);
      }
      if (toStationId === null || toStationId === undefined || toStationId === '') {
        throw new Error(`toStationId is required, received: ${toStationId} (type: ${typeof toStationId})`);
      }

      // Reuse new unified endpoint for seat map display
      const params = new URLSearchParams({
        tripId: tripId.toString(),
        fromStationId: fromStationId.toString(),
        toStationId: toStationId.toString()
      });

      const fullUrl = `/api/Trip/seat-availability?${params.toString()}`;

      console.log('🌐 Making (NEW) seat map API call:', {
        fullUrl,
        completeURL: `${this.instance.defaults.baseURL}${fullUrl}`,
        params: params.toString()
      });

      const response = await this.instance.get(fullUrl);

      // If caller wants raw floors, return unmodified
      if (options?.raw) {
        return response.data;
      }

      let data = response.data;
      if (Array.isArray(data) && data.length && data[0].seats) {
        data = data.flatMap((floor: any) =>
          Array.isArray(floor.seats) ? floor.seats.map((s: any) => ({ ...s, floorIndex: floor.floorIndex })) : []
        );
      }

      console.log('🌐 Seat map API response (normalized):', {
        status: response.status,
        normalizedCount: Array.isArray(data) ? data.length : 'N/A'
      });

  return data;
    } catch (error) {
      console.error(`❌ Error fetching seat-available for trip ${tripId}:`, error);
      throw error;
    }
  }

  // One-way trip search API
  async searchTrips(searchParams: {
    fromLocationId: string | number,
    fromStationId: string | number,
    toLocationId: string | number,
    toStationId: string | number,
    date: string,
    directTripsPagination?: {
      page?: number,
      amount?: number,
      all?: boolean
    },
    transferTripsPagination?: {
      page?: number,
      amount?: number,
      all?: boolean
    },
    tripleTripsPagination?: {
      page?: number,
      amount?: number,
      all?: boolean
    }
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      // Required parameters
      params.append('FromLocationId', searchParams.fromLocationId.toString());
      params.append('FromStationId', searchParams.fromStationId.toString());
      params.append('ToLocationId', searchParams.toLocationId.toString());
      params.append('ToStationId', searchParams.toStationId.toString());
      params.append('Date', searchParams.date);
      
      // Default pagination parameters
      const directPagination = searchParams.directTripsPagination || {};
      params.append('DirectTripsPagination.Page', (directPagination.page || 0).toString());
      params.append('DirectTripsPagination.Amount', (directPagination.amount || 50).toString());
      params.append('DirectTripsPagination.All', (directPagination.all !== undefined ? directPagination.all : true).toString());
      
      const transferPagination = searchParams.transferTripsPagination || {};
      params.append('TransferTripsPagination.Page', (transferPagination.page || 0).toString());
      params.append('TransferTripsPagination.Amount', (transferPagination.amount || 50).toString());
      params.append('TransferTripsPagination.All', (transferPagination.all !== undefined ? transferPagination.all : true).toString());
      
      const triplePagination = searchParams.tripleTripsPagination || {};
      params.append('TripleTripsPagination.Page', (triplePagination.page || 0).toString());
      params.append('TripleTripsPagination.Amount', (triplePagination.amount || 50).toString());
      params.append('TripleTripsPagination.All', (triplePagination.all !== undefined ? triplePagination.all : true).toString());

      console.log('🌐 Making one-way trip search API call:', {
        url: `/api/Trip/mobile-search?${params.toString()}`,
        searchParams
      });
      
      const response = await this.instance.get(`/api/Trip/mobile-search?${params.toString()}`);
      
      console.log('🌐 One-way trip search response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error searching one-way trips:', error);
      throw error;
    }
  }

  // Round-trip search API
  async searchRoundTrips(searchParams: {
    fromLocationId: string | number,
    fromStationId: string | number,
    toLocationId: string | number,
    toStationId: string | number,
    date: string,
    returnDate: string,
    directTripsPagination?: {
      page?: number,
      amount?: number,
      all?: boolean
    },
    transferTripsPagination?: {
      page?: number,
      amount?: number,
      all?: boolean
    },
    tripleTripsPagination?: {
      page?: number,
      amount?: number,
      all?: boolean
    }
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      
      // Required parameters
      params.append('FromLocationId', searchParams.fromLocationId.toString());
      params.append('FromStationId', searchParams.fromStationId.toString());
      params.append('ToLocationId', searchParams.toLocationId.toString());
      params.append('ToStationId', searchParams.toStationId.toString());
      params.append('Date', searchParams.date);
      params.append('ReturnDate', searchParams.returnDate);
      
      // Default pagination parameters
      const directPagination = searchParams.directTripsPagination || {};
      params.append('DirectTripsPagination.Page', (directPagination.page || 0).toString());
      params.append('DirectTripsPagination.Amount', (directPagination.amount || 50).toString());
      params.append('DirectTripsPagination.All', (directPagination.all !== undefined ? directPagination.all : true).toString());
      
      const transferPagination = searchParams.transferTripsPagination || {};
      params.append('TransferTripsPagination.Page', (transferPagination.page || 0).toString());
      params.append('TransferTripsPagination.Amount', (transferPagination.amount || 50).toString());
      params.append('TransferTripsPagination.All', (transferPagination.all !== undefined ? transferPagination.all : true).toString());
      
      const triplePagination = searchParams.tripleTripsPagination || {};
      params.append('TripleTripsPagination.Page', (triplePagination.page || 0).toString());
      params.append('TripleTripsPagination.Amount', (triplePagination.amount || 50).toString());
      params.append('TripleTripsPagination.All', (triplePagination.all !== undefined ? triplePagination.all : true).toString());

      console.log('🌐 Making round-trip search API call:', {
        url: `/api/Trip/mobile-search-return?${params.toString()}`,
        searchParams
      });
      
      const response = await this.instance.get(`/api/Trip/mobile-search-return?${params.toString()}`);
      
      console.log('🌐 Round-trip search response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error searching round trips:', error);
      throw error;
    }
  }
}

// Export axios instance and API client
export { axiosInstance };
export const apiClient = new ApiClient(axiosInstance);
export default apiClient;
