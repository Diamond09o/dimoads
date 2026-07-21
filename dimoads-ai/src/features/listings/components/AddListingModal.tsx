/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, RefreshCw, Plus, CheckCircle } from 'lucide-react';
import { Category, Listing } from '../../../types';
import { useUploadImages, useUploadVideos } from '../../../hooks/useMedia';
import ImageUploader from './ImageUploader';
import VideoUploader from './VideoUploader';
import { collection, doc } from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

interface AddListingModalProps {
  onClose: () => void;
  onAddListing: (listing: Omit<Listing, 'id' | 'viewsCount' | 'createdAt' | 'updatedAt'>, customId?: string) => void;
  currentUserId: string;
  language: 'en' | 'ar';
}

const CATEGORIES_ALL = [
  { value: 'jobs', label: '💼 Jobs / وظائف' },
  { value: 'real-estate', label: '🏠 Real Estate / عقارات' },
  { value: 'vehicles', label: '🚗 Vehicles / مركبات' },
  { value: 'electronics', label: '📱 Electronics / إلكترونيات' },
  { value: 'services', label: '🛠️ Services / خدمات' },
  { value: 'businesses-for-sale', label: '🏢 Businesses for Sale / شركات للبيع' },
  { value: 'investment-opportunities', label: '📈 Investment Opportunities / فرص استثمارية' },
  { value: 'industrial-equipment', label: '⚙️ Industrial Equipment / معدات صناعية' },
  { value: 'commodities', label: '🌾 Commodities / سلع أساسية' }
];

const replaceFireplaceText = (value: string) =>
  value.replace(/\bfireplace(s)?\b/gi, 'balcony');

