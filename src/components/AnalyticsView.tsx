/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Customer, Order, OrderItem, Product, Category, Payment, formatCurrency } from '../types';

interface AnalyticsViewProps {
  customers: Customer[];
  orders: Order[];
  orderItems: OrderItem[];
  products: Product[];
  categories: Category[];
  payments: Payment[];
}

export default function AnalyticsView({
  customers,
  orders,
  orderItems,
  products,
  categories,
  payments,
}: AnalyticsViewProps) {
  const customerChartRef = useRef<HTMLCanvasElement | null>(null);
  const categoryChartRef = useRef<HTMLCanvasElement | null>(null);
  const paymentChartRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic calculations & Canvas drawings
  useEffect(() => {
    // ---- 1. TOP CUSTOMERS BY SPENDING (Horizontal Bar Chart) ----
    const customerCanvas = customerChartRef.current;
    if (customerCanvas) {
      const displayWidth = customerCanvas.parentElement?.clientWidth || 400;
      const displayHeight = 280;
      const dpr = window.devicePixelRatio || 1;
      
      customerCanvas.width = displayWidth * dpr;
      customerCanvas.height = displayHeight * dpr;
      customerCanvas.style.width = `${displayWidth}px`;
      customerCanvas.style.height = `${displayHeight}px`;

      const ctx = customerCanvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        // Calculate customer spend of completed orders
        const customerSpendMap: Record<number, number> = {};
        
        // Initializing with zero for all customers
        customers.forEach((c) => {
          customerSpendMap[c.customer_id] = 0;
        });

        payments.forEach((p) => {
          if (p.status === 'COMPLETED') {
            const order = orders.find((o) => o.order_id === p.order_id);
            if (order && customerSpendMap[order.customer_id] !== undefined) {
              customerSpendMap[order.customer_id] += p.amount;
            }
          }
        });

        // Convert to array of { customer, spend }
        const spendArray = customers.map((c) => ({
          name: `${c.first_name} ${c.last_name}`,
          city: c.city,
          spend: customerSpendMap[c.customer_id] || 0,
        }));

        // Sort descending, take top 5
        spendArray.sort((a, b) => b.spend - a.spend);
        const top5 = spendArray.slice(0, 5);

        // Layout variables
        const leftMargin = 120;
        const rightMargin = 85;
        const topMargin = 25;
        const bottomMargin = 25;
        const chartWidth = displayWidth - leftMargin - rightMargin;
        const chartHeight = displayHeight - topMargin - bottomMargin;

        const maxSpend = Math.max(...top5.map((t) => t.spend), 5000);
        const barSpacing = chartHeight / top5.length;
        const barHeight = barSpacing * 0.55;

        // Draw vertical axis line
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(leftMargin, topMargin);
        ctx.lineTo(leftMargin, displayHeight - bottomMargin);
        ctx.stroke();

        top5.forEach((item, idx) => {
          if (item.spend === 0) return;
          const y = topMargin + idx * barSpacing + (barSpacing - barHeight) / 2;
          const currentBarWidth = (item.spend / maxSpend) * chartWidth;

          // Draw horizontal bar gradient
          const gradient = ctx.createLinearGradient(leftMargin, y, leftMargin + currentBarWidth, y);
          gradient.addColorStop(0, '#8f88ff');
          gradient.addColorStop(1, '#6c63ff');

          ctx.fillStyle = gradient;
          
          // Rounded corners on the right side of the bar
          ctx.beginPath();
          const r = Math.min(4, currentBarWidth);
          ctx.moveTo(leftMargin, y);
          ctx.lineTo(leftMargin + currentBarWidth - r, y);
          ctx.quadraticCurveTo(leftMargin + currentBarWidth, y, leftMargin + currentBarWidth, y + r);
          ctx.lineTo(leftMargin + currentBarWidth, y + barHeight - r);
          ctx.quadraticCurveTo(leftMargin + currentBarWidth, y + barHeight, leftMargin + currentBarWidth - r, y + barHeight);
          ctx.lineTo(leftMargin, y + barHeight);
          ctx.closePath();
          ctx.fill();

          // Left Label Name
          ctx.fillStyle = '#1e293b';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.font = '600 11px sans-serif';
          ctx.fillText(item.name, leftMargin - 10, y + barHeight / 2 - 5);

          // Subtext City
          ctx.fillStyle = '#94a3b8';
          ctx.font = '500 9px monospace';
          ctx.fillText(item.city, leftMargin - 10, y + barHeight / 2 + 7);

          // Value inside or right of the bar
          ctx.fillStyle = '#475569';
          ctx.textAlign = 'left';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(formatCurrency(item.spend), leftMargin + currentBarWidth + 8, y + barHeight / 2);
        });
      }
    }

    // ---- 2. CATEGORY REVENUE BREAKDOWN (Donut Chart) ----
    const categoryCanvas = categoryChartRef.current;
    if (categoryCanvas) {
      const displayWidth = categoryCanvas.parentElement?.clientWidth || 400;
      const displayHeight = 280;
      const dpr = window.devicePixelRatio || 1;

      categoryCanvas.width = displayWidth * dpr;
      categoryCanvas.height = displayHeight * dpr;
      categoryCanvas.style.width = `${displayWidth}px`;
      categoryCanvas.style.height = `${displayHeight}px`;

      const ctx = categoryCanvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        // Sum category revenues dynamics from orders and order items
        // Filter out items matching COMPLETED orders
        const categoryRevMap: Record<number, number> = {};
        categories.forEach((c) => {
          categoryRevMap[c.category_id] = 0;
        });

        // Loop payments
        payments.forEach((p) => {
          if (p.status === 'COMPLETED') {
            const currentItems = orderItems.filter((i) => i.order_id === p.order_id);
            currentItems.forEach((item) => {
              const prod = products.find((pr) => pr.product_id === item.product_id);
              if (prod) {
                categoryRevMap[prod.category_id] += item.quantity * item.unit_price;
              }
            });
          }
        });

        const totalRevenue = Object.values(categoryRevMap).reduce((a, b) => a + b, 0);

        // Chart center position
        const centerX = displayWidth * 0.32;
        const centerY = displayHeight / 2;
        const outerRadius = Math.min(displayWidth * 0.25, displayHeight * 0.32);
        const innerRadius = outerRadius * 0.56;

        const colors = ['#6c63ff', '#a855f7', '#10b981', '#f59e0b', '#ec4899'];

        let angleStart = -Math.PI / 2;

        categories.forEach((cat, idx) => {
          const spend = categoryRevMap[cat.category_id] || 0;
          if (spend === 0) return;

          const sliceAngle = (spend / totalRevenue) * (Math.PI * 2);
          const angleEnd = angleStart + sliceAngle;

          ctx.beginPath();
          ctx.arc(centerX, centerY, outerRadius, angleStart, angleEnd);
          ctx.arc(centerX, centerY, innerRadius, angleEnd, angleStart, true);
          ctx.closePath();

          ctx.fillStyle = colors[idx % colors.length];
          ctx.fill();

          angleStart = angleEnd;
        });

        // Center total text indicator
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('Revenue', centerX, centerY - 8);
        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#6c63ff';
        
        let sumStr = totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(0)}k` : `${totalRevenue}`;
        ctx.fillText(`PKR ${sumStr}`, centerX, centerY + 8);

        // Draw side Category Legends
        const legendX = displayWidth * 0.58;
        const legendStartY = centerY - (categories.length * 20) / 2 + 6;

        categories.forEach((cat, idx) => {
          const spend = categoryRevMap[cat.category_id] || 0;
          const pct = totalRevenue > 0 ? Math.round((spend / totalRevenue) * 100) : 0;
          const y = legendStartY + idx * 24;

          // Dot marker
          ctx.beginPath();
          ctx.fillStyle = colors[idx % colors.length];
          ctx.arc(legendX, y, 4.5, 0, 2 * Math.PI);
          ctx.fill();

          // Text category label
          ctx.fillStyle = '#1e293b';
          ctx.textAlign = 'left';
          ctx.font = '600 11.5px sans-serif';
          ctx.fillText(cat.category_name, legendX + 10, y);

          // Sub Label metrics
          ctx.fillStyle = '#64748b';
          ctx.font = '500 10px monospace';
          ctx.fillText(`${formatCurrency(spend)} (${pct}%)`, legendX + 10, y+11);
        });
      }
    }

    // ---- 3. PAYMENT METHOD DISTRIBUTION (Count & Amount per method) ----
    const paymentCanvas = paymentChartRef.current;
    if (paymentCanvas) {
      const displayWidth = paymentCanvas.parentElement?.clientWidth || 400;
      const displayHeight = 280;
      const dpr = window.devicePixelRatio || 1;

      paymentCanvas.width = displayWidth * dpr;
      paymentCanvas.height = displayHeight * dpr;
      paymentCanvas.style.width = `${displayWidth}px`;
      paymentCanvas.style.height = `${displayHeight}px`;

      const ctx = paymentCanvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, displayWidth, displayHeight);

        // Find methods list
        const methods: Array<'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'EASYPAISA' | 'JAZZCASH'> = [
          'CASH',
          'CREDIT_CARD',
          'DEBIT_CARD',
          'EASYPAISA',
          'JAZZCASH',
        ];

        const methodLabels = ['Cash', 'Credit C.', 'Debit C.', 'EasyPaisa', 'JazzCash'];

        const metrics = methods.map((m) => {
          let count = 0;
          let revenuesum = 0;
          payments.forEach((p) => {
            if (p.payment_method === m && p.status === 'COMPLETED') {
              count++;
              revenuesum += p.amount;
            }
          });
          return { method: m, count, amount: revenuesum };
        });

        // Layout variables
        const leftMargin = 55;
        const rightMargin = 20;
        const topMargin = 30;
        const bottomMargin = 40;
        const chartWidth = displayWidth - leftMargin - rightMargin;
        const chartHeight = displayHeight - topMargin - bottomMargin;

        const maxAmount = Math.max(...metrics.map((x) => x.amount), 5000);
        const yAxisMax = Math.ceil(maxAmount / 10000) * 10000;

        // Draw background horizontal lines
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;

        const gridLines = 4;
        for (let i = 0; i <= gridLines; i++) {
          const val = (yAxisMax / gridLines) * i;
          const y = topMargin + chartHeight - (val / yAxisMax) * chartHeight;
          
          ctx.beginPath();
          ctx.moveTo(leftMargin, y);
          ctx.lineTo(displayWidth - rightMargin, y);
          ctx.stroke();

          // Left Y Labels
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'right';
          ctx.font = '9px monospace';
          const kLabel = val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`;
          ctx.fillText(kLabel, leftMargin - 6, y + 3);
        }

        // Draw vertical bars
        const totalSteps = metrics.length;
        const barSpacing = chartWidth / totalSteps;
        const barWidth = barSpacing * 0.5;

        metrics.forEach((item, idx) => {
          const barHeight = (item.amount / yAxisMax) * chartHeight;
          const x = leftMargin + idx * barSpacing + (barSpacing - barWidth) / 2;
          const y = topMargin + chartHeight - barHeight;

          // Draw dual color gradient represent dynamic growth
          const gradient = ctx.createLinearGradient(x, y, x, topMargin + chartHeight);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(1, '#34d399');

          ctx.fillStyle = gradient;
          
          if (barHeight > 4) {
            ctx.beginPath();
            const r = 4;
            ctx.moveTo(x, y + barHeight);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.lineTo(x + barWidth - r, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
            ctx.lineTo(x + barWidth, y + barHeight);
            ctx.closePath();
            ctx.fill();
          } else if (barHeight > 0) {
            ctx.fillRect(x, y, barWidth, barHeight);
          }

          // Draw text annotation count
          ctx.fillStyle = '#0f766e';
          ctx.textAlign = 'center';
          ctx.font = '9px sans-serif';
          
          if (item.count > 0) {
            ctx.fillText(`${item.count}tx`, x + barWidth / 2, Math.max(y - 14, topMargin + 2));
            
            // Amount inline badge
            ctx.fillStyle = '#1e293b';
            ctx.font = 'bold 8px monospace';
            const kStr = item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}k` : `${item.amount}`;
            ctx.fillText(kStr, x + barWidth / 2, Math.max(y - 4, topMargin + 11));
          } else {
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('0 tx', x + barWidth / 2, y - 5);
          }

          // X Label
          ctx.fillStyle = '#475569';
          ctx.font = '600 11px sans-serif';
          ctx.fillText(methodLabels[idx], x + barWidth / 2, topMargin + chartHeight + 16);
        });
      }
    }
  }, [customers, orders, orderItems, products, categories, payments]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-xs">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Business Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Detailed breakdown of customer revenue streams, category shares and payment channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Top Customers by Spending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>👥</span> Top Customers by Spending
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Top 5 registered shoppers sorted by total completed spend.</p>
          </div>
          <div className="w-full flex-1 min-h-[280px] flex items-center justify-center relative">
            <canvas ref={customerChartRef} className="w-full h-[280px]" id="customer-chart-canvas"></canvas>
          </div>
        </div>

        {/* Panel 2: Category Revenue Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🍕</span> Category Revenue Breakdown
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Category share segment calculations of completed order streams.</p>
          </div>
          <div className="w-full flex-1 min-h-[280px] flex items-center justify-center relative">
            <canvas ref={categoryChartRef} className="w-full h-[280px]" id="category-chart-canvas"></canvas>
          </div>
        </div>
      </div>

      {/* Panel 3: Payment Method Distribution */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span>💳</span> Payment Channel Revenue & counts
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Revenue volume totals and completed transaction counts (tx) mapped by channel.</p>
        </div>
        <div className="w-full min-h-[280px] flex items-center justify-center relative">
          <canvas ref={paymentChartRef} className="w-full h-[280px]" id="payment-chart-canvas"></canvas>
        </div>
      </div>
    </div>
  );
}
