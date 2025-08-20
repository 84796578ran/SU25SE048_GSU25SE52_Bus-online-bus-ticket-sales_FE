import { apiClient } from './api';

// Types for Rating API
export interface Rating {
  id: number;
  ticketId: number;
  companyId: number;
  customerName: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface RatingResponse {
  data: Rating[];
  page: number;
  amount: number;
  totalPage: number;
  totalCount: number;
}

export interface RatingParams {
  Page?: number;
  Amount?: number;
  All?: boolean;
}

// Request interface for creating ratings
export interface CreateRatingRequest {
  ticketId: number;
  score: number;
  comment: string;
}

const ratingService = {
  /**
   * Get ratings from API
   * @param params - Optional query parameters
   * @returns Promise<RatingResponse>
   */
  getRatings: async (params?: RatingParams): Promise<RatingResponse> => {
    try {
      console.log('📤 Fetching ratings with params:', params);
      
      // Set default parameters
      const defaultParams: RatingParams = {
        All: true,
        Page: 0,
        Amount: 10,
        ...params
      };

      const response = await apiClient.get<RatingResponse>('/api/Rating', {
        params: defaultParams
      });
      
      console.log('📥 Ratings response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);
      throw new Error('Failed to fetch ratings');
    }
  },

  /**
   * Create a new rating
   * @param ratingData - The rating data to submit
   * @returns Promise<Rating>
   */
  createRating: async (ratingData: CreateRatingRequest): Promise<Rating> => {
    try {
      console.log('📤 Submitting rating:', ratingData);

      const response = await apiClient.post<Rating>('/api/Rating', ratingData);
      
      console.log('📥 Rating created successfully:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Error creating rating:', error);
      
      // Check if this is a duplicate rating error - multiple ways the error can come through
      const isDuplicateRating = 
        // Direct message check
        error?.message === "Bạn đã đánh giá rồi" ||
        // Response data message check
        error?.response?.data?.message === "Bạn đã đánh giá rồi" ||
        // Data message check (after API client transformation)
        error?.data?.message === "Bạn đã đánh giá rồi" ||
        // Details message check
        error?.details?.message === "Bạn đã đánh giá rồi" ||
        // Contains check for any of the above
        error?.message?.includes("Bạn đã đánh giá rồi") ||
        error?.response?.data?.message?.includes("Bạn đã đánh giá rồi") ||
        error?.data?.message?.includes("Bạn đã đánh giá rồi") ||
        error?.details?.message?.includes("Bạn đã đánh giá rồi");

      if (isDuplicateRating) {
        console.log('⚠️ Duplicate rating detected');
        throw new Error('DUPLICATE_RATING');
      }
      
      // Check for other specific error messages in order of preference
      const errorMessage = 
        error?.message ||
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.details?.message ||
        'Failed to create rating';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get recent ratings for homepage display
   * @param limit - Number of ratings to fetch (default: 6)
   * @returns Promise<Rating[]>
   */
  getRecentRatings: async (limit: number = 6): Promise<Rating[]> => {
    try {
      const response = await ratingService.getRatings({
        All: true,
        Amount: limit,
        Page: 0
      });
      
      // Sort by createdAt descending to get most recent ratings
      const sortedRatings = response.data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return sortedRatings;
    } catch (error) {
      console.error('❌ Error fetching recent ratings:', error);
      return []; // Return empty array as fallback
    }
  },

  /**
   * Get customer's ratings to check which tickets have been rated
   * @returns Promise<Rating[]>
   */
  getCustomerRatings: async (): Promise<Rating[]> => {
    try {
      console.log('📤 Fetching customer ratings...');
      
      const response = await ratingService.getRatings({
        All: true,
        Page: 0,
        Amount: 1000 // Get all customer ratings
      });
      
      console.log('📥 Customer ratings response:', response);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching customer ratings:', error);
      return []; // Return empty array as fallback
    }
  }
};

export default ratingService;
