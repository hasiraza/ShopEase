/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { isDatabaseEmpty, seedDatabase } from './model/seed';
import {
  fetchCategories,
  fetchCustomers,
  fetchProducts,
  fetchOrders,
  fetchOrderItems,
  fetchPayments,
  addProductToDb,
  fetchDbStatus,
} from './model/service';
import { Product, OrderStatus } from './types';

import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  CreditCard,
  TrendingUp
} from 'lucide-react';

// Importing views
import DashboardView from './components/DashboardView';
import ProductsView from './components/ProductsView';
import CustomersView from './components/CustomersView';
import OrdersView from './components/OrdersView';
import PaymentsView from './components/PaymentsView';
import AnalyticsView from './components/AnalyticsView';
import AuthScreen from './components/AuthScreen';
import StorefrontView from './components/StorefrontView';

export default function App() {
  // Authentication states
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Database Connection Status State
  const [dbState, setDbState] = useState<{ isMongo: boolean; uriConfigured: boolean; connectionError: string } | null>(null);

  // Application Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [seedingInProgress, setSeedingInProgress] = useState(false);

  // Router States
  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [appMode, setAppMode] = useState<'admin' | 'storefront'>('admin');
  const [selectedStorefrontProductId, setSelectedStorefrontProductId] = useState<number | null>(null);

  // Monitor Auth State Changes (Local Storage + MongoDB-connected sessions)
  useEffect(() => {
    const savedEmail = localStorage.getItem('shopease_admin_email');
    if (savedEmail) {
      setUser({ email: savedEmail });
    }
    setAuthLoading(false);
  }, []);

  const handleAuthSuccess = (email: string) => {
    localStorage.setItem('shopease_admin_email', email);
    setUser({ email });
  };

  const handleSignOut = () => {
    localStorage.removeItem('shopease_admin_email');
    setUser(null);
  };

  // Fetch all collections from database
  const loadAllDataFromDb = async () => {
    setLoadingData(true);
    try {
      // Load connection status
      try {
        const dState = await fetchDbStatus();
        setDbState(dState);
      } catch (err) {
        console.error('Failed to get database connection state:', err);
      }

      // Check if database is empty, and auto-seed if so
      const isEmpty = await isDatabaseEmpty();
      if (isEmpty) {
        setSeedingInProgress(true);
        console.log('Database is empty. Autoseeding initial ShopEase datasets...');
        await seedDatabase();
        setSeedingInProgress(false);
      }

      const [cats, custs, prods, ords, items, pays] = await Promise.all([
        fetchCategories(),
        fetchCustomers(),
        fetchProducts(),
        fetchOrders(),
        fetchOrderItems(),
        fetchPayments(),
      ]);

      setCategories(cats);
      setCustomers(custs);
      setProducts(prods);
      setOrders(ords);
      setOrderItems(items);
      setPayments(pays);
    } catch (e) {
      console.error('Error fetching live records:', e);
    } finally {
      setLoadingData(false);
      setSeedingInProgress(false);
    }
  };

  // Trigger loading when user is signed in
  useEffect(() => {
    if (user) {
      loadAllDataFromDb();
    }
  }, [user]);

  // Clean and force reseed database function
  const handleForceReseed = async () => {
    if (window.confirm('Are you sure you want to force refill the database and restore default records?')) {
      setSeedingInProgress(true);
      try {
        await seedDatabase();
        await loadAllDataFromDb();
        alert('Database successfully seeded!');
      } catch (err) {
        console.error(err);
        alert('Failed to seed: please check your MongoDB backend.');
      } finally {
        setSeedingInProgress(false);
      }
    }
  };

  // Add Product Handler
  const handleAddProduct = async (newProd: Omit<Product, 'product_id'>) => {
    const nextId = products.length > 0 ? Math.max(...products.map((p) => p.product_id)) + 1 : 1;
    const fullProduct: Product = {
      product_id: nextId,
      ...newProd,
    };

    // Save to database first, then load
    await addProductToDb(fullProduct);
    await loadAllDataFromDb();
  };

  // Nav items list
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Products', icon: Package },
    { name: 'Customers', icon: Users },
    { name: 'Orders', icon: ShoppingCart },
    { name: 'Payments', icon: CreditCard },
    { name: 'Analytics', icon: TrendingUp },
  ];

  // Dynamic Navigation to Customers with details drawer open
  const handleSelectCustomerFromOtherPages = (custId: number) => {
    setSelectedCustomerId(custId);
    setActivePage('Customers');
  };

  // Loading indicator for active session initiation
  if (authLoading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#f0f2f5] font-sans">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-block w-8 h-8 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin"></span>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
            Connecting to secure gateway...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated? Show the custom login/signup page
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Storefront view mode gate
  if (appMode === 'storefront') {
    return (
      <StorefrontView
        products={products}
        categories={categories}
        customers={customers}
        orders={orders}
        orderItems={orderItems}
        payments={payments}
        selectedProductId={selectedStorefrontProductId}
        onSelectProduct={setSelectedStorefrontProductId}
        onSwitchToAdmin={() => setAppMode('admin')}
        onRefreshData={loadAllDataFromDb}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f2f5] font-sans antialiased text-slate-800">

      {/* Sidebar navigation */}
      <aside
        className="w-16 md:w-60 bg-[#1a1f36] text-[#8892b0] flex flex-col justify-between shrink-0 select-none z-10 transition-all duration-300 shadow-xl"
        id="dashboard-sidebar"
      >
        <div>
          {/* Logo container area */}
          <div className="h-16 flex items-center px-4 md:px-6 border-b border-indigo-950/40 bg-slate-950/20">
            <span className="text-xl md:text-2xl font-bold text-white tracking-wider flex items-center gap-2">
              <span>🛒</span>
              <span className="hidden md:inline text-base lg:text-lg font-black tracking-tight" id="logo-text">
                ShopEase
              </span>
            </span>
          </div>

          {/* Open Storefront CTA Banner */}
          <div className="p-4 border-b border-white/5 bg-slate-950/10">
            <button
              onClick={() => {
                setAppMode('storefront');
                setSelectedStorefrontProductId(null);
              }}
              className="w-full py-2.5 px-3 bg-[#6c63ff] hover:bg-[#5b54e0] text-white text-xs font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              title="Browse customer-facing shop"
            >
              🛍️ <span className="hidden md:inline text-[11px]">Open Storefront</span>
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name);
                    // Reset selected customer unless explicitly navigating to customer panel
                    if (item.name !== 'Customers') {
                      setSelectedCustomerId(null);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left cursor-pointer group relative ${isActive
                      ? 'bg-[#6c63ff] text-white font-medium'
                      : 'text-[#8892b0] hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className="text-base group-hover:scale-110 transition-transform">
                    <item.icon size={18} />
                  </span>
                  <span className="hidden md:inline transition-all">
                    {item.name}
                  </span>

                  {/* Tooltip for small screens */}
                  <span className="md:hidden absolute left-14 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap font-bold shadow-md">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Database Control Center Panel */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <button
            onClick={handleForceReseed}
            disabled={seedingInProgress}
            className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wider text-[#8892b0] hover:text-white rounded-lg border border-white/10 cursor-pointer transition-colors"
          >
            {seedingInProgress ? 'Refilling Database...' : '🔄 Refill Database'}
          </button>

          {/* Sidebar Footer credit */}
          <div className="text-xs text-[#8892b0] text-center mt-3 pt-3 border-t border-white/5">
            <p className="hidden md:block">
              ShopEase Admin v1.0
            </p>
            <p className="block md:hidden font-mono text-center">
              v1.0
            </p>
          </div>
        </div>
      </aside>

      {/* Main content pane */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top Header of Content panel */}
        <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-8 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-700">{activePage} Dashboard</h2>
            {dbState && (
              dbState.isMongo ? (
                <span className="hidden sm:inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-100 uppercase tracking-wider">
                  🍃 MongoDB Connected
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-100 uppercase tracking-wider" title="App is running on a high-fidelity MongoDB emulation layer. Configure MONGODB_URI in secrets to sync with live MongoDB Atlas.">
                  ⚠️ SQLite/JSON Sandbox (Mongo Emulation)
                </span>
              )
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">
                {user.email?.split('@')[0] || 'Admin User'}
              </p>
              <button
                onClick={handleSignOut}
                className="text-[10px] text-[#6c63ff] font-bold hover:underline cursor-pointer uppercase tracking-wider block text-right w-full"
              >
                Sign Out
              </button>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6c63ff] flex items-center justify-center text-white font-black shadow-sm uppercase">
              {(user.email?.[0] || 'A')}
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 relative">

          {loadingData && (
            <div className="absolute top-4 right-4 bg-white border border-[#6c63ff]/20 text-[#6c63ff] text-xs font-bold py-1.5 px-3 rounded-xl shadow-md flex items-center gap-2 z-50">
              <span className="inline-block w-3.5 h-3.5 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin"></span>
              Synchronizing collections...
            </div>
          )}

          {activePage === 'Dashboard' && (
            <DashboardView
              orders={orders}
              customers={customers}
              products={products}
              payments={payments}
              onNavigate={(page) => setActivePage(page)}
              onSelectCustomer={handleSelectCustomerFromOtherPages}
              dbState={dbState}
            />
          )}

          {activePage === 'Products' && (
            <ProductsView
              products={products}
              categories={categories}
              onAddProduct={handleAddProduct}
              onViewProductOnStorefront={(productId) => {
                setAppMode('storefront');
                setSelectedStorefrontProductId(productId);
              }}
            />
          )}

          {activePage === 'Customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={setSelectedCustomerId}
            />
          )}

          {activePage === 'Orders' && (
            <OrdersView
              orders={orders}
              customers={customers}
              orderItems={orderItems}
              products={products}
              payments={payments}
            />
          )}

          {activePage === 'Payments' && (
            <PaymentsView
              payments={payments}
              orders={orders}
              customers={customers}
            />
          )}

          {activePage === 'Analytics' && (
            <AnalyticsView
              customers={customers}
              orders={orders}
              orderItems={orderItems}
              products={products}
              categories={categories}
              payments={payments}
            />
          )}
        </div>
      </main>
    </div>
  );
}
