/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  User, 
  Sparkles, 
  CheckCircle, 
  Info,
  Sun,
  Moon
} from 'lucide-react';
import { Listing, User as UserType, Report, Category } from '../types';
import { useLanguage } from '../providers/LanguageProvider';
import { useTheme } from '../providers/ThemeProvider';
import { 
  getLocalListings, 
  saveLocalListings, 
  getLocalUsers, 
  saveLocalUsers, 
  getLocalReports, 
  getCurrentUserId, 
  createListing, 
  fileReport, 
  resolveReport, 
  incrementListingViews 
} from '../firebase/firebase';
import { 
  seedDatabaseIfEmpty, 
  ListingService, 
  UserService, 
  ReportService 
} from '../firebase/firestore';

// Import Modular Sub-Components
import SearchBar from '../features/search/components/SearchBar';
import ListingCard from '../features/listings/components/ListingCard';
import AddListingModal from '../features/listings/components/AddListingModal';
import ProfileModal from '../features/profile/components/ProfileModal';
import MessagingDrawer from '../features/chat/components/MessagingDrawer';
import AdminPage from './pages/AdminPage';
import { useAuth } from '../features/auth/hooks/useAuth';
import AuthModal from '../features/auth/AuthModal';
import { useAppState } from './context/AppStateContext';
import { useSearchFilter } from '../features/search/context/SearchFilterContext';
import { matchesCountryFilter } from '../global/languages/countries';

const CATEGORIES_ALL: { value: Category | 'all'; labelKey: string; icon: string }[] = [
  { value: 'all', labelKey: 'category.all', icon: '✨' },
  { value: 'vehicles', labelKey: 'category.vehicles', icon: '🚗' },
  { value: 'real-estate', labelKey: 'category.realEstate', icon: '🏠' },
  { value: 'jobs', labelKey: 'category.jobs', icon: '💼' },
  { value: 'electronics', labelKey: 'category.electronics', icon: '📱' },
  { value: 'services', labelKey: 'category.services', icon: '🛠️' },
  { value: 'businesses-for-sale', labelKey: 'category.businesses', icon: '🏢' },
  { value: 'investment-opportunities', labelKey: 'category.investments', icon: '📈' },
  { value: 'industrial-equipment', labelKey: 'category.industrial', icon: '⚙️' },
  { value: 'commodities', labelKey: 'category.commodities', icon: '🌾' }
];

