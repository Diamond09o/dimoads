/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth, AccountType } from './hooks/useAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AccountType[];
  fallback?: React.ReactNode;
}

/**
 * Access-control guard component protecting administrator or premium sections
 */
export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasRole = user && allowedRoles.includes(user.accountType);

  if (!hasRole) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-6 bg-red-50 border border-red-200 text-red-800 text-xs rounded-2xl flex flex-col items-center gap-1.5 text-center max-w-sm mx-auto">
        <span className="font-bold">Unauthorized Access</span>
        <p className="opacity-90">Your account type ({user?.accountType || 'guest'}) is not permitted to enter this specific administrative panel.</p>
      </div>
    );
  }

  return <>{children}</>;
}
