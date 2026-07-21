/**
 * Recommendation Engine Module
 */
import { AIService } from '../services/ai-service';
import { RecommendationInput, RecommendationResult, AIResponse } from '../types';

export const RecommendationEngine = {
  async get(input: RecommendationInput, listings: any[]): Promise<AIResponse<RecommendationResult>> {
    return AIService.getRecommendations(input, listings);
  }
};
