import { NextApiRequest, NextApiResponse } from 'next';

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

    // For now, we'll use a simple file-based approach
    // In production, you might want to use Google Sheets or a database
    const fs = await import('fs');
    const path = await import('path');
    
    const statsFile = path.join(process.cwd(), 'public', 'blog-stats.json');
    
    let stats: Record<string, {views: number, likes: number}> = {};
    try {
      if (fs.existsSync(statsFile)) {
        stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
      }
    } catch {
      console.warn('Could not read stats file, starting fresh');
    }

    // Initialize post stats if not exists
    if (!stats[postId]) {
      stats[postId] = { views: 0, likes: 0 };
    }

    // Increment view count
    stats[postId].views += 0.5;

    // Write back to file
    fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));

    return res.status(200).json({ 
      success: true, 
      views: stats[postId].views,
      likes: stats[postId].likes 
    });

  } catch (err) {
    console.error('Error tracking blog view:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}