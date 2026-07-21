/**
 * Premium Admin Sidebar Navigation Panel with beautiful modern bento styling
 */
import React from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Layers, 
  ShieldAlert, 
  MessageSquare, 
  FileCheck, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  Shield, 
  Terminal,
  LogOut,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface AdminSidebarProps {
  currentRoute: string;
  onChangeRoute: (route: string) => void;
  onExitAdmin: () => void;
  language: 'en' | 'ar';
}

export default function AdminSidebar({ 
  currentRoute, 
  onChangeRoute, 
  onExitAdmin, 
  language 
}: AdminSidebarProps) {
  
  const navItems = [
    { id: '/admin/dashboard', label: language === 'ar' ? 'الرئيسية' : 'System Home', icon: BarChart3 },
    { id: '/admin/ai-assistant', label: language === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Copilot Advisor', icon: Sparkles },
    { id: '/admin/users', label: language === 'ar' ? 'المستخدمين' : 'User Ledger', icon: Users },
    { id: '/admin/listings', label: language === 'ar' ? 'الإعلانات' : 'Ads Registry', icon: FileText },
    { id: '/admin/categories', label: language === 'ar' ? 'التصنيفات' : 'Nested Categories', icon: Layers },
    { id: '/admin/reports', label: language === 'ar' ? 'البلاغات' : 'Fraud Reports', icon: ShieldAlert },
    { id: '/admin/support', label: language === 'ar' ? 'تذاكر الدعم' : 'Support Tickets', icon: MessageSquare },
    { id: '/admin/verification', label: language === 'ar' ? 'التوثيقات' : 'Verification Files', icon: FileCheck },
    { id: '/admin/payments', label: language === 'ar' ? 'المدفوعات والمستحقات' : 'Payments & Stripe', icon: CreditCard },
    { id: '/admin/analytics', label: language === 'ar' ? 'التحليلات والمؤشرات' : 'Analytics Growth', icon: TrendingUp },
    { id: '/admin/settings', label: language === 'ar' ? 'إعدادات النظام' : 'System Settings', icon: Settings },
    { id: '/admin/roles', label: language === 'ar' ? 'إدارة الصلاحيات' : 'RBAC Access', icon: Shield },
    { id: '/admin/logs', label: language === 'ar' ? 'سجل العمليات الأمني' : 'Security Logs', icon: Terminal }
  ];

  return (
    <aside id="admin_sidebar_navigation" className="w-64 bg-slate-950 text-slate-100 flex flex-col justify-between h-screen sticky top-0 border-r border-slate-900 shadow-xl flex-shrink-0">
      
      {/* Sidebar Header */}
      <div>
        <div className="p-5 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-blue-600/30">
              D
            </div>
            <div>
              <span className="block font-black tracking-tight text-white text-xs">DIMOADS AI</span>
              <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider">Enterprise Admin</span>
            </div>
          </div>

          <button 
            onClick={onExitAdmin}
            title="Exit Administrative Panel"
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeRoute(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Operator profile card at bottom */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 bg-indigo-600 text-white font-extrabold text-xs rounded-lg flex items-center justify-center">
              MA
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-white truncate">Moustafa Admin</span>
              <span className="block text-[9px] text-indigo-400 font-extrabold truncate uppercase tracking-wider">SUPER ADMIN</span>
            </div>
          </div>

          <button
            onClick={onExitAdmin}
            title="Log out of Secure session"
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </aside>
  );
}
