/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Shield, Phone, Sparkles, User, UserCheck, Briefcase, RefreshCw } from 'lucide-react';
import { User as UserType } from '../../../types';
import { calculateTrustScore } from '../../../firebase/firebase';
import { useAuth } from '../../auth/hooks/useAuth';

interface ProfileModalProps {
  user: UserType;
  onClose: () => void;
  onUpdateUser: (updated: UserType) => void;
  language: 'en' | 'ar';
}

export default function ProfileModal({ user, onClose, onUpdateUser, language }: ProfileModalProps) {
  const { logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [accountType, setAccountType] = useState<'personal' | 'business'>(user.accountType);
  const [isVerifying, setIsVerifying] = useState(false);

  const trustScore = calculateTrustScore({
    ...user,
    name,
    phone,
    accountType
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      phone,
      accountType,
      trustScore
    });
  };

  const handleVerifyPhone = () => {
    setIsVerifying(true);
    // Mock OTP Verification loop
    setTimeout(() => {
      onUpdateUser({
        ...user,
        name,
        phone,
        accountType,
        verificationStatus: 'verified',
        trustScore: calculateTrustScore({
          ...user,
          verificationStatus: 'verified',
          name,
          phone,
          accountType
        })
      });
      setIsVerifying(false);
    }, 1500);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div id="profile_modal_overlay" className="fixed inset-0 bg-black/55 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div id="profile_modal_content" className="bg-white rounded-3xl w-full max-w-md shadow-xl overflow-hidden animate-scaleIn">
        
        {/* Header */}
        <div className={`p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900 font-sans">
              {language === 'ar' ? 'ملف المستخدم والتوثيق' : 'User Verification & Profile'}
            </h2>
          </div>
          <button
            id="close_profile_modal"
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Trust Score circular graphics */}
          <div className="bg-gradient-to-r from-gray-900 to-blue-950 text-white rounded-2xl p-5 flex items-center gap-4 border border-blue-900">
            <div className="relative w-16 h-16 flex-shrink-0 bg-white/10 rounded-full flex items-center justify-center border border-white/25">
              <span className="text-xl font-bold font-mono text-yellow-300">{trustScore}%</span>
            </div>
            <div className={`flex-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <h4 className="text-xs uppercase tracking-wider text-blue-200 font-bold mb-1">
                {language === 'ar' ? 'مؤشر ثقة المستخدم' : 'Identity Trust Score'}
              </h4>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {language === 'ar' 
                  ? 'يتم حساب مؤشر الثقة ديناميكياً بناءً على اكتمال الملف وتوثيق رقم الهاتف والترخيص التجاري.'
                  : 'Computed dynamically based on profile completeness, phone verification, and commercial registry credentials.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            {/* Account Type Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'نوع الحساب' : 'Account Category'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('personal')}
                  className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    accountType === 'personal' 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{language === 'ar' ? 'شخصي' : 'Personal'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('business')}
                  className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    accountType === 'business' 
                      ? 'bg-blue-50 border-blue-200 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تجاري / شركة' : 'Business'}</span>
                </button>
              </div>
            </div>

            {/* Display Name */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'اسم المستخدم / الشركة' : 'Display Name / Business Name'}
              </label>
              <input
                id="profile_name_input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full border border-gray-200 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Telephone verification */}
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-bold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'رقم الهاتف الموثق' : 'Verified Phone Number'}
              </label>
              <div className="flex gap-2">
                <input
                  id="profile_phone_input"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`flex-1 border border-gray-200 rounded-xl ${language === 'ar' ? 'text-right' : 'text-left'} px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {user.verificationStatus === 'verified' ? (
                  <span className="px-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-xl flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-green-600 fill-green-100" />
                    <span>{language === 'ar' ? 'موثق' : 'Verified'}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={isVerifying || !phone.trim()}
                    className="px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isVerifying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Phone className="w-3.5 h-3.5" />
                    )}
                    <span>{language === 'ar' ? 'توثيق الهاتف' : 'Verify'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Verification explanation metrics */}
            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 flex flex-col gap-1 text-left">
              <span className="font-bold text-gray-700 mb-1">{language === 'ar' ? 'كيفية زيادة ثقتك:' : 'Trust indicators list:'}</span>
              <span className="flex items-center gap-1">✅ {language === 'ar' ? 'توثيق رقم الهاتف الهاتف (+5 درجات)' : 'Verified Mobile Contact Details (+5 pts)'}</span>
              <span className="flex items-center gap-1">✅ {language === 'ar' ? 'توثيق الهوية الرسمي (+30 درجة)' : 'Verified Identity Credentials (+30 pts)'}</span>
              <span className="flex items-center gap-1">✅ {language === 'ar' ? 'وضع الحساب التجاري للشركات (+10 درجات)' : 'Business Commercial License Mode (+10 pts)'}</span>
            </div>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {language === 'ar' ? 'إغلاق' : 'Close'}
                </button>
                <button
                  id="save_profile_btn"
                  type="submit"
                  className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl active:scale-95 cursor-pointer"
                >
                  {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </button>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100/70 text-red-700 text-xs font-bold rounded-xl border border-red-100 cursor-pointer transition-colors"
              >
                {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out / Logout'}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
