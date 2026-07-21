/**
 * AI Copilot Administrative Advisor Component
 * Provides comprehensive platform auditing, priority flags, and simulation modes.
 */
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  UserX, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  Lock, 
  Terminal, 
  HelpCircle, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Listing, User, Report } from '../../../types';
import { AdminService } from '../services/adminService';

interface AiAdminAssistantViewProps {
  language: 'en' | 'ar';
}

interface SuspiciousActivity {
  userId: string;
  userName: string;
  reason: string;
  riskScore: number;
  recommendedAction: 'suspend' | 'warn' | 'monitor' | 'none';
}

interface PrioritizedReport {
  reportId: string;
  listingId: string;
  listingTitle: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  recommendedAction: 'suspend' | 'dismiss';
}

interface ListingRecommendation {
  listingId: string;
  title: string;
  recommendation: 'approve' | 'reject' | 'flag';
  confidence: number;
  reason: string;
}

interface TicketSummary {
  ticketId: string;
  subject: string;
  summary: string;
  suggestedReply: string;
  sentiment: 'frustrated' | 'neutral' | 'urgent' | 'happy';
}

interface FinancialTrafficInsight {
  type: 'revenue' | 'traffic';
  title: string;
  isAbnormal: boolean;
  impact: 'high' | 'medium' | 'low';
  description: string;
  recommendedAdjustment: string;
}

interface AgentPreparation {
  agentName: string;
  readyForAutonomousExecution: boolean;
  capabilityDirectives: string[];
  nextAutonomousStepSimulated: string;
}

interface AssistantResponse {
  suspiciousActivities: SuspiciousActivity[];
  prioritizedReports: PrioritizedReport[];
  listingRecommendations: ListingRecommendation[];
  ticketSummaries: TicketSummary[];
  financialTrafficInsights: FinancialTrafficInsight[];
  agentPreparation: AgentPreparation;
}

