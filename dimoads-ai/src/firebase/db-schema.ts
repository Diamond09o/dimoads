/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccountType } from '../features/auth/AuthProvider';

/**
 * 1. USERS COLLECTION SCHEMA
 * Location: users/{uid}
 */
export interface FirestoreUserProfile {
  uid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  coverPhoto: string;
  bio: string;
  accountType: AccountType;
  verified: boolean;
  trustScore: number;
  country: string;
  city: string;
  language: 'en' | 'ar';
  currency: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  status: 'active' | 'suspended';
  notificationSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    marketingEnabled: boolean;
  };
  privacySettings: {
    showPhone: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
  deviceTokens: string[];
}

/**
 * 2. LISTINGS COLLECTION SCHEMA
 * Location: listings/{listingId}
 */
export interface FirestoreListing {
  listingId: string;
  sellerId: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
  images: string[];
  video: string;
  thumbnail: string;
  status: 'active' | 'sold' | 'expired' | 'suspended' | 'draft';
  featured: boolean;
  premium: boolean;
  condition: 'new' | 'like_new' | 'excellent' | 'good' | 'fair';
  brand?: string;
  model?: string;
  year?: number;
  specifications: Record<string, any>;
  views: number;
  favoritesCount: number;
  shareCount: number;
  reportCount: number;
  seoKeywords: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

/**
 * 3. CATEGORIES COLLECTION SCHEMA
 * Location: categories/{categoryId}
 */
export interface FirestoreCategory {
  categoryId: string;
  nameEn: string;
  nameAr: string;
  parentId: string | null; // For infinite nested category hierarchy
  slug: string;
  icon: string;
  level: number; // 0 for root, 1 for sub, etc.
}

/**
 * 4. COUNTRIES COLLECTION SCHEMA
 * Location: countries/{countryCode} (e.g. countries/EG)
 */
export interface FirestoreCountry {
  countryCode: string;
  nameEn: string;
  nameAr: string;
  currency: string;
  phoneCode: string;
  status: 'active' | 'inactive';
}

/**
 * 5. CITIES COLLECTION SCHEMA
 * Location: cities/{cityId}
 */
export interface FirestoreCity {
  cityId: string;
  countryCode: string;
  nameEn: string;
  nameAr: string;
  status: 'active' | 'inactive';
  latitude: number;
  longitude: number;
}

/**
 * 6. FAVORITES COLLECTION SCHEMA
 * Location: favorites/{userId}
 * Optimize read performance with a list, or doc per user
 */
export interface FirestoreFavorite {
  favoriteId: string; // userId_listingId
  userId: string;
  listingId: string;
  createdAt: string;
}

/**
 * 7. MESSAGES COLLECTION SCHEMA
 * Location: messages/{messageId}
 */
export interface FirestoreMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: 'text' | 'image' | 'video' | 'location' | 'document';
  mediaUrl?: string;
  read: boolean;
  createdAt: string;
}

/**
 * 8. CONVERSATIONS COLLECTION SCHEMA
 * Location: conversations/{conversationId}
 */
export interface FirestoreConversation {
  conversationId: string;
  participantIds: string[];
  lastMessage: string;
  lastSenderId: string;
  lastMessageAt: string;
  unreadCounts: Record<string, number>; // Map of participant uid to unread count
}

/**
 * 9. NOTIFICATIONS COLLECTION SCHEMA
 * Location: notifications/{notificationId}
 */
export interface FirestoreNotification {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  type: 'system' | 'message' | 'offer' | 'promotion' | 'report_resolved';
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

/**
 * 10. REPORTS COLLECTION SCHEMA
 * Location: reports/{reportId}
 */
export interface FirestoreReport {
  reportId: string;
  listingId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  details: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

/**
 * 11. REVIEWS COLLECTION SCHEMA
 * Location: reviews/{reviewId}
 */
export interface FirestoreReview {
  reviewId: string;
  reviewerId: string;
  targetUserId: string;
  listingId: string;
  rating: number; // 1 to 5
  text: string;
  createdAt: string;
}

/**
 * 12. PAYMENTS COLLECTION SCHEMA
 * Location: payments/{paymentId}
 */
export interface FirestorePayment {
  paymentId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'credit_card' | 'paypal' | 'fawry' | 'apple_pay' | 'google_pay';
  transactionId: string;
  type: 'subscription' | 'ad_boost' | 'featured_listing';
  description: string;
  createdAt: string;
}

/**
 * 13. SUBSCRIPTIONS COLLECTION SCHEMA
 * Location: subscriptions/{subscriptionId}
 */
export interface FirestoreSubscription {
  subscriptionId: string;
  userId: string;
  planId: string; // 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  billingPeriod: 'monthly' | 'yearly';
  amount: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
}

/**
 * 14. ADVERTISEMENTS COLLECTION SCHEMA
 * Location: advertisements/{adId}
 */
export interface FirestoreAdvertisement {
  adId: string;
  advertiserId: string;
  listingId?: string;
  title: string;
  placement: 'home_hero' | 'sidebar' | 'category_header' | 'native_listings';
  startDate: string;
  endDate: string;
  budget: number;
  impressions: number;
  clicks: number;
  status: 'pending' | 'active' | 'paused' | 'expired';
  createdAt: string;
}

/**
 * 15. SAVED_SEARCHES COLLECTION SCHEMA
 * Location: saved_searches/{searchId}
 */
export interface FirestoreSavedSearch {
  searchId: string;
  userId: string;
  query: string;
  filters: Record<string, any>;
  createdAt: string;
  emailAlert: boolean;
}

/**
 * 16. RECENT_SEARCHES COLLECTION SCHEMA
 * Location: recent_searches/{searchId}
 */
export interface FirestoreRecentSearch {
  searchId: string;
  userId: string;
  query: string;
  createdAt: string;
}

/**
 * 17. USER_ACTIVITY COLLECTION SCHEMA
 * Location: user_activity/{activityId}
 */
export interface FirestoreUserActivity {
  activityId: string;
  userId: string;
  type: 'view_listing' | 'search' | 'contact_seller' | 'share_listing' | 'favorite_listing';
  targetId: string; // e.g. listingId
  metadata: Record<string, any>;
  createdAt: string;
}

/**
 * 18. ANALYTICS COLLECTION SCHEMA
 * Location: analytics/{metricId}
 */
export interface FirestoreAnalytics {
  metricId: string;
  name: string; // e.g. 'daily_active_users', 'listings_created'
  value: number;
  dimensions: Record<string, string>; // e.g. { country: 'EG', category: 'cars' }
  timestamp: string;
}

/**
 * 19. SETTINGS COLLECTION SCHEMA
 * Location: settings/{settingId}
 */
export interface FirestoreSetting {
  settingId: string;
  key: string;
  value: any;
  description: string;
  updatedAt: string;
  updatedBy: string;
}

/**
 * 20. SUPPORT_TICKETS COLLECTION SCHEMA
 * Location: support_tickets/{ticketId}
 */
export interface FirestoreSupportTicket {
  ticketId: string;
  userId: string;
  subject: string;
  description: string;
  category: 'account' | 'payment' | 'listing' | 'fraud' | 'other';
  status: 'open' | 'pending' | 'resolved';
  messages: Array<{
    senderId: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 21. VERIFICATION_REQUESTS COLLECTION SCHEMA
 * Location: verification_requests/{requestId}
 */
export interface FirestoreVerificationRequest {
  requestId: string;
  userId: string;
  documentType: 'national_id' | 'passport' | 'commercial_license' | 'tax_card';
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