export default function AddListingModal({ onClose, onAddListing, currentUserId, language }: AddListingModalProps) {
  // Pre-generate listingId for matching storage and firestore keys
  const [listingId] = useState(() => doc(collection(db, 'listings')).id);

  // AI Generator specific state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Form Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('electronics');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState('');

  // 1. Hook up Multi-Image & Video upload managers
  const {
    uploads: imageUploads,
    setUploads: setImageUploads,
    uploadImages,
    cancelUpload: cancelImageUpload,
    retryUpload: retryImageUpload,
    removeUpload: removeImageUpload
  } = useUploadImages(currentUserId, listingId);

  const {
    uploads: videoUploads,
    uploadVideos,
    cancelUpload: cancelVideoUpload,
    removeUpload: removeVideoUpload
  } = useUploadVideos(currentUserId, listingId);

  const [coverId, setCoverId] = useState<string | null>(null);

  // Auto-designate first completed image as the default cover
  useEffect(() => {
    const completed = imageUploads.filter(u => u.status === 'completed');
    if (completed.length > 0 && !coverId) {
      setCoverId(completed[0].id);
    }
  }, [imageUploads, coverId]);

  // Auto detect original language of creation
  const originalLanguage = language;

  const handleGenerateAiListing = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiError('');

    try {
      const response = await fetch('/api/gemini/listing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: aiPrompt,
          originalLanguage
        })
      });

      const data = await response.json();
      if (response.ok) {
        setTitle(replaceFireplaceText(data.title || ''));
        setDescription(replaceFireplaceText(data.description || ''));
        if (data.category) {
          setCategory(data.category as Category);
        }
        if (data.tags) {
          setAiTags(data.tags);
        }
      } else {
        setAiError(data.error || 'Failed to generate listing details');
      }
    } catch (err: any) {
      setAiError('Connection failed: Ensure server is running');
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !price) return;

    const hasPendingMedia = imageUploads.some(u => ['idle', 'analyzing', 'compressing', 'uploading'].includes(u.status))
      || videoUploads.some(u => ['idle', 'compressing', 'uploading'].includes(u.status));

    if (hasPendingMedia) {
      setSubmitError('Please wait until all image and video uploads finish before publishing.');
      return;
    }
    setSubmitError('');

    // Filter, sort and map image uploads
    const completedImages = imageUploads.filter(u => u.status === 'completed');
    const sortedImages = [...completedImages];
    if (coverId) {
      const coverIdx = sortedImages.findIndex(u => u.id === coverId);
      if (coverIdx > -1) {
        const [cover] = sortedImages.splice(coverIdx, 1);
        sortedImages.unshift(cover);
      }
    }

    const imageUrls = sortedImages.map(u => u.url).filter((url): url is string => !!url);
    const finalImages = imageUrls.length > 0 
      ? imageUrls 
      : ['https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800'];

    // Map video upload
    const completedVideos = videoUploads.filter(u => u.status === 'completed');
    const videoUrl = completedVideos[0]?.url || undefined;

    const normalizedTitle = replaceFireplaceText(title);
    const normalizedDescription = replaceFireplaceText(description);

    onAddListing({
      title: normalizedTitle,
      description: normalizedDescription,
      category,
      location,
      price: parseFloat(price),
      images: finalImages,
      video: videoUrl,
      contactOptions: {
        phone: phone || '+1 (555) 019-2834',
        email: email || 'user@example.com',
        whatsapp: whatsapp || '15550192834'
      },
      ownerId: currentUserId,
      isPremium,
      status: 'active',
      aiTags: aiTags.length > 0 ? aiTags : ['classifieds', category],
      originalLanguage: originalLanguage
    }, listingId);
    onClose();
  };

  return (
    <div id="add_listing_modal_overlay" className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div id="add_listing_modal_content" className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden my-8 animate-scaleIn">
        {/* Modal Header */}
        <div className={`p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <Plus className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900 font-sans">
              {language === 'ar' ? 'إضافة إعلان جديد' : 'Publish Classified Advertisement'}
            </h2>
          </div>
          <button
            id="close_add_listing_btn"
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] flex flex-col gap-6">
          
          {/* AI Generator Box (The Star Feature) */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-100 shadow-sm">
            <h3 className={`text-sm font-bold text-blue-900 mb-2 flex items-center gap-1.5 ${language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row'}`}>
              <Sparkles className="w-4.5 h-4.5 text-blue-600 fill-blue-500 animate-pulse" />
              <span>{language === 'ar' ? 'مساعد الإعلانات الذكي (اختياري)' : 'AI Listing Assistant (Optional)'}</span>
            </h3>
            <p className={`text-xs text-blue-700 mb-4 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' 
                ? 'أدخل لمحة سريعة عما تود بيعه، وسيقوم الذكاء الاصطناعي بكتابة عنوان احترافي، وصف تفصيلي وتصنيف ذكي تلقائياً.'
                : 'Enter a simple summary of what you are selling or offering, and Gemini will automatically structure a professional title, detailed bulleted description, correct category, and keywords.'}
            </p>
            <div className="flex gap-2">
              <input
                id="ai_listing_prompt_input"
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={language === 'ar' ? "مثال: هاتف آيفون ١٣ أحمر ٢٥٦ جيجا نظيف جداً في الرياض..." : "Example: used red iPhone 13 256GB in Riyadh clean battery..."}
                className={`flex-1 bg-white border border-blue-200 rounded-xl ${language === 'ar' ? 'text-right pr-4' : 'pl-4'} py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400`}
              />
              <button
                id="generate_ai_listing_btn"
                type="button"
                onClick={handleGenerateAiListing}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                {isAiLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                )}
                {language === 'ar' ? 'توليد بالذكاء' : 'Generate'}
              </button>
            </div>
            {aiError && <p className="text-xs text-red-500 mt-2 text-right">{aiError}</p>}
          </div>

          {/* Core Fields Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Category Select */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'تصنيف الإعلان' : 'Marketplace Category'} *
              </label>
              <select
                id="add_category_select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES_ALL.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'عنوان الإعلان' : 'Listing Title'} *
              </label>
              <input
                id="add_title_input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={language === 'ar' ? "عنوان جذاب ومباشر" : "Direct catching title"}
                required
                maxLength={150}
                className={`w-full border border-gray-200 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'تفاصيل الإعلان' : 'Detailed Description'} *
              </label>
              <textarea
                id="add_description_textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={language === 'ar' ? "أدخل التفاصيل الفنية، حالة المنتج، وشروط التواصل..." : "Describe items condition, specific parameters, and shipping options..."}
                required
                rows={5}
                maxLength={5000}
                className={`w-full border border-gray-200 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Price & Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'السعر (USD)' : 'Price (USD)'} *
                </label>
                <input
                  id="add_price_input"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  min={0}
                  className={`w-full border border-gray-200 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'الموقع' : 'Location'} *
                </label>
                <input
                  id="add_location_input"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={language === 'ar' ? "المدينة، الدولة" : "City, Country"}
                  required
                  className={`w-full border border-gray-200 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* REAL FIREBASE STORAGE MEDIA UPLOADER PLUGINS */}
            <div className="flex flex-col gap-6 border-t border-b border-gray-100 py-5">
              <ImageUploader
                uploads={imageUploads}
                setUploads={setImageUploads}
                uploadImages={uploadImages}
                cancelUpload={cancelImageUpload}
                retryUpload={retryImageUpload}
                removeUpload={removeImageUpload}
                coverId={coverId}
                onSetCover={setCoverId}
                language={language}
              />
              
              <VideoUploader
                uploads={videoUploads}
                uploadVideos={uploadVideos}
                cancelUpload={cancelVideoUpload}
                removeUpload={removeVideoUpload}
                language={language}
              />
            </div>

            {/* Contact Options */}
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              <h4 className={`text-xs font-bold text-gray-800 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'خيارات التواصل المباشر (اختياري)' : 'Direct Contact Options (Optional)'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  id="add_contact_phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={language === 'ar' ? "رقم الهاتف" : "Phone Number"}
                  className={`border border-gray-200 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500`}
                />
                <input
                  id="add_contact_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  id="add_contact_whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Whatsapp Number (e.g. 971...)"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Premium Promotion Feature */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
              <div className={`flex flex-col gap-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {language === 'ar' ? 'ترقية الإعلان إلى مميز (زيادة المشاهدات بنسبة ٣٠٠٪)' : 'Upgrade to Premium Listing (300% Views Boost)'}
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  {language === 'ar' ? 'يكلف ١٠ دولارات فقط، يثبت الإعلان في الصدارة.' : 'Costs only $10. Pin your advertisement to the dashboard header.'}
                </span>
              </div>
              <input
                id="add_premium_checkbox"
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Generated Keywords Badges Indicator */}
            {aiTags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className={`text-[10px] font-bold text-gray-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'الكلمات المفتاحية المولدة بالذكاء:' : 'AI SEO keywords generated:'}
                </span>
                <div className={`flex flex-wrap gap-1.5 ${language === 'ar' ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
                  {aiTags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-100 font-semibold font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Bar */}
            {submitError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 font-semibold">
                {submitError}
              </div>
            )}
            <div className="border-t border-gray-100 pt-5 mt-2 flex gap-3">
              <button
                id="cancel_publish_btn"
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                id="submit_publish_btn"
                type="submit"
                disabled={imageUploads.some(u => ['idle', 'analyzing', 'compressing', 'uploading'].includes(u.status)) || videoUploads.some(u => ['idle', 'compressing', 'uploading'].includes(u.status))}
                className="flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{language === 'ar' ? 'نشر الإعلان الآن' : 'Publish Ad'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
