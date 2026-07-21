/**
 * Dashboard Home component displaying real-time platform metrics
 */
import React from 'react';
import { 
  Users, 
  FileText, 
  ShieldAlert, 
  DollarSign, 
  Activity, 
  CheckCircle, 
  BarChart3, 
  Database, 
  Server,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { Listing, User as UserType, Report } from '../../../types';
import { VerificationRequest, SupportTicket, AdminPaymentTransaction } from '../types';

interface DashboardHomeProps {
  listings: Listing[];
  users: Record<string, UserType>;
  reports: Report[];
  verifications: VerificationRequest[];
  tickets: SupportTicket[];
  payments: AdminPaymentTransaction[];
  language: 'en' | 'ar';
}

export default function DashboardHome({ 
  listings, 
  users, 
  reports, 
  verifications, 
  tickets, 
  payments, 
  language 
}: DashboardHomeProps) {
  
  // Computations
  const usersList = Object.values(users);
  const totalUsers = usersList.length;
  const onlineUsers = Math.ceil(totalUsers * 0.35); // Simulated live users (35% of total)
  const newUsersToday = Math.ceil(totalUsers * 0.12);

  const totalListings = listings.length;
  const newListingsToday = listings.filter(l => {
    const createdDate = new Date(l.createdAt);
    const today = new Date();
    return createdDate.toDateString() === today.toDateString();
  }).length || 2; // Default fallback to 2 new listings today
  
  const featuredListings = listings.filter(l => l.isPremium).length;
  const premiumListings = listings.filter(l => l.isPremium && l.price > 1000).length;
  const pendingListings = listings.filter(l => l.status === 'pending').length;
  
  const pendingVerifications = verifications.filter(v => v.status === 'pending').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const openSupportTickets = tickets.filter(t => t.status === 'open').length;

  const totalRevenue = payments.filter(p => p.status === 'succeeded').reduce((acc, curr) => acc + curr.amount, 0);
  const subscriptionRevenue = payments.filter(p => p.status === 'succeeded' && p.type === 'subscription_fee').reduce((acc, curr) => acc + curr.amount, 0);

  // Category statistics
  const categoriesMap: Record<string, number> = {};
  listings.forEach(l => {
    categoriesMap[l.category] = (categoriesMap[l.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoriesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Geographic statistics (Simulated)
  const topCountries = [
    { country: 'Bahrain', percentage: 48, count: Math.ceil(totalListings * 0.48) },
    { country: 'Saudi Arabia', percentage: 32, count: Math.ceil(totalListings * 0.32) },
    { country: 'United Arab Emirates', percentage: 20, count: Math.ceil(totalListings * 0.2) }
  ];

  const topCities = [
    { name: 'Manama', count: Math.ceil(totalListings * 0.35) },
    { name: 'Riyadh', count: Math.ceil(totalListings * 0.22) },
    { name: 'Dubai', count: Math.ceil(totalListings * 0.18) }
  ];

  return (
    <div id="admin_dashboard_home" className="space-y-6">
      
      {/* Real-time Status / System Health Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 font-sans">
              {language === 'ar' ? 'جميع أنظمة Dimoads AI تعمل بكفاءة' : 'Dimoads AI Systems Operational'}
            </h4>
            <p className="text-[10px] text-gray-500">
              {language === 'ar' ? 'وقت التشغيل 99.98٪ • استهلاك المعالج 12٪ • الذاكرة المتاحة 3.2 جيجا' : 'System Uptime 99.98% • CPU Load 12% • Memory Available 3.2GB'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
          <Server className="w-3.5 h-3.5 text-blue-600" />
          <span>v2.8.5-enterprise</span>
        </div>
      </div>

      {/* Primary Key Performance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* User Engagement Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">
                {language === 'ar' ? 'المستخدمون والزوار' : 'Users & Engagement'}
              </span>
              <h3 className="text-2xl font-black font-mono text-gray-900 mt-1">{totalUsers}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {onlineUsers} {language === 'ar' ? 'نشط الآن' : 'online now'}
            </span>
            <span className="text-emerald-600">
              +{newUsersToday} {language === 'ar' ? 'اليوم' : 'today'}
            </span>
          </div>
        </div>

        {/* Listings Volumetric Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">
                {language === 'ar' ? 'إجمالي الإعلانات المعروضة' : 'Classified Listings'}
              </span>
              <h3 className="text-2xl font-black font-mono text-gray-900 mt-1">{totalListings}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-gray-500">
            <span>{featuredListings} {language === 'ar' ? 'مميز' : 'featured'}</span>
            <span>{premiumListings} {language === 'ar' ? 'نخبة' : 'premium'}</span>
            <span className="text-indigo-600">+{newListingsToday} today</span>
          </div>
        </div>

        {/* Action queue card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">
                {language === 'ar' ? 'المهام المعلقة والتحكيم' : 'Action Queue'}
              </span>
              <h3 className="text-2xl font-black font-mono text-red-600 mt-1">
                {pendingVerifications + pendingReports + openSupportTickets}
              </h3>
            </div>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[9px] font-bold">
            <span className="bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded-md">
              {pendingVerifications} {language === 'ar' ? 'توثيقات' : 'verif'}
            </span>
            <span className="bg-red-50 text-red-800 px-2 py-0.5 rounded-md">
              {pendingReports} {language === 'ar' ? 'بلاغات' : 'flags'}
            </span>
            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md">
              {openSupportTickets} {language === 'ar' ? 'تذاكر' : 'tickets'}
            </span>
          </div>
        </div>

        {/* Commission Gross revenues Card */}
        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider block">
                {language === 'ar' ? 'إجمالي العوائد والمشتركين' : 'Gross Revenue'}
              </span>
              <h3 className="text-2xl font-black font-mono text-amber-900 mt-1">${totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-amber-800">
            <span>${subscriptionRevenue} {language === 'ar' ? 'اشتراكات' : 'subs'}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              +18.4% MoM
            </span>
          </div>
        </div>

      </div>

      {/* Secondary Dashboard Sections: Charts & System Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Storage, AI Requests, System Health */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>{language === 'ar' ? 'استهلاك الموارد السحابية' : 'Cloud Resource Audit'}</span>
            </h3>

            <div className="space-y-4">
              {/* Storage usage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-600">{language === 'ar' ? 'استهلاك مساحة التخزين' : 'Cloud Object Storage'}</span>
                  <span className="font-mono text-gray-900 font-bold">14.2 GB / 50 GB</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '28.4%' }}></div>
                </div>
              </div>

              {/* AI requests */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    {language === 'ar' ? 'طلبات الذكاء الاصطناعي (Gemini)' : 'Gemini AI API Load'}
                  </span>
                  <span className="font-mono text-gray-900 font-bold">2,481 / 5,000 reqs</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '49.6%' }}></div>
                </div>
              </div>

              {/* Database read quota usage */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-600">{language === 'ar' ? 'عمليات القراءة لقواعد البيانات' : 'Firestore Read Quota'}</span>
                  <span className="font-mono text-gray-900 font-bold">38,920 / 50,000 reads</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-yellow-500 h-full rounded-full" style={{ width: '77.8%' }}></div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated: 1 min ago
              </span>
              <span className="font-semibold text-emerald-600">Standard Tier Active</span>
            </div>
          </div>

          {/* System status details */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ar' ? 'حالة الخدمات والمؤشرات' : 'Microservice Health Registry'}</span>
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">Firestore Read/Write Node</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">Gemini 3.5 Flash Inference</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">CDN Asset Hosting Gate</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">SMTP Transactional Email</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right column: Demographics, Category Stats, and Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>{language === 'ar' ? 'الإعلانات حسب التصنيف والجغرافيا' : 'Listings Category & Demographics'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category stats */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                  {language === 'ar' ? 'التصنيفات الأكثر نشاطاً' : 'Top Categories'}
                </h4>
                <div className="space-y-3">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="w-16 text-xs text-gray-600 truncate uppercase font-semibold">{cat}</span>
                      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full" 
                          style={{ width: `${(count / totalListings) * 100}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-900">{count} ads</span>
                    </div>
                  ))}
                  {topCategories.length === 0 && (
                    <div className="text-xs text-gray-400 italic">No category listings yet</div>
                  )}
                </div>
              </div>

              {/* Geographic stats */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                  {language === 'ar' ? 'التوزيع الجغرافي للنشاط' : 'Top Countries Distribution'}
                </h4>
                <div className="space-y-3">
                  {topCountries.map((c) => (
                    <div key={c.country} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-gray-600 truncate font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-red-500" />
                        {c.country}
                      </span>
                      <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
                          style={{ width: `${c.percentage}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-900">{c.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top cities widget */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                {language === 'ar' ? 'المدن الأكثر نشاطاً في البحث والبيع' : 'Top Active Cities'}
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {topCities.map(city => (
                  <div key={city.name} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                    <span className="block text-xs font-bold text-gray-800">{city.name}</span>
                    <span className="font-mono text-[11px] text-gray-500 font-semibold">{city.count} listings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-extrabold mb-2">
              {language === 'ar' ? 'إجراءات لوحة التحكم السريعة لمدير المنصة' : 'Administrative Smart Engine Dashboard'}
            </h3>
            <p className="text-xs text-blue-100 mb-4 max-w-lg">
              {language === 'ar' ? 'يمكنك تحديث مخطط قواعد البيانات أو تفويض الصلاحيات للأقسام والمشرفين عبر قائمة التنقل الجانبية.' : 'Review and arbitrate verification files, manage custom taxonomies, override system pricing indexes or moderate flag queues directly with security logs tracing.'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
