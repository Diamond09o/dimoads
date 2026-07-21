/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { KeyRound, ArrowLeft, Send, Check } from 'lucide-react';

interface ForgotPasswordProps {
  language: 'en' | 'ar';
}

export default function ForgotPassword({ language }: ForgotPasswordProps) {
  const { sendPasswordReset, setAuthModalView, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'ar' ? 'فشل إرسال رابط استعادة كلمة المرور' : 'Failed to send password reset link'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-gray-800">
      <div className="text-center flex flex-col items-center gap-1.5">
        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2 shadow-xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold tracking-tight">
          {language === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password'}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {language === 'ar' 
            ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور' 
            : 'Enter your email and we will send you a password reset link'}
        </p>
      </div>

      {success ? (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex flex-col items-center gap-2 text-center">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">
            {language === 'ar' 
              ? 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح. يرجى مراجعة بريدك الإلكتروني.' 
              : 'Password reset link sent successfully! Please check your email inbox.'}
          </span>
          <button
            onClick={() => setAuthModalView('login')}
            className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
          >
            {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs transition-all font-semibold"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span>...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}</span>
              </>
            )}
          </button>
        </form>
      )}

      {!success && (
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mt-2">
          <button
            onClick={() => {
              setError(null);
              setAuthModalView('login');
            }}
            className="flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'الرجوع للخلف' : 'Back to Login'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
