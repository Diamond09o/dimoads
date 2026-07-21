/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, RefreshCw, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import { UploadFileState } from '../../../hooks/useMedia';

interface UploadProgressProps {
  key?: string | number;
  upload: UploadFileState;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  language: 'en' | 'ar';
}

export default function UploadProgress({ 
  upload, 
  onCancel, 
  onRetry, 
  onRemove, 
  language 
}: UploadProgressProps) {
  const isAr = language === 'ar';

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusLabel = () => {
    switch (upload.status) {
      case 'analyzing':
        return isAr ? 'جاري التحليل والمسح الذكي...' : 'AI Quality & Safety Scan...';
      case 'compressing':
        return isAr ? 'جاري الضغط والتهيئة...' : 'Compressing & Web-Optimizing...';
      case 'uploading':
        return isAr ? 'جاري الرفع للشبكة...' : 'Uploading...';
      case 'completed':
        return isAr ? 'اكتمل الرفع بنجاح' : 'Upload completed';
      case 'failed':
        return isAr ? 'فشل الرفع' : 'Upload failed';
      case 'cancelled':
        return isAr ? 'تم إلغاء الرفع' : 'Upload cancelled';
      default:
        return isAr ? 'في الانتظار...' : 'Pending...';
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-2.5 transition-all shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-800 truncate">{upload.name}</p>
          <p className="text-[10px] text-gray-400 font-medium font-mono">{formatSize(upload.size)}</p>
        </div>
        
        {/* Actions Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {upload.status === 'uploading' && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(upload.id)}
              className="p-1 hover:bg-gray-200 text-gray-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
              title={isAr ? 'إلغاء التحميل' : 'Cancel upload'}
            >
              <Ban className="w-4 h-4" />
            </button>
          )}

          {upload.status === 'failed' && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(upload.id)}
              className="p-1 hover:bg-gray-200 text-blue-600 rounded-lg transition-colors cursor-pointer animate-pulse"
              title={isAr ? 'إعادة المحاولة' : 'Retry upload'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          {onRemove && (upload.status === 'completed' || upload.status === 'failed' || upload.status === 'cancelled') && (
            <button
              type="button"
              onClick={() => onRemove(upload.id)}
              className="p-1 hover:bg-gray-200 text-gray-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
              title={isAr ? 'حذف' : 'Remove'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress & Label */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className={`flex items-center gap-1 ${
            upload.status === 'failed' ? 'text-red-600' :
            upload.status === 'completed' ? 'text-emerald-600' :
            upload.status === 'cancelled' ? 'text-amber-600' : 'text-blue-600'
          }`}>
            {upload.status === 'completed' && <CheckCircle className="w-3 h-3" />}
            {upload.status === 'failed' && <AlertTriangle className="w-3 h-3" />}
            {getStatusLabel()}
          </span>
          <span className="text-gray-500 font-mono">{upload.progress}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              upload.status === 'failed' ? 'bg-red-500' :
              upload.status === 'completed' ? 'bg-emerald-500' :
              upload.status === 'cancelled' ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{ width: `${upload.progress}%` }}
          />
        </div>
      </div>

      {upload.error && (
        <p className={`text-[10px] font-semibold text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100 ${isAr ? 'text-right' : 'text-left'}`}>
          {upload.error}
        </p>
      )}
    </div>
  );
}
