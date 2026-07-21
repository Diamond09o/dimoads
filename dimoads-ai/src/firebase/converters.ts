/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore';
import { User, Listing } from '../types';

/**
 * Converter to translate Firestore user document to/from application User object.
 * 
 * Target schema requirements:
 * - uid, displayName, email, phone, photoURL, accountType, verified, trustScore, country, city, createdAt, updatedAt
 */
export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: User): DocumentData {
    return {
      uid: user.id,
      displayName: user.name,
      email: user.email,
      phone: user.phone,
      photoURL: '',
      accountType: user.accountType,
      verified: user.verificationStatus === 'verified',
      trustScore: user.trustScore,
      country: 'EG',
      city: 'Cairo',
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): User {
    const data = snapshot.data();
    return {
      id: data.uid || snapshot.id,
      name: data.displayName || 'Unknown User',
      email: data.email || '',
      phone: data.phone || '',
      accountType: data.accountType || 'personal',
      verificationStatus: data.verified ? 'verified' : (data.verificationStatus || 'pending'),
      trustScore: typeof data.trustScore === 'number' ? data.trustScore : 75,
      createdAt: data.createdAt || new Date().toISOString()
    };
  }
};

/**
 * Converter to translate Firestore listing document to/from application Listing object.
 * 
 * Target schema requirements:
 * - id, title, description, categoryId, sellerId, price, currency, country, city, latitude, longitude, images, video, status, views, favorites, createdAt, updatedAt
 */
export const listingConverter: FirestoreDataConverter<Listing> = {
  toFirestore(listing: Listing): DocumentData {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      categoryId: listing.category,
      sellerId: listing.ownerId,
      price: listing.price,
      currency: 'USD',
      country: 'EG',
      city: listing.location || 'Cairo',
      latitude: 30.0444,
      longitude: 31.2357,
      images: listing.images || [],
      video: listing.video || '',
      status: listing.status || 'active',
      views: listing.viewsCount || 0,
      favorites: [],
      createdAt: listing.createdAt || new Date().toISOString(),
      updatedAt: listing.updatedAt || new Date().toISOString(),
      // Carry other properties used in original code
      isPremium: listing.isPremium || false,
      aiTags: listing.aiTags || [],
      originalLanguage: listing.originalLanguage || 'en',
      translations: listing.translations || {}
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Listing {
    const data = snapshot.data();
    return {
      id: data.id || snapshot.id,
      title: data.title || '',
      description: data.description || '',
      category: data.categoryId || 'electronics',
      location: data.city || 'Cairo',
      price: typeof data.price === 'number' ? data.price : 0,
      images: data.images || [],
      video: data.video || '',
      contactOptions: data.contactOptions || {
        phone: data.phone || '',
        email: data.email || '',
        whatsapp: data.whatsapp || ''
      },
      ownerId: data.sellerId || '',
      isPremium: !!data.isPremium,
      status: data.status || 'active',
      aiTags: data.aiTags || [],
      originalLanguage: data.originalLanguage || 'en',
      translations: data.translations || {},
      viewsCount: typeof data.views === 'number' ? data.views : 0,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
  }
};
