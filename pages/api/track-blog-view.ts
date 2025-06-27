import { NextApiRequest, NextApiResponse } from 'next';
import { updateBlogStats, initializeDatabase } from '../../lib/db';

interface DbError extends Error {
  code?: string;
}

const rateLimit = new Map();

function rateLimitCheck(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  
  const validRequests = userRequests.filter((time: number) => now - time < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false;
  }
  
  validRequests.push(now);
  rateLimit.set(ip, validRequests);
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp;

  if (!rateLimitCheck(ip, 10, 60000)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    await initializeDatabase();
    
    const stats = await updateBlogStats(postId, 'view', 0.5);

    return res.status(200).json({ 
      success: true, 
      views: stats.views,
      likes: stats.likes 
    });

  } catch (err) {
    console.error('Error tracking blog view:', err);
    console.error('Error details:', {
      message: err instanceof Error ? err.message : 'Unknown error',
      code: (err as DbError)?.code,
      stack: err instanceof Error ? err.stack : undefined,
      env: {
        POSTGRES_URL: !!process.env.POSTGRES_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
}