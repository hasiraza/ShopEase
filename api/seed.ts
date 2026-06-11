import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDb, CategoryModel, CustomerModel, ProductModel, OrderModel, OrderItemModel, PaymentModel } from './_db';

const INITIAL_CATEGORIES = [
  { category_id: 1, category_name: 'Electronics', description: 'Gadgets, mobile phones, laptops, and more' },
  { category_id: 2, category_name: 'Clothing', description: 'Apparel, casual wear, kurtas, and apparel accessories' },
  { category_id: 3, category_name: 'Books', description: 'Textbooks, guidebooks, and programming guides' },
  { category_id: 4, category_name: 'Home & Kitchen', description: 'Cookware sets, dinner plates, and home utilities' },
  { category_id: 5, category_name: 'Sports', description: 'Outdoor gears, football, cricket, and equipment' },
];

const INITIAL_CUSTOMERS = [
  { customer_id: 1, first_name: 'Ali', last_name: 'Hassan', email: 'ali.hassan@gmail.com', phone: '0300-1111111', city: 'Lahore', registration_date: '2023-01-10' },
  { customer_id: 2, first_name: 'Sara', last_name: 'Khan', email: 'sara.khan@gmail.com', phone: '0301-2222222', city: 'Karachi', registration_date: '2023-02-15' },
  { customer_id: 3, first_name: 'Usman', last_name: 'Raza', email: 'usman.raza@gmail.com', phone: '0302-3333333', city: 'Islamabad', registration_date: '2023-03-20' },
  { customer_id: 4, first_name: 'Ayesha', last_name: 'Malik', email: 'ayesha.malik@gmail.com', phone: '0303-4444444', city: 'Lahore', registration_date: '2023-04-05' },
  { customer_id: 5, first_name: 'Bilal', last_name: 'Ahmed', email: 'bilal.ahmed@gmail.com', phone: '0304-5555555', city: 'Faisalabad', registration_date: '2023-05-12' },
  { customer_id: 6, first_name: 'Hina', last_name: 'Yousaf', email: 'hina.yousaf@gmail.com', phone: '0305-6666666', city: 'Karachi', registration_date: '2023-06-18' },
  { customer_id: 7, first_name: 'Zain', last_name: 'Tariq', email: 'zain.tariq@gmail.com', phone: '0306-7777777', city: 'Lahore', registration_date: '2023-07-22' },
  { customer_id: 8, first_name: 'Nimra', last_name: 'Butt', email: 'nimra.butt@gmail.com', phone: '0307-8888888', city: 'Multan', registration_date: '2023-08-30' },
];

const INITIAL_PRODUCTS = [
  { product_id: 1, category_id: 1, product_name: 'Samsung Galaxy A54', price: 65000, stock_qty: 20, description: 'Super AMOLED display, 5G mobile phone' },
  { product_id: 2, category_id: 1, product_name: 'Lenovo IdeaPad 3', price: 95000, stock_qty: 10, description: 'Intel Core i3, 8GB RAM, 256GB SSD' },
  { product_id: 3, category_id: 1, product_name: 'JBL Bluetooth Speaker', price: 8500, stock_qty: 35, description: 'Portable wireless speaker with deep bass' },
  { product_id: 4, category_id: 2, product_name: 'Men Casual Shirt', price: 1500, stock_qty: 100, description: '100% cotton casual button-down shirt' },
  { product_id: 5, category_id: 2, product_name: 'Women Kurta', price: 2200, stock_qty: 80, description: 'Embroidered lawn kurta in medium size' },
  { product_id: 6, category_id: 3, product_name: 'Database Systems Book', price: 1200, stock_qty: 50, description: 'Complete reference for relational databases' },
  { product_id: 7, category_id: 3, product_name: 'Python Programming', price: 950, stock_qty: 60, description: 'Introductory book to code in Python' },
  { product_id: 8, category_id: 4, product_name: 'Non-stick Cookware Set', price: 4500, stock_qty: 25, description: 'Set of 3 non-stick cooking pots with glass lids' },
  { product_id: 9, category_id: 4, product_name: 'Dinner Plate Set', price: 2800, stock_qty: 40, description: 'Ceramic plates set of 6' },
  { product_id: 10, category_id: 5, product_name: 'Cricket Bat', price: 3500, stock_qty: 30, description: 'Premium English willow cricket bat' },
  { product_id: 11, category_id: 5, product_name: 'Football', price: 1800, stock_qty: 45, description: 'Standard size 5 leather football' },
  { product_id: 12, category_id: 1, product_name: 'USB-C Charging Cable', price: 450, stock_qty: 200, description: 'Fast charging braided nylon cable 1m' },
];

