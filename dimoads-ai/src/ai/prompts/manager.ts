/**
 * PromptManager: Centrally manages and retrieves prompt templates
 */
import { PromptTemplates } from './templates';

export const PromptManager = {
  getListingAssistantPrompt(rawInput: string, originalLanguage: string = 'en') {
    return {
      systemInstruction: PromptTemplates.LISTING_ASSISTANT.systemInstruction,
      contents: PromptTemplates.LISTING_ASSISTANT.userPrompt(rawInput, originalLanguage)
    };
  },

  getTranslationPrompt(title: string, description: string, targetLang: string) {
    return {
      systemInstruction: PromptTemplates.TRANSLATION.systemInstruction,
      contents: PromptTemplates.TRANSLATION.userPrompt(title, description, targetLang)
    };
  },

  getPricePrompt(category: string, brand: string, model: string, year: number | string, condition: string, location: string) {
    return {
      systemInstruction: PromptTemplates.PRICE_RECOMMENDATION.systemInstruction,
      contents: PromptTemplates.PRICE_RECOMMENDATION.userPrompt(category, brand, model, year, condition, location)
    };
  },

  getFraudPrompt(title: string, description: string, price: number, category: string, phone?: string) {
    return {
      systemInstruction: PromptTemplates.FRAUD_DETECTION.systemInstruction,
      contents: PromptTemplates.FRAUD_DETECTION.userPrompt(title, description, price, category, phone)
    };
  },

  getSEOPrompt(title: string, description: string, category: string) {
    return {
      systemInstruction: PromptTemplates.SEO_GENERATOR.systemInstruction,
      contents: PromptTemplates.SEO_GENERATOR.userPrompt(title, description, category)
    };
  },

  getRecommendationsPrompt(favorites: string[], searchHistory: string[], listings: any[], location?: string, category?: string) {
    return {
      systemInstruction: PromptTemplates.RECOMMENDATION.systemInstruction,
      contents: PromptTemplates.RECOMMENDATION.userPrompt(favorites, searchHistory, listings, location, category)
    };
  },

  getModerationPrompt(title: string, description: string, contactInfo?: string) {
    return {
      systemInstruction: PromptTemplates.CONTENT_MODERATION.systemInstruction,
      contents: PromptTemplates.CONTENT_MODERATION.userPrompt(title, description, contactInfo)
    };
  }
};
