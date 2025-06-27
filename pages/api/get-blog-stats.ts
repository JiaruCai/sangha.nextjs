import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const statsFile = path.join(process.cwd(), 'public', 'blog-stats.json');
    
    let stats: Record<string, {views: number, likes: number}> = {};
    try {
      if (fs.existsSync(statsFile)) {
        stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
      }
    } catch {
      console.warn('Could not read stats file, returning empty stats');
    }

    return res.status(200).json(stats);

  } catch (err) {
    console.error('Error fetching blog stats:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}