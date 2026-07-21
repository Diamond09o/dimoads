/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  video?: string;
  language: 'en' | 'ar';
}

export default function ImageGallery({ images = [], video, language }: ImageGalleryProps) {
  const isAr = language === 'ar';
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewingVideo, setViewingVideo] = useState(false);

  // Combine media sources
  // If video is present, we put it as a special media source or handle it separately
  const totalImages = images.length;
  const hasVideo = !!video;

  const handlePrev = () => {
    if (viewingVideo) {
      setViewingVideo(false);
      setActiveIndex(totalImages - 1);
    } else if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    } else if (hasVideo) {
      setViewingVideo(true);
    } else {
      setActiveIndex(totalImages - 1);
    }
  };

  const handleNext = () => {
    if (viewingVideo) {
      setViewingVideo(false);
      setActiveIndex(0);
    } else if (activeIndex < totalImages - 1) {
      setActiveIndex(activeIndex + 1);
    } else if (hasVideo) {
      setViewingVideo(true);
    } else {
      setActiveIndex(0);
    }
  };

  const selectMedia = (idx: number, isVid = false) => {
    setViewingVideo(isVid);
    if (!isVid) {
      setActiveIndex(idx);
    }
  };

  if (images.length === 0 && !video) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-100 rounded-3xl flex items-center justify-center border border-gray-200">
        <span className="text-gray-400 text-xs font-semibold">
          {isAr ? 'لا توجد وسائط متوفرة' : 'No media available'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main Viewport */}
      <div className="relative aspect-[4/3] w-full bg-gray-900 rounded-3xl overflow-hidden shadow-inner group">
        {viewingVideo && video ? (
          <video
            src={video}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={images[activeIndex] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
            alt={`Listing Image ${activeIndex + 1}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain select-none"
          />
        )}

        {/* Carousel Overlay Nav Buttons */}
        {(totalImages > 1 || hasVideo) && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Index/Counter Overlay */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold font-mono">
          {viewingVideo ? (
            <span>{isAr ? 'مقطع فيديو' : 'Video Clip'}</span>
          ) : (
            <span>
              {activeIndex + 1} / {totalImages}
            </span>
          )}
        </div>
      </div>

      {/* Thumbnails Row */}
      {(totalImages > 1 || hasVideo) && (
        <div className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
          {/* Video Thumbnail */}
          {hasVideo && (
            <button
              type="button"
              onClick={() => selectMedia(0, true)}
              className={`relative h-14 aspect-video rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                viewingVideo 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 text-white">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div className="w-full h-full bg-gray-800" />
            </button>
          )}

          {/* Image Thumbnails */}
          {images.map((imgUrl, idx) => {
            const isSelected = !viewingVideo && idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => selectMedia(idx, false)}
                className={`h-14 aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
