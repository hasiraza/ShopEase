import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDb, UserModel } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await connectDb();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    let user = await UserModel.findOne({ email });
    if (!user) {
      // Auto-register on first login
      user = new UserModel({ email, password });
      await user.save();
    } else if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password credentials.' });
    }
    res.json({ success: true, user: { email } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}