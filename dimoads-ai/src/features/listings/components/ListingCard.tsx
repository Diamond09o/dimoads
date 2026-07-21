/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, MapPin, DollarSign, Calendar, MessageSquare, Flag, Globe, ShieldAlert, Sparkles, AlertTriangle, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { Listing, User, AppLanguage } from '../../../types';
import ImageGallery from './ImageGallery';
import { useAppState } from '../../../app/context/AppStateContext';

interface ListingCardProps {
  listing: Listing;
  onContactSeller: (listing: Listing) => void;
  onReportListing: (listingId: string) => void;
  onUpdateListing: (updated: Listing) => void;
  language: AppLanguage;
}

const CATEGORY_ICONS: Record<string, string> = {
  'jobs': '💼',
  'real-estate': '🏠',
  'vehicles': '🚗',
  'electronics': '📱',
  'services': '🛠️',
  'businesses-for-sale': '🏢',
  'investment-opportunities': '📈',
  'industrial-equipment': '⚙️',
  'commodities': '🌾'
};

// Partial: only en/ar are populated with dedicated names today.
// Other languages fall back to the English label until translated.
const CATEGORY_NAMES: Record<string, Partial<Record<AppLanguage, string>>> = {
  'jobs': { en: 'Jobs', ar: 'وظائف' },
  'real-estate': { en: 'Real Estate', ar: 'عقارات' },
  'vehicles': { en: 'Vehicles', ar: 'مركبات' },
  'electronics': { en: 'Electronics', ar: 'إلكترونيات' },
  'services': { en: 'Services', ar: 'خدمات' },
  'businesses-for-sale': { en: 'Businesses for Sale', ar: 'شركات للبيع' },
  'investment-opportunities': { en: 'Investment Opportunities', ar: 'فرص استثمارية' },
  'industrial-equipment': { en: 'Industrial Equipment', ar: 'معدات صناعية' },
  'commodities': { en: 'Commodities', ar: 'سلع أساسية' }
};

const replaceFireplaceText = (value: string) =>
  value.replace(/\bfireplace(s)?\b/gi, 'balcony');

