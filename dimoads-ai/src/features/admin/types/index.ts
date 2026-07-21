/**
 * Enterprise Admin Dashboard Type Definitions
 */

export type AdminRole = 
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'support_agent'
  | 'finance'
  | 'content_reviewer'
  | 'marketing_manager'
  | 'readonly_analyst';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  status: 'active' | 'suspended';
  lastActive: string;
}

export interface AdminCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId: string | null; // Supports unlimited nested categories
  icon: string;
  imageUrl: string;
  sortOrder: number;
  status: 'enabled' | 'disabled';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  role: AdminRole;
  action: 'login' | 'edit_listing' | 'delete_listing' | 'approve_listing' | 'reject_listing' | 'suspend_user' | 'activate_user' | 'role_change' | 'payment_action' | 'category_create' | 'category_update' | 'resolve_report' | 'settings_update';
  details: string;
  ipAddress: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  userId: string;
  userEmail: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string | null; // Admin userId
  internalNotes: string[];
  replies: SupportReply[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportReply {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'identity' | 'business' | 'broker' | 'company';
  documentUrls: string[];
  status: 'pending' | 'approved' | 'rejected' | 'more_info_requested';
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdvertisementCampaign {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  position: 'homepage_banner' | 'sidebar' | 'sponsored_listing';
  clicks: number;
  impressions: number;
  status: 'active' | 'paused' | 'expired';
  startDate: string;
  endDate: string;
}

export interface AdminPaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  type: 'premium_boost' | 'subscription_fee';
  status: 'succeeded' | 'refunded' | 'failed';
  invoiceUrl: string;
  createdAt: string;
}

export interface SystemSettings {
  general: {
    siteName: string;
    logoUrl: string;
    maintenanceMode: boolean;
    defaultLanguage: 'en' | 'ar';
    defaultCurrency: string;
  };
  supportedLanguages: string[];
  supportedCurrencies: string[];
  supportedCountries: string[];
  supportedCities: string[];
  featureFlags: {
    enableAiSearch: boolean;
    enableAiListingAssistant: boolean;
    enableAiPriceRecommend: boolean;
    enableFraudRadar: boolean;
    enableInstantModeration: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultMetaDescription: string;
    keywords: string[];
  };
}
