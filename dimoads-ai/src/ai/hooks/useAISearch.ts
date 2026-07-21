import { useState, useCallback } from 'react';
import { AISearch } from '../search';

export interface SearchResultMatch {
  id: string;
  relevanceScore: number;
  matchReason: string;
}

export function useAISearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResultMatch[]>([]);

  const search = useCallback(async (query: string, listings: any[]) => {
    if (!query.trim()) {
      setResults([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await AISearch.search(query, listings);
      if (response.success && response.data) {
        setResults(response.data.results);
        return response.data.results;
      } else {
        setError(response.error || 'Search service is temporarily offline.');
        return [];
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to complete semantic query analysis.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    results,
    search,
  };
}
