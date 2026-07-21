/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Trash2, ArrowLeft, ArrowRight, Play, Sparkles, AlertTriangle, ShieldAlert } from 'lucide-react';
import { UploadFileState } from '../../../hooks/useMedia';

interface MediaPreviewProps {
  key?: string | number;
  upload: UploadFileState;
  index: number;
  totalCount: number;
  isCover: boolean;
  onSetCover?: (id: string) => void;
  onRemove?: (id: string) => void;
  onMoveLeft?: (index: number) => void;
  onMoveRight?: (index: number) => void;
  isVideo?: boolean;
  language: 'en' | 'ar';
}

export default function MediaPreview({
  upload,
  index,
  totalCount,
  isCover,
  onSetCover,
  onRemove,
  onMoveLeft,
  onMoveRight,
  isVideo = false,
  language
}: MediaPreviewProps) {
  const isAr = language === 'ar';

  return (
    <div className="relative group bg-gray-100 rounded-2xl overflow-hidden aspect-square border border-gray-200/60 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-300">
      {/* Media Content */}
      {isVideo ? (
        <div className="relative w-full h-full">
          <img
            src={upload.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300'}
            alt="Video preview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-gray-900 shadow shadow-black/20">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
          {upload.duration && (
            <span className="absolute bottom-2 right-2 bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md font-semibold">
              {Math.floor(upload.duration / 60)}:{(Math.floor(upload.duration) % 60).toString().padStart(2, '0')}
            </span>
          )}
        </div>
      ) : (
        <img
          src={upload.thumbnailUrl || upload.url}
          alt={upload.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Badges Overlay */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 max-w-[90%] pointer-events-auto">
        {isCover && (
          <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
            <Star className="w-3 h-3 fill-current" />
            {isAr ? 'الصورة الرئيسية' : 'Cover Image'}
          </span>
        )}
        {upload.analysis?.isRecommendedCover && !isCover && onSetCover && (
          <button
            type="button"
            onClick={() => onSetCover(upload.id)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 border border-indigo-400 cursor-pointer text-left w-fit transition-transform hover:scale-105 active:scale-95"
            title={isAr ? 'انقر لتعيينها كصورة غلاف موصى بها من الذكاء الاصطناعي' : 'Click to set as AI recommended cover image'}
          >
            <Sparkles className="w-3 h-3 fill-white" />
            <span>{isAr ? 'موصى به كغلاف ✨' : '✨ AI Cover Pick'}</span>
          </button>
        )}
        {upload.analysis?.isBlurry && (
          <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" />
            {isAr ? 'غير واضحة (جودة ضعيفة)' : '⚠️ Blurry Image'}
          </span>
        )}
        {upload.analysis?.isDuplicate && (
          <span className="bg-yellow-500 text-gray-900 text-[9px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" />
            {isAr ? 'صورة مكررة ⚠️' : '⚠️ Duplicate Image'}
          </span>
        )}
        {upload.analysis?.isInappropriate && (
          <span className="bg-red-700 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
            <ShieldAlert className="w-3 h-3" />
            {isAr ? 'محتوى غير لائق 🚫' : '🚫 Inappropriate'}
          </span>
        )}
        {isVideo && (
          <span className="bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm w-fit">
            {isAr ? 'فيديو' : 'Video'}
          </span>
        )}
      </div>

      {/* Delete / Make Cover Control Overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-10">
        <div className="flex items-center justify-between gap-2">
          {/* Cover Action */}
          {!isVideo && onSetCover && !isCover && (
            <button
              type="button"
              onClick={() => onSetCover(upload.id)}
              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-lg shadow flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
            >
              <Star className="w-3 h-3 fill-current" />
              {isAr ? 'اجعلها رئيسية' : 'Set Cover'}
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Delete action */}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(upload.id)}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
              title={isAr ? 'حذف' : 'Delete'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Reordering Actions */}
        {(onMoveLeft || onMoveRight) && (
          <div className="flex items-center justify-center gap-3 border-t border-white/20 pt-1.5">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveLeft?.(index)}
              className="p-1 hover:bg-white/20 text-white disabled:text-white/30 rounded transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-white/90 font-mono font-bold">
              {index + 1} / {totalCount}
            </span>
            <button
              type="button"
              disabled={index === totalCount - 1}
              onClick={() => onMoveRight?.(index)}
              className="p-1 hover:bg-white/20 text-white disabled:text-white/30 rounded transition-colors cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
