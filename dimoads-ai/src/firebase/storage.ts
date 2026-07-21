/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Firebase Storage Service Wrapper for Classified Asset uploads
 */
export const StorageService = {
  /**
   * Upload an image file to a listing's dedicated directory path:
   * users/{uid}/listings/{listingId}/{fileName}
   * 
   * Returns the final direct download URL.
   */
  async uploadListingImage(userId: string, listingId: string, file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storagePath = `users/${userId}/listings/${listingId}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  /**
   * Upload user profile photo URL
   */
  async uploadProfilePhoto(userId: string, file: File): Promise<string> {
    const fileName = `profile_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storagePath = `users/${userId}/profile/${fileName}`;
    const storageRef = ref(storage, storagePath);
    
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },

  /**
   * Delete a storage asset by its public download URL
   */
  async deleteAssetByUrl(downloadUrl: string): Promise<void> {
    if (!downloadUrl) return;
    try {
      const fileRef = ref(storage, downloadUrl);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn('Could not delete storage object:', err);
    }
  }
};
