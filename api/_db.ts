/**
 * Shared MongoDB connection for Vercel serverless functions.
 * Reuses existing connection across warm invocations.
 */
import mongoose, { Schema } from 'mongoose';

mongoose.set('bufferCommands', false);

let isConnected = false;

export async function connectDb() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || '';
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  isConnected = true;
}

export const CategoryModel = mongoose.models.Category || mongoose.model('Category', new Schema({
  category_id: { type: Number, required: true, unique: true },
  category_name: { type: String, required: true },
  description: { type: String, required: true },
}));

export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', new Schema({
  customer_id: { type: Number, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  registration_date: { type: String, required: true },
}));

export const ProductModel = mongoose.models.Product || mongoose.model('Product', new Schema({
  product_id: { type: Number, required: true, unique: true },
  category_id: { type: Number, required: true },
  product_name: { type: String, required: true },
  price: { type: Number, required: true },
  stock_qty: { type: Number, required: true },
  description: { type: String, required: true },
}));

export const OrderModel = mongoose.models.Order || mongoose.model('Order', new Schema({
  order_id: { type: Number, required: true, unique: true },
  customer_id: { type: Number, required: true },
  order_date: { type: String, required: true },
  status: { type: String, required: true },
  total_amount: { type: Number, required: true },
}));

export const OrderItemModel = mongoose.models.OrderItem || mongoose.model('OrderItem', new Schema({
  item_id: { type: Number, required: true, unique: true },
  order_id: { type: Number, required: true },
  product_id: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit_price: { type: Number, required: true },
}));

export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', new Schema({
  payment_id: { type: Number, required: true, unique: true },
  order_id: { type: Number, required: true },
  payment_date: { type: String, required: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, required: true },
  status: { type: String, required: true },
}));

export const UserModel = mongoose.models.User || mongoose.model('User', new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));