export default function ListingCard({
  listing,
  onContactSeller,
  onReportListing,
  onUpdateListing,
  language
}: ListingCardProps) {
  const { users, currentUid } = useAppState();
  const owner = users[listing.ownerId];
  const currentUserId = currentUid;
  const [isTranslating, setIsTranslating] = useState(false);
  const [isScanningFraud, setIsScanningFraud] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [fraudReport, setFraudReport] = useState<{
    scamScore: number;
    isSuspicious: boolean;
    flags: string[];
    reason: string;
  } | null>(null);

  // Check if we are currently displaying a translated state
  const isDisplayingAr = language === 'ar';
  const hasArTranslation = !!listing.translations?.ar;
  const hasEnTranslation = !!listing.translations?.en;

  // Decide current active text based on global language choice and translated caches
  let displayTitle = replaceFireplaceText(listing.title);
  let displayDescription = replaceFireplaceText(listing.description);

  if (isDisplayingAr) {
    if (listing.originalLanguage === 'ar') {
      displayTitle = listing.title;
      displayDescription = listing.description;
    } else if (hasArTranslation) {
      displayTitle = listing.translations!.ar!.title;
      displayDescription = listing.translations!.ar!.description;
    }
  } else {
    if (listing.originalLanguage === 'en') {
      displayTitle = listing.title;
      displayDescription = listing.description;
    } else if (hasEnTranslation) {
      displayTitle = listing.translations!.en!.title;
      displayDescription = listing.translations!.en!.description;
    }
  }

  // Handle Dynamic AI Translation on card
  const handleTranslateCard = async () => {
    const targetLang = listing.originalLanguage === 'en' ? 'ar' : 'en';
    
    // If translation already cached, do nothing
    if (targetLang === 'ar' && hasArTranslation) return;
    if (targetLang === 'en' && hasEnTranslation) return;

    setIsTranslating(true);
    try {
      const response = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listing.title,
          description: listing.description,
          targetLang
        })
      });
      const data = await response.json();
      
      if (response.ok && data.title && data.description) {
        const updatedTranslations = {
          ...listing.translations,
          [targetLang]: {
            title: data.title,
            description: data.description
          }
        };
        onUpdateListing({
          ...listing,
          translations: updatedTranslations
        });
      }
    } catch (err) {
      console.error('Translation error on card:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle Dynamic AI Fraud Scan
  const handleScanFraud = async () => {
    setIsScanningFraud(true);
    try {
      const response = await fetch('/api/gemini/fraud-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          category: listing.category
        })
      });
      const data = await response.json();
      if (response.ok) {
        setFraudReport(data);
      }
    } catch (err) {
      console.error('Fraud scan error:', err);
    } finally {
      setIsScanningFraud(false);
    }
  };

  const getRelativeDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (p: number, cat: string) => {
    if (cat === 'jobs') {
      return language === 'ar' ? `$${p.toLocaleString()}/شهرياً` : `$${p.toLocaleString()}/mo`;
    }
    return `$${p.toLocaleString()}`;
  };

  // Check if translation is missing for the current target language view
  const needsTranslation = 
    (isDisplayingAr && listing.originalLanguage === 'en' && !hasArTranslation) ||
    (!isDisplayingAr && listing.originalLanguage === 'ar' && !hasEnTranslation);

  return (
    <div
      id={`listing_card_${listing.id}`}
      className={`relative bg-white rounded-2xl border ${
        listing.isPremium 
          ? 'border-amber-300 ring-2 ring-amber-50 shadow-md' 
          : 'border-gray-100 shadow-sm'
      } overflow-hidden hover:shadow-lg transition-all flex flex-col`}
    >
      {/* Premium Badge */}
      {listing.isPremium && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full z-10 shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-white" />
          {language === 'ar' ? 'مميز' : 'Premium'}
        </div>
      )}

      {/* Main Category Icon Badge */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm shadow-sm text-xs font-semibold px-2.5 py-1.5 rounded-lg z-10 flex items-center gap-1 text-gray-700">
        <span>{CATEGORY_ICONS[listing.category] || '🏷️'}</span>
        <span>{CATEGORY_NAMES[listing.category]?.[language] ?? CATEGORY_NAMES[listing.category]?.en}</span>
      </div>

      {/* Image Gallery Mockup */}
      <div 
        onClick={() => setShowGalleryModal(true)}
        className="relative h-48 md:h-52 bg-gray-100 overflow-hidden group cursor-pointer"
        title={language === 'ar' ? 'انقر لعرض المعرض والوسائط' : 'Click to view gallery & media'}
      >
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800'}
          alt={displayTitle}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div className="text-white text-lg font-bold drop-shadow-md">
            {formatPrice(listing.price, listing.category)}
          </div>
          <div className="flex items-center gap-1 text-white text-xs font-medium bg-black/45 backdrop-blur-md px-2 py-1 rounded-md">
            <Eye className="w-3.5 h-3.5" />
            <span>{listing.viewsCount}</span>
          </div>
        </div>
      </div>

      {/* Listing Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className={`text-base font-bold text-gray-900 line-clamp-1 mb-2 ${language === 'ar' ? 'text-right font-sans' : 'text-left'}`}>
          {displayTitle}
        </h3>

        {/* Location & Date */}
        <div className={`flex items-center gap-4 text-xs text-gray-500 mb-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate max-w-[150px]">{listing.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{getRelativeDate(listing.createdAt)}</span>
          </div>
        </div>

        {/* Description */}
        <p className={`text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed ${language === 'ar' ? 'text-right font-sans' : 'text-left'}`}>
          {displayDescription}
        </p>

        {/* AI Translation Prompt Warning if missing translation */}
        {needsTranslation && (
          <div className="mb-4 p-2.5 bg-yellow-50 rounded-xl border border-yellow-100 flex items-center justify-between text-[11px] text-yellow-800">
            <span className="flex items-center gap-1.5 font-medium">
              <Globe className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
              {language === 'ar' ? 'الترجمة العربية غير متوفرة بعد' : 'English translation unavailable'}
            </span>
            <button
              type="button"
              onClick={handleTranslateCard}
              disabled={isTranslating}
              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              {isTranslating ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 fill-white text-white" />
              )}
              {language === 'ar' ? 'ترجم الآن' : 'Translate'}
            </button>
          </div>
        )}

        {/* AI Tags */}
        {listing.aiTags && listing.aiTags.length > 0 && (
          <div className={`flex flex-wrap gap-1.5 mb-5 ${language === 'ar' ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
            {listing.aiTags.slice(0, 4).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] font-mono border border-gray-100">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* AI Fraud Radar Box */}
        {fraudReport ? (
          <div className={`mb-4 p-3 rounded-xl border ${
            fraudReport.isSuspicious 
              ? 'bg-red-50 border-red-100 text-red-900' 
              : 'bg-green-50 border-green-100 text-green-900'
          } text-xs transition-all`}>
            <div className="flex items-center justify-between font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                {fraudReport.isSuspicious ? (
                  <ShieldAlert className="w-4 h-4 text-red-600 animate-bounce" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                )}
                {language === 'ar' ? 'فحص المصداقية بالذكاء الاصطناعي' : 'AI Security Scan'}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                fraudReport.isSuspicious ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
              }`}>
                Score: {fraudReport.scamScore}/100
              </span>
            </div>
            <p className="text-[11px] leading-relaxed mb-1.5 opacity-90">{fraudReport.reason}</p>
            {fraudReport.flags && fraudReport.flags.length > 0 && (
              <div className="flex flex-col gap-1 pl-1 text-[10px] list-disc opacity-80">
                {fraudReport.flags.map((flag, i) => (
                  <span key={i} className="flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{flag}</span>
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => setFraudReport(null)}
              className="mt-2 text-[10px] font-semibold underline hover:no-underline opacity-70"
            >
              {language === 'ar' ? 'إغلاق التقرير' : 'Close Report'}
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleScanFraud}
              disabled={isScanningFraud}
              className="w-full py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-gray-100 text-gray-600 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isScanningFraud ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              )}
              {language === 'ar' ? 'فحص مصداقية السعر بالذكاء الاصطناعي' : 'Verify Price Authenticity with AI'}
            </button>
          </div>
        )}

        {/* Owner Trust score indicator */}
        {owner && (
          <div className={`flex items-center justify-between border-t border-gray-100 pt-4 mb-4 text-xs ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-gray-500 truncate max-w-[120px] font-medium">{owner.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">{language === 'ar' ? 'مؤشر الثقة:' : 'Trust Score:'}</span>
              <span className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded ${
                owner.trustScore >= 90 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : owner.trustScore >= 75 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {owner.trustScore}%
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex gap-2 mt-auto">
          <button
            type="button"
            onClick={() => onContactSeller(listing)}
            disabled={listing.ownerId === currentUserId}
            className={`flex-1 py-2.5 ${
              listing.ownerId === currentUserId 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-900 hover:bg-gray-800 text-white active:scale-95'
            } text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'ar' ? 'تواصل الآن' : 'Contact'}</span>
          </button>

          <button
            type="button"
            onClick={() => onReportListing(listing.id)}
            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all flex items-center justify-center active:scale-95 cursor-pointer"
            title={language === 'ar' ? 'إبلاغ عن إعلان مشبوه' : 'Flag Advertisement'}
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modern Light/White Media Details Lightbox overlay */}
      {showGalleryModal && (
        <div id="gallery_modal_overlay" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowGalleryModal(false)}>
          <div id="gallery_modal_content" className="relative bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col gap-4 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between border-b border-gray-100 pb-3 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <h4 className="text-sm font-bold text-gray-900 font-sans">{displayTitle}</h4>
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <ImageGallery
              images={listing.images}
              video={listing.video}
              language={language === 'ar' ? 'ar' : 'en'}
            />
          </div>
        </div>
      )}

    </div>
  );
}
