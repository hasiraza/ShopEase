import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDb, CategoryModel } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDb();

    if (req.method === 'GET') {
      const records = await CategoryModel.find({}).lean();
      return res.status(200).json(records);
    }

    if (req.method === 'POST') {
      const data = req.body;

      await CategoryModel.findOneAndUpdate(
        { category_id: data.category_id },
        data,
        { upsert: true, new: true }
      );

      return res.status(200).json({ success: true, data });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}