const INITIAL_ORDERS = [
  { order_id: 1001, customer_id: 1, order_date: '2024-01-15', status: 'DELIVERED', total_amount: 65900 },
  { order_id: 1002, customer_id: 2, order_date: '2024-02-10', status: 'DELIVERED', total_amount: 19800 },
  { order_id: 1003, customer_id: 3, order_date: '2024-02-28', status: 'DELIVERED', total_amount: 5500 },
  { order_id: 1004, customer_id: 4, order_date: '2024-03-05', status: 'DELIVERED', total_amount: 4500 },
  { order_id: 1005, customer_id: 5, order_date: '2024-03-24', status: 'CANCELLED', total_amount: 95000 },
  { order_id: 1006, customer_id: 6, order_date: '2024-04-12', status: 'DELIVERED', total_amount: 4400 },
  { order_id: 1007, customer_id: 7, order_date: '2024-04-29', status: 'SHIPPED', total_amount: 5300 },
  { order_id: 1008, customer_id: 8, order_date: '2024-05-02', status: 'DELIVERED', total_amount: 7500 },
  { order_id: 1009, customer_id: 1, order_date: '2024-05-18', status: 'PROCESSING', total_amount: 1800 },
  { order_id: 1010, customer_id: 2, order_date: '2024-06-01', status: 'DELIVERED', total_amount: 65000 },
  { order_id: 1011, customer_id: 3, order_date: '2024-06-08', status: 'SHIPPED', total_amount: 9000 },
  { order_id: 1012, customer_id: 4, order_date: '2024-06-10', status: 'PENDING', total_amount: 1200 },
];

const INITIAL_ORDER_ITEMS = [
  { item_id: 1, order_id: 1001, product_id: 1, quantity: 1, unit_price: 65000 },
  { item_id: 2, order_id: 1001, product_id: 12, quantity: 2, unit_price: 450 },
  { item_id: 3, order_id: 1002, product_id: 3, quantity: 2, unit_price: 8500 },
  { item_id: 4, order_id: 1002, product_id: 9, quantity: 1, unit_price: 2800 },
  { item_id: 5, order_id: 1003, product_id: 6, quantity: 3, unit_price: 1200 },
  { item_id: 6, order_id: 1003, product_id: 7, quantity: 2, unit_price: 950 },
  { item_id: 7, order_id: 1004, product_id: 8, quantity: 1, unit_price: 4500 },
  { item_id: 8, order_id: 1005, product_id: 2, quantity: 1, unit_price: 95000 },
  { item_id: 9, order_id: 1006, product_id: 5, quantity: 2, unit_price: 2200 },
  { item_id: 10, order_id: 1007, product_id: 10, quantity: 1, unit_price: 3500 },
  { item_id: 11, order_id: 1007, product_id: 11, quantity: 1, unit_price: 1800 },
  { item_id: 12, order_id: 1008, product_id: 4, quantity: 5, unit_price: 1500 },
  { item_id: 13, order_id: 1009, product_id: 12, quantity: 4, unit_price: 450 },
  { item_id: 14, order_id: 1010, product_id: 1, quantity: 1, unit_price: 65000 },
  { item_id: 15, order_id: 1011, product_id: 8, quantity: 2, unit_price: 4500 },
  { item_id: 16, order_id: 1012, product_id: 6, quantity: 1, unit_price: 1200 },
];

const INITIAL_PAYMENTS = [
  { payment_id: 501, order_id: 1001, payment_date: '2024-01-15', amount: 65900, payment_method: 'DEBIT_CARD', status: 'COMPLETED' },
  { payment_id: 502, order_id: 1002, payment_date: '2024-02-10', amount: 19800, payment_method: 'EASYPAISA', status: 'COMPLETED' },
  { payment_id: 503, order_id: 1003, payment_date: '2024-02-28', amount: 5500, payment_method: 'CREDIT_CARD', status: 'COMPLETED' },
  { payment_id: 504, order_id: 1004, payment_date: '2024-03-05', amount: 4500, payment_method: 'JAZZCASH', status: 'COMPLETED' },
  { payment_id: 505, order_id: 1005, payment_date: '2024-03-24', amount: 95000, payment_method: 'CREDIT_CARD', status: 'REFUNDED' },
  { payment_id: 506, order_id: 1006, payment_date: '2024-04-12', amount: 4400, payment_method: 'JAZZCASH', status: 'COMPLETED' },
  { payment_id: 507, order_id: 1007, payment_date: '2024-04-29', amount: 5300, payment_method: 'EASYPAISA', status: 'COMPLETED' },
  { payment_id: 508, order_id: 1008, payment_date: '2024-05-02', amount: 7500, payment_method: 'CASH', status: 'COMPLETED' },
  { payment_id: 509, order_id: 1009, payment_date: '2024-05-18', amount: 1800, payment_method: 'JAZZCASH', status: 'COMPLETED' },
  { payment_id: 510, order_id: 1010, payment_date: '2024-06-01', amount: 65000, payment_method: 'CREDIT_CARD', status: 'COMPLETED' },
  { payment_id: 511, order_id: 1011, payment_date: '2024-06-08', amount: 9000, payment_method: 'EASYPAISA', status: 'COMPLETED' },
  { payment_id: 512, order_id: 1012, payment_date: '2024-06-10', amount: 1200, payment_method: 'CREDIT_CARD', status: 'PENDING' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
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

    res.json({ success: true, message: 'Database seeded successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}