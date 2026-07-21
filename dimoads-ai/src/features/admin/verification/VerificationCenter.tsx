/**
 * Verification Center file checking and security approvals view
 */
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  AlertCircle, 
  Check, 
  X, 
  HelpCircle,
  Clock,
  Briefcase,
  FileCheck
} from 'lucide-react';
import { VerificationRequest } from '../types';
import { AdminService } from '../services/adminService';

interface VerificationCenterProps {
  language: 'en' | 'ar';
}

export default function VerificationCenter({ language }: VerificationCenterProps) {
  const [requests, setRequests] = useState<VerificationRequest[]>(() => AdminService.getVerifications());
  const [selectedReqId, setSelectedReqId] = useState<string | null>(requests[0]?.id || null);

  const activeRequest = requests.find(r => r.id === selectedReqId);

  const handleStatusChange = (id: string, status: VerificationRequest['status']) => {
    const list = [...requests];
    const req = list.find(r => r.id === id);
    if (req) {
      req.status = status;
      const comment = prompt('Enter admin decision commentary / reasons:', req.comments);
      if (comment !== null) {
        req.comments = comment;
      }
      req.updatedAt = new Date().toISOString();
      AdminService.updateVerification(req);
      setRequests(AdminService.getVerifications());
      alert(`Verification request ${id} updated to status: ${status.toUpperCase()}`);
    }
  };

  return (
    <div id="admin_verification_center" className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Request Register */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-xs h-fit space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-950 flex items-center gap-2 mb-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Verification File Queue</span>
          </h3>

          <div className="space-y-3">
            {requests.map((req) => (
              <div 
                key={req.id}
                onClick={() => setSelectedReqId(req.id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedReqId === req.id 
                    ? 'bg-emerald-50/30 border-emerald-200' 
                    : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-bold text-gray-950">{req.userName}</span>
                  <span className="uppercase text-[9px] bg-indigo-50 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded">
                    {req.type}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-semibold font-mono">{req.userEmail}</div>
                
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded uppercase text-[8px] font-black ${
                    req.status === 'approved' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : req.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center/Right column: Selected Request file audits */}
        <div className="lg:col-span-2">
          {activeRequest ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-5 animate-slideLeft">
              
              <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-950">{activeRequest.userName}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                    User Email: {activeRequest.userEmail} • Request ID: {activeRequest.id}
                  </p>
                </div>
                
                <span className="text-[10px] uppercase font-black bg-indigo-600 text-white px-2.5 py-1 rounded-xl tracking-wider">
                  {activeRequest.type} LICENSE FILE
                </span>
              </div>

              {/* Submitted documents links */}
              <div className="space-y-3.5">
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Submitted Dossier & License Files
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeRequest.documentUrls.map((url, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Briefcase className="w-5 h-5 text-gray-400" />
                        <div>
                          <span className="block text-xs font-bold text-gray-800">License Document #{index + 1}</span>
                          <span className="font-mono text-[9px] text-gray-400 font-semibold">VERIFICATION_ATTACHMENT.pdf</span>
                        </div>
                      </div>

                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        title="Open document in secure sandbox viewer"
                        className="p-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all flex items-center justify-center cursor-pointer text-blue-600 shadow-xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments and notations */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">Registrar Commentary & Notations</span>
                <p className="text-gray-700 leading-relaxed font-semibold italic">"{activeRequest.comments}"</p>
              </div>

              {/* Quick operations */}
              <div className="border-t border-gray-100 pt-4 space-y-3.5">
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Security Registrar Actions
                </span>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleStatusChange(activeRequest.id, 'approved')}
                    disabled={activeRequest.status === 'approved'}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Credentials</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(activeRequest.id, 'rejected')}
                    disabled={activeRequest.status === 'rejected'}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Credentials</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(activeRequest.id, 'more_info_requested')}
                    className="flex-1 px-4 py-2.5 bg-gray-950 hover:bg-gray-900 text-white text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-yellow-300" />
                    <span>Request Info</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-400 h-64 flex flex-col items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-gray-300 mb-2" />
              <span>Select a pending broker/business verification application from the register to conduct the licensing audit.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
