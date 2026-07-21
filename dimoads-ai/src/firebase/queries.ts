/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  Query,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from './collections';
import { listingConverter, userConverter } from './converters';
import { Listing, User } from '../types';

/**
 * Creates a query for active classified listings, ordered by creation date (newest first).
 */
export function getActiveListingsQuery(): Query<Listing, DocumentData> {
  return query(
    collection(db, COLLECTIONS.LISTINGS).withConverter(listingConverter),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Creates a query for listings created by a specific user.
 */
export function getUserListingsQuery(userId: string): Query<Listing, DocumentData> {
  return query(
    collection(db, COLLECTIONS.LISTINGS).withConverter(listingConverter),
    where('sellerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Creates a query for listings filtered by category ID.
 */
export function getListingsByCategoryQuery(categoryId: string): Query<Listing, DocumentData> {
  return query(
    collection(db, COLLECTIONS.LISTINGS).withConverter(listingConverter),
    where('categoryId', '==', categoryId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Creates a query for all pending abuse/fraud reports.
 */
export function getPendingReportsQuery(): Query<DocumentData, DocumentData> {
  return query(
    collection(db, COLLECTIONS.REPORTS),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
}

/**
 * Creates a query for users with high trustworthiness scores.
 */
export function getTrustedUsersQuery(): Query<User, DocumentData> {
  return query(
    collection(db, COLLECTIONS.USERS).withConverter(userConverter),
    where('trustScore', '>=', 80),
    orderBy('trustScore', 'desc')
  );
}

/**
 * DB QUERIES SERVICE
 * High-performance reusable query functions for international classified marketplace
 */
export const DbQueries = {
  /**
   * 1. Get Latest Listings
   * Optimized for homepage listing feed with country / city filter
   */
  async getLatestListings(options?: {
    country?: string;
    city?: string;
    maxLimit?: number;
  }): Promise<Listing[]> {
    const constraints: QueryConstraint[] = [];
    
    // Always filter by active listings
    constraints.push(where('status', '==', 'active'));
    
    if (options?.country) {
      constraints.push(where('country', '==', options.country));
    }
    if (options?.city) {
      constraints.push(where('city', '==', options.city));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(options?.maxLimit || 24));

    const q = query(
      collection(db, COLLECTIONS.LISTINGS),
      ...constraints
    ).withConverter(listingConverter);
    
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  /**
   * 2. Get Popular Listings (Sorted by Views Count / Visibility)
   */
  async getPopularListings(options?: {
    category?: string;
    maxLimit?: number;
  }): Promise<Listing[]> {
    const constraints: QueryConstraint[] = [];
    
    constraints.push(where('status', '==', 'active'));
    
    if (options?.category) {
      constraints.push(where('categoryId', '==', options.category));
    }
    
    constraints.push(orderBy('views', 'desc'));
    constraints.push(limit(options?.maxLimit || 12));

    const q = query(
      collection(db, COLLECTIONS.LISTINGS),
      ...constraints
    ).withConverter(listingConverter);

    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  /**
   * 3. Get Featured / Premium Sponsored Listings
   */
  async getFeaturedListings(options?: {
    country?: string;
    maxLimit?: number;
  }): Promise<Listing[]> {
    const constraints: QueryConstraint[] = [];
    
    constraints.push(where('status', '==', 'active'));
    constraints.push(where('isPremium', '==', true));
    
    if (options?.country) {
      constraints.push(where('country', '==', options.country));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(options?.maxLimit || 8));

    const q = query(
      collection(db, COLLECTIONS.LISTINGS),
      ...constraints
    ).withConverter(listingConverter);

    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  /**
   * 4. Get Listings By Category
   */
  async getListingsByCategory(categoryId: string, maxLimit = 24): Promise<Listing[]> {
    const q = query(
      collection(db, COLLECTIONS.LISTINGS),
      where('status', '==', 'active'),
      where('categoryId', '==', categoryId),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    ).withConverter(listingConverter);

    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  /**
   * 5. Get Listings By Country
   */
  async getListingsByCountry(countryCode: string, maxLimit = 24): Promise<Listing[]> {
    const q = query(
      collection(db, COLLECTIONS.LISTINGS),
      where('status', '==', 'active'),
      where('country', '==', countryCode),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    ).withConverter(listingConverter);

    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  /**
   * 6. Get Listings By City
   */
  async getListingsByCity(city: string, maxLimit = 24): Promise<Listing[]> {
    const q = query(
      collection(db, COLLECTIONS.LISTINGS),
      where('status', '==', 'active'),
      where('city', '==', city),
      orderBy('createdAt', 'desc'),
      limit(maxLimit)
    ).withConverter(listingConverter);

    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  /**
   * 7. Get Listings By Seller
   */
  async getListingsBySeller(sellerId: string): Promise<Listing[]> {
    const q = query(
      collection(db, COLLECTIONS.LISTINGS),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    ).withConverter(listingConverter);

    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data());
  },

  /**
   * 8. Get Related Listings (Same category, excluding current listing)
   */
  async getRelatedListings(categoryId: string, excludeListingId: string, maxLimit = 4): Promise<Listing[]> {
    const q = query(
      collection(db, COLLECTIONS.LISTINGS),
      where('status', '==', 'active'),
      where('categoryId', '==', categoryId),
      limit(maxLimit + 1)
    ).withConverter(listingConverter);

    const snap = await getDocs(q);
    const listings = snap.docs.map(doc => doc.data());
    return listings.filter(l => l.id !== excludeListingId).slice(0, maxLimit);
  },

  /**
   * 9. Get Saved Favorites for a User
   */
  async getUserFavorites(userId: string): Promise<Listing[]> {
    const favDocRef = doc(db, COLLECTIONS.FAVORITES, userId);
    const favSnap = await getDoc(favDocRef);
    if (!favSnap.exists()) return [];

    const listingIds: string[] = favSnap.data().listingIds || [];
    if (listingIds.length === 0) return [];

    // Split list into chunks of 10 for Firestore 'in' limit
    const results: Listing[] = [];
    const chunks: string[][] = [];
    for (let i = 0; i < listingIds.length; i += 10) {
      chunks.push(listingIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const q = query(
        collection(db, COLLECTIONS.LISTINGS),
        where('id', 'in', chunk)
      ).withConverter(listingConverter);
      const snap = await getDocs(q);
      results.push(...snap.docs.map(d => d.data()));
    }

    return results;
  }
};
