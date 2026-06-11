/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchProducts } from './service';

export async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const products = await fetchProducts();
    return products.length === 0;
  } catch (error) {
    console.error('Failed to check if database is empty:', error);
    return true;
  }
}

export async function seedDatabase(): Promise<void> {
  try {
    const res = await fetch('/api/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      throw new Error('Seed endpoint returned non-OK status');
    }
    console.log('Database successfully seeded with ShopEase test datasets via server!');
  } catch (error) {
    console.error('Failed to seed MongoDB database:', error);
    throw error;
  }
}
