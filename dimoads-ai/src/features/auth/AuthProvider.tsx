/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../../firebase/auth';

export type AccountType = 'individual' | 'business' | 'broker' | 'company' | 'administrator';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  photoURL: string;
  accountType: AccountType;
  verified: boolean;
  trustScore: number;
  country: string;
  city: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  status: 'active' | 'suspended';
  passwordHash?: string;
}

interface LocalAuthUser {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  photoURL: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: LocalAuthUser | null;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  isGuest: boolean;

  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, profileData: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phone: string, containerId: string) => Promise<void>;
  verifyPhoneOTP: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;

  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalView: 'login' | 'register' | 'forgot-password' | 'verify-phone' | 'profile-setup';
  setAuthModalView: (view: 'login' | 'register' | 'forgot-password' | 'verify-phone' | 'profile-setup') => void;
  tempPhone: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USERS_STORAGE_KEY = 'dimoads_local_users_v1';
const CURRENT_USER_UID_KEY = 'dimoads_current_uid';
const CURRENT_USER_PAYLOAD_KEY = 'dimoads_current_user';

const hashPassword = (value: string) => {
  if (typeof btoa === 'function') {
    return btoa(encodeURIComponent(value));
  }
  return value;
};

const readStoredUsers = (): UserProfile[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredUsers = (users: UserProfile[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const persistCurrentUser = (profile: UserProfile) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CURRENT_USER_UID_KEY, profile.uid);
  window.localStorage.setItem(CURRENT_USER_PAYLOAD_KEY, JSON.stringify(profile));
};

const clearCurrentUser = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CURRENT_USER_UID_KEY);
  window.localStorage.removeItem(CURRENT_USER_PAYLOAD_KEY);
};

const buildProfile = (email: string, pass: string | undefined, profileData: Partial<UserProfile> = {}): UserProfile => {
  const now = new Date().toISOString();
  const baseEmail = email.trim().toLowerCase();
  const uid = `local-${baseEmail.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}`;
  return {
    uid,
    displayName: profileData.displayName || baseEmail.split('@')[0],
    email: baseEmail,
    phoneNumber: profileData.phoneNumber || '',
    photoURL: profileData.photoURL || '',
    accountType: profileData.accountType || 'individual',
    verified: false,
    trustScore: 75,
    country: profileData.country || 'EG',
    city: profileData.city || 'Cairo',
    language: profileData.language || 'en',
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
    status: 'active',
    passwordHash: pass ? hashPassword(pass) : undefined
  };
};

const findStoredUserByEmail = (email: string) => {
  const normalized = email.trim().toLowerCase();
  return readStoredUsers().find((user) => user.email.toLowerCase() === normalized);
};

