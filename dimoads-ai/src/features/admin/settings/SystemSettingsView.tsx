/**
 * System Settings Configurator for controlling languages, currencies, and feature flags
 */
import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Check, 
  Sliders, 
  Globe, 
  DollarSign, 
  Search,
  Sparkles
} from 'lucide-react';
import { SystemSettings } from '../types';
import { AdminService } from '../services/adminService';

interface SystemSettingsViewProps {
  language: 'en' | 'ar';
}

export default function SystemSettingsView({ language }: SystemSettingsViewProps) {
  const [settings, setSettings] = useState<SystemSettings>(() => AdminService.getSettings());
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [siteName, setSiteName] = useState(settings.general.siteName);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.general.maintenanceMode);
  const [defaultCurrency, setDefaultCurrency] = useState(settings.general.defaultCurrency);
  
  // Custom Lists
  const [langs, setLangs] = useState(settings.supportedLanguages.join(', '));
  const [currencies, setCurrencies] = useState(settings.supportedCurrencies.join(', '));
  const [countries, setCountries] = useState(settings.supportedCountries.join(', '));
  const [cities, setCities] = useState(settings.supportedCities.join(', '));
  const [keywords, setKeywords] = useState(settings.seo.keywords.join(', '));

  // Feature Flags
  const [enableAiSearch, setEnableAiSearch] = useState(settings.featureFlags.enableAiSearch);
  const [enableAiListingAssistant, setEnableAiListingAssistant] = useState(settings.featureFlags.enableAiListingAssistant);
  const [enableAiPriceRecommend, setEnableAiPriceRecommend] = useState(settings.featureFlags.enableAiPriceRecommend);
  const [enableFraudRadar, setEnableFraudRadar] = useState(settings.featureFlags.enableFraudRadar);
  const [enableInstantModeration, setEnableInstantModeration] = useState(settings.featureFlags.enableInstantModeration);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: SystemSettings = {
      general: {
        siteName,
        logoUrl: settings.general.logoUrl,
        maintenanceMode,
        defaultLanguage: settings.general.defaultLanguage,
        defaultCurrency
      },
      supportedLanguages: langs.split(',').map(s => s.trim()).filter(Boolean),
      supportedCurrencies: currencies.split(',').map(s => s.trim()).filter(Boolean),
      supportedCountries: countries.split(',').map(s => s.trim()).filter(Boolean),
      supportedCities: cities.split(',').map(s => s.trim()).filter(Boolean),
      featureFlags: {
        enableAiSearch,
        enableAiListingAssistant,
        enableAiPriceRecommend,
        enableFraudRadar,
        enableInstantModeration
      },
      seo: {
        defaultTitle: settings.seo.defaultTitle,
        defaultMetaDescription: settings.seo.defaultMetaDescription,
        keywords: keywords.split(',').map(s => s.trim()).filter(Boolean)
      }
    };

    AdminService.updateSettings(updated);
    setSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form id="admin_system_settings" onSubmit={handleSave} className="space-y-6">
      
      {/* Save Trigger Banner */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-950 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <span>GLOBAL REGISTRY & TAX CONTROL PANEL</span>
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">Edit system configurations, supported regions, and AI services</p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{isSaved ? 'Settings Saved' : 'Save System Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* Left Side: General and Regional */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold uppercase text-[10px] text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>Regional Lists & System Metadata</span>
            </h4>

            {/* Site Title and Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Site Title Brand</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">System Default Currency</label>
                <input
                  type="text"
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 font-semibold text-gray-800"
                />
              </div>
            </div>

            {/* List selectors */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-gray-500 font-bold mb-1">Supported Languages (comma-separated)</label>
                <input
                  type="text"
                  value={langs}
                  onChange={(e) => setLangs(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Supported Currencies (comma-separated)</label>
                <input
                  type="text"
                  value={currencies}
                  onChange={(e) => setCurrencies(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Supported Sovereign Countries (comma-separated)</label>
                <input
                  type="text"
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-none font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Supported Cities (comma-separated)</label>
                <input
                  type="text"
                  value={cities}
                  onChange={(e) => setCities(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-none font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1">Global SEO Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Feature toggles & AI switches */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold uppercase text-[10px] text-gray-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span>Feature Flags & AI Gateways</span>
            </h4>

            <div className="space-y-4">
              {/* Maintenance toggle */}
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl">
                <div>
                  <span className="block font-bold text-gray-900">Maintenance Mode</span>
                  <span className="text-[10px] text-gray-400">Lock marketplace for public users</span>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                />
              </div>

              {/* AI Search */}
              <div className="flex justify-between items-center p-3.5 bg-blue-50/20 border border-blue-50 rounded-2xl">
                <div>
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    Gemini Smart Search
                  </span>
                  <span className="block text-[10px] text-gray-400">Enable advanced NLP matching</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAiSearch}
                  onChange={(e) => setEnableAiSearch(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                />
              </div>

              {/* AI Listing Assistant */}
              <div className="flex justify-between items-center p-3.5 bg-blue-50/20 border border-blue-50 rounded-2xl">
                <div>
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    AI Listing Copywriter
                  </span>
                  <span className="block text-[10px] text-gray-400">Auto-compose title/description</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAiListingAssistant}
                  onChange={(e) => setEnableAiListingAssistant(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                />
              </div>

              {/* AI Price Recommend */}
              <div className="flex justify-between items-center p-3.5 bg-blue-50/20 border border-blue-50 rounded-2xl">
                <div>
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    AI Price Valuator
                  </span>
                  <span className="block text-[10px] text-gray-400">GCC regional valuation advisor</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableAiPriceRecommend}
                  onChange={(e) => setEnableAiPriceRecommend(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                />
              </div>

              {/* Fraud radar */}
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl">
                <div>
                  <span className="font-bold text-gray-900">Fraud Radar Engine</span>
                  <span className="text-[10px] text-gray-400">Auto-isolate duplicating sellers</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableFraudRadar}
                  onChange={(e) => setEnableFraudRadar(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                />
              </div>

              {/* Instant moderation */}
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl">
                <div>
                  <span className="font-bold text-gray-900">Instant Image Moderation</span>
                  <span className="text-[10px] text-gray-400">AI reject blurry/unsafe uploads</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableInstantModeration}
                  onChange={(e) => setEnableInstantModeration(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500"
                />
              </div>

            </div>
          </div>
        </div>

      </div>

    </form>
  );
}
