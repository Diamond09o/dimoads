/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { useAuth, AccountType } from './hooks/useAuth';
import { Check, ShieldAlert } from 'lucide-react';
import { COUNTRY_OPTIONS } from '../../global/languages/countries';

interface ProfileSetupProps {
  language: 'en' | 'ar';
}

export default function ProfileSetup({ language }: ProfileSetupProps) {
  const { user, updateProfile, setAuthModalOpen } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [accountType, setAccountType] = useState<AccountType>(user?.accountType || 'individual');
  const [city, setCity] = useState(user?.city || 'Cairo');
  const [country, setCountry] = useState(user?.country || 'EG');
  const [loading, setLoading] = useState(false);

  const countryOptions = useMemo(() => COUNTRY_OPTIONS, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        displayName,
        accountType,
        city,
        country,
        updatedAt: new Date().toISOString()
      });
      setAuthModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const accountTypes: { value: AccountType; labelEn: string; labelAr: string; descEn: string; descAr: string }[] = [
    { 
      value: 'individual', 
      labelEn: 'Individual', 
      labelAr: 'شخصي', 
      descEn: 'Buy and sell personal products', 
      descAr: 'بيع وشراء المنتجات والأغراض الشخصية' 
    },
    { 
      value: 'business', 
      labelEn: 'Business', 
      labelAr: 'تجاري', 
      descEn: 'Professional commercial classified postings', 
      descAr: 'حساب مخصص للأنشطة والشركات الصغيرة' 
    },
    { 
      value: 'broker', 
      labelEn: 'Broker', 
      labelAr: 'وسيط عقاري / تجاري', 
      descEn: 'Advertise on behalf of third-parties', 
      descAr: 'الإعلان والتسويق بالنيابة عن أطراف أخرى' 
    },
    { 
      value: 'company', 
      labelEn: 'Company', 
      labelAr: 'شركة كبرى', 
      descEn: 'Corporate account with high advertisement quotas', 
      descAr: 'حساب مخصص للمؤسسات والشركات الكبرى' 
    }
  ];

  return (
    <div className="flex flex-col gap-4 text-gray-800">
      <div className="text-center flex flex-col items-center gap-1.5">
        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2 shadow-xs">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold tracking-tight">
          {language === 'ar' ? 'إعداد ملفك الشخصي' : 'Complete Profile Setup'}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {language === 'ar' 
            ? 'يرجى مواءمة حسابك لبدء استخدام المنصة بثقة كاملة' 
            : 'Please complete your classified identity setup before publishing.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs transition-all font-semibold"
            required
          />
        </div>

        {/* Location selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {language === 'ar' ? 'البلد' : 'Country'}
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs font-semibold"
              required
            >
              {countryOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.flag ? `${option.flag} ` : ''}{language === 'ar' ? option.labelAr : option.labelEn}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {language === 'ar' ? 'المدينة' : 'City'}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-blue-500 rounded-xl outline-hidden text-xs font-semibold"
              required
            />
          </div>
        </div>

        {/* Account Types */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {language === 'ar' ? 'نوع الحساب الاستثماري' : 'Classified Account Type'}
          </label>
          <div className="flex flex-col gap-2">
            {accountTypes.map((type) => {
              const isSelected = accountType === type.value;
              return (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => setAccountType(type.value)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-white border-gray-100 hover:border-gray-200 text-gray-700'
                  }`}
                >
                  <div className={`flex flex-col gap-0.5 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <span className="text-xs font-bold">
                      {language === 'ar' ? type.labelAr : type.labelEn}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {language === 'ar' ? type.descAr : type.descEn}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !displayName}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span>...</span>
          ) : (
            <span>{language === 'ar' ? 'حفظ وإكمال الإعداد' : 'Save & Complete Onboarding'}</span>
          )}
        </button>
      </form>
    </div>
  );
}
