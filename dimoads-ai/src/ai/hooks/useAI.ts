import { useState, useCallback } from 'react';
import { AIService } from '../services/ai-service';
import { AIResponse } from '../types';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTask = useCallback(async <T>(task: () => Promise<AIResponse<T>>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await task();
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to execute AI task');
        return null;
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    setError,
    runTask,
    aiService: AIService,
  };
}
