/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';
import { 
  StorageService, 
  ImageUploadService, 
  VideoUploadService,
  ThumbnailService,
  MediaOptimizationService,
  getCDNUrl
} from '../firebase/media-services';

export interface UploadFileState {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'idle' | 'analyzing' | 'compressing' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  url?: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  cancelFn?: () => void;
  // Intelligent media analysis results
  analysis?: {
    isBlurry: boolean;
    blurScore: number;
    isDuplicate: boolean;
    duplicateHash: string;
    isInappropriate: boolean;
    safetyScore: number;
    aestheticScore: number;
    isRecommendedCover: boolean;
  };
  // Responsive sizes URLs prepared for the CDN
  responsiveUrls?: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  };
}

/**
 * Calculates bit differences between two 64-bit average hashes.
 * Hamming distance <= 4 indicates nearly identical images (duplicates).
 */
function getHammingDistance(h1: string, h2: string): number {
  if (!h1 || !h2 || h1.length !== h2.length) return 999;
  let dist = 0;
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) dist++;
  }
  return dist;
}

/**
 * 1. USE UPLOAD IMAGES HOOK
 * Manages multi-image uploads, automatic blur checks, duplicate comparisons, cover suggestions, and multi-size responsive storage paths.
 */
export function useUploadImages(userId: string, listingId: string) {
  const [uploads, setUploads] = useState<UploadFileState[]>([]);
  const activeUploadsRef = useRef<Record<string, { cancel: () => void }>>({});

  // Scans all completed files to nominate the sharpest, most aesthetic, non-blurry, unique image as the Recommended Cover
  const updateCoverRecommendations = useCallback((currentUploads: UploadFileState[]) => {
    // Filter out candidates that are completed and safe
    const candidates = currentUploads.filter(u => 
      u.status === 'completed' && 
      u.analysis && 
      !u.analysis.isBlurry && 
      !u.analysis.isDuplicate && 
      !u.analysis.isInappropriate
    );

    if (candidates.length === 0) return currentUploads;

    // Nominate the one with the highest aesthetic score
    let bestCandidateId = candidates[0].id;
    let maxScore = candidates[0].analysis?.aestheticScore || 0;

    for (const c of candidates) {
      const score = c.analysis?.aestheticScore || 0;
      if (score > maxScore) {
        maxScore = score;
        bestCandidateId = c.id;
      }
    }

    return currentUploads.map(u => {
      if (u.analysis) {
        return {
          ...u,
          analysis: {
            ...u.analysis,
            isRecommendedCover: u.id === bestCandidateId
          }
        };
      }
      return u;
    });
  }, []);

  const uploadSingleImage = useCallback(async (fileState: UploadFileState, uid: string, lid: string) => {
    const id = fileState.id;
    
    // 1. Validation
    const validationError = ImageUploadService.validateImage(fileState.file);
    if (validationError) {
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'failed', error: validationError } : u));
      return;
    }

    try {
      // 2. Intelligent Real-time Image Analysis (Blur, Duplicates, and Aesthetic exposure)
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'analyzing', progress: 5 } : u));
      const localAnalysis = await MediaOptimizationService.analyzeImageLocally(fileState.file);

      // Check for client-side duplicate uploads (Hamming distance comparison)
      let isDuplicate = false;
      setUploads(prev => {
        for (const existing of prev) {
          if (existing.id !== id && existing.analysis?.duplicateHash) {
            const dist = getHammingDistance(localAnalysis.duplicateHash, existing.analysis.duplicateHash);
            if (dist <= 4) {
              isDuplicate = true;
              break;
            }
          }
        }
        return prev;
      });

      const finalAnalysis = {
        isBlurry: localAnalysis.isBlurry,
        blurScore: localAnalysis.blurScore,
        isDuplicate: isDuplicate,
        duplicateHash: localAnalysis.duplicateHash,
        isInappropriate: localAnalysis.isInappropriate,
        safetyScore: localAnalysis.isInappropriate ? 10 : 98,
        aestheticScore: localAnalysis.aestheticScore,
        isRecommendedCover: false
      };

      // 3. Compress and Generate Responsive Sizes
      setUploads(prev => prev.map(u => u.id === id ? { 
        ...u, 
        status: 'compressing', 
        progress: 15,
        analysis: finalAnalysis
      } : u));

      const [compressedBlob, responsiveBlobs] = await Promise.all([
        ImageUploadService.compressImage(fileState.file),
        MediaOptimizationService.generateResponsiveSizes(fileState.file)
      ]);

      // Extract original dimensions
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = URL.createObjectURL(fileState.file);
      });

      // 4. Upload Assets in a structured, resumable pipeline with CDN preparation
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'uploading', progress: 30 } : u));
      
      const timestamp = Date.now();
      const sanitizedName = fileState.name;

      // Prepare storage paths
      const mainPath = `users/${uid}/listings/${lid}/images/${timestamp}_original_${sanitizedName}`;
      const thumbPath = `users/${uid}/listings/${lid}/images/thumb_${timestamp}_${sanitizedName}`;
      const smallPath = `users/${uid}/listings/${lid}/images/small_${timestamp}_${sanitizedName}`;
      const medPath = `users/${uid}/listings/${lid}/images/medium_${timestamp}_${sanitizedName}`;
      const largePath = `users/${uid}/listings/${lid}/images/large_${timestamp}_${sanitizedName}`;

      // Upload main optimized image (resumable with progress callback)
      const mainTask = StorageService.uploadFileResumable(
        mainPath,
        compressedBlob,
        'image/jpeg',
        (progress) => {
          // Map progress between 30% and 80% to represent overall state
          const scaledProgress = 30 + (progress * 0.5);
          setUploads(prev => prev.map(u => u.id === id ? { ...u, progress: Math.round(scaledProgress) } : u));
        }
      );

      activeUploadsRef.current[id] = { cancel: () => mainTask.cancel() };
      setUploads(prev => prev.map(u => u.id === id ? { ...u, cancelFn: () => mainTask.cancel() } : u));

      // Await Main Upload
      const mainUrl = await mainTask.promise;

      // Upload remaining responsive size blobs in background parallel tasks
      setUploads(prev => prev.map(u => u.id === id ? { ...u, progress: 85 } : u));
      
      const [thumbUrl, smallUrl, medUrl, largeUrl] = await Promise.all([
        StorageService.uploadFileResumable(thumbPath, responsiveBlobs.thumbnail, 'image/jpeg').promise,
        StorageService.uploadFileResumable(smallPath, responsiveBlobs.small, 'image/jpeg').promise,
        StorageService.uploadFileResumable(medPath, responsiveBlobs.medium, 'image/jpeg').promise,
        StorageService.uploadFileResumable(largePath, responsiveBlobs.large, 'image/jpeg').promise
      ]);

      // Apply CDN url formatter wrapper
      const cdnMainUrl = getCDNUrl(mainUrl);
      const cdnThumbUrl = getCDNUrl(thumbUrl, 'thumbnail');
      const cdnSmallUrl = getCDNUrl(smallUrl, 'small');
      const cdnMedUrl = getCDNUrl(medUrl, 'medium');
      const cdnLargeUrl = getCDNUrl(largeUrl, 'large');

      // 5. Complete Upload State
      setUploads(prev => {
        const completedList = prev.map(u => u.id === id ? { 
          ...u, 
          status: 'completed', 
          progress: 100, 
          url: cdnMainUrl, 
          thumbnailUrl: cdnThumbUrl,
          width: dimensions.width,
          height: dimensions.height,
          responsiveUrls: {
            thumbnail: cdnThumbUrl,
            small: cdnSmallUrl,
            medium: cdnMedUrl,
            large: cdnLargeUrl
          }
        } : u);

        // Recalculate cover recommendation rankings across all items
        return updateCoverRecommendations(completedList);
      });
      
      delete activeUploadsRef.current[id];
    } catch (err: any) {
      if (err?.code === 'storage/canceled') {
        setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'cancelled', error: 'Upload cancelled by user' } : u));
      } else {
        console.error('Intelligent Image Upload failed:', err);
        setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'failed', error: err?.message || 'Upload failed' } : u));
      }
      delete activeUploadsRef.current[id];
    }
  }, [updateCoverRecommendations]);

  const uploadImages = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);
    
    // Limit total images to 20
    const currentCompleted = uploads.filter(u => u.status === 'completed').length;
    const incomingCount = list.length;
    if (currentCompleted + incomingCount > 20) {
      alert('Maximum 20 images allowed per listing.');
      return;
    }

    const newUploadStates: UploadFileState[] = list.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name.replace(/[^a-zA-Z0-9.]/g, '_'),
      size: file.size,
      progress: 0,
      status: 'idle'
    }));

    setUploads(prev => [...prev, ...newUploadStates]);

    newUploadStates.forEach(fileState => {
      uploadSingleImage(fileState, userId, listingId);
    });
  }, [userId, listingId, uploads, uploadSingleImage]);

  const cancelUpload = useCallback((id: string) => {
    if (activeUploadsRef.current[id]) {
      activeUploadsRef.current[id].cancel();
    }
  }, []);

  const retryUpload = useCallback((id: string) => {
    const target = uploads.find(u => u.id === id);
    if (target) {
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'idle', progress: 0, error: undefined } : u));
      uploadSingleImage(target, userId, listingId);
    }
  }, [uploads, userId, listingId, uploadSingleImage]);

  const removeUpload = useCallback(async (id: string) => {
    const target = uploads.find(u => u.id === id);
    if (!target) return;

    cancelUpload(id);

    // Cascade delete original, thumbnail, and responsive CDN files
    if (target.url) {
      await StorageService.deleteFileByUrl(target.url);
    }
    if (target.thumbnailUrl) {
      await StorageService.deleteFileByUrl(target.thumbnailUrl);
    }
    if (target.responsiveUrls) {
      const urls = [
        target.responsiveUrls.thumbnail,
        target.responsiveUrls.small,
        target.responsiveUrls.medium,
        target.responsiveUrls.large
      ];
      await Promise.all(urls.map(url => {
        if (url && url !== target.thumbnailUrl) {
          return StorageService.deleteFileByUrl(url);
        }
        return Promise.resolve();
      }));
    }

    setUploads(prev => {
      const remaining = prev.filter(u => u.id !== id);
      return updateCoverRecommendations(remaining);
    });
  }, [uploads, cancelUpload, updateCoverRecommendations]);

  const reorderImages = useCallback((startIndex: number, endIndex: number) => {
    setUploads(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const clearUploads = useCallback(() => {
    uploads.forEach(u => cancelUpload(u.id));
    setUploads([]);
  }, [uploads, cancelUpload]);

  return {
    uploads,
    setUploads,
    uploadImages,
    cancelUpload,
    retryUpload,
    removeUpload,
    reorderImages,
    clearUploads
  };
}

/**
 * 2. USE UPLOAD VIDEOS HOOK
 * Handles video validation, background frame-grabbing, progress, and metadata extraction.
 */
export function useUploadVideos(userId: string, listingId: string) {
  const [uploads, setUploads] = useState<UploadFileState[]>([]);
  const activeUploadsRef = useRef<Record<string, { cancel: () => void }>>({});

  const uploadSingleVideo = useCallback(async (fileState: UploadFileState, uid: string, lid: string) => {
    const id = fileState.id;
    
    // 1. Validation
    const validationError = VideoUploadService.validateVideo(fileState.file);
    if (validationError) {
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'failed', error: validationError } : u));
      return;
    }

    try {
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'compressing', progress: 5 } : u));
      
      // 2. Extract Metadata & Video Thumbnail in Parallel
      const [metadata, thumbnailBlob] = await Promise.all([
        VideoUploadService.getVideoMetadata(fileState.file),
        VideoUploadService.generateVideoThumbnail(fileState.file)
      ]);

      // 3. Upload Video
      setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'uploading', progress: 15 } : u));
      const videoPath = `users/${uid}/listings/${lid}/videos/${Date.now()}_${fileState.name}`;
      const videoTask = StorageService.uploadFileResumable(
        videoPath,
        fileState.file,
        fileState.file.type,
        (progress) => {
          const scaledProgress = 15 + (progress * 0.7);
          setUploads(prev => prev.map(u => u.id === id ? { ...u, progress: Math.round(scaledProgress) } : u));
        }
      );

      activeUploadsRef.current[id] = { cancel: () => videoTask.cancel() };
      setUploads(prev => prev.map(u => u.id === id ? { ...u, cancelFn: () => videoTask.cancel() } : u));

      const downloadUrl = await videoTask.promise;

      // 4. Upload Video Preview Thumbnail
      setUploads(prev => prev.map(u => u.id === id ? { ...u, progress: 90 } : u));
      const thumbPath = `users/${uid}/listings/${lid}/thumbnails/vid_thumb_${Date.now()}_${fileState.name}.jpg`;
      const thumbTask = StorageService.uploadFileResumable(
        thumbPath,
        thumbnailBlob,
        'image/jpeg'
      );
      
      const thumbUrl = await thumbTask.promise;

      // 5. Complete
      setUploads(prev => prev.map(u => u.id === id ? { 
        ...u, 
        status: 'completed', 
        progress: 100, 
        url: downloadUrl, 
        thumbnailUrl: thumbUrl,
        width: metadata.width,
        height: metadata.height,
        duration: metadata.duration
      } : u));

      delete activeUploadsRef.current[id];
    } catch (err: any) {
      if (err?.code === 'storage/canceled') {
        setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'cancelled', error: 'Upload cancelled' } : u));
      } else {
        console.error('Video upload failed:', err);
        setUploads(prev => prev.map(u => u.id === id ? { ...u, status: 'failed', error: err?.message || 'Upload failed' } : u));
      }
      delete activeUploadsRef.current[id];
    }
  }, []);

  const uploadVideos = useCallback((files: FileList | File[]) => {
    const list = Array.from(files);

    // Limit total videos to 2
    const currentCompleted = uploads.filter(u => u.status === 'completed').length;
    if (currentCompleted + list.length > 2) {
      alert('Maximum 2 videos allowed per listing.');
      return;
    }

    const newUploadStates: UploadFileState[] = list.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name.replace(/[^a-zA-Z0-9.]/g, '_'),
      size: file.size,
      progress: 0,
      status: 'idle'
    }));

    setUploads(prev => [...prev, ...newUploadStates]);

    newUploadStates.forEach(fileState => {
      uploadSingleVideo(fileState, userId, listingId);
    });
  }, [userId, listingId, uploads, uploadSingleVideo]);

  const cancelUpload = useCallback((id: string) => {
    if (activeUploadsRef.current[id]) {
      activeUploadsRef.current[id].cancel();
    }
  }, []);

  const removeUpload = useCallback(async (id: string) => {
    const target = uploads.find(u => u.id === id);
    if (!target) return;

    cancelUpload(id);

    if (target.url) {
      await StorageService.deleteFileByUrl(target.url);
    }
    if (target.thumbnailUrl) {
      await StorageService.deleteFileByUrl(target.thumbnailUrl);
    }

    setUploads(prev => prev.filter(u => u.id !== id));
  }, [uploads, cancelUpload]);

  return {
    uploads,
    setUploads,
    uploadVideos,
    cancelUpload,
    removeUpload
  };
}

/**
 * 3. USE DELETE MEDIA HOOK
 * Robust and safe asset deletion helper
 */
export function useDeleteMedia() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAsset = useCallback(async (url: string) => {
    setDeleting(true);
    setError(null);
    try {
      await StorageService.deleteFileByUrl(url);
    } catch (err: any) {
      console.error('Delete failed:', err);
      setError(err?.message || 'Failed to delete asset');
    } finally {
      setDeleting(false);
    }
  }, []);

  const deleteListingMedia = useCallback(async (imageUrls: string[], videoUrl?: string) => {
    setDeleting(true);
    setError(null);
    try {
      const deletePromises = imageUrls.map(url => StorageService.deleteFileByUrl(url));
      if (videoUrl) {
        deletePromises.push(StorageService.deleteFileByUrl(videoUrl));
      }
      await Promise.all(deletePromises);
    } catch (err: any) {
      console.error('Delete listing media failed:', err);
      setError(err?.message || 'Failed to delete listing media');
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    deleteAsset,
    deleteListingMedia,
    deleting,
    error
  };
}
