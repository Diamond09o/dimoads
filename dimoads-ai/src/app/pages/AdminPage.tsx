import React from 'react';

// Lazy load the full heavy AdminDashboard component
const AdminDashboard = React.lazy(() => import('../../features/admin/components/AdminDashboard'));

interface AdminPageProps {
  onResolveReport: (reportId: string, action: 'suspend' | 'dismiss') => void;
  language: 'en' | 'ar';
}

export default function AdminPage({ onResolveReport, language }: AdminPageProps) {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm mb-8 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <h3 className="mt-4 text-base font-bold text-gray-950">
          {language === 'ar' ? 'جاري تهيئة لوحة التحكم للمشرف...' : 'Initializing Operator Console...'}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {language === 'ar' ? 'تحميل الموارد والوحدات البرمجية الآمنة.' : 'Loading secure admin resources and modules.'}
        </p>
      </div>
    }>
      <AdminDashboard
        onResolveReport={onResolveReport}
        language={language}
      />
    </React.Suspense>
  );
}
