import { useState, useCallback } from 'react';
import { RecommendationEngine } from '../recommendations';
import { RecommendationResult } from '../types';

export function useRecommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);

  const fetchRecommendations = useCallback(async (
    userId: string,
    favorites: string[],
    searchHistory: string[],
    listings: any[],
    location?: string,
    category?: string,
    currentListingId?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await RecommendationEngine.get(
        { userId, favorites, searchHistory, location, category, currentListingId },
        listings
      );

      if (response.success && response.data) {
        setRecommendations(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to fetch recommendations.');
        return null;
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected recommendation engine error.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    recommendations,
    fetchRecommendations,
  };
}
