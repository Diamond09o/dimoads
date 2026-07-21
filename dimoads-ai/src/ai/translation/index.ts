/**
 * AI Translation Module
 */
import { AIService } from '../services/ai-service';
import { TranslationInput, TranslationResult, AIResponse } from '../types';

export const AITranslation = {
  async translate(input: TranslationInput): Promise<AIResponse<TranslationResult>> {
    return AIService.translateListing(input);
  }
};
