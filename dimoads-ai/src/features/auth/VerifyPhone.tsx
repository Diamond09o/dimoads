/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

interface VerifyPhoneProps {
  language: 'en' | 'ar';
}

export default function VerifyPhone({ language }: VerifyPhoneProps) {
  const { verifyPhoneOTP, setAuthModalView, tempPhone, error, setError } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;

    setLoading(false);
    setError(null);
    setLoading(true);
    try {
      await verifyPhoneOTP(code);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'ar' ? 'رمز التحقق غير صحيح أو منتهي الصلاحية' : 'Incorrect or expired verification code'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-gray-800">
      <div className="text-center flex flex-col items-center gap-1.5">
        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold tracking-tight">
          {language === 'ar' ? 'التحقق من رقم الهاتف' : 'Verify Phone Number'}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {language === 'ar' 
            ? `لقد أرسلنا رمز التحقق المكون من 6 أرقام إلى ${tempPhone}` 
            : `We sent a 6-digit verification code to ${tempPhone}`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5 mt-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'رمز التحقق (OTP)' : 'Verification Code'}
          </label>
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden font-mono text-center text-lg tracking-widest transition-all font-bold"
            required
            autoFocus
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl font-semibold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-98 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <span>{language === 'ar' ? 'تأكيد الرمز والتحقق' : 'Confirm & Verify Code'}</span>
          )}
        </button>
      </form>

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
    </div>
  );
}
