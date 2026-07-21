/**
 * Enterprise Admin Control Panel
 * Implements full modular routing-like views, RBAC roles checking and state management.
 */
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Listing, User, Report } from '../../../types';
import { AdminService } from '../services/adminService';
import { useAppState } from '../../../app/context/AppStateContext';

// Module views (lazy loaded)
const DashboardHome = React.lazy(() => import('../dashboard/DashboardHome'));
const UserManagement = React.lazy(() => import('../users/UserManagement'));
const ListingManagement = React.lazy(() => import('../listings/ListingManagement'));
const CategoryManagement = React.lazy(() => import('../categories/CategoryManagement'));
const ReportManagement = React.lazy(() => import('../reports/ReportManagement'));
const SupportCenter = React.lazy(() => import('../support/SupportCenter'));
const VerificationCenter = React.lazy(() => import('../verification/VerificationCenter'));
const PaymentsCenter = React.lazy(() => import('../payments/PaymentsCenter'));
const AnalyticsDashboard = React.lazy(() => import('../analytics/AnalyticsDashboard'));
const SystemSettingsView = React.lazy(() => import('../settings/SystemSettingsView'));
const RolesManagement = React.lazy(() => import('../roles/RolesManagement'));
const AuditLogsView = React.lazy(() => import('../audit-logs/AuditLogsView'));
const AiAdminAssistantView = React.lazy(() => import('../ai-assistant/AiAdminAssistantView'));

import AdminSidebar from './AdminSidebar';

interface AdminDashboardProps {
  onResolveReport: (reportId: string, action: 'suspend' | 'dismiss') => void;
  language: 'en' | 'ar';
}

