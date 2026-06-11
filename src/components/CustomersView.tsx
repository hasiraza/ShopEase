/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer, Order, formatCurrency, formatDate } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  selectedCustomerId: number | null;
  onSelectCustomer: (customerId: number | null) => void;
}

export default function CustomersView({
  customers,
  orders,
  selectedCustomerId,
  onSelectCustomer,
}: CustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Find customer's order history
  const getCustomerOrders = (custId: number) => {
    return orders.filter((o) => o.customer_id === custId);
  };

  // Filter list
  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    const city = c.city.toLowerCase();
    const s = searchTerm.toLowerCase();
    return fullName.includes(s) || city.includes(s);
  });

  const selectedCustomer = customers.find((c) => c.customer_id === selectedCustomerId);
  const selectedCustomerOrders = selectedCustomer ? getCustomerOrders(selectedCustomer.customer_id) : [];

  return (
    <div className="relative space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Customers Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer records, analyze transaction frequencies, and investigate detailed order records.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search customers by name or city (e.g. Lahore, Sara)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 font-bold"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="customers-table">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase bg-slate-50">
                <th className="py-3.5 px-5 select-none w-20">ID</th>
                <th className="py-3.5 px-5 select-none">Name</th>
                <th className="py-3.5 px-5 select-none">Email Address</th>
                <th className="py-3.5 px-5 select-none w-36">Phone Number</th>
                <th className="py-3.5 px-5 select-none w-32">City</th>
                <th className="py-3.5 px-5 select-none w-36">Registration</th>
                <th className="py-3.5 px-5 select-none w-28 text-right">Total Orders</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
              {filteredCustomers.map((c) => {
                const customerOrders = getCustomerOrders(c.customer_id);
                const orderCount = customerOrders.length;
                return (
                  <tr
                    key={c.customer_id}
                    onClick={() => onSelectCustomer(c.customer_id)}
                    className={`hover:bg-slate-50/75 transition-colors cursor-pointer ${
                      selectedCustomerId === c.customer_id ? 'bg-[#6c63ff]/10' : ''
                    }`}
                  >
                    <td className="py-4 px-5 font-mono font-bold text-slate-400">CUST-{c.customer_id}</td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 group-hover:text-[#6c63ff] flex items-center gap-1.5ClassName">
                        {c.first_name} {c.last_name}
                      </div>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-500 select-all">{c.email}</td>
                    <td className="py-4 px-5 font-mono select-all text-slate-500">{c.phone}</td>
                    <td className="py-4 px-5">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded text-[10px] border border-slate-200">
                        {c.city}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-500">
                      {formatDate(c.registration_date)}
                    </td>
                    <td className="py-4 px-5 text-right font-bold font-mono text-[#6c63ff]">
                      {orderCount}
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="text-3xl mb-2">👤</div>
                    <p className="text-sm font-semibold text-slate-500">No customers found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Sliding Drawer Side Panel */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex justify-end z-50">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => onSelectCustomer(null)}></div>
          
          {/* Drawer Body */}
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-indigo-300 font-bold uppercase block">
                  Customer Profile
                </span>
                <h3 className="text-lg font-bold mt-0.5">
                  {selectedCustomer.first_name} {selectedCustomer.last_name}
                </h3>
              </div>
              <button
                onClick={() => onSelectCustomer(null)}
                className="text-white/80 hover:text-white font-bold font-mono text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Profile card fields */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Customer ID</span>
                  <span className="font-mono font-bold text-slate-700">CUST-{selectedCustomer.customer_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Email Address</span>
                  <span className="font-medium text-slate-800 select-all">{selectedCustomer.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Phone Number</span>
                  <span className="font-mono font-medium text-slate-800 select-all">{selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">City Location</span>
                  <span className="font-bold text-slate-800">{selectedCustomer.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Joined On</span>
                  <span className="font-medium text-slate-800">{formatDate(selectedCustomer.registration_date)}</span>
                </div>
              </div>

              {/* Transaction volume summary header */}
              <div className="flex justify-between items-center pt-2">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Order History ({selectedCustomerOrders.length})
                </h4>
                <div className="text-xs bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-[#6c63ff] px-2 py-0.5 rounded-md font-mono font-bold">
                  Spend: {formatCurrency(
                    selectedCustomerOrders
                      .filter(o => o.status !== 'CANCELLED')
                      .reduce((sum, o) => sum + o.total_amount, 0)
                  )}
                </div>
              </div>

              {/* Order history list */}
              <div className="space-y-3">
                {selectedCustomerOrders.map((o) => {
                  let badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
                  if (o.status === 'DELIVERED') badgeClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  else if (o.status === 'SHIPPED') badgeClass = 'bg-purple-100 text-purple-700 border-purple-200';
                  else if (o.status === 'PROCESSING') badgeClass = 'bg-indigo-100 text-indigo-700 border-indigo-200';
                  else if (o.status === 'CANCELLED') badgeClass = 'bg-rose-100 text-rose-700 border-rose-200';

                  return (
                    <div
                      key={o.order_id}
                      className="p-3 border border-slate-150 rounded-xl hover:border-[#6c63ff]/30 transition-colors text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-800">ORD-{o.order_id}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                          {formatDate(o.order_date)}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1.5">
                        <span className="font-bold font-mono text-slate-800">{formatCurrency(o.total_amount)}</span>
                        <span className={`px-2 py-0.2 rounded-full border text-[9px] font-bold ${badgeClass}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {selectedCustomerOrders.length === 0 && (
                  <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <span className="text-xl">📭</span>
                    <p className="text-xs font-semibold text-slate-500 mt-1">This customer hasn't placed any orders yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex shrink-0">
              <button
                onClick={() => onSelectCustomer(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
