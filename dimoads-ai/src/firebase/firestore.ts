/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  increment,
  writeBatch,
  addDoc,
} from 'firebase/firestore';

import { db } from './firebase';
import { COLLECTIONS } from './collections';
import { userConverter, listingConverter } from './converters';
import { handleFirestoreError, OperationType } from './firestore-error';
import { StorageService } from './media-services';
import { mockUsers, initialListings, initialReports } from '../data';
import type { User, Listing, Message, Report } from '../types';

// ====================================================
// AUTO DATABASE SEEDING
// ====================================================

/**
 * Checks if Firestore collections are empty and pre-seeds them with
 * initial mock data.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  try {
    const listingsRef = collection(db, COLLECTIONS.LISTINGS);
    const snap = await getDocs(query(listingsRef, limit(1)));

    if (!snap.empty) {
      console.log("Dimoads Firestore already contains data.");
      return;
    }

    console.log(
      "Dimoads Firestore is empty. Initializing database pre-seeding pipeline..."
    );

    const batch = writeBatch(db);

    // Seed Users
    const usersColRef = collection(
      db,
      COLLECTIONS.USERS
    ).withConverter(userConverter);

    Object.values(mockUsers).forEach((user) => {
      const userDoc = doc(usersColRef, user.id);
      batch.set(userDoc, user);
    });


    // Seed Listings
    const listingsColRef = collection(
      db,
      COLLECTIONS.LISTINGS
    ).withConverter(listingConverter);

    initialListings.forEach((listing) => {
      const listingDoc = doc(listingsColRef, listing.id);
      batch.set(listingDoc, listing);
    });


    // Seed Reports
    const reportsColRef = collection(
      db,
      COLLECTIONS.REPORTS
    );

    initialReports.forEach((report) => {
      const reportDoc = doc(reportsColRef, report.id);

      batch.set(reportDoc, {
        id: report.id,
        listingId: report.listingId,
        reporterId: report.reporterId,
        reason: report.reason,
        status: report.status,
        createdAt:
          report.createdAt ||
          new Date().toISOString(),
      });
    });


    await batch.commit();

    console.log(
      "Dimoads Firestore pre-seeding completed successfully."
    );

  } catch (error) {

    console.error(
      "Error during Firestore database seeding:",
      error
    );

  }
}
export const UserService = {
  async getUser(uid: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, uid).withConverter(userConverter);
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.USERS}/${uid}`);
    }
  },

  async createUser(user: User): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, user.id).withConverter(userConverter);
      await setDoc(docRef, user);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.USERS}/${user.id}`);
    }
  },

  async updateUser(user: User): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, user.id).withConverter(userConverter);
      await setDoc(docRef, user, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.USERS}/${user.id}`);
    }
  },

  /**
   * Listens to all user profiles in realtime
   */
  subscribeUsers(onUpdate: (users: Record<string, User>) => void) {
    const q = collection(db, COLLECTIONS.USERS).withConverter(userConverter);
    return onSnapshot(q, (snapshot) => {
      const usersMap: Record<string, User> = {};
      snapshot.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });
      onUpdate(usersMap);
    }, (error) => {
      console.error("Users subscription error:", error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.USERS);
    });
  }
};

