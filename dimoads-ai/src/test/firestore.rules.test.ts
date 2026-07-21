/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment | null = null;

  beforeAll(async () => {
    try {
      testEnv = await initializeTestEnvironment({
        projectId: 'demo-rules-test',
        firestore: {
          rules: readFileSync('firestore.rules', 'utf8'),
          host: '127.0.0.1',
          port: 8080,
        }
      });
    } catch (e) {
      console.warn('Could not initialize test environment. Firestore emulator may not be running on 127.0.0.1:8080.', e);
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  it('a regular user cannot set their own accountType to administrator', async () => {
    if (!testEnv) {
      console.log('Skipping test as testEnv is not initialized.');
      return;
    }
    const context = testEnv.authenticatedContext('user_1');
    const db = context.firestore();
    const userDocRef = doc(db, 'users', 'user_1');

    // Attempting to create user with accountType: 'administrator' should fail
    await assertFails(
      setDoc(userDocRef, {
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        accountType: 'administrator',
        trustScore: null
      })
    );

    // Creating a normal user should succeed
    await assertSucceeds(
      setDoc(userDocRef, {
        id: 'user_1',
        name: 'John Doe',
        email: 'john@example.com',
        accountType: 'regular',
        trustScore: null
      })
    );

    // Attempting to update accountType to 'administrator' should fail
    await assertFails(
      updateDoc(userDocRef, {
        accountType: 'administrator'
      })
    );
  });

  it('a regular user cannot edit another user\'s listing', async () => {
    if (!testEnv) {
      console.log('Skipping test as testEnv is not initialized.');
      return;
    }

    // Seed listing belonging to user_1 with security rules disabled
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'listings', 'listing_1'), {
        id: 'listing_1',
        title: 'Bicycle',
        description: 'A great red bicycle in perfect condition.',
        price: 150,
        status: 'active',
        sellerId: 'user_1'
      });
    });

    // Attempt to update the listing as user_2 (not the owner) - should fail
    const contextUser2 = testEnv.authenticatedContext('user_2');
    const dbUser2 = contextUser2.firestore();
    const listingRef = doc(dbUser2, 'listings', 'listing_1');

    await assertFails(
      updateDoc(listingRef, {
        title: 'Stolen Bicycle',
        price: 10
      })
    );

    // Updating as the owner user_1 - should succeed
    const contextUser1 = testEnv.authenticatedContext('user_1');
    const dbUser1 = contextUser1.firestore();
    const listingRefOwner = doc(dbUser1, 'listings', 'listing_1');

    await assertSucceeds(
      updateDoc(listingRefOwner, {
        title: 'Updated Bicycle Title',
        price: 160
      })
    );
  });

  it('only an admin can delete a report', async () => {
    if (!testEnv) {
      console.log('Skipping test as testEnv is not initialized.');
      return;
    }

    // Seed report and user/admin records with rules disabled
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      
      // Seed a report
      await setDoc(doc(db, 'reports', 'report_1'), {
        id: 'report_1',
        listingId: 'listing_1',
        reporterId: 'user_1',
        reason: 'Inappropriate content',
        status: 'pending'
      });

      // Seed an admin user record
      await setDoc(doc(db, 'users', 'admin_1'), {
        id: 'admin_1',
        name: 'Admin User',
        email: 'admin@example.com',
        accountType: 'administrator',
        trustScore: null
      });

      // Seed a regular user record
      await setDoc(doc(db, 'users', 'user_1'), {
        id: 'user_1',
        name: 'Regular User',
        email: 'user@example.com',
        accountType: 'regular',
        trustScore: null
      });
    });

    // Try deleting the report as a regular user - should fail
    const contextUser1 = testEnv.authenticatedContext('user_1');
    const dbUser1 = contextUser1.firestore();
    await assertFails(
      deleteDoc(doc(dbUser1, 'reports', 'report_1'))
    );

    // Try deleting the report as an admin - should succeed
    const contextAdmin = testEnv.authenticatedContext('admin_1');
    const dbAdmin = contextAdmin.firestore();
    await assertSucceeds(
      deleteDoc(doc(dbAdmin, 'reports', 'report_1'))
    );
  });
});
