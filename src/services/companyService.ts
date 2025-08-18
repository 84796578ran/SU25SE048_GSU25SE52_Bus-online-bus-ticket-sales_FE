import { apiClient } from './api';

// Types for Company API
export interface Company {
  id: number;
  companyId: string;
  name: string;
  numberOfRatings: number;
  averageRating: number;
  numberOfTrips: number;
}

export interface CompanyResponse {
  data: Company[];
  page: number;
  amount: number;
  totalPage: number;
  totalCount: number;
}

export interface CompanyParams {
  Page?: number;
  Amount?: number;
  All?: boolean;
}

const companyService = {
  /**
   * Get popular companies from API
   * @param params - Optional query parameters
   * @returns Promise<CompanyResponse>
   */
  getPopularCompanies: async (params?: CompanyParams): Promise<CompanyResponse> => {
    try {
      console.log('📤 Fetching popular companies with params:', params);
      
      // Set default parameters
      const defaultParams: CompanyParams = {
        All: true,
        Page: 0,
        Amount: 10,
        ...params
      };

      const response = await apiClient.get<CompanyResponse>('/api/Company/popular', {
        params: defaultParams
      });
      
      console.log('📥 Popular companies response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching popular companies:', error);
      throw new Error('Failed to fetch popular companies');
    }
  },

  /**
   * Get top rated companies for homepage display
   * @param limit - Number of companies to fetch (default: 4)
   * @returns Promise<Company[]>
   */
  getTopRatedCompanies: async (limit: number = 4): Promise<Company[]> => {
    try {
      const response = await companyService.getPopularCompanies({
        All: true,
        Amount: 20, // Get more data to filter properly
        Page: 0
      });
      
      // Filter companies with ratings and sort by average rating and number of ratings
      const companiesWithRatings = response.data.filter(company => 
        company.numberOfRatings > 0 && company.averageRating > 0
      );
      
      // Sort by average rating (desc) and then by number of ratings (desc)
      const sortedCompanies = companiesWithRatings.sort((a, b) => {
        // Primary sort: average rating (descending)
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        // Secondary sort: number of ratings (descending)
        return b.numberOfRatings - a.numberOfRatings;
      });
      
      // If we don't have enough companies with ratings, fill with companies that have trips
      if (sortedCompanies.length < limit) {
        const companiesWithTrips = response.data.filter(company => 
          company.numberOfTrips > 0 && !sortedCompanies.some(sc => sc.id === company.id)
        );
        
        // Sort by number of trips
        const sortedByTrips = companiesWithTrips.sort((a, b) => 
          b.numberOfTrips - a.numberOfTrips
        );
        
        sortedCompanies.push(...sortedByTrips);
      }
      
      return sortedCompanies.slice(0, limit);
    } catch (error) {
      console.error('❌ Error fetching top rated companies:', error);
      return []; // Return empty array as fallback
    }
  }
};

export default companyService;
