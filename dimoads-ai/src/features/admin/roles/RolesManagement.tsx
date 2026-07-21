/**
 * Roles and RBAC Configuration view
 */
import React, { useState } from 'react';
import { 
  Shield, 
  UserCheck2, 
  CheckSquare, 
  Square, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { AdminUser, AdminRole } from '../types';
import { AdminService } from '../services/adminService';

interface RolesManagementProps {
  language: 'en' | 'ar';
}

export default function RolesManagement({ language }: RolesManagementProps) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => AdminService.getAdminUsers());
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(adminUsers[0]?.id || null);

  const activeAdmin = adminUsers.find(u => u.id === selectedAdminId);

  // Available permissions
  const availablePermissions = [
    { key: 'all', label: 'Super Admin: All System Access' },
    { key: 'view_listings', label: 'View Ads Directory' },
    { key: 'edit_listings', label: 'Modify Ads Metadata' },
    { key: 'delete_listings', label: 'Delete Ads from Database' },
    { key: 'moderate_content', label: 'Arbitrate Flag Reports' },
    { key: 'view_payments', label: 'Audit Financial Revenue' },
    { key: 'refund_payments', label: 'Trigger Customer Stripe Refunds' },
    { key: 'view_analytics', label: 'Examine Growth Charts' },
    { key: 'view_tickets', label: 'Read Support Tickets' },
    { key: 'reply_tickets', label: 'Send Ticket Chat Replies' },
    { key: 'manage_settings', label: 'Modify Regional Taxonomies' }
  ];

  const handleRoleChange = (role: AdminRole) => {
    if (!activeAdmin) return;

    // Default permission mappings for role speed-allocation
    let perms: string[] = [];
    if (role === 'super_admin') perms = ['all'];
    else if (role === 'content_reviewer') perms = ['view_listings', 'edit_listings', 'delete_listings', 'moderate_content'];
    else if (role === 'finance') perms = ['view_payments', 'refund_payments', 'view_analytics'];
    else if (role === 'support_agent') perms = ['view_tickets', 'reply_tickets'];
    else perms = ['view_listings', 'view_tickets'];

    AdminService.updateAdminUserRole(activeAdmin.id, role, perms);
    setAdminUsers(AdminService.getAdminUsers());
    alert(`Assigned Role: ${role.toUpperCase()} to ${activeAdmin.name}`);
  };

  const handleTogglePermission = (permissionKey: string) => {
    if (!activeAdmin) return;

    let current = [...activeAdmin.permissions];
    if (current.includes(permissionKey)) {
      current = current.filter(k => k !== permissionKey);
    } else {
      current.push(permissionKey);
    }

    AdminService.updateAdminUserRole(activeAdmin.id, activeAdmin.role, current);
    setAdminUsers(AdminService.getAdminUsers());
  };

  return (
    <div id="admin_roles_rbac" className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Admin users ledger */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-xs h-fit space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-950 flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Administrative Officers</span>
          </h3>

          <div className="space-y-3">
            {adminUsers.map((u) => (
              <div 
                key={u.id}
                onClick={() => setSelectedAdminId(u.id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedAdminId === u.id 
                    ? 'bg-blue-50/40 border-blue-200' 
                    : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-bold text-gray-950">{u.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    u.role === 'super_admin' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-semibold font-mono">{u.email}</div>
                
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Last Active: {new Date(u.lastActive).toLocaleTimeString()}
                  </span>
                  <span className="capitalize text-emerald-600 font-extrabold">{u.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center/Right column: Custom permissions checklist */}
        <div className="lg:col-span-2">
          {activeAdmin ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-5 animate-slideLeft">
              
              <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-950">{activeAdmin.name}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                    User ID: {activeAdmin.id} • Assigned Officer Role: <span className="text-blue-600 font-bold">{activeAdmin.role.toUpperCase()}</span>
                  </p>
                </div>

                {/* Role Switcher */}
                <select
                  value={activeAdmin.role}
                  onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                  className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 focus:outline-none"
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="support_agent">Support Agent</option>
                  <option value="finance">Finance Director</option>
                  <option value="content_reviewer">Content Reviewer</option>
                  <option value="marketing_manager">Marketing Manager</option>
                  <option value="readonly_analyst">Read-Only Analyst</option>
                </select>
              </div>

              {/* Checklist */}
              <div className="space-y-3">
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Configurable Privileges & Permissions Checklist
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availablePermissions.map((perm) => {
                    const hasPerm = activeAdmin.permissions.includes(perm.key) || activeAdmin.permissions.includes('all');
                    return (
                      <div 
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          hasPerm 
                            ? 'bg-blue-50/30 border-blue-100 text-gray-850' 
                            : 'bg-white border-gray-100 text-gray-400'
                        }`}
                      >
                        <span>{perm.label}</span>
                        {hasPerm ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 bg-yellow-50 border border-yellow-100 rounded-2xl text-[10px] text-yellow-800 leading-relaxed font-semibold">
                <HelpCircle className="w-3.5 h-3.5 inline mr-1" />
                Warning: Modifying authorization tables triggers an immediate system-wide token refresh. Staff are tracked by audit logs.
              </div>

            </div>
          ) : (
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-400 h-64 flex flex-col items-center justify-center">
              <Shield className="w-8 h-8 text-gray-300 mb-2" />
              <span>Select an administrative officer from the ledger sidebar to audit and configure custom security access.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
