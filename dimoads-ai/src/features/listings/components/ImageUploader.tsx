/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { UploadFileState } from '../../../hooks/useMedia';
import UploadProgress from './UploadProgress';
import MediaPreview from './MediaPreview';
import CoverImageSelector from './CoverImageSelector';

interface ImageUploaderProps {
  uploads: UploadFileState[];
  setUploads: React.Dispatch<React.SetStateAction<UploadFileState[]>>;
  uploadImages: (files: File[] | FileList) => void;
  cancelUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  removeUpload: (id: string) => void;
  coverId: string | null;
  onSetCover: (id: string) => void;
  language: 'en' | 'ar';
}

export default function ImageUploader({
  uploads,
  setUploads,
  uploadImages,
  cancelUpload,
  retryUpload,
  removeUpload,
  coverId,
  onSetCover,
  language
}: ImageUploaderProps) {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filter uploads by status
  const inProgressUploads = uploads.filter(
    u => u.status === 'compressing' || u.status === 'uploading' || u.status === 'idle'
  );
  
  const completedUploads = uploads.filter(u => u.status === 'completed');
  
  const failedUploads = uploads.filter(
    u => u.status === 'failed' || u.status === 'cancelled'
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadImages(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImages(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Reordering handlers
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setUploads(prev => {
      const copy = [...prev];
      // Find indexes in full uploads array
      const completedIndices = copy
        .map((u, i) => (u.status === 'completed' ? i : -1))
        .filter(idx => idx !== -1);

      const targetIdxInFull = completedIndices[index];
      const prevIdxInFull = completedIndices[index - 1];

      // Swap
      const temp = copy[targetIdxInFull];
      copy[targetIdxInFull] = copy[prevIdxInFull];
      copy[prevIdxInFull] = temp;
      return copy;
    });
  };

  const handleMoveRight = (index: number) => {
    setUploads(prev => {
      const copy = [...prev];
      const completedIndices = copy
        .map((u, i) => (u.status === 'completed' ? i : -1))
        .filter(idx => idx !== -1);

      if (index >= completedIndices.length - 1) return prev;

      const targetIdxInFull = completedIndices[index];
      const nextIdxInFull = completedIndices[index + 1];

      // Swap
      const temp = copy[targetIdxInFull];
      copy[targetIdxInFull] = copy[nextIdxInFull];
      copy[nextIdxInFull] = temp;
      return copy;
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Label and Upload Zone */}
      <div className="flex flex-col gap-2">
        <label className={`text-xs font-bold text-gray-700 flex items-center gap-1.5 ${isAr ? 'justify-start flex-row-reverse text-right' : 'text-left'}`}>
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>
            {isAr ? 'صور المنتج أو العقار (الحد الأقصى ٢٠ صورة)' : 'Product Images (Max 20 images)'} *
          </span>
        </label>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/40 scale-[0.99]' 
              : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="hidden"
          />
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {isAr ? 'اسحب وأفلت الصور هنا، أو اضغط للتصفح' : 'Drag & drop images here, or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isAr ? 'يدعم صيغ JPG, PNG, WEBP, HEIC (بحد أقصى ١٠ ميجابايت للصورة)' : 'Supports JPG, PNG, WEBP, HEIC (Max 10MB per image)'}
            </p>
          </div>
        </div>
      </div>

      {/* Completed Image Grid with Reorder controls */}
      {completedUploads.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className={`text-[11px] font-bold text-gray-500 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr 
              ? 'معاينة الصور وإعادة ترتيبها (الصورة الأولى هي صورة الغلاف تلقائياً)' 
              : 'Image Previews & Reordering (First image is automatically the cover)'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {completedUploads.map((upload, idx) => (
              <MediaPreview
                key={upload.id}
                upload={upload}
                index={idx}
                totalCount={completedUploads.length}
                isCover={upload.id === coverId}
                onSetCover={onSetCover}
                onRemove={removeUpload}
                onMoveLeft={idx > 0 ? handleMoveLeft : undefined}
                onMoveRight={idx < completedUploads.length - 1 ? handleMoveRight : undefined}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cover Image Selector widget */}
      {completedUploads.length > 1 && (
        <CoverImageSelector
          uploads={uploads}
          coverId={coverId}
          onSetCover={onSetCover}
          language={language}
        />
      )}

      {/* Uploads in Progress / Queue */}
      {inProgressUploads.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className={`text-[11px] font-bold text-blue-600 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? 'جاري رفع الصور...' : 'Uploading Images...'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {inProgressUploads.map(upload => (
              <UploadProgress
                key={upload.id}
                upload={upload}
                onCancel={cancelUpload}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* Failed/Cancelled Uploads */}
      {failedUploads.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <span className={`text-[11px] font-bold text-red-500 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? 'ملفات واجهت مشاكل أثناء الرفع:' : 'Files with upload problems:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {failedUploads.map(upload => (
              <UploadProgress
                key={upload.id}
                upload={upload}
                onRetry={retryUpload}
                onRemove={removeUpload}
                language={language}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
