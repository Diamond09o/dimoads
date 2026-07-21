/**
 * Enterprise Admin Service for managing platform entities and mock data
 */
import { 
  AdminCategory, 
  AuditLog, 
  SupportTicket, 
  VerificationRequest, 
  AdvertisementCampaign, 
  AdminPaymentTransaction, 
  SystemSettings,
  AdminRole,
  AdminUser
} from '../types';

const ADMIN_CATEGORIES_KEY = 'dimoads_admin_categories';
const ADMIN_LOGS_KEY = 'dimoads_admin_logs';
const ADMIN_TICKETS_KEY = 'dimoads_admin_tickets';
const ADMIN_VERIFICATIONS_KEY = 'dimoads_admin_verifications';
const ADMIN_CAMPAIGNS_KEY = 'dimoads_admin_campaigns';
const ADMIN_PAYMENTS_KEY = 'dimoads_admin_payments';
const ADMIN_SETTINGS_KEY = 'dimoads_admin_settings';
const ADMIN_USERS_KEY = 'dimoads_admin_users_rbac';

export const AdminService = {
  // --- Seed Data Helpers ---
  initializeAdminData() {
    // 1. Seed Categories
    if (!localStorage.getItem(ADMIN_CATEGORIES_KEY)) {
      const initialCategories: AdminCategory[] = [
        { id: '1', nameEn: 'Vehicles', nameAr: 'مركبات', slug: 'vehicles', parentId: null, icon: '🚗', imageUrl: '', sortOrder: 1, status: 'enabled' },
        { id: '1-1', nameEn: 'Cars', nameAr: 'سيارات', slug: 'cars', parentId: '1', icon: '🚙', imageUrl: '', sortOrder: 1, status: 'enabled' },
        { id: '1-2', nameEn: 'Motorcycles', nameAr: 'دراجات نارية', slug: 'motorcycles', parentId: '1', icon: '🏍️', imageUrl: '', sortOrder: 2, status: 'enabled' },
        { id: '2', nameEn: 'Real Estate', nameAr: 'عقارات', slug: 'real-estate', parentId: null, icon: '🏠', imageUrl: '', sortOrder: 2, status: 'enabled' },
        { id: '2-1', nameEn: 'Apartments', nameAr: 'شقق للبيع والإيجار', slug: 'apartments', parentId: '2', icon: '🏢', imageUrl: '', sortOrder: 1, status: 'enabled' },
        { id: '3', nameEn: 'Jobs', nameAr: 'وظائف', slug: 'jobs', parentId: null, icon: '💼', imageUrl: '', sortOrder: 3, status: 'enabled' },
        { id: '4', nameEn: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', parentId: null, icon: '📱', imageUrl: '', sortOrder: 4, status: 'enabled' }
      ];
      localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(initialCategories));
    }

    // 2. Seed Admin Users & RBAC
    if (!localStorage.getItem(ADMIN_USERS_KEY)) {
      const initialAdminUsers: AdminUser[] = [
        { id: 'user-admin-1', name: 'Moustafa Admin', email: 'mohdhussain79@gmail.com', role: 'super_admin', permissions: ['all'], status: 'active', lastActive: '2026-07-08T15:00:00Z' },
        { id: 'user-admin-2', name: 'Sarah Content', email: 'sarah.c@dimoads.com', role: 'content_reviewer', permissions: ['view_listings', 'edit_listings', 'delete_listings', 'moderate_content'], status: 'active', lastActive: '2026-07-08T14:30:00Z' },
        { id: 'user-admin-3', name: 'Khalid Finance', email: 'khalid.f@dimoads.com', role: 'finance', permissions: ['view_payments', 'refund_payments', 'view_analytics'], status: 'active', lastActive: '2026-07-08T13:10:00Z' },
        { id: 'user-admin-4', name: 'Ahmed Support', email: 'ahmed.s@dimoads.com', role: 'support_agent', permissions: ['view_tickets', 'reply_tickets'], status: 'active', lastActive: '2026-07-08T12:00:00Z' }
      ];
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(initialAdminUsers));
    }

    // 3. Seed Support Tickets
    if (!localStorage.getItem(ADMIN_TICKETS_KEY)) {
      const initialTickets: SupportTicket[] = [
        {
          id: 'ticket-1',
          subject: 'Payment failed for premium listing boost',
          message: 'I tried boosting my car listing but the payment failed even though the money was debited from my card.',
          userId: 'user-1',
          userEmail: 'user1@example.com',
          status: 'open',
          priority: 'high',
          assignedTo: 'user-admin-4',
          internalNotes: ['Verified with Stripe, transaction was pending.'],
          replies: [
            { id: 'r-1', senderId: 'user-1', senderName: 'User One', text: 'Please resolve this immediately.', isAdmin: false, createdAt: '2026-07-08T10:00:00Z' }
          ],
          createdAt: '2026-07-08T09:30:00Z',
          updatedAt: '2026-07-08T10:00:00Z'
        },
        {
          id: 'ticket-2',
          subject: 'Reported listing clarification',
          message: 'My apartment listing was reported, can you explain why?',
          userId: 'user-2',
          userEmail: 'user2@example.com',
          status: 'in_progress',
          priority: 'medium',
          assignedTo: null,
          internalNotes: [],
          replies: [],
          createdAt: '2026-07-08T11:00:00Z',
          updatedAt: '2026-07-08T11:00:00Z'
        }
      ];
      localStorage.setItem(ADMIN_TICKETS_KEY, JSON.stringify(initialTickets));
    }

    // 4. Seed Verifications
    if (!localStorage.getItem(ADMIN_VERIFICATIONS_KEY)) {
      const initialVerifications: VerificationRequest[] = [
        {
          id: 'v-1',
          userId: 'user-1',
          userEmail: 'user1@example.com',
          userName: 'Mohammed Hussain',
          type: 'broker',
          documentUrls: ['https://firebasestorage.googleapis.com/v0/b/dummy/o/id_card.png'],
          status: 'pending',
          comments: 'RERA Bahrain Broker ID uploaded.',
          createdAt: '2026-07-08T08:00:00Z',
          updatedAt: '2026-07-08T08:00:00Z'
        },
        {
          id: 'v-2',
          userId: 'user-2',
          userEmail: 'user2@example.com',
          userName: 'Nasser Realestate Co.',
          type: 'company',
          documentUrls: ['https://firebasestorage.googleapis.com/v0/b/dummy/o/cr.pdf'],
          status: 'approved',
          comments: 'Commercial registration verified.',
          createdAt: '2026-07-07T10:00:00Z',
          updatedAt: '2026-07-07T15:00:00Z'
        }
      ];
      localStorage.setItem(ADMIN_VERIFICATIONS_KEY, JSON.stringify(initialVerifications));
    }

    // 5. Seed Campaigns
    if (!localStorage.getItem(ADMIN_CAMPAIGNS_KEY)) {
      const initialCampaigns: AdvertisementCampaign[] = [
        {
          id: 'c-1',
          title: 'Bahrain Harbour Premium Residencies',
          imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
          targetUrl: 'https://harbour-residencies.com',
          position: 'homepage_banner',
          clicks: 1420,
          impressions: 48900,
          status: 'active',
          startDate: '2026-07-01T00:00:00Z',
          endDate: '2026-08-01T00:00:00Z'
        },
        {
          id: 'c-2',
          title: 'Toyota Almoayyed Summer Deals',
          imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
          targetUrl: 'https://toyotabahrain.com',
          position: 'sponsored_listing',
          clicks: 840,
          impressions: 32000,
          status: 'active',
          startDate: '2026-07-05T00:00:00Z',
          endDate: '2026-07-25T00:00:00Z'
        }
      ];
      localStorage.setItem(ADMIN_CAMPAIGNS_KEY, JSON.stringify(initialCampaigns));
    }

    // 6. Seed Payment Transactions
    if (!localStorage.getItem(ADMIN_PAYMENTS_KEY)) {
      const initialPayments: AdminPaymentTransaction[] = [
        { id: 'tx-1', userId: 'user-1', userEmail: 'user1@example.com', amount: 10, currency: 'USD', type: 'premium_boost', status: 'succeeded', invoiceUrl: '#', createdAt: '2026-07-08T09:00:00Z' },
        { id: 'tx-2', userId: 'user-2', userEmail: 'user2@example.com', amount: 49, currency: 'USD', type: 'subscription_fee', status: 'succeeded', invoiceUrl: '#', createdAt: '2026-07-08T07:15:00Z' },
        { id: 'tx-3', userId: 'user-3', userEmail: 'user3@example.com', amount: 10, currency: 'USD', type: 'premium_boost', status: 'succeeded', invoiceUrl: '#', createdAt: '2026-07-07T18:45:00Z' },
        { id: 'tx-4', userId: 'user-4', userEmail: 'user4@example.com', amount: 10, currency: 'USD', type: 'premium_boost', status: 'refunded', invoiceUrl: '#', createdAt: '2026-07-07T11:20:00Z' }
      ];
      localStorage.setItem(ADMIN_PAYMENTS_KEY, JSON.stringify(initialPayments));
    }

    // 7. Seed Settings
    if (!localStorage.getItem(ADMIN_SETTINGS_KEY)) {
      const initialSettings: SystemSettings = {
        general: {
          siteName: 'Dimoads AI Global Market',
          logoUrl: '',
          maintenanceMode: false,
          defaultLanguage: 'en',
          defaultCurrency: 'BHD'
        },
        supportedLanguages: ['en', 'ar', 'fr', 'hi', 'ur', 'zh'],
        supportedCurrencies: ['BHD', 'SAR', 'AED', 'KWD', 'QAR', 'USD', 'EUR'],
        supportedCountries: ['Bahrain', 'Saudi Arabia', 'United Arab Emirates', 'Kuwait', 'Oman', 'Qatar', 'Egypt'],
        supportedCities: ['Manama', 'Riffa', 'Muharraq', 'Riyadh', 'Jeddah', 'Dubai', 'Abu Dhabi'],
        featureFlags: {
          enableAiSearch: true,
          enableAiListingAssistant: true,
          enableAiPriceRecommend: true,
          enableFraudRadar: true,
          enableInstantModeration: true
        },
        seo: {
          defaultTitle: 'Dimoads AI - Middle East Intelligent Classifieds Market',
          defaultMetaDescription: 'The first AI-optimised enterprise classifieds network in the GCC region.',
          keywords: ['classifieds', 'bahrain estate', 'vehicles', 'jobs Manama', 'AI marketplace']
        }
      };
      localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(initialSettings));
    }

    // 8. Seed Audit Logs
    if (!localStorage.getItem(ADMIN_LOGS_KEY)) {
      const initialLogs: AuditLog[] = [
        { id: 'log-1', timestamp: '2026-07-08T15:20:00Z', userId: 'user-admin-1', userEmail: 'mohdhussain79@gmail.com', role: 'super_admin', action: 'login', details: 'Successful administrative portal sign in', ipAddress: '192.168.1.5' },
        { id: 'log-2', timestamp: '2026-07-08T14:15:00Z', userId: 'user-admin-2', userEmail: 'sarah.c@dimoads.com', role: 'content_reviewer', action: 'resolve_report', details: 'Suspended suspicious iPhone listing #list-3', ipAddress: '192.168.1.12' },
        { id: 'log-3', timestamp: '2026-07-08T11:45:00Z', userId: 'user-admin-1', userEmail: 'mohdhussain79@gmail.com', role: 'super_admin', action: 'role_change', details: 'Promoted ahmed.s@dimoads.com to support_agent', ipAddress: '192.168.1.5' }
      ];
      localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(initialLogs));
    }
  },

  // --- Core CRUD API Layer ---
  
  // 1. Categories
  getCategories(): AdminCategory[] {
    this.initializeAdminData();
    return JSON.parse(localStorage.getItem(ADMIN_CATEGORIES_KEY) || '[]');
  },
  saveCategories(categories: AdminCategory[]): void {
    localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(categories));
  },
  addCategory(cat: Omit<AdminCategory, 'id'>): AdminCategory {
    const list = this.getCategories();
    const newCat = { ...cat, id: `cat-${Date.now()}` };
    list.push(newCat);
    this.saveCategories(list);
    this.logAction('category_create', `Created new category: ${cat.nameEn} (${cat.slug})`);
    return newCat;
  },
  updateCategory(updated: AdminCategory): void {
    const list = this.getCategories();
    const idx = list.findIndex(c => c.id === updated.id);
    if (idx !== -1) {
      list[idx] = updated;
      this.saveCategories(list);
      this.logAction('category_update', `Updated category: ${updated.nameEn}`);
    }
  },

  // 2. Audit Logs
  getAuditLogs(): AuditLog[] {
    this.initializeAdminData();
    return JSON.parse(localStorage.getItem(ADMIN_LOGS_KEY) || '[]');
  },
  logAction(action: AuditLog['action'], details: string): void {
    const list = JSON.parse(localStorage.getItem(ADMIN_LOGS_KEY) || '[]');
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'user-admin-1',
      userEmail: 'mohdhussain79@gmail.com',
      role: 'super_admin',
      action,
      details,
      ipAddress: '127.0.0.1'
    };
    list.unshift(newLog);
    localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(list));
  },

  // 3. Support Tickets
  getTickets(): SupportTicket[] {
    this.initializeAdminData();
    return JSON.parse(localStorage.getItem(ADMIN_TICKETS_KEY) || '[]');
  },
  updateTicket(ticket: SupportTicket): void {
    const list = this.getTickets();
    const idx = list.findIndex(t => t.id === ticket.id);
    if (idx !== -1) {
      list[idx] = ticket;
      localStorage.setItem(ADMIN_TICKETS_KEY, JSON.stringify(list));
    }
  },
  addTicketReply(ticketId: string, text: string, senderId: string, senderName: string, isAdmin: boolean): void {
    const list = this.getTickets();
    const ticket = list.find(t => t.id === ticketId);
    if (ticket) {
      ticket.replies.push({
        id: `reply-${Date.now()}`,
        senderId,
        senderName,
        text,
        isAdmin,
        createdAt: new Date().toISOString()
      });
      ticket.updatedAt = new Date().toISOString();
      this.updateTicket(ticket);
    }
  },

  // 4. Verification Center
  getVerifications(): VerificationRequest[] {
    this.initializeAdminData();
    return JSON.parse(localStorage.getItem(ADMIN_VERIFICATIONS_KEY) || '[]');
  },
  updateVerification(request: VerificationRequest): void {
    const list = this.getVerifications();
    const idx = list.findIndex(v => v.id === request.id);
    if (idx !== -1) {
      list[idx] = request;
      localStorage.setItem(ADMIN_VERIFICATIONS_KEY, JSON.stringify(list));
      this.logAction('settings_update', `Updated verification request for ${request.userName} to status ${request.status}`);
    }
  },

  // 5. Advertisement Management
  getCampaigns(): AdvertisementCampaign[] {
    this.initializeAdminData();
    return JSON.parse(localStorage.getItem(ADMIN_CAMPAIGNS_KEY) || '[]');
  },
  saveCampaigns(campaigns: AdvertisementCampaign[]): void {
    localStorage.setItem(ADMIN_CAMPAIGNS_KEY, JSON.stringify(campaigns));
  },
  addCampaign(campaign: Omit<AdvertisementCampaign, 'id' | 'clicks' | 'impressions'>): AdvertisementCampaign {
    const list = this.getCampaigns();
    const newCamp = { ...campaign, id: `camp-${Date.now()}`, clicks: 0, impressions: 0 };
    list.push(newCamp);
    this.saveCampaigns(list);
    this.logAction('settings_update', `Created advertising campaign: ${campaign.title}`);
    return newCamp;
  },
  updateCampaign(campaign: AdvertisementCampaign): void {
    const list = this.getCampaigns();
    const idx = list.findIndex(c => c.id === campaign.id);
    if (idx !== -1) {
      list[idx] = campaign;
      this.saveCampaigns(list);
    }
  },

  // 6. Payments
  getPayments(): AdminPaymentTransaction[] {
    this.initializeAdminData();
    return JSON.parse(localStorage.getItem(ADMIN_PAYMENTS_KEY) || '[]');
  },
  refundPayment(txId: string): void {
    const list = this.getPayments();
    const tx = list.find(t => t.id === txId);
    if (tx) {
      tx.status = 'refunded';
      localStorage.setItem(ADMIN_PAYMENTS_KEY, JSON.stringify(list));
      this.logAction('payment_action', `Refunded transaction ${txId} of amount $${tx.amount}`);
    }
  },

  // 7. System Settings
  getSettings(): SystemSettings {
    this.initializeAdminData();
    return JSON.parse(localStorage.getItem(ADMIN_SETTINGS_KEY) || '{}');
  },
  updateSettings(settings: SystemSettings): void {
    localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
    this.logAction('settings_update', 'Modified system-wide feature flags & currency settings');
  },

  // 8. RBAC Admin Users
  getAdminUsers(): AdminUser[] {
    this.initializeAdminData();
    return JSON.parse(localStorage.getItem(ADMIN_USERS_KEY) || '[]');
  },
  updateAdminUserRole(userId: string, role: AdminRole, permissions: string[]): void {
    const list = this.getAdminUsers();
    const user = list.find(u => u.id === userId);
    if (user) {
      user.role = role;
      user.permissions = permissions;
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(list));
      this.logAction('role_change', `Role of user ${user.name} changed to ${role}`);
    }
  }
};
