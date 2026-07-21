import { Listing, Message, Report, User } from '../types';
import { initialListings, initialReports, mockUsers } from '../data';

type PersistedState = {
  listings: Listing[];
  users: Record<string, User>;
  reports: Report[];
  messages: Message[];
  currentUserId: string;
};

const LISTINGS_KEY = 'dimoads_listings';
const USERS_KEY = 'dimoads_users';
const REPORTS_KEY = 'dimoads_reports';
const MESSAGES_KEY = 'dimoads_messages';
const CURRENT_USER_KEY = 'dimoads_current_uid';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) {
      return fallback;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.warn(`Failed to read persisted state for ${key}:`, error);
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write persisted state for ${key}:`, error);
  }
}

async function hydrateFromServer() {
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return;
  }

  try {
    const response = await fetch('/api/persistence/state');
    if (!response.ok) {
      return;
    }

    const payload = await response.json() as Partial<PersistedState>;
    if (!payload || typeof payload !== 'object') {
      return;
    }

    if (Array.isArray(payload.listings)) {
      writeJson(LISTINGS_KEY, payload.listings);
    }
    if (payload.users && typeof payload.users === 'object') {
      writeJson(USERS_KEY, payload.users);
    }
    if (Array.isArray(payload.reports)) {
      writeJson(REPORTS_KEY, payload.reports);
    }
    if (Array.isArray(payload.messages)) {
      writeJson(MESSAGES_KEY, payload.messages);
    }
    if (typeof payload.currentUserId === 'string') {
      writeJson(CURRENT_USER_KEY, payload.currentUserId);
    }
  } catch (error) {
    console.warn('Failed to hydrate from server persistence:', error);
  }
}

function syncToServer(nextState: Partial<PersistedState>) {
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return;
  }

  const payload: PersistedState = {
    listings: Array.isArray(nextState.listings) ? nextState.listings : getPersistedListings(),
    users: nextState.users && typeof nextState.users === 'object' ? nextState.users : getPersistedUsers(),
    reports: Array.isArray(nextState.reports) ? nextState.reports : getPersistedReports(),
    messages: Array.isArray(nextState.messages) ? nextState.messages : getPersistedMessages(),
    currentUserId: typeof nextState.currentUserId === 'string' ? nextState.currentUserId : getCurrentUserId()
  };

  void fetch('/api/persistence/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch((error) => {
    console.warn('Failed to sync persistence to server:', error);
  });
}

void hydrateFromServer();

export function getPersistedListings(): Listing[] {
  const stored = readJson<Listing[] | null>(LISTINGS_KEY, null);
  if (stored) {
    return stored;
  }

  void hydrateFromServer();
  return initialListings;
}

export function savePersistedListings(listings: Listing[]) {
  writeJson(LISTINGS_KEY, listings);
  syncToServer({ listings });
}

export function getPersistedUsers(): Record<string, User> {
  const stored = readJson<Record<string, User> | null>(USERS_KEY, null);
  if (stored) {
    return stored;
  }

  void hydrateFromServer();
  return mockUsers;
}

export function savePersistedUsers(users: Record<string, User>) {
  writeJson(USERS_KEY, users);
  syncToServer({ users });
}

export function getPersistedReports(): Report[] {
  const stored = readJson<Report[] | null>(REPORTS_KEY, null);
  if (stored) {
    return stored;
  }

  void hydrateFromServer();
  return initialReports;
}

export function savePersistedReports(reports: Report[]) {
  writeJson(REPORTS_KEY, reports);
  syncToServer({ reports });
}

export function getPersistedMessages(): Message[] {
  const stored = readJson<Message[] | null>(MESSAGES_KEY, null);
  if (stored) {
    return stored;
  }

  void hydrateFromServer();
  return [];
}

export function savePersistedMessages(messages: Message[]) {
  writeJson(MESSAGES_KEY, messages);
  syncToServer({ messages });
}

export function getCurrentUserId(): string {
  if (typeof window === 'undefined') {
    return 'user-3';
  }

  const uid = localStorage.getItem(CURRENT_USER_KEY);
  if (!uid) {
    localStorage.setItem(CURRENT_USER_KEY, 'user-3');
    return 'user-3';
  }
  return uid;
}

export function setCurrentUserId(uid: string) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(CURRENT_USER_KEY, uid);
  syncToServer({ currentUserId: uid });
}
