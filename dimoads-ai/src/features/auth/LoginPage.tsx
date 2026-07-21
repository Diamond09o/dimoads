/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import GoogleLoginButton from './GoogleLoginButton';
import { Mail, Lock, Phone, Key, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  language: 'en' | 'ar';
}

export default function LoginPage({ language }: LoginPageProps) {
  const { loginWithEmail, loginWithPhone, setAuthModalView, error, setError } = useAuth();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone state
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.' : 'Failed to log in. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError(null);
    try {
      // Trigger Recaptcha verification on hidden container
      await loginWithPhone(phone, 'recaptcha-invisible-container');
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'ar' ? 'فشل إرسال رمز التحقق' : 'Failed to initiate OTP code verification'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-gray-800">
      {/* Title block */}
      <div className="text-center">
        <h3 className="text-lg font-bold tracking-tight">
          {language === 'ar' ? 'تسجيل الدخول للمنصة' : 'Sign In to Marketplace'}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {language === 'ar' 
            ? 'تواصل مع البائعين، انشر الإعلانات وتصفح بشكل آمن' 
            : 'Access secure messaging, listing publishing and trust tracking.'}
        </p>
      </div>

      {/* Tab toggle buttons */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => { setAuthMethod('email'); setError(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            authMethod === 'email' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
        </button>
        <button
          onClick={() => { setAuthMethod('phone'); setError(null); }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            authMethod === 'phone' ? 'bg-white shadow-xs text-gray-900' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {language === 'ar' ? 'رقم الهاتف (الأساسي)' : 'Phone (Primary)'}
        </button>
      </div>

      {/* Forms rendering */}
      {authMethod === 'email' ? (
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-3.5">
          {/* Email field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <button
                type="button"
                onClick={() => setAuthModalView('forgot-password')}
                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot?'}</span>
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs transition-all font-semibold"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-98 disabled:opacity-50 mt-1"
          >
            <span>{loading ? '...' : (language === 'ar' ? 'دخول الحساب' : 'Login') }</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handlePhoneLogin} className="flex flex-col gap-3.5">
          {/* Phone field */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {language === 'ar' ? 'رقم الجوال الدولي' : 'International Phone Number'}
            </label>
            <div className="relative flex items-center">
              <Phone className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 234 5678"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs transition-all font-semibold"
                required
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">
              {language === 'ar' ? 'يرجى كتابة رقم الجوال مع رمز البلد (مثال: 201002345678+)' : 'Use international code prefix (e.g. +201002345678)'}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-98 disabled:opacity-50 mt-1"
          >
            <span>{loading ? '...' : (language === 'ar' ? 'إرسال الرمز (OTP)' : 'Send Verification OTP') }</span>
          </button>

          {/* Hidden Recaptcha Anchor */}
          <div id="recaptcha-invisible-container" className="hidden"></div>
        </form>
      )}

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-100"></div>
        <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          {language === 'ar' ? 'أو عبر تسجيل دخول سريع' : 'Or fast connects'}
        </span>
        <div className="flex-grow border-t border-gray-100"></div>
      </div>

      {/* Google Login trigger */}
      <GoogleLoginButton language={language} />

      {/* Footer link */}
      <div className="text-center text-xs text-gray-400 font-semibold mt-2">
        <span>{language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"} </span>
        <button
          onClick={() => { setError(null); setAuthModalView('register'); }}
          className="text-blue-600 hover:underline font-bold"
        >
          {language === 'ar' ? 'سجل معنا مجاناً الآن' : 'Create Free Account'}
        </button>
      </div>
    </div>
  );
}
