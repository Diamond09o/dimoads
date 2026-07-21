/**
 * AIClient: Enterprise-grade client interface for AI endpoints
 */
import { AICacheService } from '../utils/cache';
import { AIResponse } from '../types';

export class AIErrorHandler {
  public static handle(error: any): string {
    console.error('[AI Error Handler] Caught error:', error);
    if (error.name === 'AbortError') {
      return 'The AI request timed out. Please try again.';
    }
    if (error.status === 429) {
      return 'Gemini API rate limit exceeded. Please wait a moment.';
    }
    if (error.status === 503) {
      return 'Gemini AI service is currently unavailable. Retrying shortly...';
    }
    return error.message || 'An unexpected error occurred in the AI Platform.';
  }
}

export class ResponseParser {
  public static parse<T>(data: any): T {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data.trim()) as T;
      } catch (e) {
        throw new Error('AI returned an invalid JSON schema response.');
      }
    }
    return data as T;
  }
}

export class AIClient {
  private static DEFAULT_TIMEOUT = 15000; // 15 seconds timeout

  /**
   * Universal fetch method with Timeout and Error Handling
   */
  public static async request<T>(
    endpoint: string,
    payload: any,
    options?: { useCache?: boolean; ttlMs?: number; timeoutMs?: number }
  ): Promise<AIResponse<T>> {
    const useCache = options?.useCache !== false;
    const cacheKey = AICacheService.generateKey(endpoint, payload);

    // 1. Return cached response if available
    if (useCache) {
      const cachedData = AICacheService.get<T>(cacheKey);
      if (cachedData) {
        console.log(`[AI Cache] Hit for ${endpoint}`);
        return { success: true, data: cachedData, cached: true };
      }
    }

    // 2. Setup timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeoutMs || this.DEFAULT_TIMEOUT);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errObj = { status: response.status, message: `HTTP error ${response.status}` };
        try {
          const body = await response.json();
          errObj.message = body.error || errObj.message;
        } catch (_) {}
        throw errObj;
      }

      const body = await response.json();
      const parsedData = ResponseParser.parse<T>(body);

      // 3. Populate cache
      if (useCache) {
        AICacheService.set(cacheKey, parsedData, options?.ttlMs);
      }

      return { success: true, data: parsedData };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const errorMessage = AIErrorHandler.handle(err);
      return { success: false, error: errorMessage };
    }
  }
}
