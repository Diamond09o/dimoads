/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth, AccountType } from './hooks/useAuth';
import GoogleLoginButton from './GoogleLoginButton';
import { Mail, Lock, User, ArrowLeft, Check } from 'lucide-react';

interface RegisterPageProps {
  language: 'en' | 'ar';
}

export default function RegisterPage({ language }: RegisterPageProps) {
  const { registerWithEmail, setAuthModalView, error, setError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerWithEmail(email, password, {
        displayName: name,
        accountType,
        verified: false,
        trustScore: 75,
        status: 'active'
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'ar' ? 'فشل إنشاء الحساب. يرجى محاولة بريد آخر.' : 'Registration failed. Try another email.'));
    } finally {
      setLoading(false);
    }
  };

  const accountTypes: { value: AccountType; labelEn: string; labelAr: string }[] = [
    { value: 'individual', labelEn: 'Individual (Buyer/Seller)', labelAr: 'حساب شخصي' },
    { value: 'business', labelEn: 'Business Store', labelAr: 'متجر تجاري' },
    { value: 'broker', labelEn: 'Classified Broker', labelAr: 'وسيط معتمد' },
    { value: 'company', labelEn: 'Developer/Company', labelAr: 'مؤسسة / شركة كبرى' }
  ];

  return (
    <div className="flex flex-col gap-4 text-gray-800">
      <div className="text-center">
        <h3 className="text-lg font-bold tracking-tight">
          {language === 'ar' ? 'إنشاء حساب جديد مجاناً' : 'Create Free Account'}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {language === 'ar' 
            ? 'انضم إلى آلاف المستخدمين والشركات الفاعلة معنا اليوم' 
            : 'Access professional classified templates, messaging and stats.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Name Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs transition-all font-semibold"
              required
            />
          </div>
        </div>

        {/* Email input */}
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

        {/* Password input */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'كلمة المرور' : 'Password (Min 6 Characters)'}
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs transition-all font-semibold"
              required
              minLength={6}
            />
          </div>
        </div>

        {/* Account Type dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'نوع النشاط الإعلاني' : 'Advertising Segment'}
          </label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value as AccountType)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs font-semibold text-gray-700 transition-all cursor-pointer"
          >
            {accountTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {language === 'ar' ? t.labelAr : t.labelEn}
              </option>
            ))}
          </select>
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
          <span>{loading ? '...' : (language === 'ar' ? 'تأكيد وإنشاء الحساب' : 'Create Free Profile') }</span>
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-gray-100"></div>
        <span className="flex-shrink mx-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          {language === 'ar' ? 'أو سجل باستخدام' : 'Or fast signup'}
        </span>
        <div className="flex-grow border-t border-gray-100"></div>
      </div>

      <GoogleLoginButton language={language} />

      {/* Back to Login footer */}
      <div className="text-center text-xs font-semibold text-gray-500 mt-2">
        <button
          onClick={() => { setError(null); setAuthModalView('login'); }}
          className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition-colors mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}</span>
        </button>
      </div>
    </div>
  );
}
