/**
 * AI Price Recommendation Module
 */
import { AIService } from '../services/ai-service';
import { PriceRecommendationInput, PriceRecommendationResult, AIResponse } from '../types';

export const AIPriceRecommendation = {
  async recommend(input: PriceRecommendationInput): Promise<AIResponse<PriceRecommendationResult>> {
    return AIService.recommendPrice(input);
  }
};
