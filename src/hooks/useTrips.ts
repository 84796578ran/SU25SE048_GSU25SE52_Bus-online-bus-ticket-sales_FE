import { useState, useEffect } from 'react';
import { tripService } from '../services';
import type { TripSearchParams, TripSearchResult } from '../services';

// Custom hook for trip search
export const useTripSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TripSearchResult | null>(null);

  const searchTrips = async (params: TripSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await tripService.searchTrips(params);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    results,
    searchTrips,
  };
};

// Custom hook for popular routes
export const usePopularRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularRoutes = async () => {
      try {
        setLoading(true);
        const data = await tripService.getPopularRoutes();
        setRoutes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch popular routes');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularRoutes();
  }, []);

  return { routes, loading, error };
};
