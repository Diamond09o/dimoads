/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Route/UI Guard. If user is guest, automatically prompts login.
 */
export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading, setAuthModalOpen, setAuthModalView } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      setAuthModalView('login');
      setAuthModalOpen(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-6 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs rounded-2xl flex flex-col items-center gap-1.5 text-center max-w-sm mx-auto">
        <span className="font-bold">Login Required</span>
        <p className="opacity-90">Please authenticate to gain authorization to this classified section.</p>
        <button
          onClick={() => { setAuthModalView('login'); setAuthModalOpen(true); }}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