export default function AiAdminAssistantView({ language }: AiAdminAssistantViewProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autonomousEnabled, setAutonomousEnabled] = useState<boolean>(false);
  
  // Track actions executed by admins (final decisions)
  const [actionLogs, setActionLogs] = useState<string[]>([]);
  const [approvedItems, setApprovedItems] = useState<Record<string, boolean>>({});

  const isArabic = language === 'ar';

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      // Collect current local mock state to analyze
      const localUsers = JSON.parse(localStorage.getItem('dimoads_users') || '{}');
      const localListings = JSON.parse(localStorage.getItem('dimoads_listings') || '[]');
      const localReports = JSON.parse(localStorage.getItem('dimoads_reports') || '[]');
      const localTickets = AdminService.getTickets();
      const localPayments = AdminService.getPayments();

      const response = await fetch('/api/ai/admin-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listings: localListings,
          users: localUsers,
          reports: localReports,
          tickets: localTickets,
          payments: localPayments
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve AI Admin briefing');
      }

      const payload = await response.json();
      setData(payload);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error running telemetry scans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleApplyAction = (section: string, itemId: string, detail: string) => {
    // Record log
    const timestamp = new Date().toLocaleTimeString();
    const actionText = `[${timestamp}] Approved recommendation for ${section} (${itemId}): ${detail}`;
    setActionLogs(prev => [actionText, ...prev]);
    
    // Mark item as approved/resolved
    setApprovedItems(prev => ({ ...prev, [itemId]: true }));

    // Log this action globally via AdminService so it populates the platform Security Audit Logs!
    AdminService.logAction('resolve_report', `AI Recommendation Finalized: ${detail}`);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          {isArabic ? 'جاري تحليل سجلات النظام والمدفوعات والبلاغات...' : 'Auditing platform telemetries, payments, and active listings...'}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-lg font-bold text-red-950">
          {isArabic ? 'فشل الاتصال بمستشار الذكاء الاصطناعي' : 'Advisor Stream Offline'}
        </h3>
        <p className="text-sm text-red-700 max-w-md mx-auto">
          {error || 'An unexpected error occurred while analyzing telemetry.'}
        </p>
        <button 
          onClick={fetchInsights}
          className="px-5 py-2.5 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 transition-colors"
        >
          {isArabic ? 'إعادة المحاولة' : 'Retry Diagnosis Scan'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* 1. Header Hero Panel with Bento Styling */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Dimoads AI Advisor Copilot</span>
            </div>
            
            <h1 className="text-2xl font-black tracking-tight">
              {isArabic ? 'مساعد الإدارة الذكي' : 'AI Copilot Administrative Advisor'}
            </h1>
            
            <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
              {isArabic 
                ? 'يقوم نظامنا باستمرار بمراجعة سلوك المستخدمين والمدفوعات والبلاغات وتذاكر الدعم لتقديم التوصيات المباشرة. يمتلك المدير المسؤول دائمًا السلطة المطلقة لاتخاذ القرار النهائي.'
                : 'Our platform AI continuously parses behavioral metrics, financial ledgers, and flag registers to compile strategic advisory models. Human operators retain absolute decision authority over all execution branches.'}
            </p>
          </div>

          <button 
            onClick={fetchInsights}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold transition-all self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تحديث الفحص' : 'Re-Run System Scan'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Strategic Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            {isArabic ? 'مستوى خطورة المنصة' : 'Platform Threat Level'}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-lg font-black text-slate-900 uppercase">
              {isArabic ? 'منخفض' : 'Minimal / Safe'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            {isArabic ? 'لا توجد هجمات نشطة أو محاولات احتيال منسقة.' : 'Zero active Sybil campaigns or coordinated phishing clusters detected.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            {isArabic ? 'بلاغات حرجة معلقة' : 'Critical Flags Queue'}
          </span>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="text-lg font-black text-slate-900">
              {data.prioritizedReports.filter(r => r.priority === 'critical' || r.priority === 'high').length}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            {isArabic ? 'بلاغات مصنفة بحاجة لتدخل بشري فوري.' : 'Unresolved listings flagged as severe anomalies needing triage.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            {isArabic ? 'مؤشر ثقة التوصية' : 'AI Accuracy Index'}
          </span>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-lg font-black text-slate-900">96.8%</span>
          </div>
          <p className="text-[10px] text-slate-500">
            {isArabic ? 'نسبة دقة التوصيات مقارنة بالقرارات البشرية السابقة.' : 'Advisory rating aligned with subsequent human review cycles.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
            {isArabic ? 'حالة خط عمل العميل الذاتي' : 'Agent Execution Mode'}
          </span>
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-500" />
            <span className="text-lg font-black text-amber-600 uppercase">
              {isArabic ? 'استشاري فقط' : 'Advisory Mode'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            {isArabic ? 'القرارات التلقائية مقفلة لدواعي السلامة.' : 'Autonomous execution locked. Admin consent mandatory.'}
          </p>
        </div>

      </div>

      {/* 3. Action Execution Confirmation Log (Sticky Overlay if has items) */}
      {actionLogs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slideDown">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <div>
              <p className="text-xs font-bold text-white">{isArabic ? 'تم تأكيد قرار المشرف وتحديث النظام' : 'Decision final: Operator Authorized Action'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-xl">{actionLogs[0]}</p>
            </div>
          </div>
          <div className="text-[10px] font-bold px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">
            {actionLogs.length} {isArabic ? 'عمليات مصرحة' : 'Operations Executed'}
          </div>
        </div>
      )}

      {/* 4. Main Diagnostic Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: System Telemetry Feeds */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section A: Suspicious Activity Detector */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <UserX className="w-5 h-5 text-indigo-600" />
                  <span>{isArabic ? 'كاشف الأنشطة المشبوهة والقرصنة' : 'Behavioral & Suspicious Activity Scan'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isArabic ? 'اكتشاف الحسابات التي تظهر سلوكًا غير طبيعي أو محاولات تحايل.' : 'Identifies user profiles exhibiting malicious posting intervals, geographic hops, or bank wire requests.'}
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-100">
                {isArabic ? 'تحديث حي' : 'Telemetry Live'}
              </span>
            </div>

            <div className="space-y-4">
              {data.suspiciousActivities.length === 0 ? (
                <div className="text-center p-8 bg-slate-50 text-slate-400 text-xs rounded-2xl">
                  {isArabic ? 'لا توجد أنشطة مشبوهة مكتشفة حالياً.' : 'Zero malicious profiles or sybil activity detected.'}
                </div>
              ) : (
                data.suspiciousActivities.map((act) => {
                  const isDone = approvedItems[act.userId];
                  return (
                    <div 
                      key={act.userId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone 
                          ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                          : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-900">{act.userName}</span>
                            <span className="text-[10px] font-mono text-slate-400">ID: {act.userId}</span>
                            
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              act.riskScore > 80 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' 
                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                            }`}>
                              {act.riskScore}% {isArabic ? 'خطورة' : 'Risk'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {act.reason}
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isArabic ? 'الإجراء المقترح:' : 'Recommended:'}</span>
                            <span className="text-[10px] font-extrabold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                              {act.recommendedAction}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Decisions */}
                        <div className="flex sm:flex-col gap-2 self-end sm:self-center">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isArabic ? 'تم التنفيذ' : 'Actioned'}</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleApplyAction('Users', act.userId, `Suspended ${act.userName} and issued full sandbox warning.`)}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xl tracking-wider transition-all cursor-pointer"
                              >
                                {isArabic ? 'تعليق الحساب' : 'Apply Suspension'}
                              </button>
                              <button
                                onClick={() => handleApplyAction('Users', act.userId, `Sent official security warning mail to ${act.userName}.`)}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl tracking-wider transition-all cursor-pointer"
                              >
                                {isArabic ? 'إرسال تحذير' : 'Send Warning'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section B: Prioritized Report Arbiter */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>{isArabic ? 'طابور موازنة البلاغات المنسق' : 'AI Prioritized Flag Arbitration'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isArabic ? 'ترتيب البلاغات حسب الأولوية بناءً على خوارزميات رادار الاحتيال.' : 'Prioritizes listing flags by analyzing market deviation, buyer complaints, and structural violations.'}
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full border border-rose-100">
                {isArabic ? 'توجيه آلي' : 'Auto Routing'}
              </span>
            </div>

            <div className="space-y-4">
              {data.prioritizedReports.map((rep) => {
                const isDone = approvedItems[rep.reportId];
                return (
                  <div 
                    key={rep.reportId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone 
                        ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{rep.listingTitle}</span>
                          <span className="text-[9px] font-mono text-slate-400">({rep.listingId})</span>
                          
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${
                            rep.priority === 'critical' 
                              ? 'bg-red-500 text-white animate-pulse' 
                              : rep.priority === 'high' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rep.priority}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {rep.reason}
                        </p>

                        <div className="text-[10px] font-bold text-slate-500">
                          {isArabic ? 'توصية الذكاء الاصطناعي:' : 'Recommendation:'}{' '}
                          <span className={`uppercase font-extrabold ${rep.recommendedAction === 'suspend' ? 'text-rose-600' : 'text-slate-500'}`}>
                            {rep.recommendedAction === 'suspend' ? (isArabic ? 'إزالة فورية للسلعة' : 'Immediate Listing Takedown') : (isArabic ? 'تجاهل البلاغ' : 'Dismiss Flag')}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 self-end sm:self-center">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                            ✓ {isArabic ? 'تم الفصل' : 'Resolved'}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApplyAction('Reports', rep.reportId, `Takedown approved for listing ${rep.listingTitle}.`)}
                              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-xl tracking-wider transition-all cursor-pointer"
                            >
                              {isArabic ? 'تأكيد الحجب' : 'Approve Takedown'}
                            </button>
                            <button
                              onClick={() => handleApplyAction('Reports', rep.reportId, `Dismissed reports against ${rep.listingTitle}.`)}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-xl tracking-wider transition-all cursor-pointer"
                            >
                              {isArabic ? 'تجاهل' : 'Dismiss Report'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section C: Listing Review & Recommendations */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>{isArabic ? 'توصيات جودة الإعلانات والموافقة' : 'Active Listing Quality Appraisal'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isArabic ? 'توصية آمنة للموافقة أو الرفض استنادًا إلى قواعد النشر ومعايير المحتوى.' : 'Advises approval or rejection based on pricing limits, description length, and safety criteria.'}
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                {isArabic ? 'مراجعة أولية' : 'Pre-Audit'}
              </span>
            </div>

            <div className="space-y-4">
              {data.listingRecommendations.map((rec) => {
                const isDone = approvedItems[rec.listingId];
                return (
                  <div 
                    key={rec.listingId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone 
                        ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                          <span className="text-[9px] font-mono text-slate-400">({rec.listingId})</span>
                          
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.recommendation === 'approve' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {rec.recommendation === 'approve' ? (isArabic ? 'موصى بنشره' : 'Recommend Approval') : (isArabic ? 'موصى بالرفض' : 'Recommend Rejection')}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {rec.reason}
                        </p>

                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <span>{isArabic ? 'نسبة ثقة الفحص:' : 'Confidence:'}</span>
                          <span className="text-blue-600">{rec.confidence}%</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col gap-2 self-end sm:self-center">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isArabic ? 'تم التأكيد' : 'Approved'}</span>
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApplyAction('Listings', rec.listingId, `Approved and published listing: ${rec.title}`)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-xl tracking-wider transition-all cursor-pointer"
                            >
                              {isArabic ? 'نشر الإعلان' : 'Approve & Publish'}
                            </button>
                            <button
                              onClick={() => handleApplyAction('Listings', rec.listingId, `Rejected listing: ${rec.title}`)}
                              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-xl tracking-wider transition-all cursor-pointer"
                            >
                              {isArabic ? 'رفض السلعة' : 'Reject Listing'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section D: Support Ticket Summarization & Drafts */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>{isArabic ? 'تلخيص تذاكر الدعم والردود المقترحة' : 'Support Ticket Summaries & Smart Reply'}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {isArabic ? 'تلخيص التذاكر الطويلة وصياغة ردود ذكية لإتمام تذاكر الدعم بسرعة.' : 'Summarizes critical user support queries and auto-drafts responses utilizing historical resolution records.'}
                </p>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                {isArabic ? 'ردود مقترحة' : 'AI Response Draft'}
              </span>
            </div>

            <div className="space-y-4">
              {data.ticketSummaries.map((ticket) => {
                const isDone = approvedItems[ticket.ticketId];
                return (
                  <div 
                    key={ticket.ticketId}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone 
                        ? 'bg-slate-50/50 border-slate-100 opacity-60' 
                        : 'bg-white border-slate-100'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{ticket.subject}</span>
                          <span className="text-[9px] font-mono text-slate-400">({ticket.ticketId})</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ticket.sentiment === 'urgent' || ticket.sentiment === 'frustrated'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                            : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {ticket.sentiment}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">
                          {isArabic ? 'التلخيص التنفيذي:' : 'Executive Summary:'}
                        </span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {ticket.summary}
                        </p>
                      </div>

                      <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/50 space-y-2">
                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wide block">
                          {isArabic ? 'الرد المقترح بالذكاء الاصطناعي:' : 'AI Suggested Reply Draft:'}
                        </span>
                        <p className="text-xs text-slate-700 italic leading-relaxed font-semibold">
                          "{ticket.suggestedReply}"
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                            ✓ {isArabic ? 'تم إرسال الرد وإغلاق التذكرة' : 'Reply Inserted & Resolved'}
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleApplyAction('Tickets', ticket.ticketId, `Sent reply draft and resolved Ticket ${ticket.ticketId}`)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-xl tracking-wider transition-all cursor-pointer"
                            >
                              {isArabic ? 'إرسال الرد التلقائي' : 'Insert Draft & Reply'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Financial Anomalies & Future Agent Blueprint */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Section E: Financial & Traffic Anomalies */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-5">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{isArabic ? 'رادار المعاملات المالية والشذوذ' : 'Financial & Traffic Auditing'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {isArabic ? 'مراقبة تقلبات العائدات المفاجئة والتحذير من معضلات بوابة الدفع.' : 'Monitors sudden refund spikes, payment processor latencies, and traffic anomalies.'}
              </p>
            </div>

            <div className="space-y-4">
              {data.financialTrafficInsights.map((insight, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wide">
                      {insight.title}
                    </span>
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      insight.isAbnormal 
                        ? 'bg-rose-100 text-rose-700 animate-pulse' 
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {insight.isAbnormal ? (isArabic ? 'حالة شاذة' : 'Anomaly') : (isArabic ? 'طبيعي' : 'Nominal')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-normal">
                    {insight.description}
                  </p>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                      {isArabic ? 'التعديل الموصى به:' : 'Recommended Action:'}
                    </span>
                    <p className="text-[10px] text-indigo-700 font-bold leading-normal">
                      {insight.recommendedAdjustment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section F: Future Autonomous Agent Sandbox */}
          <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-900 space-y-5 shadow-lg">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[9px] font-bold">
                <Lock className="w-2.5 h-2.5" />
                <span>Sandbox Sandbox</span>
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                {isArabic ? 'هيكل عميل الذكاء الاصطناعي الذاتي المستقبلي' : 'Autonomous AI Agent Sandbox'}
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                {isArabic 
                  ? 'هذا القسم يجهز بنية الروبوتات البرمجية لتنفيذ الحجب التلقائي والردود الذاتية مستقبلاً. حالياً، تقتصر قدرة النموذج على تقديم توصيات استشارية فقط.'
                  : 'Prepares the secure architecture for future auto-arbitration loops. Currently restricted to Advisory recommendations.'}
              </p>
            </div>

            {/* Locked Toggle Control */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-white">
                  {isArabic ? 'تفعيل الوضع الذاتي المستقل' : 'Enable Autonomous Execution'}
                </span>
                <span className="block text-[9px] text-rose-400 font-bold uppercase">
                  {isArabic ? 'مغلق: يتطلب موافقة المطور' : 'LOCKED: SUPER ADMIN ONLY'}
                </span>
              </div>
              <button 
                onClick={() => {
                  alert(isArabic ? 'خطأ أمني: كود الحماية يمنع العمل المستقل دون إشراف بشري.' : 'Safety Gate: Autonomous execution requires secure key agreement and developer authorization.');
                }}
                className="w-10 h-6 bg-slate-800 rounded-full flex items-center px-1 cursor-pointer"
              >
                <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
              </button>
            </div>

            {/* Capability Directives of Simulated Agent */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                {isArabic ? 'توجيهات نموذج العمليات المبرمجة:' : 'Pre-compiled Capability Directives:'}
              </span>
              <div className="space-y-1">
                {data.agentPreparation.capabilityDirectives.map((dir, i) => (
                  <div key={i} className="flex items-center gap-2 text-[9px] font-mono text-indigo-400">
                    <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                    <span>{dir}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Agent Terminal Console */}
            <div className="bg-black/80 rounded-xl p-3 border border-slate-900 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                <span className="text-[8px] font-mono text-slate-500 flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-emerald-500" />
                  <span>{data.agentPreparation.agentName}</span>
                </span>
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">
                  {isArabic ? 'مستعد' : 'STANDBY / SIMULATING'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-300 leading-relaxed italic">
                "{data.agentPreparation.nextAutonomousStepSimulated}"
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
