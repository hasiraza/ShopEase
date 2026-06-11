/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  category_id: number;
  category_name: string;
  description: string;
}

export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  registration_date: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  order_id: number;
  customer_id: number;
  order_date: string;
  status: OrderStatus;
  total_amount: number;
}

export interface Product {
  product_id: number;
  category_id: number;
  product_name: string;
  price: number;
  stock_qty: number;
  description: string;
}

export interface OrderItem {
  item_id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'EASYPAISA' | 'JAZZCASH';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  payment_id: number;
  order_id: number;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
}

/**
 * Currency formatter following PKR formatting rules
 */
export function formatCurrency(amount: number): string {
  return `PKR ${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Date formatter converting "YYYY-MM-DD" style dates to "DD MMM YYYY"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parts[2].padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${months[monthIndex]} ${year}`;
    }
  }
  
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
