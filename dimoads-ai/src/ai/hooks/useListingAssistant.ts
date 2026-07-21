import { useState, useCallback } from 'react';
import { ListingAssistant } from '../assistant';
import { ListingAssistantResult } from '../types';

export function useListingAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ListingAssistantResult | null>(null);

  const generateListingDetails = useCallback(async (rawInput: string, originalLanguage: string = 'en') => {
    if (!rawInput.trim()) {
      setError('Please provide some information about your item.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ListingAssistant.generate({ rawInput, originalLanguage });
      if (response.success && response.data) {
        setResult(response.data);
        return response.data;
      } else {
        setError(response.error || 'Failed to generate listing assistant results.');
        return null;
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during generation.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    generateListingDetails,
    clearResult,
  };
}
