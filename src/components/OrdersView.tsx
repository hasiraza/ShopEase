/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Order, Customer, OrderItem, Product, Payment, OrderStatus, formatCurrency, formatDate } from '../types';

interface OrdersViewProps {
  orders: Order[];
  customers: Customer[];
  orderItems: OrderItem[];
  products: Product[];
  payments: Payment[];
}

export default function OrdersView({
  orders,
  customers,
  orderItems,
  products,
  payments,
}: OrdersViewProps) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Filter orders by status
  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'ALL') return true;
    return o.status === activeFilter;
  });

  const getCustomerName = (custId: number) => {
    const cust = customers.find((c) => c.customer_id === custId);
    return cust ? `${cust.first_name} ${cust.last_name}` : `Cust #${custId}`;
  };

  const getOrderItemsCount = (orderId: number) => {
    const items = orderItems.filter((item) => item.order_id === orderId);
    const sum = items.reduce((total, item) => total + item.quantity, 0);
    return sum === 1 ? '1 item' : `${sum} items`;
  };

  const getPaymentMethod = (orderId: number) => {
    const p = payments.find((pay) => pay.order_id === orderId);
    if (!p) return '—';
    // Visual formatting matching payments
    const methodNames: Record<string, string> = {
      CASH: '💵 Cash',
      CREDIT_CARD: '💳 Credit Card',
      DEBIT_CARD: '💳 Debit Card',
      EASYPAISA: '📱 EasyPaisa',
      JAZZCASH: '🎵 JazzCash',
    };
    return methodNames[p.payment_method] || p.payment_method;
  };

  const toggleExpandOrder = (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Status badges colors mapping
  const getStatusBadge = (status: OrderStatus) => {
    let colors = 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'PROCESSING') colors = 'bg-blue-100 text-blue-700 border-blue-200';
    else if (status === 'SHIPPED') colors = 'bg-purple-100 text-purple-700 border-purple-200';
    else if (status === 'DELIVERED') colors = 'bg-emerald-100 text-emerald-700 border-emerald-200';
    else if (status === 'CANCELLED') colors = 'bg-rose-100 text-rose-700 border-rose-200';

    return (
      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wide uppercase ${colors}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-xs">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Orders Ledger</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor incoming online customer orders, change statuses, and expand individual rows to view invoice item lists.
        </p>
      </div>

      {/* Filter Tabs by Order Status */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map((status) => {
          const isActive = activeFilter === status;
          const count = status === 'ALL' ? orders.length : orders.filter((o) => o.status === status).length;
          
          let btnClass = 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200';
          if (isActive) {
            if (status === 'ALL') btnClass = 'bg-slate-800 border-slate-800 text-white shadow-xs';
            else if (status === 'PENDING') btnClass = 'bg-amber-600 border-amber-600 text-white shadow-xs';
            else if (status === 'PROCESSING') btnClass = 'bg-blue-600 border-blue-600 text-white shadow-xs';
            else if (status === 'SHIPPED') btnClass = 'bg-purple-600 border-purple-600 text-white shadow-xs';
            else if (status === 'DELIVERED') btnClass = 'bg-emerald-600 border-emerald-600 text-white shadow-xs';
            else if (status === 'CANCELLED') btnClass = 'bg-rose-600 border-rose-600 text-white shadow-xs';
          }

          return (
            <button
              key={status}
              onClick={() => {
                setActiveFilter(status);
                setExpandedOrderId(null);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${btnClass}`}
            >
              <span>{status.charAt(0) + status.slice(1).toLowerCase()}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500 font-bold'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-150 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="orders-full-table">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase bg-slate-50">
                <th className="py-3.5 px-5 select-none w-12"></th>
                <th className="py-3.5 px-5 select-none w-28">Order ID</th>
                <th className="py-3.5 px-5 select-none">Customer</th>
                <th className="py-3.5 px-5 select-none w-36">Date</th>
                <th className="py-3.5 px-5 select-none w-24">Items</th>
                <th className="py-3.5 px-5 select-none w-36">Total (PKR)</th>
                <th className="py-3.5 px-5 select-none w-36">Status</th>
                <th className="py-3.5 px-5 select-none w-44">Payment Method</th>
              </tr>
            </thead>
            <tbody className="text-xs text-slate-600 divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.order_id;
                // Fetch items for details
                const currentOrderItems = orderItems.filter((item) => item.order_id === order.order_id);

                return (
                  <React.Fragment key={order.order_id}>
                    {/* Primary row */}
                    <tr
                      onClick={() => toggleExpandOrder(order.order_id)}
                      className={`hover:bg-slate-50/70 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-slate-50' : ''
                      }`}
                    >
                      <td className="py-4 px-5 text-center font-bold text-slate-400 text-sm">
                        {isExpanded ? '▼' : '▶'}
                      </td>
                      <td className="py-4 px-2 font-mono font-bold text-slate-800">ORD-{order.order_id}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">
                        {getCustomerName(order.customer_id)}
                      </td>
                      <td className="py-4 px-5">{formatDate(order.order_date)}</td>
                      <td className="py-4 px-5 font-medium">{getOrderItemsCount(order.order_id)}</td>
                      <td className="py-4 px-5 font-black font-mono text-slate-800">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="py-4 px-5">{getStatusBadge(order.status)}</td>
                      <td className="py-4 px-5 font-medium text-slate-700">
                        {getPaymentMethod(order.order_id)}
                      </td>
                    </tr>

                    {/* Collapsible items block */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={8} className="py-4 px-8 border-t border-slate-100">
                          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                              Order Details — Invoice ORD-{order.order_id}
                            </h4>
                            <table className="w-full text-left font-sans text-xs">
                              <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                                  <th className="pb-2">Product Description</th>
                                  <th className="pb-2 w-24 text-center">Qty</th>
                                  <th className="pb-2 w-36 text-right">Unit Price</th>
                                  <th className="pb-2 w-36 text-right">Line Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-600">
                                {currentOrderItems.map((item) => {
                                  const prod = products.find((p) => p.product_id === item.product_id);
                                  const prodName = prod ? prod.product_name : `Product ID ${item.product_id}`;
                                  return (
                                    <tr key={item.item_id}>
                                      <td className="py-2.5 font-medium text-slate-800">{prodName}</td>
                                      <td className="py-2.5 text-center font-mono font-bold text-slate-700">
                                        {item.quantity}
                                      </td>
                                      <td className="py-2.5 text-right font-mono text-slate-500">
                                        {formatCurrency(item.unit_price)}
                                      </td>
                                      <td className="py-2.5 text-right font-mono font-black text-slate-800">
                                        {formatCurrency(item.quantity * item.unit_price)}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot>
                                <tr className="font-mono text-xs border-t border-slate-200">
                                  <td colSpan={2} className="pt-3 font-semibold text-slate-400">Total Calculation:</td>
                                  <td colSpan={2} className="pt-3 text-right text-sm font-extrabold text-[#6c63ff]">
                                    {formatCurrency(order.total_amount)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-sm font-semibold text-slate-500">No orders catalogued</p>
                    <p className="text-xs text-slate-400 mt-1">There are no orders with standard status "{activeFilter}".</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
