import { NextApiRequest, NextApiResponse } from 'next';
import Papa from 'papaparse';

// URL for the Google Sheets CSV export - same as get-blog-posts
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1IAWJ-SgDeHhZd3nClA22hufwlpfBWWlqgED-yid8ubmw95RjLHwNBv1CmAuCz2vM-vUkmkHuU0Z9/pub?gid=0&single=true&output=csv';

export interface BlogPost {
  id: string;
  slug: string;
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

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ message: 'Slug is required' });
  }

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    const csv = await response.text();

    const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });

    const blogPosts = parsed.data.map((row: unknown, index: number) => {
      const postRow = row as Record<string, string>;

      // Generate ID from title if not provided
      const id = postRow.id || postRow.title?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || `post-${index + 1}`;

      // Generate slug from title
      const postSlug = postRow.slug || postRow.title?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
        || `post-${index + 1}`;

      return {
        id,
        slug: postSlug,
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

    // Find the blog post by slug
    const blogPost = blogPosts.find(post => post.slug === slug);

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.status(200).json(blogPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);

    // Return fallback data if Google Sheets is unavailable
    const fallbackPost = {
      id: '1',
      slug: 'let-meditation-change-your-perspective-stop-the-nagging-habit-today',
      title: 'Let Meditation Change Your Perspective – Stop the Nagging Habit Today',
      content: 'We\'ve all heard the phrase, "The glass is half full or half empty." The difference lies in perspective...',
      contentPost: 'We\'ve all heard the phrase, "The glass is half full or half empty." The difference lies in perspective...',
      author: 'Jiaru Cai',
      date: 'May 22, 2024',
      image: '/jiaru-blog.png',
      image2: '',
      image3: '',
      authorImage: '/jiaru-cai.png',
      category: 'JoinSangha Teams Blog',
      published: true
    };

    if (fallbackPost.slug === slug) {
      res.status(200).json(fallbackPost);
    } else {
      res.status(404).json({ message: 'Blog post not found' });
    }
  }
}