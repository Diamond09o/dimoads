/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Authentication Service Wrapper
 */
export const AuthService = {
  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  /**
   * Log in with email and password
   */
  async loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return cred.user;
  },

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    return cred.user;
  },

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    await signOut(auth);
  },

  /**
   * Sign in using Google OAuth Popup
   */
  async signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  },

  async signInWithGoogleRedirect(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  },

  async getGoogleRedirectResult(): Promise<FirebaseUser | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        return result.user;
      }
      return null;
    } catch (error) {
      console.warn('Google redirect result processing failed:', error);
      return null;
    }
  },

  /**
   * Initialize ReCaptcha for Phone Authentication
   */
  initializeRecaptcha(containerId: string): RecaptchaVerifier {
    return new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  },

  /**
   * Sign in using Phone Number verification code
   */
  async signInWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  }
};
