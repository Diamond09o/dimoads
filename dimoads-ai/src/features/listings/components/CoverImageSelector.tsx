/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star } from 'lucide-react';
import { UploadFileState } from '../../../hooks/useMedia';

interface CoverImageSelectorProps {
  uploads: UploadFileState[];
  coverId: string | null;
  onSetCover: (id: string) => void;
  language: 'en' | 'ar';
}

export default function CoverImageSelector({
  uploads,
  coverId,
  onSetCover,
  language
}: CoverImageSelectorProps) {
  const isAr = language === 'ar';
  const completedImages = uploads.filter(u => u.status === 'completed');

  if (completedImages.length === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
      <div className={`flex flex-col gap-1 ${isAr ? 'text-right' : 'text-left'}`}>
        <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 justify-start">
          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>{isAr ? 'تحديد الصورة البارزة (غلاف الإعلان)' : 'Select Primary Cover Image'}</span>
        </h4>
        <p className="text-[10px] text-gray-500">
          {isAr 
            ? 'اختر أفضل صورة ليتم عرضها كغلاف رئيسي لإعلانك في صفحة التصفح.'
            : 'Choose the best image to showcase as the primary cover photo across the platform.'}
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {completedImages.map((upload) => {
          const isSelected = upload.id === coverId;
          return (
            <button
              key={upload.id}
              type="button"
              onClick={() => onSetCover(upload.id)}
              className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                isSelected 
                  ? 'border-amber-500 shadow-sm ring-2 ring-amber-500/20' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={upload.thumbnailUrl || upload.url}
                alt={upload.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center">
                  <span className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-0.5">
                    <Star className="w-3 h-3 fill-current" />
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
