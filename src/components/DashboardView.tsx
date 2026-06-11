/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  PieChart,
  ArrowRight,
  RefreshCw,
  Wifi,
  Copy,
  Check,
} from 'lucide-react';
import { Order, Customer, Product, Payment, formatCurrency, formatDate } from '../types';

interface DashboardViewProps {
  orders: Order[];
  customers: Customer[];
  products: Product[];
  payments: Payment[];
  onNavigate: (page: string) => void;
  onSelectCustomer: (customerId: number) => void;
  dbState?: { isMongo: boolean; uriConfigured: boolean; connectionError: string } | null;
}

export default function DashboardView({
  orders,
  customers,
  products,
  payments,
  onNavigate,
  onSelectCustomer,
  dbState,
}: DashboardViewProps) {
  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const donutChartRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedIP, setCopiedIP] = React.useState(false);

  // Calculate KPI stats
  const totalRevenue = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  // Recent 5 orders (latest first based on order ID)
  const sortedOrders = [...orders].sort((a, b) => b.order_id - a.order_id);
  const recentOrders = sortedOrders.slice(0, 5);

  // Low stock products (stock < 25)
  const lowStockProducts = products.filter((p) => p.stock_qty < 25);

  // Render Bar Chart: Monthly Revenue
  useEffect(() => {
    const canvas = barChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayWidth = canvas.parentElement?.clientWidth || 400;
    const displayHeight = 260;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyRevenue = [0, 0, 0, 0, 0, 0];

    payments.forEach((p) => {
      if (p.status === 'COMPLETED' && p.payment_date.startsWith('2024-')) {
        const monthNum = parseInt(p.payment_date.split('-')[1], 10);
        if (monthNum >= 1 && monthNum <= 6) {
          monthlyRevenue[monthNum - 1] += p.amount;
        }
      }
    });

    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 30;
    const paddingBottom = 40;
    const chartWidth = displayWidth - paddingLeft - paddingRight;
    const chartHeight = displayHeight - paddingTop - paddingBottom;

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const maxVal = Math.max(...monthlyRevenue, 10000);
    const yAxisMax = Math.ceil(maxVal / 10000) * 10000;

    const gridLines = 4;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#e2e8f0';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= gridLines; i++) {
      const val = (yAxisMax / gridLines) * i;
      const y = paddingTop + chartHeight - (val / yAxisMax) * chartHeight;

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(displayWidth - paddingRight, y);
      ctx.stroke();

      let formattedLabel = val >= 1000 ? `${val / 1000}k` : `${val}`;
      if (val === 0) formattedLabel = '0';
      ctx.fillText(formattedLabel, paddingLeft - 8, y + 4);
    }

    const barWidth = (chartWidth / months.length) * 0.55;
    const spacing = chartWidth / months.length;

    months.forEach((month, idx) => {
      const val = monthlyRevenue[idx];
      const barHeight = (val / yAxisMax) * chartHeight;
      const x = paddingLeft + idx * spacing + (spacing - barWidth) / 2;
      const y = paddingTop + chartHeight - barHeight;

      const gradient = ctx.createLinearGradient(x, y, x, paddingTop + chartHeight);
      gradient.addColorStop(0, '#6c63ff');
      gradient.addColorStop(1, '#8f88ff');

      ctx.fillStyle = gradient;

      if (barHeight > 4) {
        ctx.beginPath();
        const radius = 4;
        ctx.moveTo(x, y + barHeight);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.closePath();
        ctx.fill();
      } else if (barHeight > 0) {
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      ctx.fillStyle = '#334155';
      ctx.font = '600 11.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(month, x + barWidth / 2, paddingTop + chartHeight + 18);

      if (val > 0) {
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 9px monospace';
        const kStr = val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`;
        ctx.fillText(kStr, x + barWidth / 2, y - 6);
      }
    });
  }, [payments, orders]);

  // Render Donut Chart: Orders by Status
  useEffect(() => {
    const canvas = donutChartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const displayWidth = canvas.parentElement?.clientWidth || 400;
    const displayHeight = 260;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    ctx.scale(dpr, dpr);

    const statusCounts: Record<string, number> = {
      DELIVERED: 0,
      SHIPPED: 0,
      PROCESSING: 0,
      PENDING: 0,
      CANCELLED: 0,
    };

    orders.forEach((o) => {
      if (statusCounts[o.status] !== undefined) {
        statusCounts[o.status]++;
      }
    });

    const categories = Object.keys(statusCounts);
    const dataVals = Object.values(statusCounts);
    const totalCount = dataVals.reduce((a, b) => a + b, 0);

    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const colors: Record<string, string> = {
      DELIVERED: '#22c55e',
      SHIPPED: '#a855f7',
      PROCESSING: '#3b82f6',
      PENDING: '#f59e0b',
      CANCELLED: '#ef4444',
    };

    const centerX = displayWidth * 0.35 + 10;
    const centerY = displayHeight / 2;
    const outerRadius = Math.min(displayWidth * 0.3, displayHeight * 0.34);
    const innerRadius = outerRadius * 0.58;

    let startAngle = -Math.PI / 2;

    categories.forEach((cat) => {
      const val = statusCounts[cat];
      if (val === 0) return;

      const sliceAngle = (val / totalCount) * (2 * Math.PI);
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = colors[cat];
      ctx.fill();

      startAngle = endAngle;
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`${totalCount}`, centerX, centerY - 4);
    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px sans-serif';
    ctx.fillText('Orders Total', centerX, centerY + 14);

    const legendX = displayWidth * 0.68;
    const legendStartY = centerY - (categories.length * 18) / 2 + 6;

    categories.forEach((cat, idx) => {
      const val = statusCounts[cat];
      const y = legendStartY + idx * 22;

      ctx.fillStyle = colors[cat];
      ctx.beginPath();
      ctx.arc(legendX, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e293b';
      ctx.font = '600 11.5px sans-serif';
      ctx.fillText(cat.charAt(0) + cat.slice(1).toLowerCase(), legendX + 12, y);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 11px monospace';
      const pct = totalCount > 0 ? Math.round((val / totalCount) * 100) : 0;
      ctx.fillText(`${val} (${pct}%)`, legendX + 90, y);
    });
  }, [orders]);

  const getCustomerName = (customerId: number) => {
    const cust = customers.find((c) => c.customer_id === customerId);
    return cust ? `${cust.first_name} ${cust.last_name}` : `Unknown ID ${customerId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time shop metrics, monthly revenue trends and stock tracking alerts.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 uppercase font-semibold font-mono">
          <RefreshCw size={11} />
          Last updated: Live
        </div>
      </div>

      {/* MongoDB warning banner */}
      {dbState?.uriConfigured && !dbState?.isMongo && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 shadow-xs text-sm text-slate-700 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-amber-900 text-base">MongoDB IP Whitelist Connection Guide</h3>
              <p className="text-amber-850 leading-relaxed text-xs">
                You have configured a custom{' '}
                <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">
                  MONGODB_URI
                </code>{' '}
                environment variable, but your live MongoDB Atlas cluster is rejecting the connection. This is
                because MongoDB Atlas blocks access from dynamic/ephemeral host IPs unless explicitly authorized.
                ShopEase has automatically activated offline-first Sandbox mode so you can view, edit, and seed
                shop datasets without interrupts.
              </p>
            </div>
          </div>

          <div className="pl-8 space-y-2.5">
            <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wide">
              Steps to establish active connection with MongoDB Atlas:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-650 text-xs">
              <li>
                Log in to your{' '}
                <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-[#6c63ff] font-bold hover:underline">
                  MongoDB Atlas Console
                </a>.
              </li>
              <li>Select your project, and click <strong className="text-amber-950 font-semibold">Network Access</strong> under Security.</li>
              <li>Click <strong className="text-amber-950 font-semibold">Add IP Address</strong>.</li>
              <li>Select <strong className="text-amber-950 font-semibold">Allow Access From Anywhere</strong> (or enter <strong className="text-amber-950 font-semibold">0.0.0.0/0</strong> manually).</li>
              <li>Save the configuration. Whitelisting completes within 30–60 seconds.</li>
              <li>Refresh this page to connect to your live Atlas cluster!</li>
            </ol>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-xs text-amber-850 font-medium">Quick copy IP Whitelist string:</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <code className="bg-white border border-amber-200 px-2 py-1 rounded font-mono text-xs font-bold text-slate-700">
                  0.0.0.0/0
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('0.0.0.0/0');
                    setCopiedIP(true);
                    setTimeout(() => setCopiedIP(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#6c63ff] hover:bg-[#5b54db] text-white text-[10px] font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
                >
                  {copiedIP ? <Check size={11} /> : <Copy size={11} />}
                  {copiedIP ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div
          onClick={() => onNavigate('Payments')}
          className="bg-white p-5 rounded-xl border-l-4 border-emerald-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 font-mono">{formatCurrency(totalRevenue)}</h3>
              <p className="text-[10px] text-emerald-600 mt-3 font-semibold flex items-center gap-1">
                <CheckCircle size={11} />
                Completed payments
              </p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg">
              <DollarSign size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Orders */}
        <div
          onClick={() => onNavigate('Orders')}
          className="bg-white p-5 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 font-mono">{totalOrders}</h3>
              <p className="text-[10px] text-slate-400 mt-3">From registered customers</p>
            </div>
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
              <ShoppingCart size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Customers */}
        <div
          onClick={() => onNavigate('Customers')}
          className="bg-white p-5 rounded-xl border-l-4 border-purple-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Customers</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 font-mono">{totalCustomers}</h3>
              <p className="text-[10px] text-purple-600 mt-3 font-semibold">Active in 4 major cities</p>
            </div>
            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-lg">
              <Users size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Products */}
        <div
          onClick={() => onNavigate('Products')}
          className="bg-white p-5 rounded-xl border-l-4 border-orange-500 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Active Products</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2 font-mono">{totalProducts}</h3>
              <p className="text-[10px] text-orange-600 mt-3 font-semibold flex items-center gap-1">
                {lowStockProducts.length > 0 ? (
                  <><AlertTriangle size={11} /> {lowStockProducts.length} low stock alerts</>
                ) : (
                  <><CheckCircle size={11} /> All stock healthy</>
                )}
              </p>
            </div>
            <div className="bg-orange-50 text-orange-600 p-2.5 rounded-lg">
              <Package size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp size={15} className="text-[#6c63ff]" />
              Monthly Revenue Trend (2024 Completed)
            </h4>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-bold">PKR</span>
          </div>
          <div className="w-full flex-1 min-h-[260px] flex items-center justify-center relative">
            <canvas ref={barChartRef} className="w-full h-[260px]" id="bar-chart-canvas"></canvas>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <PieChart size={15} className="text-[#6c63ff]" />
              Orders by Status Share
            </h4>
            <span className="text-xs text-slate-400 font-mono font-medium">12 sample orders</span>
          </div>
          <div className="w-full flex-1 min-h-[260px] flex items-center justify-center relative">
            <canvas ref={donutChartRef} className="w-full h-[260px]" id="donut-chart-canvas"></canvas>
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Package size={16} className="text-slate-500" />
              Recent Orders (Latest 5)
            </h4>
            <button
              onClick={() => onNavigate('Orders')}
              className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="recent-orders-table">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase bg-slate-50/50">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount (PKR)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {recentOrders.map((order) => {
                  const cust = customers.find((c) => c.customer_id === order.customer_id);
                  const custName = cust ? `${cust.first_name} ${cust.last_name}` : `ID ${order.customer_id}`;

                  let badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
                  if (order.status === 'DELIVERED') badgeClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  else if (order.status === 'SHIPPED') badgeClass = 'bg-purple-100 text-purple-700 border-purple-200';
                  else if (order.status === 'PROCESSING') badgeClass = 'bg-indigo-100 text-indigo-700 border-indigo-200';
                  else if (order.status === 'CANCELLED') badgeClass = 'bg-rose-100 text-rose-700 border-rose-200';

                  return (
                    <tr
                      key={order.order_id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => {
                        if (cust) {
                          onSelectCustomer(cust.customer_id);
                          onNavigate('Customers');
                        }
                      }}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">ORD-{order.order_id}</td>
                      <td className="py-3 px-4 font-medium text-slate-900">{custName}</td>
                      <td className="py-3 px-4">{formatDate(order.order_date)}</td>
                      <td className="py-3 px-4 font-bold font-mono text-slate-800">{formatCurrency(order.total_amount)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${badgeClass}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warnings */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-500" />
              Low Stock Warnings (&le;25)
            </h4>
            <span className="text-xs bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[200px] flex-1 pr-1 border-dashed rounded-lg border border-transparent hover:border-slate-100">
            {lowStockProducts.map((p) => {
              const bgClass =
                p.stock_qty === 0
                  ? 'bg-rose-50 border-rose-100 text-rose-900'
                  : 'bg-amber-50/50 border-amber-100 text-amber-900';
              const dotClass = p.stock_qty === 0 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500';

              return (
                <div
                  key={p.product_id}
                  onClick={() => onNavigate('Products')}
                  className={`p-3 rounded-xl border flex justify-between items-center text-xs hover:shadow-xs transition-shadow cursor-pointer ${bgClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`}></span>
                    <div>
                      <h4 className="font-bold truncate text-slate-800 max-w-[130px]">{p.product_name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{formatCurrency(p.price)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Quantity</span>
                    <span className="text-sm font-mono font-black text-slate-800">{p.stock_qty}</span>
                  </div>
                </div>
              );
            })}

            {lowStockProducts.length === 0 && (
              <div className="h-full flex flex-col justify-center items-center text-center py-6 text-slate-400">
                <CheckCircle size={28} className="text-emerald-400 mb-2" />
                <span className="text-xs font-bold text-slate-500">All inventory items catalogued nicely.</span>
                <span className="text-[10px] mt-1 text-slate-400">Products are fully stocked.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}