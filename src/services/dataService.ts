import { apiClient } from './api';
import type { 
  Location, 
  BusCompany, 
  ApiResponse 
} from '../types/api';

// Location and general data API calls
export const dataService = {
  // Get all locations/cities
  getLocations: async (): Promise<Location[]> => {
    const response = await apiClient.get<ApiResponse<Location[]>>('/locations');
    return response.data;
  },

  // Search locations by name
  searchLocations: async (query: string): Promise<Location[]> => {
    const response = await apiClient.get<ApiResponse<Location[]>>(
      `/locations/search?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Get all bus companies
  getBusCompanies: async (): Promise<BusCompany[]> => {
    const response = await apiClient.get<ApiResponse<BusCompany[]>>('/bus-companies');
    return response.data;
  },

  // Get bus company by ID
  getBusCompanyById: async (companyId: string): Promise<BusCompany> => {
    const response = await apiClient.get<ApiResponse<BusCompany>>(`/bus-companies/${companyId}`);
    return response.data;
  },
};

export default dataService;
