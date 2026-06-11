// /**
//  * @license
//  * SPDX-License-Identifier: Apache-2.0
//  */

// import { Category, Customer, Product, Order, OrderItem, Payment } from '../types';

// export interface DbStatus {
//   isMongo: boolean;
//   uriConfigured: boolean;
//   connectionError: string;
// }

// // Check database connection mode
// export async function fetchDbStatus(): Promise<DbStatus> {
//   try {
//     const res = await fetch('/api/db-status');
//     if (!res.ok) throw new Error('Status check failed');
//     return await res.json();
//   } catch (err) {
//     console.error('Failed to fetch store database status:', err);
//     return {
//       isMongo: false,
//       uriConfigured: false,
//       connectionError: err instanceof Error ? err.message : String(err),
//     };
//   }
// }

// export async function fetchCategories(): Promise<Category[]> {
//   try {
//     const res = await fetch('/api/categories');
//     if (!res.ok) throw new Error('Failed to fetch categories');
//     return await res.json();
//   } catch (err) {
//     console.error('Error in fetchCategories:', err);
//     return [];
//   }
// }

// export async function fetchCustomers(): Promise<Customer[]> {
//   try {
//     const res = await fetch('/api/customers');
//     if (!res.ok) throw new Error('Failed to fetch customers');
//     return await res.json();
//   } catch (err) {
//     console.error('Error in fetchCustomers:', err);
//     return [];
//   }
// }

// export async function fetchProducts(): Promise<Product[]> {
//   try {
//     const res = await fetch('/api/products');
//     if (!res.ok) throw new Error('Failed to fetch products');
//     return await res.json();
//   } catch (err) {
//     console.error('Error in fetchProducts:', err);
//     return [];
//   }
// }

// export async function fetchOrders(): Promise<Order[]> {
//   try {
//     const res = await fetch('/api/orders');
//     if (!res.ok) throw new Error('Failed to fetch orders');
//     return await res.json();
//   } catch (err) {
//     console.error('Error in fetchOrders:', err);
//     return [];
//   }
// }

// export async function fetchOrderItems(): Promise<OrderItem[]> {
//   try {
//     const res = await fetch('/api/order-items');
//     if (!res.ok) throw new Error('Failed to fetch order items');
//     return await res.json();
//   } catch (err) {
//     console.error('Error in fetchOrderItems:', err);
//     return [];
//   }
// }

// export async function fetchPayments(): Promise<Payment[]> {
//   try {
//     const res = await fetch('/api/payments');
//     if (!res.ok) throw new Error('Failed to fetch payments');
//     return await res.json();
//   } catch (err) {
//     console.error('Error in fetchPayments:', err);
//     return [];
//   }
// }

// export async function addProductToDb(product: Product): Promise<void> {
//   try {
//     const res = await fetch('/api/products', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(product),
//     });
//     if (!res.ok) throw new Error('Failed to add product');
//   } catch (err) {
//     console.error('Error in addProductToDb:', err);
//     throw err;
//   }
// }

// export async function addCustomerToDb(customer: Customer): Promise<void> {
//   try {
//     const res = await fetch('/api/customers', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(customer),
//     });
//     if (!res.ok) throw new Error('Failed to add customer');
//   } catch (err) {
//     console.error('Error in addCustomerToDb:', err);
//     throw err;
//   }
// }

// export async function addOrderToDb(order: Order): Promise<void> {
//   try {
//     const res = await fetch('/api/orders', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(order),
//     });
//     if (!res.ok) throw new Error('Failed to add order');
//   } catch (err) {
//     console.error('Error in addOrderToDb:', err);
//     throw err;
//   }
// }

// export async function addOrderItemToDb(item: OrderItem): Promise<void> {
//   try {
//     const res = await fetch('/api/order-items', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(item),
//     });
//     if (!res.ok) throw new Error('Failed to add order item');
//   } catch (err) {
//     console.error('Error in addOrderItemToDb:', err);
//     throw err;
//   }
// }

// export async function addPaymentToDb(payment: Payment): Promise<void> {
//   try {
//     const res = await fetch('/api/payments', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payment),
//     });
//     if (!res.ok) throw new Error('Failed to add payment');
//   } catch (err) {
//     console.error('Error in addPaymentToDb:', err);
//     throw err;
//   }
// }

// export async function updateProductStockInDb(productId: number, newStock: number, product: Product): Promise<void> {
//   try {
//     const res = await fetch('/api/products', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ ...product, stock_qty: newStock }),
//     });
//     if (!res.ok) throw new Error('Failed to update product stock');
//   } catch (err) {
//     console.error('Error in updateProductStockInDb:', err);
//     throw err;
//   }
// }

