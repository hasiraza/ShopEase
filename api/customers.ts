import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDb, CustomerModel } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDb();
    if (req.method === 'GET') {
      const records = await CustomerModel.find({}).lean();
      return res.json(records);
    }
    if (req.method === 'POST') {
      const data = req.body;
      await CustomerModel.findOneAndUpdate({ customer_id: data.customer_id }, data, { upsert: true, new: true });
      return res.json({ success: true, data });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}