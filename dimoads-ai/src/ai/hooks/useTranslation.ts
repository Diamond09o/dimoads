import { useState, useCallback } from 'react';
import { AITranslation } from '../translation';
import { TranslationResult } from '../types';

export function useTranslation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateListing = useCallback(
    async (title: string, description: string, targetLang: 'ar' | 'en' | 'fr' | 'hi' | 'ur' | 'zh') => {
      if (!title || !description) {
        setError('Title and description are required for translation.');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await AITranslation.translate({ title, description, targetLang });
        if (response.success && response.data) {
          return response.data;
        } else {
          setError(response.error || 'Translation failed.');
          return null;
        }
      } catch (err: any) {
        setError(err?.message || 'Unexpected error during translation.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    translateListing,
  };
}
