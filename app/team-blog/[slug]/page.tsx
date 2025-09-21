import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import { generateSeoMetadata } from '../../components/Seo';
import type { Metadata } from 'next';

interface BlogPost {
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

interface BlogStats {
  [postId: string]: {
    views: number;
    likes: number;
  };
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    // Use localhost in development
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://joinsangha.com');

    const res = await fetch(`${baseUrl}/api/get-blog-post?slug=${slug}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

async function getBlogStats(): Promise<BlogStats> {
  try {
    // Use localhost in development
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : (process.env.NEXT_PUBLIC_BASE_URL || 'https://joinsangha.com');

    const res = await fetch(`${baseUrl}/api/get-blog-stats`, {
      next: { revalidate: 10 } // Cache for 10 seconds
    });

    if (!res.ok) {
      return {};
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return {};
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    return generateSeoMetadata({
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
      url: `https://joinsangha.com/team-blog/${resolvedParams.slug}`
    });
  }

  const truncatedContent = post.content.length > 155
    ? post.content.substring(0, 152) + '...'
    : post.content;

  return generateSeoMetadata({
    title: post.title,
    description: truncatedContent,
    url: `https://joinsangha.com/team-blog/${resolvedParams.slug}`,
    image: post.image
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const [post, blogStats] = await Promise.all([
    getBlogPost(resolvedParams.slug),
    getBlogStats()
  ]);

  if (!post) {
    notFound();
  }

  return <BlogPostClient post={post} blogStats={blogStats} />;
}