export default function App() {
  // Context states
  const { 
    listings, 
    users, 
    reports, 
    currentUid, 
    syncDatabaseState 
  } = useAppState();

  const {
    selectedCategory,
    setSelectedCategory,
    searchFilters,
    setSearchFilters,
    aiSearchScores,
    setAiSearchScores,
    isAiSearching,
    setIsAiSearching
  } = useSearchFilter();

  // Global App States
  const { user: authUser, setAuthModalOpen, setAuthModalView } = useAuth();
  const { language, setLanguage, t, direction, availableLanguages } = useLanguage();
  const { theme, setTheme, isDark } = useTheme();
  
  // UI Panels / Modal Triggers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [activeMessageListing, setActiveMessageListing] = useState<Listing | null>(null);

  // Toast / System Notifications State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Toast Notification Auto-dismiss
  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // ----------------------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------------------

  // Handle Standard Filters & AI Semantic Search Requests
  const handleSearch = async (filters: typeof searchFilters) => {
    setSearchFilters(filters);
    
    // Reset AI search score maps if a standard search is performed
    if (!filters.isAiSearch) {
      setAiSearchScores({});
      return;
    }

    // Trigger Server-Side Gemini Semantic Search Pipeline
    setIsAiSearching(true);
    try {
      const activeList = listings.filter(l => l.status === 'active');
      const response = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: filters.query,
          listings: activeList
        })
      });

      const data = await response.json();
      if (response.ok && data.results) {
        const scoreMap: Record<string, { score: number; reason: string }> = {};
        data.results.forEach((r: { id: string; relevanceScore: number; matchReason: string }) => {
          scoreMap[r.id] = {
            score: r.relevanceScore,
            reason: r.matchReason
          };
        });
        setAiSearchScores(scoreMap);
        triggerToast(t('toast.aiSearchComplete'), 'success');
      } else {
        triggerToast(data.error || 'Failed to analyze semantic query', 'error');
      }
    } catch (err) {
      triggerToast(t('toast.aiSearchException'), 'error');
      console.error(err);
    } finally {
      setIsAiSearching(false);
    }
  };

  // Reset Standard Filters & Semantic AI Search States
  const handleReset = () => {
    setSelectedCategory('all');
    setSearchFilters({
      query: '',
      category: 'all',
      location: '',
      minPrice: null,
      maxPrice: null,
      isAiSearch: false
    });
    setAiSearchScores({});
  };

  // Publish Listing Callback
  const handlePublishListing = (
    newListingData: Omit<Listing, 'id' | 'viewsCount' | 'createdAt' | 'updatedAt'>,
    customId?: string
  ) => {
    const created = createListing(newListingData, customId);
    syncDatabaseState();
    triggerToast(t('toast.listingPublished', { title: created.title }), 'success');
  };

  // Update profile details
  const handleUpdateProfile = (updatedUser: UserType) => {
    const localUsers = getLocalUsers();
    localUsers[updatedUser.id] = updatedUser;
    saveLocalUsers(localUsers);
    syncDatabaseState();
    triggerToast(t('toast.profileUpdated'), 'success');
  };

  // Report/Flag listing
  const handleReportListing = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    fileReport(
      listingId,
      currentUid,
      `Reported for audit: "${listing.title}" priced at $${listing.price}. Potential scam risk.`
    );
    syncDatabaseState();
    triggerToast(t('toast.reportSubmitted'), 'info');
  };

  // Resolve reported listing (Admin)
  const handleResolveReport = (reportId: string, action: 'suspend' | 'dismiss') => {
    resolveReport(reportId, action);
    syncDatabaseState();
    triggerToast(
      action === 'suspend'
        ? t('toast.listingSuspended')
        : t('toast.reportDismissed'),
      'info'
    );
  };

  // Card details modified (e.g. translation cached)
  const handleUpdateListing = (updated: Listing) => {
    const localList = getLocalListings();
    const idx = localList.findIndex(l => l.id === updated.id);
    if (idx !== -1) {
      localList[idx] = updated;
      saveLocalListings(localList);
      syncDatabaseState();
    }
  };

  // Open Chat Drawer with seller
  const handleContactSeller = (listing: Listing) => {
    if (!authUser) {
      setAuthModalView('login');
      setAuthModalOpen(true);
      triggerToast(t('toast.contactLoginRequired'), 'info');
      return;
    }
    incrementListingViews(listing.id);
    setActiveMessageListing(listing);
  };

  // ----------------------------------------------------
  // LISTING FILTERING ENGINE (Standard vs AI)
  // ----------------------------------------------------
  
  // Decide active listings to show
  const filteredListings = listings.filter((l) => {
    // 1. Hard filter: Never show suspended listings in client-facing feed
    if (l.status === 'suspended') return false;

    // 2. Horizontal categories ribbon filter
    if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;

    // 3. Standard Search Inputs (Skip if AI Search scores are actively filtering)
    if (Object.keys(aiSearchScores).length === 0) {
      const q = searchFilters.query.toLowerCase();
      if (q && !l.title.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q) && !l.category.toLowerCase().includes(q)) {
        return false;
      }
      if (searchFilters.category !== 'all' && l.category !== searchFilters.category) return false;
      if (searchFilters.location && !matchesCountryFilter(l.location, searchFilters.location) && !l.location.toLowerCase().includes(searchFilters.location.toLowerCase())) return false;
      if (searchFilters.minPrice !== null && l.price < searchFilters.minPrice) return false;
      if (searchFilters.maxPrice !== null && l.price > searchFilters.maxPrice) return false;
    } else {
      // AI Semantic filtering mode: Only show items matching semantic scoring cutoff
      const aiScoreObj = aiSearchScores[l.id];
      if (!aiScoreObj || aiScoreObj.score < 40) return false;
    }

    return true;
  });

  // Sort listings: Pinned/Premium listings at the very top, followed by AI score order (if active), followed by creation dates
  const sortedListings = [...filteredListings].sort((a, b) => {
    // Premium priority
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;

    // AI Score priority if in active semantic match mode
    if (Object.keys(aiSearchScores).length > 0) {
      const scoreA = aiSearchScores[a.id]?.score || 0;
      const scoreB = aiSearchScores[b.id]?.score || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
    }

    // Default Date sorting
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const currentUser: UserType = authUser ? {
    id: authUser.uid,
    name: authUser.displayName,
    email: authUser.email,
    phone: authUser.phoneNumber,
    accountType: authUser.accountType === 'administrator' ? 'business' : (authUser.accountType === 'company' || authUser.accountType === 'broker' || authUser.accountType === 'business' ? 'business' : 'personal'),
    verificationStatus: authUser.verified ? 'verified' : 'pending',
    trustScore: authUser.trustScore,
    createdAt: authUser.createdAt
  } : {
    id: 'user-3',
    name: 'Moustafa El-Sayed',
    email: 'moustafa.sayed@gmail.com',
    phone: '+20 100 234 5678',
    accountType: 'personal',
    verificationStatus: 'pending',
    trustScore: 75,
    createdAt: ''
  };

  return (
      <div 
        id="app_root" 
        dir={direction} 
        className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 pb-16 antialiased transition-colors duration-200`}
      >
        
        {/* Toast Notification HUD */}
        {notification && (
          <div 
            id="toast_notification" 
            className={`fixed bottom-6 ${direction === 'rtl' ? 'left-6' : 'right-6'} z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-xs font-bold shadow-lg animate-slideLeft ${
              notification.type === 'success' 
                ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                : notification.type === 'info' 
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300' 
                  : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Main App Navigation Bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xs sticky top-0 z-30 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            {/* Logo & Slogan */}
            <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white fill-white" />
              </div>
              <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                <h1 className="text-lg font-bold font-sans text-gray-900 dark:text-gray-100 tracking-tight">Dimoads AI</h1>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider block">
                  {t('header.tagline')}
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3">
              
              {/* Language Selector: dropdown covering all 20 supported languages */}
              <select
                id="language_toggle_btn"
                value={language}
                onChange={(e) => setLanguage(e.target.value as typeof language)}
                className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full transition-colors font-bold text-xs border border-gray-200 dark:border-gray-700 cursor-pointer bg-white dark:bg-gray-800 outline-none"
                title={t('header.changeLanguage')}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>

              {/* Dark Mode Toggle */}
              <button
                id="theme_toggle_btn"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2.5 rounded-full transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title={t('header.toggleTheme')}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                id="admin_panel_toggle_btn"
                onClick={() => {
                  if (!authUser) {
                    setAuthModalView('login');
                    setAuthModalOpen(true);
                    triggerToast(t('toast.adminLoginRequired'), 'info');
                  } else {
                    setShowAdminPanel(!showAdminPanel);
                  }
                }}
                className={`p-2.5 rounded-full transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer border ${
                  showAdminPanel 
                    ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{t('header.admin')}</span>
              </button>

              {/* User Profile Badge Trigger */}
              <button
                id="user_profile_trigger_btn"
                onClick={() => {
                  if (!authUser) {
                    setAuthModalView('login');
                    setAuthModalOpen(true);
                  } else {
                    setShowProfileModal(true);
                  }
                }}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full transition-all flex items-center gap-2 cursor-pointer text-xs font-semibold bg-white dark:bg-gray-800"
              >
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="hidden sm:inline text-gray-700 dark:text-gray-200">{currentUser.name}</span>
                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[10px] font-bold rounded">
                  {currentUser.trustScore}% {t('header.trust')}
                </span>
              </button>

              {/* Publish Ad Action Button */}
              <button
                id="publish_ad_header_btn"
                onClick={() => {
                  if (!authUser) {
                    setAuthModalView('login');
                    setAuthModalOpen(true);
                    triggerToast(t('toast.publishLoginRequired'), 'info');
                  } else {
                    setShowAddModal(true);
                  }
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>{t('header.publishAd')}</span>
              </button>

            </div>

          </div>
        </header>

      {/* Main Marketplace Context */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Admin Dashboard Panel */}
        {showAdminPanel && (
          <AdminPage
            onResolveReport={handleResolveReport}
            language={language}
          />
        )}

        {/* Hero banner section */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl text-white p-6 md:p-8 mb-8 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
          <div className="relative max-w-xl z-10 flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-spin" />
              {t('hero.badge')}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans leading-snug">
              {t('hero.heading')}
            </h2>
            <p className="text-xs md:text-sm text-blue-100 leading-relaxed font-medium">
              {t('hero.subtext')}
            </p>
          </div>
        </div>

        {/* Integrated Unified Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onClear={handleReset}
          language={language}
        />

        {/* Horizontal Category Carousel Ribbon */}
        <div className="relative mb-8">
          <div className={`flex gap-2.5 overflow-x-auto pb-3 scrollbar-none snap-x ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
            {CATEGORIES_ALL.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setSearchFilters(prev => ({ ...prev, category: cat.value }));
                  }}
                  className={`px-4 py-3 rounded-full border transition-all text-xs font-bold flex items-center gap-2 whitespace-nowrap snap-center cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{t(cat.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Semantic matches reason banner */}
        {Object.keys(aiSearchScores).length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className={`text-xs text-blue-900 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              <h4 className="font-bold mb-1">
                {t('search.aiActiveTitle')}
              </h4>
              <p className="opacity-90 leading-relaxed">
                {t('search.aiActiveDesc', { query: searchFilters.query })}
              </p>
            </div>
          </div>
        )}

        {/* Listings Feed Bento Layout */}
        <div>
          {sortedListings.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <span className="text-4xl block mb-3">🔍</span>
              <h3 className="text-base font-bold text-gray-900 mb-1">
                {t('noResults.title')}
              </h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                {t('noResults.desc')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedListings.map((listing) => (
                <div key={listing.id} className="flex flex-col relative">
                  {/* Semantic Score Tag Overlay */}
                  {aiSearchScores[listing.id] && (
                    <div className="absolute top-14 left-3 right-3 bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-lg p-2.5 z-10 shadow-md text-[11px] animate-scaleIn">
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {t('search.aiScoreLabel')}
                        </span>
                        <span className="font-mono text-yellow-300 font-extrabold">{aiSearchScores[listing.id].score}%</span>
                      </div>
                      <p className="opacity-95 leading-relaxed">{aiSearchScores[listing.id].reason}</p>
                    </div>
                  )}

                  <ListingCard
                    listing={listing}
                    onContactSeller={handleContactSeller}
                    onReportListing={handleReportListing}
                    onUpdateListing={handleUpdateListing}
                    language={language}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Developer Reference footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-200">
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
          <p>{t('footer.copyright')}</p>
          <div className="flex gap-4">
            <a href="/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 underline font-semibold">
              {t('footer.architectureLink')}
            </a>
          </div>
        </div>
      </footer>

      {/* ----------------------------------------------------
          MODALS & DRAWERS
         ---------------------------------------------------- */}

      {/* Modal: Add Listing Form with AI */}
      {showAddModal && (
        <AddListingModal
          onClose={() => setShowAddModal(false)}
          onAddListing={handlePublishListing}
          currentUserId={currentUser.id}
          language={language}
        />
      )}

      {/* Modal: User profile and Identity Trust metrics */}
      {showProfileModal && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdateUser={handleUpdateProfile}
          language={language}
        />
      )}

      {/* Drawer: Messaging Center between Buyer & Seller */}
      {activeMessageListing && (
        <MessagingDrawer
          listing={activeMessageListing}
          currentUser={currentUser}
          seller={users[activeMessageListing.ownerId]}
          onClose={() => setActiveMessageListing(null)}
          language={language}
        />
      )}

      {/* Central Auth Modal overlay */}
      <AuthModal language={language} />

    </div>
  );
}
