/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category } from '../../../types';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  minPrice: number | null;
  maxPrice: number | null;
  isAiSearch: boolean;
}

interface SearchFilterContextType {
  selectedCategory: Category | 'all';
  setSelectedCategory: React.Dispatch<React.SetStateAction<Category | 'all'>>;
  searchFilters: SearchFilters;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  aiSearchScores: Record<string, { score: number; reason: string }>;
  setAiSearchScores: React.Dispatch<React.SetStateAction<Record<string, { score: number; reason: string }>>>;
  isAiSearching: boolean;
  setIsAiSearching: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchFilterContext = createContext<SearchFilterContextType | undefined>(undefined);

const initialFilters: SearchFilters = {
  query: '',
  category: 'all',
  location: '',
  minPrice: null,
  maxPrice: null,
  isAiSearch: false
};

export function SearchFilterProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(initialFilters);
  const [aiSearchScores, setAiSearchScores] = useState<Record<string, { score: number; reason: string }>>({});
  const [isAiSearching, setIsAiSearching] = useState(false);

  return (
    <SearchFilterContext.Provider value={{
      selectedCategory,
      setSelectedCategory,
      searchFilters,
      setSearchFilters,
      aiSearchScores,
      setAiSearchScores,
      isAiSearching,
      setIsAiSearching
    }}>
      {children}
    </SearchFilterContext.Provider>
  );
}

export function useSearchFilter() {
  const context = useContext(SearchFilterContext);
  if (context === undefined) {
    throw new Error('useSearchFilter must be used within a SearchFilterProvider');
  }
  return context;
}
