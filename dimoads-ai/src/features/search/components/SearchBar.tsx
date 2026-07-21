/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Sparkles, SlidersHorizontal, MapPin, DollarSign, RefreshCw, X } from 'lucide-react';
import { AppLanguage, Category } from '../../../types';
import { useSearchFilter } from '../context/SearchFilterContext';
import { COUNTRY_OPTIONS, matchesCountryFilter } from '../../../global/languages/countries';

interface SearchBarProps {
  onSearch: (filters: {
    query: string;
    category: string;
    location: string;
    minPrice: number | null;
    maxPrice: number | null;
    isAiSearch: boolean;
  }) => void;
  onClear: () => void;
  language: AppLanguage;
}

const CATEGORIES_ENG = [
  { value: 'all', label: 'All Categories' },
  { value: 'jobs', label: '💼 Jobs' },
  { value: 'real-estate', label: '🏠 Real Estate' },
  { value: 'vehicles', label: '🚗 Vehicles' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'services', label: '🛠️ Services' },
  { value: 'businesses-for-sale', label: '🏢 Businesses for Sale' },
  { value: 'investment-opportunities', label: '📈 Investments' },
  { value: 'industrial-equipment', label: '⚙️ Industrial Equipment' },
  { value: 'commodities', label: '🌾 Commodities' }
];

const CATEGORIES_ARA = [
  { value: 'all', label: 'جميع الفئات' },
  { value: 'jobs', label: '💼 وظائف' },
  { value: 'real-estate', label: '🏠 عقارات' },
  { value: 'vehicles', label: '🚗 مركبات' },
  { value: 'electronics', label: '📱 إلكترونيات' },
  { value: 'services', label: '🛠️ خدمات' },
  { value: 'businesses-for-sale', label: '🏢 شركات للبيع' },
  { value: 'investment-opportunities', label: '📈 فرص استثمارية' },
  { value: 'industrial-equipment', label: '⚙️ معدات صناعية' },
  { value: 'commodities', label: '🌾 سلع أساسية' }
];

const baseTranslations = {
  placeholder: "Search listings by keyword or try AI natural language: 'porsche for cheap in Dubai'...",
  searchBtn: "Search",
  aiBtn: "AI Semantic Search",
  filtersLabel: "Filters",
  clearBtn: "Reset",
  categoryLabel: "Category",
  locationLabel: "Location",
  locationPlc: "City or Country",
  minPricePlc: "Min Price",
  maxPricePlc: "Max Price",
  aiActive: "AI Search Active",
  aiThinking: "Analyzing intent..."
};

const TRANSLATIONS: Record<AppLanguage, {
  placeholder: string;
  searchBtn: string;
  aiBtn: string;
  filtersLabel: string;
  clearBtn: string;
  categoryLabel: string;
  locationLabel: string;
  locationPlc: string;
  minPricePlc: string;
  maxPricePlc: string;
  aiActive: string;
  aiThinking: string;
}> = {
  en: { ...baseTranslations },
  ar: {
    placeholder: "ابحث عن الإعلانات بالكلمة المفتاحية أو جرب البحث الذكي: 'سيارة بورشه رخيصة في دبي'...",
    searchBtn: "بحث",
    aiBtn: "البحث الدلالي بالذكاء الاصطناعي",
    filtersLabel: "تصفية النتائج",
    clearBtn: "إعادة تعيين",
    categoryLabel: "الفئة",
    locationLabel: "الموقع",
    locationPlc: "المدينة أو الدولة",
    minPricePlc: "الحد الأدنى للسعر",
    maxPricePlc: "الحد الأقصى للسعر",
    aiActive: "البحث الذكي نشط",
    aiThinking: "تحليل النية..."
  },
  "zh-CN": { ...baseTranslations },
  es: { ...baseTranslations },
  fr: { ...baseTranslations },
  hi: { ...baseTranslations },
  pt: { ...baseTranslations },
  ru: { ...baseTranslations },
  id: { ...baseTranslations },
  de: { ...baseTranslations },
  ja: { ...baseTranslations },
  ko: { ...baseTranslations },
  tr: { ...baseTranslations },
  it: { ...baseTranslations },
  pl: { ...baseTranslations },
  nl: { ...baseTranslations },
  bn: { ...baseTranslations },
  ur: { ...baseTranslations },
  vi: { ...baseTranslations },
  th: { ...baseTranslations }
};

