import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  connectDb,
  CategoryModel,
  CustomerModel,
  ProductModel,
  OrderModel,
  OrderItemModel,
  PaymentModel
} from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDb();

    await CategoryModel.deleteMany({});
    await CategoryModel.insertMany(INITIAL_CATEGORIES);

    await CustomerModel.deleteMany({});
    await CustomerModel.insertMany(INITIAL_CUSTOMERS);

    await ProductModel.deleteMany({});
    await ProductModel.insertMany(INITIAL_PRODUCTS);

    await OrderModel.deleteMany({});
    await OrderModel.insertMany(INITIAL_ORDERS);

    await OrderItemModel.deleteMany({});
    await OrderItemModel.insertMany(INITIAL_ORDER_ITEMS);

    await PaymentModel.deleteMany({});
    await PaymentModel.insertMany(INITIAL_PAYMENTS);

    return res.status(200).json({
      success: true,
      message: 'Database seeded successfully.'
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}