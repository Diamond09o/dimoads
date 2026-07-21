/**
 * AI Semantic Search Module
 */
import { AIService } from '../services/ai-service';
import { AIResponse } from '../types';

export const AISearch = {
  async search(query: string, listings: any[]): Promise<AIResponse<{ results: { id: string; relevanceScore: number; matchReason: string }[] }>> {
    return AIService.searchListings(query, listings);
  }
};
