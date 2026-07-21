/**
 * Report Management Subsystem View
 */
import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle, 
  UserX, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  Trash2,
  ListFilter
} from 'lucide-react';
import { Report, Listing, User as UserType } from '../../../types';
import { AdminService } from '../services/adminService';

interface ReportManagementProps {
  reports: Report[];
  listings: Listing[];
  users: Record<string, UserType>;
  onResolveReport: (reportId: string, action: 'suspend' | 'dismiss') => void;
  onUpdateUsers: (updatedUsers: Record<string, UserType>) => void;
  language: 'en' | 'ar';
}

export default function ReportManagement({ 
  reports, 
  listings, 
  users, 
  onResolveReport, 
  onUpdateUsers, 
  language 
}: ReportManagementProps) {
  
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');

  const getReporterName = (uid: string) => users[uid]?.name || 'Anonymous Platform User';
  const getListingTitle = (id: string) => listings.find(l => l.id === id)?.title || 'Purged Ad Listing';
  const getListingOwnerId = (id: string) => listings.find(l => l.id === id)?.ownerId || '';
  const getListingOwnerName = (id: string) => {
    const ownerId = getListingOwnerId(id);
    return users[ownerId]?.name || 'Unknown Seller';
  };

  const handleBanUser = (listingId: string) => {
    const ownerId = getListingOwnerId(listingId);
    if (!ownerId) return;

    if (window.confirm(`Are you sure you want to permanently suspend/ban the seller "${getListingOwnerName(listingId)}"?`)) {
      const updated = { ...users };
      if (updated[ownerId]) {
        updated[ownerId].trustScore = 0;
        updated[ownerId].verificationStatus = 'unverified';
        onUpdateUsers(updated);
        AdminService.logAction('suspend_user', `Permanently banned seller ${updated[ownerId].name} following fraud audits.`);
        alert('Seller account has been locked and trust score set to 0%');
      }
    }
  };

  const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

  return (
    <div id="admin_reports_manager" className="space-y-6">
      
      {/* Filters HUD */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex justify-between items-center">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-950 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>Fraud Flag Arbitration Queue</span>
        </h3>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-2xl text-xs">
          <ListFilter className="w-3.5 h-3.5 text-gray-400" />
          <select 
            value={filter} 
            onChange={(e: any) => setFilter(e.target.value)}
            className="bg-transparent border-none font-bold text-gray-600 focus:outline-none"
          >
            <option value="pending">Pending Review</option>
            <option value="resolved">Resolved / Suspended</option>
            <option value="dismissed">Dismissed / Verified Safe</option>
            <option value="all">All Reports Archive</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((rep) => (
          <div 
            key={rep.id} 
            className={`p-5 rounded-3xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all ${
              rep.status === 'pending' 
                ? 'bg-red-50/40 border-red-100/70 shadow-xs' 
                : 'bg-white border-gray-100'
            }`}
          >
            
            {/* Report information */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase ${
                  rep.status === 'pending' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {rep.status}
                </span>
                <span className="text-[10px] text-gray-400 font-mono font-semibold">Report ID: {rep.id}</span>
              </div>

              <div>
                <h4 className="text-sm font-extrabold text-gray-950">
                  Flagged: <span className="text-blue-600">"{getListingTitle(rep.listingId)}"</span>
                </h4>
                <p className="text-xs text-gray-500 italic mt-1 leading-relaxed">
                  Reason filed: "{rep.reason}"
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-[10px] text-gray-400 font-bold pt-1">
                <div>Reporter: <span className="text-gray-600">{getReporterName(rep.reporterId)}</span></div>
                <div>Offending Seller: <span className="text-red-700">{getListingOwnerName(rep.listingId)}</span></div>
                <div>Created: {new Date(rep.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Verification actions */}
            {rep.status === 'pending' && (
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={() => onResolveReport(rep.id, 'dismiss')}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Dismiss Report</span>
                </button>

                <button
                  onClick={() => onResolveReport(rep.id, 'suspend')}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Suspend Listing</span>
                </button>

                <button
                  onClick={() => handleBanUser(rep.listingId)}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-gray-950 hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserX className="w-4 h-4" />
                  <span>Ban Seller</span>
                </button>
              </div>
            )}

          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-400">
            Excellent! No pending fraud report files currently awaiting arbitration.
          </div>
        )}
      </div>

    </div>
  );
}
