/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Listing, User, Report, Message } from '../types';
import { initialListings, mockUsers, initialReports } from '../data';
import {
  getPersistedListings,
  savePersistedListings,
  getPersistedUsers,
  savePersistedUsers,
  getPersistedReports,
  savePersistedReports,
  getPersistedMessages,
  savePersistedMessages,
  getCurrentUserId as getStoredCurrentUserId,
  setCurrentUserId as setStoredCurrentUserId,
} from './filePersistence';

// Public config from environment variables
const metaEnv = (import.meta as any).env || {};

const requiredEnvVars = [
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID'
] as const;

const missingVars: string[] = [];
requiredEnvVars.forEach((v) => {
  if (!metaEnv[v]) {
    missingVars.push(v);
  }
});

if (missingVars.length > 0) {
  const errorMsg = `Missing required Firebase environment variables: ${missingVars.join(', ')}. Please configure them in your .env file or environment settings.`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

const firebaseConfig = {
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
  appId: metaEnv.VITE_FIREBASE_APP_ID,
  apiKey: metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID
};

const databaseId = metaEnv.VITE_FIREBASE_DATABASE_ID;

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, databaseId);
export const storage = getStorage(app);

// ----------------------------------------------------
// DATABASE ACCESSORS & LOCAL STATE BRIDGES
// ----------------------------------------------------

/**
 * Initialize local persistence defaults.
 */
export function initializeLocalDatabase() {
  const persistedListings = getPersistedListings();
  if (!persistedListings.length) {
    savePersistedListings(initialListings);
  }

  const persistedUsers = getPersistedUsers();
  if (!Object.keys(persistedUsers).length) {
    savePersistedUsers(mockUsers);
  }

  const persistedReports = getPersistedReports();
  if (!persistedReports.length) {
    savePersistedReports(initialReports);
  }

  const persistedMessages = getPersistedMessages();
  if (!persistedMessages.length) {
    savePersistedMessages([]);
  }
}

// Kick off local seeding
initializeLocalDatabase();

/**
 * Returns persisted listings for synchronous UI reads.
 */
export function getLocalListings(): Listing[] {
  return getPersistedListings();
}

/**
 * Saves modified listing changes to local persistence.
 */
export function saveLocalListings(listings: Listing[]) {
  savePersistedListings(listings);
}

/**
 * Returns persisted users for initial UI render.
 */
export function getLocalUsers(): Record<string, User> {
  return getPersistedUsers();
}

/**
 * Saves profile updates to local persistence.
 */
export function saveLocalUsers(users: Record<string, User>) {
  savePersistedUsers(users);
}

/**
 * Returns persisted reports.
 */
export function getLocalReports(): Report[] {
  return getPersistedReports();
}

export function saveLocalReports(reports: Report[]) {
  savePersistedReports(reports);
}

export function getLocalMessages(): Message[] {
  return getPersistedMessages();
}

export function saveLocalMessages(messages: Message[]) {
  savePersistedMessages(messages);
}

export function getCurrentUserId(): string {
  return getStoredCurrentUserId();
}

export function setCurrentUserId(uid: string) {
  setStoredCurrentUserId(uid);
}

// ----------------------------------------------------
// TRANSACTION METHODS (Core Marketplace Actions)
// ----------------------------------------------------

export function calculateTrustScore(user: User): number {
  let score = 50; // Base score
  if (user.verificationStatus === 'verified') score += 30;
  if (user.verificationStatus === 'pending') score += 10;
  if (user.accountType === 'business') score += 10;
  if (user.name.length > 5) score += 5;
  if (user.phone && user.phone.trim().length > 7) score += 5;
  
  return Math.min(100, Math.max(0, score));
}

export function createListing(
  listingData: Omit<Listing, 'id' | 'viewsCount' | 'createdAt' | 'updatedAt'>,
  customId?: string
): Listing {
  const newListing: Listing = {
    ...listingData,
    id: customId || `list-${Date.now()}`,
    viewsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const existingListings = getLocalListings();
  saveLocalListings([...existingListings, newListing]);

  return newListing;
}

export function incrementListingViews(id: string) {
  const listings = getLocalListings();
  const nextListings = listings.map(listing => {
    if (listing.id === id) {
      return { ...listing, viewsCount: (listing.viewsCount || 0) + 1, updatedAt: new Date().toISOString() };
    }
    return listing;
  });
  saveLocalListings(nextListings);
}

export function fileReport(listingId: string, reporterId: string, reason: string): Report {
  const rep: Report = {
    id: `rep-${Date.now()}`,
    listingId,
    reporterId,
    reason,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const reports = getLocalReports();
  saveLocalReports([...reports, rep]);

  return rep;
}

export function resolveReport(reportId: string, action: 'suspend' | 'dismiss') {
  const status: Report['status'] = action === 'suspend' ? 'resolved' : 'dismissed';
  const reports = getLocalReports();
  const nextReports = reports.map(report => report.id === reportId ? { ...report, status } : report);
  saveLocalReports(nextReports);

  if (action === 'suspend') {
    const report = nextReports.find(item => item.id === reportId);
    if (report) {
      const listings = getLocalListings().map(listing =>
        listing.id === report.listingId ? { ...listing, status: 'suspended' as const, updatedAt: new Date().toISOString() } : listing
      );
      saveLocalListings(listings);
    }
  }
}

export function sendMessage(senderId: string, receiverId: string, text: string): Message {
  const chatId = [senderId, receiverId].sort().join('-');
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    chatId,
    senderId,
    receiverId,
    text,
    createdAt: new Date().toISOString()
  };

  const messages = getLocalMessages();
  saveLocalMessages([...messages, newMessage]);

  return newMessage;
}

export default app;
