import { NextApiRequest, NextApiResponse } from 'next';
import Papa from 'papaparse';

// URL for the Google Sheets CSV export - update this with your actual blog posts sheet URL
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1IAWJ-SgDeHhZd3nClA22hufwlpfBWWlqgED-yid8ubmw95RjLHwNBv1CmAuCz2vM-vUkmkHuU0Z9/pub?gid=0&single=true&output=csv';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorImage: string;
  date: string;
  image: string;
  image2: string;
  image3: string;
  category: string;
  published: boolean;
  contentPost: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    const csv = await response.text();
    
    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
    
    console.log('Parsed CSV data:', parsed.data);
    
    const blogPosts = parsed.data.map((row: unknown, index: number) => {
      const postRow = row as Record<string, string>;
      
      // Generate ID from title if not provided
      const id = postRow.id || postRow.title?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || `post-${index + 1}`;
      
      return {
        id,
        title: postRow.title || '',
        content: postRow.content || '',
        author: postRow.author || '',
        authorImage: postRow.authorImage ,
        date: postRow.date || new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        image: postRow.image || '',
        image2: postRow.image2 || '',
        image3: postRow.image3 || '',
        contentPost: postRow.contentPost || '',
        category: postRow.category || 'JoinSangha Teams Blog',
        // For now, assume all posts are published if they have title and content
        published: !!(
          (typeof postRow.published === 'string' && (
            postRow.published.toLowerCase() === 'true' ||
            postRow.published === '1'
          )) ||
          (!postRow.published && postRow.title && postRow.content)
        )
      };
    }).filter((post) => post.title && post.content);

    // Sort by date (newest first)
    blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    console.log('Fetched blog posts:', blogPosts);

    res.status(200).json(blogPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Return fallback data if Google Sheets is unavailable
    const fallbackPosts = [
      {
        id: '1',
        title: 'Let Meditation Change Your Perspective – Stop the Nagging Habit Today',
        content: 'We\'ve all heard the phrase, "The glass is half full or half empty." The difference lies in perspective...',
        author: 'Jiaru Cai',
        date: 'May 22, 2024',
        image: '/jiaru-blog.png',
        authorImage: '/jiaru-cai.png',
        category: 'JoinSangha Teams Blog',
        published: true
      }
    ];
    
    res.status(200).json(fallbackPosts);
  }
}