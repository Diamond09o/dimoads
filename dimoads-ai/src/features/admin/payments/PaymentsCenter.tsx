/**
 * Payments Center showing transactions, boosting commissions, and refund operations
 */
import React, { useState } from 'react';
import { 
  CreditCard, 
  RotateCcw, 
  FileText, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle,
  Percent
} from 'lucide-react';
import { AdminPaymentTransaction } from '../types';
import { AdminService } from '../services/adminService';

interface PaymentsCenterProps {
  language: 'en' | 'ar';
}

export default function PaymentsCenter({ language }: PaymentsCenterProps) {
  const [payments, setPayments] = useState<AdminPaymentTransaction[]>(() => AdminService.getPayments());
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefund = (txId: string) => {
    if (window.confirm(`Are you absolutely sure you want to issue a full refund for transaction ${txId}?`)) {
      AdminService.refundPayment(txId);
      setPayments(AdminService.getPayments());
      alert(`Refund successfully dispatched for transaction ${txId}`);
    }
  };

  const filtered = payments.filter(p => 
    p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSucceeded = payments.filter(p => p.status === 'succeeded').reduce((acc, curr) => acc + curr.amount, 0);
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div id="admin_payments_center" className="space-y-6">
      
      {/* Financial Overview Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Succeeded card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">Net Revenue Dispatched</span>
            <h3 className="text-xl font-black font-mono text-gray-950 mt-1">${(totalSucceeded - totalRefunded).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Boost Commission */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">Listing Boost Fees</span>
            <h3 className="text-xl font-black font-mono text-indigo-700 mt-1">
              ${payments.filter(p => p.type === 'premium_boost' && p.status === 'succeeded').reduce((acc, curr) => acc + curr.amount, 0)}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* Refunded card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">Refund Debits</span>
            <h3 className="text-xl font-black font-mono text-red-600 mt-1">${totalRefunded.toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Transaction Feed */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>COMMISSION PAYMENTS JOURNAL</span>
          </h3>

          <div className="relative w-full sm:w-64 text-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email or transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-3 py-1.5 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-500">
            <thead className="text-[10px] text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3">Transaction ID / Email</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-gray-900 font-mono">{p.id}</div>
                    <div className="text-[10px] text-gray-400 font-semibold font-mono">{p.userEmail}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="uppercase text-[9px] bg-gray-100 text-gray-700 font-bold px-1.5 py-0.5 rounded">
                      {p.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-extrabold text-gray-950">${p.amount} USD</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      p.status === 'succeeded' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {p.status === 'succeeded' ? (
                      <button
                        onClick={() => handleRefund(p.id)}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Refund
                      </button>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
