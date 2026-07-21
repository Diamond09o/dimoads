/**
 * Enterprise AI Platform Type Definitions
 */

export interface ListingAssistantInput {
  rawInput: string;
  originalLanguage?: string;
}

export interface ListingAssistantResult {
  title: string;
  description: string;
  seoKeywords: string[];
  hashtags: string[];
  suggestedCategory: string;
  suggestedPrice: number;
  suggestedTags: string[];
  grammarImproved: boolean;
}

export interface TranslationInput {
  title: string;
  description: string;
  targetLang: 'ar' | 'en' | 'fr' | 'hi' | 'ur' | 'zh';
}

export interface TranslationResult {
  title: string;
  description: string;
  language: string;
}

export interface PriceRecommendationInput {
  category: string;
  brand: string;
  model: string;
  year?: number;
  condition: 'new' | 'like-new' | 'excellent' | 'good' | 'fair';
  location: string;
}

export interface PriceRecommendationResult {
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  confidenceScore: number; // 0 to 100
  reasoning: string;
}

export interface FraudDetectionInput {
  title: string;
  description: string;
  price: number;
  category: string;
  phone?: string;
  imageUrls?: string[];
}

export interface FraudDetectionResult {
  isSuspicious: boolean;
  scamScore: number; // 0 to 100
  flags: string[];
  reason: string;
}

export interface SEOGenerationInput {
  title: string;
  description: string;
  category: string;
}

export interface SEOGenerationResult {
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  slug: string;
  openGraphDescription: string;
}

export interface RecommendationInput {
  userId: string;
  favorites: string[];
  searchHistory: string[];
  location?: string;
  category?: string;
  currentListingId?: string;
}

export interface RecommendationResult {
  recommendedIds: string[];
  reasons: Record<string, string>; // Maps listing ID to match reason
}

export interface ContentModerationInput {
  title: string;
  description: string;
  contactInfo?: string;
}

export interface ContentModerationResult {
  isSafe: boolean;
  flagReasons: string[];
  categories: {
    adult: boolean;
    violence: boolean;
    illegalProducts: boolean;
    hateSpeech: boolean;
    offensiveLanguage: boolean;
    fakeContactInfo: boolean;
  };
}

export interface AICacheConfig {
  ttlMs?: number;
}

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}
