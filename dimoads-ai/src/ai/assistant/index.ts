/**
 * Listing Assistant Module
 */
import { AIService } from '../services/ai-service';
import { ListingAssistantInput, ListingAssistantResult, AIResponse } from '../types';

export const ListingAssistant = {
  async generate(input: ListingAssistantInput): Promise<AIResponse<ListingAssistantResult>> {
    return AIService.generateListing(input);
  }
};
