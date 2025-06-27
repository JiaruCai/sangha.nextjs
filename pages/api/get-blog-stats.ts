import { NextApiRequest, NextApiResponse } from 'next';
import { getBlogStats, initializeDatabase } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initializeDatabase();
    
    const stats = await getBlogStats();

    return res.status(200).json(stats);

  } catch (err) {
    console.error('Error fetching blog stats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}