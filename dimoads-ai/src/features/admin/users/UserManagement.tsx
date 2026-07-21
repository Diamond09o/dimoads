/**
 * User Management Component
 */
import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  UserCheck2,
  ListFilter,
  Users,
  Eye,
  Activity,
  Award
} from 'lucide-react';
import { User as UserType, Listing, Report } from '../../../types';
import { AdminRole, AuditLog } from '../types';
import { AdminService } from '../services/adminService';

interface UserManagementProps {
  users: Record<string, UserType>;
  listings: Listing[];
  reports: Report[];
  onUpdateUsers: (updatedUsers: Record<string, UserType>) => void;
  language: 'en' | 'ar';
}

export default function UserManagement({ 
  users, 
  listings, 
  reports, 
  onUpdateUsers, 
  language 
}: UserManagementProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'personal' | 'business'>('all');
  const [filterVerification, setFilterVerification] = useState<'all' | 'verified' | 'pending' | 'unverified'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const usersList = Object.values(users);

  // Search, Filter, Sort Logic
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.phone.includes(searchTerm);
    const matchesType = filterType === 'all' || u.accountType === filterType;
    const matchesVerif = filterVerification === 'all' || u.verificationStatus === filterVerification;
    
    return matchesSearch && matchesType && matchesVerif;
  });

  const handleSuspend = (userId: string) => {
    const updated = { ...users };
    if (updated[userId]) {
      updated[userId] = {
        ...updated[userId],
        verificationStatus: 'unverified',
        trustScore: Math.max(0, updated[userId].trustScore - 40)
      };
      onUpdateUsers(updated);
      AdminService.logAction('suspend_user', `Suspended/flagged user credentials for: ${updated[userId].name}`);
    }
  };

  const handleActivate = (userId: string) => {
    const updated = { ...users };
    if (updated[userId]) {
      updated[userId] = {
        ...updated[userId],
        trustScore: 100
      };
      onUpdateUsers(updated);
      AdminService.logAction('activate_user', `Fully restored and re-activated user account: ${updated[userId].name}`);
    }
  };

  const handleVerify = (userId: string) => {
    const updated = { ...users };
    if (updated[userId]) {
      updated[userId] = {
        ...updated[userId],
        verificationStatus: 'verified',
        trustScore: Math.max(90, updated[userId].trustScore)
      };
      onUpdateUsers(updated);
      AdminService.logAction('activate_user', `Completed manual security verification for user: ${updated[userId].name}`);
    }
  };

  const handleResetPassword = (userId: string) => {
    alert(`Password reset token generated and dispatched to ${users[userId]?.email}`);
    AdminService.logAction('settings_update', `Dispatched standard password reset protocol for user ID: ${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you absolutely sure you want to permanently delete this user from database? This operation is irreversible.')) {
      const updated = { ...users };
      const name = updated[userId]?.name || '';
      delete updated[userId];
      onUpdateUsers(updated);
      AdminService.logAction('delete_listing', `Permanently purged user account and data associated with: ${name}`);
      if (selectedUserId === userId) setSelectedUserId(null);
    }
  };

  const handleAssignRole = (userId: string, role: string) => {
    alert(`Assigned workspace privilege [${role}] to user ID: ${userId}`);
    AdminService.logAction('role_change', `Role elevation of ${userId} to ${role}`);
  };

  // Detailed selected user metrics
  const selectedUser = selectedUserId ? users[selectedUserId] : null;
  const userListings = selectedUserId ? listings.filter(l => l.ownerId === selectedUserId) : [];
  const userReports = selectedUserId ? reports.filter(r => r.reporterId === selectedUserId) : [];
  
  // Custom Activity log simulation for users
  const userLogs = selectedUserId ? [
    { timestamp: '2026-07-08T14:12:00Z', event: 'Signed in from Bahrain IP 89.203.112.4' },
    { timestamp: '2026-07-08T10:05:00Z', event: `Published new classified listing titled: "${userListings[0]?.title || 'Classified Ad'}"` },
    { timestamp: '2026-07-07T18:30:00Z', event: 'Initiated customer support ticket chat' }
  ] : [];

  return (
    <div id="admin_users_manager" className="space-y-6">
      
      {/* Search & Filter Header Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'البحث عن مستخدم بالاسم أو البريد...' : 'Search users by name, email, phone...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-2xl text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select 
              value={filterType} 
              onChange={(e: any) => setFilterType(e.target.value)}
              className="bg-transparent border-none font-bold text-gray-600 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-2xl text-xs">
            <ListFilter className="w-3.5 h-3.5 text-gray-400" />
            <select 
              value={filterVerification} 
              onChange={(e: any) => setFilterVerification(e.target.value)}
              className="bg-transparent border-none font-bold text-gray-600 focus:outline-none"
            >
              <option value="all">All Verifications</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Users Table Grid */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{language === 'ar' ? 'سجل المستخدمين' : 'User Accounts Registry'} ({filteredUsers.length})</span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-gray-500">
              <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">User info</th>
                  <th className="px-5 py-3">Account details</th>
                  <th className="px-5 py-3">Security Level</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr 
                    key={u.id} 
                    className={`hover:bg-gray-50/50 cursor-pointer ${selectedUserId === u.id ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{u.name}</div>
                      <div className="text-[10px] text-gray-400 font-semibold font-mono">{u.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="uppercase text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {u.accountType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          u.trustScore >= 80 ? 'bg-emerald-500' : u.trustScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span>
                        <span className="font-mono font-bold text-gray-700">{u.trustScore}% Score</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUserId(u.id)}
                          title="Inspect detail logs"
                          className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleVerify(u.id)}
                          title="Set account verified"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSuspend(u.id)}
                          title="Suspend/Flag account"
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete account permanently"
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-gray-400">
                      No matching user files found in registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected User Details / Logs Sidebar */}
        <div className="lg:col-span-1">
          {selectedUser ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-5 animate-slideLeft">
              
              {/* User overview block */}
              <div className="text-center pb-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center font-bold text-xl mb-3">
                  {selectedUser.name[0]}
                </div>
                <h4 className="text-sm font-extrabold text-gray-900">{selectedUser.name}</h4>
                <p className="text-[10px] text-gray-400 font-mono">{selectedUser.email}</p>
                
                <div className="mt-3 flex justify-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    selectedUser.verificationStatus === 'verified' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : selectedUser.verificationStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {selectedUser.verificationStatus.toUpperCase()}
                  </span>
                  <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                    {selectedUser.accountType}
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Active Ads</span>
                  <span className="font-mono text-sm font-bold text-gray-900">{userListings.length}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl">
                  <span className="block text-[10px] uppercase font-bold text-gray-400">Reports filed</span>
                  <span className="font-mono text-sm font-bold text-gray-900">{userReports.length}</span>
                </div>
              </div>

              {/* Quick operations */}
              <div className="space-y-2">
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
                  Workspace Actions
                </span>
                
                <button
                  onClick={() => handleResetPassword(selectedUser.id)}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Password</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAssignRole(selectedUser.id, 'Moderator')}
                    className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Award className="w-3 h-3" />
                    Make Moderator
                  </button>
                  <button
                    onClick={() => handleAssignRole(selectedUser.id, 'Support Agent')}
                    className="py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <UserCheck2 className="w-3 h-3" />
                    Make Support
                  </button>
                </div>
              </div>

              {/* Live Activity Logs */}
              <div>
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Interactive Activity Log</span>
                </span>
                <div className="space-y-3 pl-2.5 border-l border-gray-100">
                  {userLogs.map((log, i) => (
                    <div key={i} className="relative text-[10px]">
                      <div className="absolute -left-4.5 top-1.5 w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="block text-gray-400 font-mono text-[9px] mb-0.5">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <p className="text-gray-700 font-semibold leading-relaxed">{log.event}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-8 text-center text-xs text-gray-400 h-64 flex flex-col items-center justify-center">
              <Users className="w-8 h-8 text-gray-300 mb-2 animate-bounce" />
              <span>Select a user record from the register to examine security index, activity, and custom logs.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
