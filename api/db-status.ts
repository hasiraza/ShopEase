import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDb } from './_db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const uriConfigured = !!process.env.MONGODB_URI;

  try {
    await connectDb();

    return res.status(200).json({
      isMongo: true,
      uriConfigured,
      connectionError: ''
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    return res.status(500).json({
      isMongo: false,
      uriConfigured,
      connectionError: message
    });
  }
}