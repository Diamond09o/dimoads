/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';

interface GoogleLoginButtonProps {
  language: 'en' | 'ar';
}

export default function GoogleLoginButton({ language }: GoogleLoginButtonProps) {
  const { loginWithGoogle, setError } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-98 text-xs disabled:opacity-50"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 0, 0)">
          <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.43c0,-0.66 -0.06,-1.29 -0.17,-1.87z" fill="#4285F4" />
          <path d="M12,20.4c2.54,0 4.67,-0.84 6.22,-2.3l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -3.3,0.98c-2.43,0 -4.5,-1.64 -5.23,-3.85H2.97v2.66c1.55,3.08 4.73,5.08 8.43,5.08z" fill="#34A853" />
          <path d="M6.77,12.66c-0.19,-0.57 -0.3,-1.18 -0.3,-1.8s0.11,-1.23 0.3,-1.8V6.4H2.97c-0.63,1.26 -0.97,2.68 -0.97,4.16s0.34,2.9 0.97,4.16l3.8,-2.66z" fill="#FBBC05" />
          <path d="M12,6.12c1.38,0 2.62,0.47 3.59,1.4l2.69,-2.69C16.65,3.33 14.53,2.4 12,2.4C8.3,2.4 5.12,4.4 3.57,7.48l3.8,2.66c0.73,-2.21 2.8,-3.85 5.23,-3.85z" fill="#EA4335" />
        </g>
      </svg>
      <span>
        {loading
          ? (language === 'ar' ? 'جاري الاتصال...' : 'Connecting...')
          : (language === 'ar' ? 'متابعة باستخدام Google' : 'Continue with Google')}
      </span>
    </button>
  );
}
