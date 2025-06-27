import { NextApiRequest, NextApiResponse } from 'next';
import { getBlogStats, initializeDatabase } from '../../lib/db';

interface DbError extends Error {
  code?: string;
}

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
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      code: (err as DbError)?.code,
      stack: err instanceof Error ? err.stack : undefined,
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
}