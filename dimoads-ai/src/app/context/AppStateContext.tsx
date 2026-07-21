/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Listing, User as UserType, Report } from '../../types';
import { 
  getLocalListings, 
  getLocalUsers, 
  getLocalReports, 
  getCurrentUserId 
} from '.././../firebase/firebase';

interface AppStateContextType {
  listings: Listing[];
  users: Record<string, UserType>;
  reports: Report[];
  currentUid: string;
  setListings: React.Dispatch<React.SetStateAction<Listing[]>>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, UserType>>>;
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  setCurrentUid: React.Dispatch<React.SetStateAction<string>>;
  syncDatabaseState: () => void;
  isLoading: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<Record<string, UserType>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [currentUid, setCurrentUid] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const syncDatabaseState = () => {
    setListings(getLocalListings());
    setUsers(getLocalUsers());
    setReports(getLocalReports());
    setCurrentUid(getCurrentUserId());
  };

  useEffect(() => {
    syncDatabaseState();
    setIsLoading(false);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && ['dimoads_listings', 'dimoads_users', 'dimoads_reports', 'dimoads_messages', 'dimoads_current_uid'].includes(event.key)) {
        syncDatabaseState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AppStateContext.Provider value={{
      listings,
      users,
      reports,
      currentUid,
      setListings,
      setUsers,
      setReports,
      setCurrentUid,
      syncDatabaseState,
      isLoading
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
