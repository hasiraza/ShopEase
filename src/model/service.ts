/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Customer, Product, Order, OrderItem, Payment } from '../types';

export interface DbStatus {
  isMongo: boolean;
  uriConfigured: boolean;
  connectionError: string;
}

// Check database connection mode
export async function fetchDbStatus(): Promise<DbStatus> {
  try {
    const res = await fetch('/api/db-status');
    if (!res.ok) throw new Error('Status check failed');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch store database status:', err);
    return {
      isMongo: false,
      uriConfigured: false,
      connectionError: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (err) {
    console.error('Error in fetchCategories:', err);
    return [];
  }
}

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch('/api/customers');
    if (!res.ok) throw new Error('Failed to fetch customers');
    return await res.json();
  } catch (err) {
    console.error('Error in fetchCustomers:', err);
    return [];
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (err) {
    console.error('Error in fetchProducts:', err);
    return [];
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (err) {
    console.error('Error in fetchOrders:', err);
    return [];
  }
}

export async function fetchOrderItems(): Promise<OrderItem[]> {
  try {
    const res = await fetch('/api/order-items');
    if (!res.ok) throw new Error('Failed to fetch order items');
    return await res.json();
  } catch (err) {
    console.error('Error in fetchOrderItems:', err);
    return [];
  }
}

export async function fetchPayments(): Promise<Payment[]> {
  try {
    const res = await fetch('/api/payments');
    if (!res.ok) throw new Error('Failed to fetch payments');
    return await res.json();
  } catch (err) {
    console.error('Error in fetchPayments:', err);
    return [];
  }
}

export async function addProductToDb(product: Product): Promise<void> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('Failed to add product');
  } catch (err) {
    console.error('Error in addProductToDb:', err);
    throw err;
  }
}

export async function addCustomerToDb(customer: Customer): Promise<void> {
  try {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    if (!res.ok) throw new Error('Failed to add customer');
  } catch (err) {
    console.error('Error in addCustomerToDb:', err);
    throw err;
  }
}

export async function addOrderToDb(order: Order): Promise<void> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to add order');
  } catch (err) {
    console.error('Error in addOrderToDb:', err);
    throw err;
  }
}

export async function addOrderItemToDb(item: OrderItem): Promise<void> {
  try {
    const res = await fetch('/api/order-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add order item');
  } catch (err) {
    console.error('Error in addOrderItemToDb:', err);
    throw err;
  }
}

export async function addPaymentToDb(payment: Payment): Promise<void> {
  try {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!res.ok) throw new Error('Failed to add payment');
  } catch (err) {
    console.error('Error in addPaymentToDb:', err);
    throw err;
  }
}

export async function updateProductStockInDb(productId: number, newStock: number, product: Product): Promise<void> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, stock_qty: newStock }),
    });
    if (!res.ok) throw new Error('Failed to update product stock');
  } catch (err) {
    console.error('Error in updateProductStockInDb:', err);
    throw err;
  }
}

export async function registerAdmin(email: string, password: string): Promise<{ success: boolean; user: { email: string } }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  return data;
}

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; user: { email: string } }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed');
  }
  return data;
}
