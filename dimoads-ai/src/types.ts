/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category =
  | 'jobs'
  | 'real-estate'
  | 'vehicles'
  | 'electronics'
  | 'services'
  | 'businesses-for-sale'
  | 'investment-opportunities'
  | 'industrial-equipment'
  | 'commodities';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountType: 'personal' | 'business';
  verificationStatus: 'unverified' | 'pending' | 'verified';
  trustScore: number; // 0 to 100
  createdAt: string;
}

export interface ContactOptions {
  phone: string;
  email: string;
  whatsapp: string;
}

export interface Translation {
  title: string;
  description: string;
}

export interface OptimizedImage {
  originalUrl: string;
  thumbnailUrl: string;
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
  analysis?: {
    isBlurry: boolean;
    blurScore: number; // 0 (completely blurry) to 100 (crisp)
    isDuplicate: boolean;
    duplicateHash: string; // Perceptual hash for client-side duplicate detection
    isInappropriate: boolean;
    safetyScore: number; // 0 to 100
    aestheticScore: number; // 0 to 100
    isRecommendedCover: boolean;
  };
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  price: number;
  images: string[];
  optimizedImages?: OptimizedImage[];
  video?: string;
  contactOptions: ContactOptions;
  ownerId: string;
  isPremium: boolean;
  status: 'pending' | 'active' | 'suspended' | 'sold';
  aiTags: string[];
  originalLanguage: 'en' | 'ar';
  translations?: {
    ar?: Translation;
    en?: Translation;
  };
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
}

export interface Report {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export type AppLanguage =
  | 'en' | 'ar' | 'zh-CN' | 'es' | 'fr' | 'hi' | 'pt' | 'ru' | 'id' | 'de'
  | 'ja' | 'ko' | 'tr' | 'it' | 'pl' | 'nl' | 'bn' | 'ur' | 'vi' | 'th';

export interface AdminAnalytics {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  reportedListingsCount: number;
  premiumRevenue: number;
  premiumListingsCount: number;
}