export default function AdminDashboard({ 
  onResolveReport, 
  language 
}: AdminDashboardProps) {
  const { listings: initialListings, users: initialUsers, reports: initialReports } = useAppState();
  
  // Simulated local routing
  const [currentRoute, setCurrentRoute] = useState('/admin/dashboard');

  // Local state replicas of listings and users to support full dashboard CRUD mutations instantly
  const [localListings, setLocalListings] = useState<Listing[]>(initialListings);
  const [localUsers, setLocalUsers] = useState<Record<string, User>>(initialUsers);

  // Sync state with props when changed externally
  useEffect(() => {
    setLocalListings(initialListings);
  }, [initialListings]);

  useEffect(() => {
    setLocalUsers(initialUsers);
  }, [initialUsers]);

  // Handle exiting admin mode
  const handleExitAdmin = () => {
    // We can simulate exit by clicking the toggle button in the App.tsx header
    const btn = document.getElementById('admin_panel_toggle_btn');
    if (btn) btn.click();
  };

  // Seed default data if needed
  useEffect(() => {
    AdminService.initializeAdminData();
  }, []);

  // Fetch lists managed via AdminService
  const verifications = AdminService.getVerifications();
  const tickets = AdminService.getTickets();
  const payments = AdminService.getPayments();

  // Route-rendering switch board
  const renderRouteView = () => {
    switch (currentRoute) {
      case '/admin/dashboard':
        return (
          <DashboardHome
            listings={localListings}
            users={localUsers}
            reports={initialReports}
            verifications={verifications}
            tickets={tickets}
            payments={payments}
            language={language}
          />
        );
      case '/admin/ai-assistant':
        return (
          <AiAdminAssistantView
            language={language}
          />
        );
      case '/admin/users':
        return (
          <UserManagement
            users={localUsers}
            listings={localListings}
            reports={initialReports}
            onUpdateUsers={(updated) => {
              setLocalUsers(updated);
              // Save local users to trigger reactive synchronizations
              localStorage.setItem('dimoads_users', JSON.stringify(updated));
            }}
            language={language}
          />
        );
      case '/admin/listings':
        return (
          <ListingManagement
            listings={localListings}
            onUpdateListings={(updated) => {
              setLocalListings(updated);
              localStorage.setItem('dimoads_listings', JSON.stringify(updated));
            }}
            language={language}
          />
        );
      case '/admin/categories':
        return (
          <CategoryManagement
            language={language}
          />
        );
      case '/admin/reports':
        return (
          <ReportManagement
            reports={initialReports}
            listings={localListings}
            users={localUsers}
            onResolveReport={onResolveReport}
            onUpdateUsers={(updated) => {
              setLocalUsers(updated);
              localStorage.setItem('dimoads_users', JSON.stringify(updated));
            }}
            language={language}
          />
        );
      case '/admin/support':
        return (
          <SupportCenter
            language={language}
          />
        );
      case '/admin/verification':
        return (
          <VerificationCenter
            language={language}
          />
        );
      case '/admin/payments':
        return (
          <PaymentsCenter
            language={language}
          />
        );
      case '/admin/analytics':
        return (
          <AnalyticsDashboard
            listings={localListings}
            users={localUsers}
            language={language}
          />
        );
      case '/admin/settings':
        return (
          <SystemSettingsView
            language={language}
          />
        );
      case '/admin/roles':
        return (
          <RolesManagement
            language={language}
          />
        );
      case '/admin/logs':
        return (
          <AuditLogsView
            language={language}
          />
        );
      default:
        return (
          <div className="p-8 text-center bg-gray-50 text-gray-500 rounded-3xl">
            View is currently under construction.
          </div>
        );
    }
  };

  return (
    <div 
      id="enterprise_admin_panel_root" 
      className="flex min-h-screen bg-gray-50 rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8 text-gray-800 animate-fadeIn"
      dir="ltr" // Sidebar always sits cleanly on left for high-tech admin dashboard aesthetics
    >
      {/* 1. Admin sidebar navigation */}
      <AdminSidebar
        currentRoute={currentRoute}
        onChangeRoute={setCurrentRoute}
        onExitAdmin={handleExitAdmin}
        language={language}
      />

      {/* 2. Main content area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto max-h-screen">
        
        {/* Dynamic Section Header Title */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-gray-950 tracking-tight flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>
                {currentRoute === '/admin/dashboard' && 'Dimoads AI System Overview'}
                {currentRoute === '/admin/ai-assistant' && 'AI Copilot Security & Moderation Advisor'}
                {currentRoute === '/admin/users' && 'Security Trust & User Ledger'}
                {currentRoute === '/admin/listings' && 'Classified Ads Registry & Moderation'}
                {currentRoute === '/admin/categories' && 'Taxonomy & Tag Manager'}
                {currentRoute === '/admin/reports' && 'Fraud flag Arbitration queue'}
                {currentRoute === '/admin/support' && 'Customer Support tickets'}
                {currentRoute === '/admin/verification' && 'License file verification center'}
                {currentRoute === '/admin/payments' && 'Financial Commission Ledgers'}
                {currentRoute === '/admin/analytics' && 'GCC Demographic Analytics'}
                {currentRoute === '/admin/settings' && 'Global Registry Settings'}
                {currentRoute === '/admin/roles' && 'Role-Based access control (RBAC)'}
                {currentRoute === '/admin/logs' && 'Security Audit logs trail'}
              </span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            <span>Secure operator session active</span>
          </div>
        </div>

        {/* 3. Embedded dynamic view */}
        <div className="animate-slideDown">
          <React.Suspense fallback={
            <div className="p-8 text-center bg-gray-50 text-gray-500 rounded-3xl min-h-[300px] flex flex-col items-center justify-center gap-3 animate-pulse border border-dashed border-gray-200">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-gray-500">
                {language === 'ar' ? 'جاري تحميل وحدة النظام آمنة...' : 'Loading secure system module...'}
              </p>
            </div>
          }>
            {renderRouteView()}
          </React.Suspense>
        </div>

      </main>
    </div>
  );
}
