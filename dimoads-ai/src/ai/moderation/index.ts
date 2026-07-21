/**
 * Safe-Marketplace Content Moderation Module
 */
import { AIService } from '../services/ai-service';
import { ContentModerationInput, ContentModerationResult, AIResponse } from '../types';

export const ContentModeration = {
  async moderate(input: ContentModerationInput): Promise<AIResponse<ContentModerationResult>> {
    return AIService.moderateContent(input);
  }
};