// export async function registerAdmin(email: string, password: string): Promise<{ success: boolean; user: { email: string } }> {
//   const res = await fetch('/api/auth/register', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password }),
//   });
//   const data = await res.json();
//   if (!res.ok) {
//     throw new Error(data.error || 'Registration failed');
//   }
//   return data;
// }

// export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; user: { email: string } }> {
//   const res = await fetch('/api/auth/login', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ email, password }),
//   });
//   const data = await res.json();
//   if (!res.ok) {
//     throw new Error(data.error || 'Authentication failed');
//   }
//   return data;
// }

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Fully offline service layer — all data stored in localStorage.
 * No backend or API routes required. Works on Vercel out of the box.
 */

import { Category, Customer, Product, Order, OrderItem, Payment } from '../types';

export interface DbStatus {
  isMongo: boolean;
  uriConfigured: boolean;
  connectionError: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lsGet<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function lsSet<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ---------------------------------------------------------------------------
// DB Status — always returns sandbox mode on Vercel
// ---------------------------------------------------------------------------

export async function fetchDbStatus(): Promise<DbStatus> {
  return {
    isMongo: false,
    uriConfigured: false,
    connectionError: '',
  };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function registerAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; user: { email: string } }> {
  const existing = localStorage.getItem('shopease_registered_email');
  if (existing === email) {
    throw new Error('An account with this email already exists. Please sign in.');
  }
  localStorage.setItem('shopease_registered_email', email);
  localStorage.setItem('shopease_registered_password', password);
  return { success: true, user: { email } };
}

export async function loginAdmin(
  email: string,
  password: string
): Promise<{ success: boolean; user: { email: string } }> {
  const storedEmail = localStorage.getItem('shopease_registered_email');
  const storedPassword = localStorage.getItem('shopease_registered_password');

  // First-time / demo mode — no account registered yet
  if (!storedEmail && !storedPassword) {
    return { success: true, user: { email } };
  }

  if (email !== storedEmail || password !== storedPassword) {
    throw new Error('Incorrect email or password. Please try again.');
  }

  return { success: true, user: { email } };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function fetchCategories(): Promise<Category[]> {
  return lsGet<Category>('shopease_categories');
}

export async function addCategoryToDb(category: Category): Promise<void> {
  const all = lsGet<Category>('shopease_categories');
  all.push(category);
  lsSet('shopease_categories', all);
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function fetchCustomers(): Promise<Customer[]> {
  return lsGet<Customer>('shopease_customers');
}

export async function addCustomerToDb(customer: Customer): Promise<void> {
  const all = lsGet<Customer>('shopease_customers');
  all.push(customer);
  lsSet('shopease_customers', all);
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function fetchProducts(): Promise<Product[]> {
  return lsGet<Product>('shopease_products');
}

export async function addProductToDb(product: Product): Promise<void> {
  const all = lsGet<Product>('shopease_products');
  // Replace if exists, otherwise push
  const idx = all.findIndex((p) => p.product_id === product.product_id);
  if (idx !== -1) {
    all[idx] = product;
  } else {
    all.push(product);
  }
  lsSet('shopease_products', all);
}

export async function updateProductStockInDb(
  productId: number,
  newStock: number,
  product: Product
): Promise<void> {
  const all = lsGet<Product>('shopease_products');
  const idx = all.findIndex((p) => p.product_id === productId);
  if (idx !== -1) {
    all[idx] = { ...product, stock_qty: newStock };
    lsSet('shopease_products', all);
  }
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function fetchOrders(): Promise<Order[]> {
  return lsGet<Order>('shopease_orders');
}

export async function addOrderToDb(order: Order): Promise<void> {
  const all = lsGet<Order>('shopease_orders');
  all.push(order);
  lsSet('shopease_orders', all);
}

// ---------------------------------------------------------------------------
// Order Items
// ---------------------------------------------------------------------------

export async function fetchOrderItems(): Promise<OrderItem[]> {
  return lsGet<OrderItem>('shopease_order_items');
}

export async function addOrderItemToDb(item: OrderItem): Promise<void> {
  const all = lsGet<OrderItem>('shopease_order_items');
  all.push(item);
  lsSet('shopease_order_items', all);
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export async function fetchPayments(): Promise<Payment[]> {
  return lsGet<Payment>('shopease_payments');
}

export async function addPaymentToDb(payment: Payment): Promise<void> {
  const all = lsGet<Payment>('shopease_payments');
  all.push(payment);
  lsSet('shopease_payments', all);
}