export default function SearchBar({ onSearch, onClear, language }: SearchBarProps) {
  const { isAiSearching } = useSearchFilter();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [aiMode, setAiMode] = useState(false);

  const t = TRANSLATIONS[language] ?? TRANSLATIONS.en;
  const categories = language === 'ar' ? CATEGORIES_ARA : CATEGORIES_ENG;
  const countryOptions = COUNTRY_OPTIONS;

  const handleStandardSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAiMode(false);
    onSearch({
      query,
      category,
      location,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      isAiSearch: false
    });
  };

  const handleAiSearch = () => {
    if (!query.trim()) return;
    setAiMode(true);
    onSearch({
      query,
      category: 'all', // AI analyzes everything
      location: '',
      minPrice: null,
      maxPrice: null,
      isAiSearch: true
    });
  };

  const handleReset = () => {
    setQuery('');
    setCategory('all');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    setAiMode(false);
    onClear();
  };

  return (
    <div id="search_container" className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 mb-8 transition-all hover:shadow-md">
      <form onSubmit={handleStandardSearch} className="flex flex-col gap-3">
        {/* Search Input Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              id="search_query_input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.placeholder}
              className={`w-full ${language === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 text-sm md:text-base`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              id="standard_search_btn"
              type="submit"
              className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-all shadow-sm active:scale-95"
            >
              {t.searchBtn}
            </button>

            <button
              id="ai_search_btn"
              type="button"
              onClick={handleAiSearch}
              disabled={isAiSearching || !query.trim()}
              className={`px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-medium rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95`}
            >
              {isAiSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              )}
              <span className="hidden sm:inline">{isAiSearching ? t.aiThinking : t.aiBtn}</span>
            </button>
          </div>
        </div>

        {/* Quick Tags Row */}
        <div className={`flex flex-wrap gap-2 text-xs text-gray-500 mt-1 ${language === 'ar' ? 'justify-start' : 'justify-start'}`}>
          <span className="font-medium">{language === 'ar' ? 'عمليات بحث شائعة:' : 'Popular searches:'}</span>
          <button
            type="button"
            onClick={() => { setQuery(language === 'ar' ? 'سيارة رخيصة بورش في دبي' : 'Porsche for cheap in Dubai'); }}
            className="hover:text-blue-600 transition-colors cursor-pointer underline decoration-dotted"
          >
            {language === 'ar' ? 'بورش في دبي' : 'Porsche in Dubai'}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => { setQuery(language === 'ar' ? 'وظيفة مطور برمجيات عن بعد براتب جيد' : 'Remote developer job with good salary'); }}
            className="hover:text-blue-600 transition-colors cursor-pointer underline decoration-dotted"
          >
            {language === 'ar' ? 'وظيفة مطور عن بعد' : 'Remote developer job'}
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => { setQuery(language === 'ar' ? 'فرصة استثمار في القصيم السعودية' : 'Al-Qassim date investment Saudi'); }}
            className="hover:text-blue-600 transition-colors cursor-pointer underline decoration-dotted"
          >
            {language === 'ar' ? 'استثمار القصيم' : 'Al-Qassim date factory'}
          </button>
        </div>

        {/* Filters Toggle and Status Row */}
        <div className="flex items-center justify-between mt-3 border-t border-gray-100 pt-3">
          <button
            id="filters_toggle_btn"
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t.filtersLabel}
          </button>

          {aiMode && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
              {t.aiActive}
            </span>
          )}

          {(query || category !== 'all' || location || minPrice || maxPrice) && (
            <button
              id="reset_filters_btn"
              type="button"
              onClick={handleReset}
              className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
            >
              {t.clearBtn}
            </button>
          )}
        </div>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div id="filters_collapsible_panel" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-3 bg-gray-50 rounded-xl p-4 border border-gray-100 animate-fadeIn">
            {/* Category Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">{t.categoryLabel}</label>
              <select
                id="filter_category_select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">{t.locationLabel}</label>
              <div className="relative">
                <MapPin className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <input
                  id="filter_location_input"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t.locationPlc}
                  list="country-suggestions"
                  className={`w-full bg-white border border-gray-200 rounded-lg ${language === 'ar' ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'} py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
                <datalist id="country-suggestions">
                  {countryOptions.map((option) => (
                    <option key={option.code} value={language === 'ar' ? option.labelAr : option.labelEn} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Min Price Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">{t.minPricePlc}</label>
              <div className="relative">
                <DollarSign className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <input
                  id="filter_min_price"
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-white border border-gray-200 rounded-lg ${language === 'ar' ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'} py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
              </div>
            </div>

            {/* Max Price Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600">{t.maxPricePlc}</label>
              <div className="relative">
                <DollarSign className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <input
                  id="filter_max_price"
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className={`w-full bg-white border border-gray-200 rounded-lg ${language === 'ar' ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'} py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all`}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