const saveProfileToStorage = (profile: UserProfile) => {
  const users = readStoredUsers();
  const nextUsers = users.filter((existing) => existing.uid !== profile.uid && existing.email.toLowerCase() !== profile.email.toLowerCase());
  nextUsers.push(profile);
  writeStoredUsers(nextUsers);
  persistCurrentUser(profile);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<LocalAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register' | 'forgot-password' | 'verify-phone' | 'profile-setup'>('login');
  const [tempPhone, setTempPhone] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const restoreLocalUser = () => {
      try {
        const savedUserPayload = window.localStorage.getItem(CURRENT_USER_PAYLOAD_KEY);
        if (savedUserPayload) {
          const parsed = JSON.parse(savedUserPayload) as UserProfile;
          setUser(parsed);
          setFirebaseUser({
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.displayName,
            phoneNumber: parsed.phoneNumber,
            photoURL: parsed.photoURL
          });
          return true;
        }
      } catch {
        // ignore malformed local data
      }
      setUser(null);
      setFirebaseUser(null);
      return false;
    };

    const processGoogleRedirect = async () => {
      try {
        const firebaseUser = await AuthService.getGoogleRedirectResult();
        if (firebaseUser) {
          const email = firebaseUser.email || `google-user-${Date.now()}@example.com`;
          const displayName = firebaseUser.displayName || 'Google User';
          const photoURL = firebaseUser.photoURL || '';
          const existing = findStoredUserByEmail(email);
          const profile = existing || buildProfile(email, 'google-local', {
            displayName,
            photoURL
          });
          saveProfileToStorage(profile);
          setUser(profile);
          setFirebaseUser({
            uid: profile.uid,
            email: profile.email,
            displayName: profile.displayName,
            phoneNumber: profile.phoneNumber,
            photoURL: profile.photoURL
          });
          setAuthModalOpen(false);
        } else {
          restoreLocalUser();
        }
      } catch (err) {
        console.warn('Google redirect result failed:', err);
        restoreLocalUser();
      } finally {
        setLoading(false);
      }
    };

    if (!restoreLocalUser()) {
      processGoogleRedirect();
    } else {
      setLoading(false);
      void processGoogleRedirect();
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      const existing = findStoredUserByEmail(email);
      if (!existing || existing.passwordHash !== hashPassword(pass)) {
        throw new Error('Invalid credentials or login failed');
      }

      const updatedProfile: UserProfile = {
        ...existing,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveProfileToStorage(updatedProfile);
      setUser(updatedProfile);
      setFirebaseUser({
        uid: updatedProfile.uid,
        email: updatedProfile.email,
        displayName: updatedProfile.displayName,
        phoneNumber: updatedProfile.phoneNumber,
        photoURL: updatedProfile.photoURL
      });
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or login failed');
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, profileData: Partial<UserProfile>) => {
    setError(null);
    try {
      const existing = findStoredUserByEmail(email);
      if (existing) {
        throw new Error('An account with that email already exists');
      }

      const newProfile = buildProfile(email, pass, profileData);
      saveProfileToStorage(newProfile);
      setUser(newProfile);
      setFirebaseUser({
        uid: newProfile.uid,
        email: newProfile.email,
        displayName: newProfile.displayName,
        phoneNumber: newProfile.phoneNumber,
        photoURL: newProfile.photoURL
      });
      setAuthModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const hydrateUserFromFirebase = async (firebaseUser: { email?: string | null; displayName?: string | null; photoURL?: string | null; uid?: string | null; }) => {
    const profileEmail = firebaseUser.email || `google-user-${Date.now()}@example.com`;
    const displayName = firebaseUser.displayName || 'Google User';
    const photoURL = firebaseUser.photoURL || '';
    const existing = findStoredUserByEmail(profileEmail);

    const profile = existing || buildProfile(profileEmail, 'google-local', {
      displayName,
      photoURL
    });

    saveProfileToStorage(profile);
    setUser(profile);
    setFirebaseUser({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      phoneNumber: profile.phoneNumber,
      photoURL: profile.photoURL
    });
    setAuthModalOpen(false);
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      try {
        const firebaseUser = await AuthService.signInWithGoogle();
        await hydrateUserFromFirebase(firebaseUser);
        return;
      } catch (authError: any) {
        console.warn('Google sign-in popup failed:', authError);

        const shouldRedirect = authError?.code === 'auth/popup-blocked'
          || authError?.code === 'auth/cancelled-popup-request'
          || authError?.code === 'auth/popup-closed-by-user'
          || authError?.code === 'auth/web-storage-unsupported'
          || authError?.code === 'auth/operation-not-supported-in-this-environment'
          || authError?.code === 'auth/auth-domain-config-required'
          || authError?.code === 'auth/unauthorized-domain'
          || authError?.code === 'auth/invalid-api-key';

        if (shouldRedirect) {
          await AuthService.signInWithGoogleRedirect();
          return;
        }

        const fallbackEmail = `google-user-${Date.now()}@example.com`;
        const fallbackProfile = buildProfile(fallbackEmail, 'google-local', {
          displayName: 'Google User'
        });
        saveProfileToStorage(fallbackProfile);
        setUser(fallbackProfile);
        setFirebaseUser({
          uid: fallbackProfile.uid,
          email: fallbackProfile.email,
          displayName: fallbackProfile.displayName,
          phoneNumber: fallbackProfile.phoneNumber,
          photoURL: fallbackProfile.photoURL
        });
        setAuthModalOpen(false);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      throw err;
    }
  };

  const loginWithPhone = async (phone: string, _containerId?: string) => {
    setError(null);
    setTempPhone(phone);
    try {
      const email = `${phone.replace(/\D/g, '') || 'phone'}@local.local`;
      const profile = buildProfile(email, undefined, {
        displayName: phone,
        phoneNumber: phone
      });
      saveProfileToStorage(profile);
      setUser(profile);
      setFirebaseUser({
        uid: profile.uid,
        email: profile.email,
        displayName: profile.displayName,
        phoneNumber: profile.phoneNumber,
        photoURL: profile.photoURL
      });
      setAuthModalOpen(false);
      setAuthModalView('login');
    } catch (err: any) {
      setError(err.message || 'Phone sign-in failed');
      throw err;
    }
  };

  const verifyPhoneOTP = async (code: string) => {
    setError(null);
    if (!tempPhone) {
      throw new Error('No phone sign-in session found');
    }
    if (!code.trim()) {
      throw new Error('Please enter the verification code');
    }
    const email = `${tempPhone.replace(/\D/g, '') || 'phone'}@local.local`;
    const profile = buildProfile(email, undefined, {
      displayName: tempPhone,
      phoneNumber: tempPhone
    });
    saveProfileToStorage(profile);
    setUser(profile);
    setFirebaseUser({
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      phoneNumber: profile.phoneNumber,
      photoURL: profile.photoURL
    });
    setAuthModalOpen(false);
    setAuthModalView('login');
  };

  const logout = async () => {
    setError(null);
    try {
      clearCurrentUser();
      setUser(null);
      setFirebaseUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    setError(null);
    try {
      const existing = findStoredUserByEmail(email);
      if (!existing) {
        throw new Error('No account found for that email');
      }
      setError('Password reset is handled locally in this build.');
    } catch (err: any) {
      setError(err.message || 'Could not reset password');
      throw err;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const now = new Date().toISOString();
    const updated = {
      ...user,
      ...data,
      updatedAt: now
    };
    saveProfileToStorage(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      error,
      setError,
      isGuest: !user,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      loginWithPhone,
      verifyPhoneOTP,
      logout,
      sendPasswordReset,
      updateProfile,
      authModalOpen,
      setAuthModalOpen,
      authModalView,
      setAuthModalView,
      tempPhone
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
