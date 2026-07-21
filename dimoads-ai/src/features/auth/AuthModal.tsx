/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPassword from './ForgotPassword';
import VerifyPhone from './VerifyPhone';
import ProfileSetup from './ProfileSetup';
import { X } from 'lucide-react';

interface AuthModalProps {
  language: 'en' | 'ar';
}

export default function AuthModal({ language }: AuthModalProps) {
  const { authModalOpen, setAuthModalOpen, authModalView } = useAuth();

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        id="auth_modal_card"
        className="bg-white border border-gray-100 rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl relative animate-scaleIn"
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Views mapping */}
        {authModalView === 'login' && <LoginPage language={language} />}
        {authModalView === 'register' && <RegisterPage language={language} />}
        {authModalView === 'forgot-password' && <ForgotPassword language={language} />}
        {authModalView === 'verify-phone' && <VerifyPhone language={language} />}
        {authModalView === 'profile-setup' && <ProfileSetup language={language} />}
      </div>
    </div>
  );
}