// ====================================================
// LISTING SERVICE
// ====================================================
export const ListingService = {
  async getListings(): Promise<Listing[]> {
    try {
      const q = collection(db, COLLECTIONS.LISTINGS).withConverter(listingConverter);
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.LISTINGS);
    }
  },

  async createListing(listing: Listing): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.LISTINGS, listing.id).withConverter(listingConverter);
      await setDoc(docRef, listing);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.LISTINGS}/${listing.id}`);
    }
  },

  async updateListing(listing: Listing): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.LISTINGS, listing.id).withConverter(listingConverter);
      await setDoc(docRef, listing, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.LISTINGS}/${listing.id}`);
    }
  },

  async deleteListing(listingId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.LISTINGS, listingId).withConverter(listingConverter);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const listing = snap.data();
        
        // Cascade delete images
        if (listing.images && listing.images.length > 0) {
          for (const url of listing.images) {
            if (url && url.includes('firebasestorage.googleapis.com')) {
              try {
                await StorageService.deleteFileByUrl(url);
              } catch (err) {
                console.warn('Cascade delete failed for image:', url, err);
              }
            }
          }
        }
        
        // Cascade delete video
        if (listing.video && listing.video.includes('firebasestorage.googleapis.com')) {
          try {
            await StorageService.deleteFileByUrl(listing.video);
          } catch (err) {
            console.warn('Cascade delete failed for video:', listing.video, err);
          }
        }
      }
      
      const rawDocRef = doc(db, COLLECTIONS.LISTINGS, listingId);
      await deleteDoc(rawDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTIONS.LISTINGS}/${listingId}`);
    }
  },

  async incrementViews(listingId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.LISTINGS, listingId);
      await updateDoc(docRef, {
        views: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.LISTINGS}/${listingId}`);
    }
  },

  async suspendListing(listingId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.LISTINGS, listingId);
      await updateDoc(docRef, {
        status: 'suspended'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.LISTINGS}/${listingId}`);
    }
  },

  /**
   * Listens to listings collection in realtime
   */
  subscribeListings(onUpdate: (listings: Listing[]) => void) {
    const q = collection(db, COLLECTIONS.LISTINGS).withConverter(listingConverter);
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => doc.data());
      onUpdate(list);
    }, (error) => {
      console.error("Listings subscription error:", error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.LISTINGS);
    });
  }
};

// ====================================================
// FAVORITE SERVICE
// ====================================================
export const FavoriteService = {
  async getFavorites(userId: string): Promise<string[]> {
    try {
      const docRef = doc(db, COLLECTIONS.FAVORITES, userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data().listingIds || [];
      }
      return [];
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.FAVORITES}/${userId}`);
    }
  },

  async addFavorite(userId: string, listingId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.FAVORITES, userId);
      const snap = await getDoc(docRef);
      const listingIds: string[] = snap.exists() ? (snap.data().listingIds || []) : [];
      if (!listingIds.includes(listingId)) {
        listingIds.push(listingId);
        await setDoc(docRef, { listingIds }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.FAVORITES}/${userId}`);
    }
  },

  async removeFavorite(userId: string, listingId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.FAVORITES, userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const listingIds: string[] = snap.data().listingIds || [];
        const updated = listingIds.filter(id => id !== listingId);
        await setDoc(docRef, { listingIds: updated }, { merge: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.FAVORITES}/${userId}`);
    }
  }
};

// ====================================================
// MESSAGE SERVICE (Realtime Chat Logs)
// ====================================================
export const MessageService = {
  async sendMessage(senderId: string, receiverId: string, text: string): Promise<Message> {
    const chatId = [senderId, receiverId].sort().join('-');
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId,
      senderId,
      receiverId,
      text,
      createdAt: new Date().toISOString()
    };
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGES, newMessage.id);
      await setDoc(docRef, newMessage);
      return newMessage;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.MESSAGES}/${newMessage.id}`);
    }
  },

  /**
   * Listen to message logs in realtime for a specific conversation thread
   */
  subscribeMessages(chatId: string, onUpdate: (messages: Message[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push(doc.data() as Message);
      });
      onUpdate(messages);
    }, (error) => {
      console.error("Messages subscription error:", error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.MESSAGES);
    });
  },

  /**
   * Listen to all messages in the system (general fallback if needed)
   */
  subscribeAllMessages(onUpdate: (messages: Message[]) => void) {
    const q = query(collection(db, COLLECTIONS.MESSAGES), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push(doc.data() as Message);
      });
      onUpdate(messages);
    }, (error) => {
      console.error("All messages subscription error:", error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.MESSAGES);
    });
  }
};

// ====================================================
// REPORT SERVICE
// ====================================================
export const ReportService = {
  async fileReport(listingId: string, reporterId: string, reason: string): Promise<Report> {
    const newReport: Report = {
      id: `rep-${Date.now()}`,
      listingId,
      reporterId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    try {
      const docRef = doc(db, COLLECTIONS.REPORTS, newReport.id);
      await setDoc(docRef, newReport);
      return newReport;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${COLLECTIONS.REPORTS}/${newReport.id}`);
    }
  },

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.REPORTS, reportId);
      await updateDoc(docRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.REPORTS}/${reportId}`);
    }
  },

  /**
   * Listens to moderation reports in realtime
   */
  subscribeReports(onUpdate: (reports: Report[]) => void) {
    const q = query(collection(db, COLLECTIONS.REPORTS), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list: Report[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Report);
      });
      onUpdate(list);
    }, (error) => {
      console.error("Reports subscription error:", error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.REPORTS);
    });
  }
};

// ====================================================
// NOTIFICATION SERVICE
// ====================================================
export const NotificationService = {
  async getNotifications(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.NOTIFICATIONS);
    }
  },

  async sendNotification(userId: string, title: string, body: string): Promise<void> {
    try {
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        userId,
        title,
        body,
        createdAt: new Date().toISOString(),
        read: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.NOTIFICATIONS);
    }
  }
};

// ====================================================
// REVIEW SERVICE
// ====================================================
export const ReviewService = {
  async getReviews(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('targetUserId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.REVIEWS);
    }
  },

  async addReview(review: { reviewerId: string; targetUserId: string; rating: number; text: string }): Promise<void> {
    try {
      await addDoc(collection(db, COLLECTIONS.REVIEWS), {
        ...review,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTIONS.REVIEWS);
    }
  }
};
