/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Payment, Order, Customer, PaymentStatus, formatCurrency, formatDate } from '../types';

interface PaymentsViewProps {
  payments: Payment[];
  orders: Order[];
  customers: Customer[];
}

export default function PaymentsView({ payments, orders, customers }: PaymentsViewProps) {
  const [activeFilter, setActiveFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    if (activeFilter === 'ALL') return true;
    return p.status === activeFilter;
  });

  // Sum categories (Completed, Pending, Refunded) from the WHOLE datasets to show accurate summary totals
  const totalCollected = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === 'REFUNDED')
    .reduce((sum, p) => sum + p.amount, 0);

  const getCustomerName = (orderId: number) => {
    const order = orders.find((o) => o.order_id === orderId);
    if (!order) return 'Unknown Customer';
    const cust = customers.find((c) => c.customer_id === order.customer_id);
    return cust ? `${0}:${cust.first_name} ${cust.last_name}` : `ID ${order.customer_id}`;
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'CASH':
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-bold text-[10px]">
            💵 Cash
          </span>
        );
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return (
          <span className="bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-md font-bold text-[10px]">
            💳 Card
          </span>
        );
      case 'EASYPAISA':
        return (
          <span className="bg-teal-50 text-teal-800 border border-teal-100 px-2 py-0.5 rounded-md font-bold text-[10px]">
            📱 EasyPaisa
          </span>
        );
      case 'JAZZCASH':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded-md font-bold text-[10px]">
            🎵 JazzCash
          </span>
        );
      default:
        return <span className="text-[10px] bg-slate-100 border text-slate-700 px-1 py-0.5 rounded">{method}</span>;
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    let colors = 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'COMPLETED') colors = 'bg-emerald-100 text-emerald-700 border-emerald-200';
    else if (status === 'FAILED') colors = 'bg-rose-100 text-rose-700 border-rose-200';
    else if (status === 'REFUNDED') colors = 'bg-slate-100 text-slate-600 border-slate-200';

    return (
      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase ${colors}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-xs">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Payments Records</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review invoices, cross-reference payment channels representing micro-transations, and trace cash settlements.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'REFUNDED'] as const).map((status) => {
          const isActive = activeFilter === status;
          const count = status === 'ALL' ? payments.length : payments.filter((p) => p.status === status).length;

          let btnClass = 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200';
          if (isActive) {
            if (status === 'ALL') btnClass = 'bg-slate-800 border-slate-800 text-white shadow-xs';
            else if (status === 'COMPLETED') btnClass = 'bg-emerald-600 border-emerald-600 text-white shadow-xs';
            else if (status === 'PENDING') btnClass = 'bg-amber-600 border-amber-600 text-white shadow-xs';
            else if (status === 'FAILED') btnClass = 'bg-rose-600 border-rose-600 text-white shadow-xs font-bold';
            else if (status === 'REFUNDED') btnClass = 'bg-slate-500 border-slate-500 text-white shadow-xs';
          }

          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${btnClass}`}
            >
              <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Payment List Card */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="payments-detail-table">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase bg-slate-50">
                <th className="py-3.5 px-5 select-none w-28">Payment ID</th>
                <th className="py-3.5 px-5 select-none w-28">Order ID</th>
                <th className="py-3.5 px-5 select-none">Customer</th>
                <th className="py-3.5 px-5 select-none w-36">Amount (PKR)</th>
                <th className="py-3.5 px-5 select-none w-40">Payment Method</th>
                <th className="py-3.5 px-5 select-none w-36">Date</th>
                <th className="py-3.5 px-5 select-none w-36 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredPayments.map((p) => (
                <tr key={p.payment_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5 font-mono font-bold text-slate-700">PAY-{p.payment_id}</td>
                  <td className="py-4 px-5 font-mono font-bold text-[#6c63ff]">ORD-{p.order_id}</td>
                  <td className="py-4 px-5 font-medium text-slate-900">{getCustomerName(p.order_id)}</td>
                  <td className="py-4 px-5 font-black font-mono text-slate-800">{formatCurrency(p.amount)}</td>
                  <td className="py-4 px-5">{getMethodBadge(p.payment_method)}</td>
                  <td className="py-4 px-5 font-medium">{formatDate(p.payment_date)}</td>
                  <td className="py-4 px-5 text-right">{getStatusBadge(p.status)}</td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="text-3xl mb-2">💳</div>
                    <p className="text-sm font-semibold text-slate-500">No payment records found</p>
                    <p className="text-xs text-slate-400 mt-1">There are no invoices found matching the current filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Summary Row Footer bottom metric bar */}
        <div className="p-5 bg-slate-50 border-t border-slate-150 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white p-3 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              🟢 Total Collected (Completed)
            </span>
            <span className="text-base font-black font-mono text-emerald-600">
              {formatCurrency(totalCollected)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              🟡 Total Pending
            </span>
            <span className="text-base font-black font-mono text-amber-600">
              {formatCurrency(totalPending)}
            </span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              🔴 Total Refunded/Returned
            </span>
            <span className="text-base font-black font-mono text-slate-600">
              {formatCurrency(totalRefunded)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
