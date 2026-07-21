/**
 * SEO Generator Module
 */
import { AIService } from '../services/ai-service';
import { SEOGenerationInput, SEOGenerationResult, AIResponse } from '../types';

export const SEOGenerator = {
  async generate(input: SEOGenerationInput): Promise<AIResponse<SEOGenerationResult>> {
    return AIService.generateSEO(input);
  }
};
