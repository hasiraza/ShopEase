/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Category, Customer, Order, OrderItem, Payment, formatCurrency, formatDate, PaymentMethod, PaymentStatus } from '../types';
import { 
  addCustomerToDb, 
  addOrderToDb, 
  addOrderItemToDb, 
  addPaymentToDb, 
  updateProductStockInDb 
} from '../model/service';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  Search, 
  Tag, 
  Package, 
  CreditCard, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink,
  ChevronLeft,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StorefrontViewProps {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  selectedProductId: number | null;
  onSelectProduct: (productId: number | null) => void;
  onSwitchToAdmin: () => void;
  onRefreshData: () => Promise<void>;
}

export default function StorefrontView({
  products,
  categories,
  customers,
  orders,
  orderItems,
  payments,
  selectedProductId,
  onSelectProduct,
  onSwitchToAdmin,
  onRefreshData,
}: StorefrontViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Checkout states
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    paymentMethod: 'CASH' as PaymentMethod,
  });
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Selected product object
  const selectedProduct = products.find(p => p.product_id === selectedProductId) || null;

  // Filter products for browsing
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesCategory = true;
    if (selectedCategory !== 'all') {
      matchesCategory = p.category_id === parseInt(selectedCategory, 10);
    }
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (catId: number) => {
    const cat = categories.find(c => c.category_id === catId);
    return cat ? cat.category_name : 'General';
  };

  // Adjust handleBuyClick
  const handleBuyClick = () => {
    if (!selectedProduct) return;
    if (selectedProduct.stock_qty <= 0) {
      alert("This product is currently out of stock!");
      return;
    }
    setPurchaseQuantity(1);
    setCheckoutError(null);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (!selectedProduct) return;

    if (purchaseQuantity > selectedProduct.stock_qty) {
      setCheckoutError(`Cannot purchase ${purchaseQuantity} items. Only ${selectedProduct.stock_qty} in stock.`);
      return;
    }

    // Basic validated check
    if (!checkoutForm.firstName.trim() || !checkoutForm.lastName.trim() || !checkoutForm.email.trim() || !checkoutForm.phone.trim() || !checkoutForm.city.trim()) {
      setCheckoutError('Please fill in all customer delivery fields.');
      return;
    }

    setCheckoutLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Identify or register Customer
      let finalCustomerId = 1;
      const matchedCustomer = customers.find(c => c.email.toLowerCase().trim() === checkoutForm.email.toLowerCase().trim());
      
      if (matchedCustomer) {
        finalCustomerId = matchedCustomer.customer_id;
      } else {
        // Create new Customer record
        const nextCustId = customers.length > 0 ? Math.max(...customers.map(c => c.customer_id)) + 1 : 1;
        finalCustomerId = nextCustId;
        const newCustomer: Customer = {
          customer_id: nextCustId,
          first_name: checkoutForm.firstName.trim(),
          last_name: checkoutForm.lastName.trim(),
          email: checkoutForm.email.trim(),
          phone: checkoutForm.phone.trim(),
          city: checkoutForm.city.trim(),
          registration_date: today
        };
        await addCustomerToDb(newCustomer);
      }

      // 2. Insert new Order
      const nextOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.order_id)) + 1 : 1;
      const orderTotal = selectedProduct.price * purchaseQuantity;
      
      const newOrder: Order = {
        order_id: nextOrderId,
        customer_id: finalCustomerId,
        order_date: today,
        status: 'PENDING',
        total_amount: orderTotal
      };
      await addOrderToDb(newOrder);

      // 3. Insert new OrderItem
      const nextItemId = orderItems.length > 0 ? Math.max(...orderItems.map(i => i.item_id)) + 1 : 1;
      const newOrderItem: OrderItem = {
        item_id: nextItemId,
        order_id: nextOrderId,
        product_id: selectedProduct.product_id,
        quantity: purchaseQuantity,
        unit_price: selectedProduct.price
      };
      await addOrderItemToDb(newOrderItem);

      // 4. Insert new Payment
      const nextPaymentId = payments.length > 0 ? Math.max(...payments.map(p => p.payment_id)) + 1 : 1;
      const newPayment: Payment = {
        payment_id: nextPaymentId,
        order_id: nextOrderId,
        payment_date: today,
        amount: orderTotal,
        payment_method: checkoutForm.paymentMethod,
        status: 'COMPLETED'
      };
      await addPaymentToDb(newPayment);

      // 5. Decrement inventory stock quantity
      const remainingStock = selectedProduct.stock_qty - purchaseQuantity;
      await updateProductStockInDb(selectedProduct.product_id, remainingStock, selectedProduct);

      // 6. Refresh state from datastore & show success screen
      setCreatedOrder(newOrder);
      await onRefreshData();
      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Failed to complete order checkout. Please check configuration.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" id="storefront-container">
      {/* Visual Banner Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (selectedProductId) {
                  onSelectProduct(null);
                }
              }}
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-[#6c63ff]/10 rounded-xl flex items-center justify-center text-[#6c63ff]">
                <ShoppingBag size={20} />
              </span>
              <div>
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">ShopEase <span className="text-[#6c63ff] text-sm font-semibold">Buyer Store</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToAdmin}
              className="py-2.5 px-4 bg-[#1a1f36] hover:bg-[#252c4a] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              🛡️ Go to Admin Portal <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!selectedProduct ? (
            /* BROWSE PRODUCT LIST MODE */
            <motion.div
              key="browse-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Marketing Hero Frame */}
              <div className="relative py-12 px-8 rounded-3xl overflow-hidden bg-radial from-slate-900 via-indigo-950 to-slate-950 border border-indigo-900/40 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-3 max-w-lg">
                  <span className="bg-[#6c63ff] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest">
                    🔥 Customer Spotlight
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                    Premium Quality, <span className="text-[#6c63ff]">Fastest Delivery</span>.
                  </h1>
                  <p className="text-sm text-slate-300">
                    Browse premium active tech & lifestyle hardware in ShopEase's direct online catalog. Buy today with instantaneous secure confirmations.
                  </p>
                </div>
                <div className="bg-white/10 p-5 rounded-2xl border border-white/5 backdrop-blur-md text-center max-w-xs shrink-0">
                  <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Guaranteed Safe Payments</p>
                  <p className="text-xs text-white/80 mt-1">Accepting Cash on Delivery, Credit/Debit cards, EasyPaisa and JazzCash securely.</p>
                </div>
              </div>

              {/* Filters Block */}
              <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:flex-1">
                  <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search premium products or specs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff] font-semibold text-slate-700 placeholder-slate-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 font-bold"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {/* Filter categories tabs/dropdown */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`py-2 px-4 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#6c63ff] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Items
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.category_id}
                      onClick={() => setSelectedCategory(cat.category_id.toString())}
                      className={`py-2 px-4 rounded-xl text-xs font-bold tracking-tight transition-all cursor-pointer ${
                        selectedCategory === cat.category_id.toString()
                          ? 'bg-[#6c63ff] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.category_name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Product Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(p => {
                  const isOutOfStock = p.stock_qty <= 0;
                  return (
                    <div 
                      key={p.product_id}
                      className="bg-white rounded-3xl border border-slate-150 hover:border-indigo-100 p-6 flex flex-col justify-between hover:shadow-lg transition-all transform hover:-translate-y-1 relative overflow-hidden group"
                    >
                      {isOutOfStock && (
                        <div className="absolute top-3 right-3 bg-rose-500 text-white font-extrabold text-[9px] uppercase tracking-widest py-1 px-3 rounded-full z-15">
                          Sold Out
                        </div>
                      )}

                      <div>
                        {/* Placeholder graphic backdrop */}
                        <div className="mb-4 h-48 rounded-2xl bg-slate-50 relative overflow-hidden flex items-center justify-center p-4 border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
                          <span className="text-4xl">📱</span>
                          <div className="absolute top-3 left-3 bg-white border border-slate-100 text-[10px] font-bold py-1 px-2.5 rounded-lg text-slate-500 shadow-3xs flex items-center gap-1">
                            <Tag size={12} className="text-[#6c63ff]" />
                            {getCategoryName(p.category_id)}
                          </div>
                        </div>

                        {/* Text and title */}
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-slate-900 group-hover:text-[#6c63ff] transition-colors text-base line-clamp-1">{p.product_name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">{p.description}</p>
                        </div>
                      </div>

                      {/* Footer pricing info */}
                      <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Buyer Price</p>
                          <p className="text-lg font-black font-mono text-slate-900 mt-0.5">{formatCurrency(p.price)}</p>
                        </div>

                        <button 
                          onClick={() => onSelectProduct(p.product_id)}
                          className="bg-slate-100 hover:bg-indigo-50 hover:text-[#6c63ff] text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          View Specs
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-150 p-6 text-slate-400">
                    <div className="text-4xl mb-2">🛍️</div>
                    <p className="text-sm font-bold text-slate-500">No items available in this category</p>
                    <p className="text-xs text-slate-400 mt-1">Try relaxing filters or search terms.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* CONCRETE PRODUCT DETAIL MODE */
            <motion.div
              key="details-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Back to browse */}
              <button
                onClick={() => onSelectProduct(null)}
                className="inline-flex items-center gap-2 py-2 px-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to product catalog
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Images side (Col 5) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white border border-slate-150 rounded-3xl p-8 flex items-center justify-center h-80 relative shadow-xs">
                    <span className="text-7xl">🎁</span>
                    <span className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 py-1 px-3 rounded-lg uppercase tracking-wider">
                      Item PRD-{selectedProduct.product_id}
                    </span>
                  </div>

                  <div className="bg-indigo-950 p-5 rounded-2xl text-white border border-indigo-900 text-xs flex gap-3.5 items-center">
                    <span className="w-9 h-9 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-indigo-300">
                      <ShieldCheck size={18} />
                    </span>
                    <div>
                      <h4 className="font-bold">Original & Certified Hardware</h4>
                      <p className="text-[10px] text-indigo-200 mt-0.5">Backed by a 1-year official brand warranty and full refund guarantee.</p>
                    </div>
                  </div>
                </div>

                {/* Details Side (Col 7) */}
                <div className="lg:col-span-7 bg-white border border-slate-150 rounded-3xl p-8 space-y-6 shadow-xs">
                  {/* Rating / Badges info */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#6c63ff]/10 text-[#6c63ff] font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-[#6c63ff]/10">
                      {getCategoryName(selectedProduct.category_id)}
                    </span>
                    {selectedProduct.stock_qty > 0 ? (
                      <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-100">
                        🟢 {selectedProduct.stock_qty} available in stock
                      </span>
                    ) : (
                      <span className="bg-rose-50 text-rose-700 font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-rose-100">
                        🔴 Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Title and descriptions */}
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      {selectedProduct.product_name}
                    </h1>
                    <div className="mt-3 text-2xl font-black text-slate-900 font-mono">
                      {formatCurrency(selectedProduct.price)}
                    </div>
                  </div>

                  {/* Descriptions block */}
                  <div className="space-y-2 pt-2 border-t border-slate-50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Product Specifications & Scope</h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {selectedProduct.description || "No specifications offered. High premium tier retail asset with top market grade reviews."}
                    </p>
                  </div>

                  {/* Quantity and actions */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                    {selectedProduct.stock_qty > 0 ? (
                      <>
                        <div className="flex items-center gap-4">
                          <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Quantity:</label>
                          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-3xs">
                            <button
                              onClick={() => setPurchaseQuantity(q => Math.max(1, q - 1))}
                              type="button"
                              className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-mono cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-12 text-center text-sm font-black font-mono text-slate-800">
                              {purchaseQuantity}
                            </span>
                            <button
                              onClick={() => setPurchaseQuantity(q => Math.min(selectedProduct.stock_qty, q + 1))}
                              type="button"
                              className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-md transition-colors font-mono cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Summary panel */}
                        <div className="flex items-center justify-between pt-3 border-t border-slate-250/20">
                          <p className="text-xs font-bold text-slate-500">Estimated Total Cost</p>
                          <p className="text-lg font-black font-mono text-slate-800">
                            {formatCurrency(selectedProduct.price * purchaseQuantity)}
                          </p>
                        </div>

                        {/* Main buy now button */}
                        <button
                          onClick={handleBuyClick}
                          className="w-full py-3.5 bg-[#6c63ff] hover:bg-[#5b54e0] text-white font-bold text-sm tracking-wide rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                        >
                          💸 Confirm Purchase & Deliver
                        </button>
                      </>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-sm font-bold text-rose-600">This item is currently sold out</p>
                        <p className="text-xs text-slate-500 mt-1">Please browse other product lines or contact support to request restock.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* CHECKOUT POPUP MODAL */}
      {isCheckoutOpen && selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-indigo-950 text-white px-6 py-4.5 flex justify-between items-center border-b border-indigo-900">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Delivering Shipping Information</h3>
                <p className="text-indigo-200 text-[10px] mt-0.5">Please fill your details below to register the secure order.</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-white/70 hover:text-white font-medium text-xl font-mono cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
              {checkoutError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-3 rounded-lg flex items-center gap-1.5 font-bold animate-pulse">
                  <span>⚠️</span> {checkoutError}
                </div>
              )}

              {/* Order summary box */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">{selectedProduct.product_name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Quantity: <span className="font-bold font-mono text-slate-600">{purchaseQuantity}x</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Total Bill</p>
                  <p className="font-bold font-mono text-slate-900 text-sm mt-0.5">
                    {formatCurrency(selectedProduct.price * purchaseQuantity)}
                  </p>
                </div>
              </div>

              {/* Dual Column Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">First Name *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.firstName}
                    onChange={(e) => setCheckoutForm({...checkoutForm, firstName: e.target.value})}
                    placeholder="e.g. Asad"
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-250/50 px-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.lastName}
                    onChange={(e) => setCheckoutForm({...checkoutForm, lastName: e.target.value})}
                    placeholder="e.g. Raza"
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-250/50 px-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                  placeholder="name@domain.com"
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-250/50 px-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff]"
                />
              </div>

              {/* Phone & City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                    placeholder="03XXXXXXXXX"
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-250/50 px-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={checkoutForm.city}
                    onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                    placeholder="e.g. Karachi"
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-250/50 px-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#6c63ff]/20 focus:border-[#6c63ff]"
                  />
                </div>
              </div>

              {/* Payment Method Option */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Payment Method *</label>
                <select
                  value={checkoutForm.paymentMethod}
                  onChange={(e) => setCheckoutForm({...checkoutForm, paymentMethod: e.target.value as PaymentMethod})}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-250/50 px-3 py-2.5 rounded-lg focus:outline-hidden"
                >
                  <option value="CASH">💵 Cash on Delivery (COD)</option>
                  <option value="CREDIT_CARD">💳 Credit Card Gateway</option>
                  <option value="DEBIT_CARD">💳 Debit Card Gateway</option>
                  <option value="EASYPAISA">📱 EasyPaisa Mobile Wallet</option>
                  <option value="JAZZCASH">📱 JazzCash Mobile Wallet</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="px-5 py-2 bg-[#6c63ff] hover:bg-[#5b54e0] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-55 cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {checkoutLoading ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Placing Order...
                    </>
                  ) : (
                    '🎁 Confirm & Checkout'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {isSuccessOpen && createdOrder && selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-150 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Checked icon ripple effect */}
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-500 mx-auto text-2xl animate-bounce">
              <Check size={32} />
            </div>

            <div className="mt-5 space-y-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200/50 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Payment Completed Successfully
              </span>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight pt-1">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500">Your shipping parcel is being prepared for immediate routing dispatch.</p>
            </div>

            {/* Structured details block */}
            <div className="mt-6 bg-slate-50 border border-slate-150 p-5 rounded-2xl text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-200/40 pb-2">
                <span className="text-slate-400 font-bold">Receipt ID</span>
                <span className="font-mono text-slate-800 font-bold">ORD-{createdOrder.order_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/40 pb-2">
                <span className="text-slate-400 font-bold">Hardware</span>
                <span className="text-slate-800 font-bold">{selectedProduct.product_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/40 pb-2">
                <span className="text-slate-400 font-bold">Delivered To</span>
                <span className="text-slate-800 font-bold">{checkoutForm.firstName} {checkoutForm.lastName} ({checkoutForm.city})</span>
              </div>
              <div className="flex justify-between text-sm pt-1">
                <span className="text-slate-500 font-black">Total Amount</span>
                <span className="font-black font-mono text-indigo-600">{formatCurrency(createdOrder.total_amount)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSuccessOpen(false);
                setCreatedOrder(null);
              }}
              className="w-full py-3 bg-[#6c63ff] hover:bg-[#5b54e0] text-white font-bold text-xs rounded-xl tracking-wide uppercase transition-all shadow-md mt-6 cursor-pointer"
            >
              Continue Shopping 🛍️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
