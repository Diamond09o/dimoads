/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { UploadCloud, Video as VideoIcon } from 'lucide-react';
import { UploadFileState } from '../../../hooks/useMedia';
import UploadProgress from './UploadProgress';
import MediaPreview from './MediaPreview';

interface VideoUploaderProps {
  uploads: UploadFileState[];
  uploadVideos: (files: File[] | FileList) => void;
  cancelUpload: (id: string) => void;
  removeUpload: (id: string) => void;
  language: 'en' | 'ar';
}

export default function VideoUploader({
  uploads,
  uploadVideos,
  cancelUpload,
  removeUpload,
  language
}: VideoUploaderProps) {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Filter uploads
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
      uploadVideos(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadVideos(e.target.files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-5 border-t border-gray-100 pt-5">
      {/* Label and Upload Zone */}
      <div className="flex flex-col gap-2">
        <label className={`text-xs font-bold text-gray-700 flex items-center gap-1.5 ${isAr ? 'justify-start flex-row-reverse text-right' : 'text-left'}`}>
          <VideoIcon className="w-4 h-4 text-blue-600" />
          <span>
            {isAr ? 'فيديو قصير للمنتج (اختياري - الحد الأقصى فيديوهين)' : 'Product Videos (Optional - Max 2 videos)'}
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
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
          />
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <VideoIcon className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {isAr ? 'اسحب وأفلت الفيديو هنا، أو اضغط للتصفح' : 'Drag & drop videos here, or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isAr ? 'يدعم صيغ MP4, MOV, WEBM (بحد أقصى ٢٥٠ ميجابايت للفيديو)' : 'Supports MP4, MOV, WEBM (Max 250MB per video)'}
            </p>
          </div>
        </div>
      </div>

      {/* Completed Video Previews */}
      {completedUploads.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <span className={`text-[11px] font-bold text-gray-500 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? 'معاينة مقاطع الفيديو المحملة:' : 'Uploaded Video Previews:'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {completedUploads.map((upload, idx) => (
              <MediaPreview
                key={upload.id}
                upload={upload}
                index={idx}
                totalCount={completedUploads.length}
                isCover={false}
                onRemove={removeUpload}
                isVideo={true}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* Uploads in Progress / Queue */}
      {inProgressUploads.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className={`text-[11px] font-bold text-blue-600 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? 'جاري رفع ومعالجة مقاطع الفيديو...' : 'Uploading & processing videos...'}
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

      {/* Failed/Cancelled Video Uploads */}
      {failedUploads.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4">
          <span className={`text-[11px] font-bold text-red-500 ${isAr ? 'text-right' : 'text-left'}`}>
            {isAr ? 'مقاطع فيديو واجهت مشاكل أثناء الرفع:' : 'Videos with upload problems:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {failedUploads.map(upload => (
              <UploadProgress
                key={upload.id}
                upload={upload}
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
