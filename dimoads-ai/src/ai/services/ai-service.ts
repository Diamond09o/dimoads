/**
 * AIService: Strongly-typed orchestrator for all AI Platform services
 */
import { AIClient } from './ai-client';
import {
  ListingAssistantInput,
  ListingAssistantResult,
  TranslationInput,
  TranslationResult,
  PriceRecommendationInput,
  PriceRecommendationResult,
  FraudDetectionInput,
  FraudDetectionResult,
  SEOGenerationInput,
  SEOGenerationResult,
  RecommendationInput,
  RecommendationResult,
  ContentModerationInput,
  ContentModerationResult,
  AIResponse,
} from '../types';

export const AIService = {
  /**
   * 1. Listing Assistant: Generates Title, Description, Category, Tags from raw input
   */
  async generateListing(input: ListingAssistantInput): Promise<AIResponse<ListingAssistantResult>> {
    return AIClient.request<ListingAssistantResult>(
      '/api/gemini/listing-assistant',
      {
        promptText: input.rawInput,
        originalLanguage: input.originalLanguage || 'en',
      }
    );
  },

  /**
   * 2. Semantic AI Search: Natural language search across listings
   */
  async searchListings(query: string, listings: any[]): Promise<AIResponse<{ results: { id: string; relevanceScore: number; matchReason: string }[] }>> {
    return AIClient.request<{ results: { id: string; relevanceScore: number; matchReason: string }[] }>(
      '/api/gemini/search',
      { query, listings },
      { useCache: true, ttlMs: 1000 * 60 * 5 } // 5 Minutes query cache
    );
  },

  /**
   * 3. AI Translation: Fluent multi-language translator
   */
  async translateListing(input: TranslationInput): Promise<AIResponse<TranslationResult>> {
    return AIClient.request<TranslationResult>(
      '/api/gemini/translate',
      {
        title: input.title,
        description: input.description,
        targetLang: input.targetLang,
      }
    );
  },

  /**
   * 4. AI Price Recommendation: Smart marketplace valuation
   */
  async recommendPrice(input: PriceRecommendationInput): Promise<AIResponse<PriceRecommendationResult>> {
    return AIClient.request<PriceRecommendationResult>(
      '/api/ai/pricing',
      input
    );
  },

  /**
   * 5. Fraud Detection Radar: Scans listing parameters for anomalies
   */
  async detectFraud(input: FraudDetectionInput): Promise<AIResponse<FraudDetectionResult>> {
    return AIClient.request<FraudDetectionResult>(
      '/api/gemini/fraud-detection',
      {
        title: input.title,
        description: input.description,
        price: input.price,
        category: input.category,
        phone: input.phone,
      }
    );
  },

  /**
   * 6. SEO Generator: Creates titles, meta-descriptions, keywords, and slugs
   */
  async generateSEO(input: SEOGenerationInput): Promise<AIResponse<SEOGenerationResult>> {
    return AIClient.request<SEOGenerationResult>(
      '/api/ai/seo',
      input
    );
  },

  /**
   * 7. Recommendation Engine: Generates personalized recommendations
   */
  async getRecommendations(input: RecommendationInput, listings: any[]): Promise<AIResponse<RecommendationResult>> {
    return AIClient.request<RecommendationResult>(
      '/api/ai/recommendations',
      { ...input, listings }
    );
  },

  /**
   * 8. Safe-Marketplace Content Moderation: Audits text listings for safety
   */
  async moderateContent(input: ContentModerationInput): Promise<AIResponse<ContentModerationResult>> {
    return AIClient.request<ContentModerationResult>(
      '/api/ai/moderation',
      input
    );
  },
};
