/**
 * Support Center ticket management component
 */
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  Send, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { SupportTicket } from '../types';
import { AdminService } from '../services/adminService';

interface SupportCenterProps {
  language: 'en' | 'ar';
}

export default function SupportCenter({ language }: SupportCenterProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => AdminService.getTickets());
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    AdminService.addTicketReply(activeTicket.id, replyText, 'user-admin-1', 'Super Admin', true);
    setReplyText('');
    setTickets(AdminService.getTickets());
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !internalNoteText.trim()) return;

    const updated = { ...activeTicket };
    updated.internalNotes.push(internalNoteText);
    AdminService.updateTicket(updated);
    setInternalNoteText('');
    setTickets(AdminService.getTickets());
  };

  const handleUpdateStatus = (ticketId: string, status: SupportTicket['status']) => {
    const list = [...tickets];
    const item = list.find(t => t.id === ticketId);
    if (item) {
      item.status = status;
      AdminService.updateTicket(item);
      setTickets(AdminService.getTickets());
    }
  };

  const handleUpdatePriority = (ticketId: string, priority: SupportTicket['priority']) => {
    const list = [...tickets];
    const item = list.find(t => t.id === ticketId);
    if (item) {
      item.priority = priority;
      AdminService.updateTicket(item);
      setTickets(AdminService.getTickets());
    }
  };

  return (
    <div id="admin_support_center" className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Ticket List */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-3xl p-5 shadow-xs h-fit space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-950 flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Open Customer Tickets</span>
          </h3>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div 
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  selectedTicketId === t.id 
                    ? 'bg-blue-50/40 border-blue-200' 
                    : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-bold text-gray-950 truncate max-w-[130px]">{t.subject}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    t.priority === 'critical' ? 'bg-red-100 text-red-800' : t.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 truncate leading-relaxed">{t.message}</p>
                
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                  <span className="capitalize text-blue-600 font-extrabold">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center/Right column: Selected Ticket Conversation */}
        <div className="lg:col-span-2">
          {activeTicket ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs space-y-5 animate-slideLeft">
              
              {/* Ticket header details */}
              <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-gray-950">{activeTicket.subject}</h4>
                  <div className="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">
                    Ticket ID: {activeTicket.id} • Customer: {activeTicket.userEmail}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeTicket.status}
                    onChange={(e: any) => handleUpdateStatus(activeTicket.id, e.target.value)}
                    className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-xl text-[10px] font-bold text-gray-700 focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={activeTicket.priority}
                    onChange={(e: any) => handleUpdatePriority(activeTicket.id, e.target.value)}
                    className="bg-gray-50 border border-gray-100 px-2 py-1 rounded-xl text-[10px] font-bold text-gray-700 focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Original message */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">Customer Description</span>
                <p className="text-gray-700 leading-relaxed font-medium">"{activeTicket.message}"</p>
              </div>

              {/* Chat replies */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">Message thread</span>
                
                {activeTicket.replies.map((rep) => (
                  <div 
                    key={rep.id} 
                    className={`p-3.5 rounded-2xl text-xs max-w-[85%] ${
                      rep.isAdmin 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="font-bold mb-1 text-[10px] opacity-90">{rep.senderName}</div>
                    <p className="leading-relaxed font-semibold">{rep.text}</p>
                    <span className="block text-[8px] opacity-75 mt-1.5 text-right font-mono">
                      {new Date(rep.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}

                {activeTicket.replies.length === 0 && (
                  <div className="text-center py-6 text-gray-400 text-xs italic">
                    No active replies dispatched yet. Compose below.
                  </div>
                )}
              </div>

              {/* Send replies form */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Compose official administrative response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all cursor-pointer flex-shrink-0 active:scale-95 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Internal notes ledger */}
              <div className="border-t border-gray-100 pt-4 space-y-3.5">
                <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Internal Staff Annotations (Invisible to user)</span>
                </span>

                <div className="space-y-2">
                  {activeTicket.internalNotes.map((note, i) => (
                    <div key={i} className="p-2.5 bg-yellow-50/50 border border-yellow-100 text-yellow-800 rounded-xl text-[11px] font-semibold leading-relaxed">
                      • {note}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddInternalNote} className="flex gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Append internal case annotation..."
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    className="flex-1 bg-amber-50/30 border border-amber-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Add Note
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-gray-50/50 border border-dashed border-gray-200 rounded-3xl p-12 text-center text-xs text-gray-400 h-64 flex flex-col items-center justify-center">
              <FolderOpen className="w-8 h-8 text-gray-300 mb-2" />
              <span>Select an open support ticket file from the sidebar register to initiate customer replies or staff annotation.</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
