"use client";

import React from 'react';
import Image from 'next/image';
import NavBar from '../download/NavBar';

type BlogPostData = {
  id: string;
  title: string;
  content: string;
  contentPost: string;
  author: string;
  authorImage: string;
  date: string;
  image: string; // Used for thumbnail in blog listings
  views: number;
  likes: number;
  comments: number;
  category: string;
};

interface BlogPostProps {
  post: BlogPostData;
  onBack?: () => void;
  blogStats?: Record<string, {views: number, likes: number}>;
}

// Function to parse content and insert images based on inline markers
const parseContentWithImages = (contentPost: string) => {
  if (!contentPost) return [];
  
  // Define regex patterns for different image marker formats
  const imagePatterns = [
    /\[IMAGE:(.*?)\]/g,                    // [IMAGE:url]
    /\[IMG\](.*?)\[\/IMG\]/g,              // [IMG]url[/IMG]
    /!\[(.*?)\]\((.*?)\)/g,                // ![alt](url) - Markdown style
  ];
  
  const contentElements: Array<{ type: 'text' | 'image'; content: string; alt?: string; index: number }> = [];
  let lastIndex = 0;
  let elementIndex = 0;
  
  // Find all image markers and their positions
  const imageMatches: Array<{ match: RegExpExecArray; pattern: number; start: number; end: number }> = [];
  
  imagePatterns.forEach((pattern, patternIndex) => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    while ((match = regex.exec(contentPost)) !== null) {
      imageMatches.push({
        match,
        pattern: patternIndex,
        start: match.index,
        end: match.index + match[0].length
      });
    }
  });
  
  // Sort matches by position in text
  imageMatches.sort((a, b) => a.start - b.start);
  
  // Process content between image markers
  imageMatches.forEach((imageMatch) => {
    // Add text content before this image
    if (imageMatch.start > lastIndex) {
      const textContent = contentPost.slice(lastIndex, imageMatch.start).trim();
      if (textContent) {
        // Split text into paragraphs
        const paragraphs = textContent.split(/\n\n+/).filter(p => p.trim());
        paragraphs.forEach(paragraph => {
          contentElements.push({
            type: 'text',
            content: paragraph.trim(),
            index: elementIndex++
          });
        });
      }
    }
    
    // Add image
    let imageUrl = '';
    let altText = '';
    
    if (imageMatch.pattern === 0) {
      // [IMAGE:url] format
      imageUrl = imageMatch.match[1]?.trim() || '';
    } else if (imageMatch.pattern === 1) {
      // [IMG]url[/IMG] format
      imageUrl = imageMatch.match[1]?.trim() || '';
    } else if (imageMatch.pattern === 2) {
      // ![alt](url) format
      altText = imageMatch.match[1]?.trim() || '';
      imageUrl = imageMatch.match[2]?.trim() || '';
    }
    
    if (imageUrl) {
      contentElements.push({
        type: 'image',
        content: imageUrl,
        alt: altText || 'Blog post image',
        index: elementIndex++
      });
    }
    
    lastIndex = imageMatch.end;
  });
  
  // Add any remaining text after the last image
  if (lastIndex < contentPost.length) {
    const remainingText = contentPost.slice(lastIndex).trim();
    if (remainingText) {
      const paragraphs = remainingText.split(/\n\n+/).filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        contentElements.push({
          type: 'text',
          content: paragraph.trim(),
          index: elementIndex++
        });
      });
    }
  }
  
  // If no image markers were found, treat the entire content as text paragraphs
  if (imageMatches.length === 0) {
    const paragraphs = contentPost.split(/\n\n+/).filter(p => p.trim());
    if (paragraphs.length <= 1) {
      // Try single line breaks if double breaks don't work well
      paragraphs.splice(0, paragraphs.length, ...contentPost.split('\n').filter(p => p.trim()));
    }
    
    paragraphs.forEach(paragraph => {
      contentElements.push({
        type: 'text',
        content: paragraph.trim(),
        index: elementIndex++
      });
    });
  }
  
  return contentElements;
};

const BlogPost: React.FC<BlogPostProps> = ({ post, onBack, blogStats }) => {
  const [currentStats, setCurrentStats] = React.useState({
    views: blogStats?.[post.id]?.views || post.views,
    likes: blogStats?.[post.id]?.likes || post.likes,
    isLiked: false
  });

  // Parse the dynamic content with images
  const contentElements = parseContentWithImages(post.contentPost || post.content);

  // Track view when component mounts
  React.useEffect(() => {
    const trackView = async () => {
      try {
        const response = await fetch('/api/track-blog-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId: post.id }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentStats(prev => ({
            ...prev,
            views: data.views,
            likes: data.likes
          }));
        }
      } catch (error) {
        console.warn('Could not track view:', error);
      }
    };
    
    trackView();
  }, [post.id]);

  const handleLike = async () => {
    try {
      const action = currentStats.isLiked ? 'unlike' : 'like';
      const response = await fetch('/api/track-blog-like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id, action }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentStats(prev => ({
          ...prev,
          likes: data.likes,
          isLiked: !prev.isLiked
        }));
      }
    } catch (error) {
      console.warn('Could not update like:', error);
    }
  };
  return (
    <main className="relative min-h-screen bg-white flex flex-col overflow-x-hidden">
      <NavBar />
      {/* Header Background - Full Width, Fixed Height */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-[#FEDEEE]" style={{height: '290px'}}>
        <div className="max-w-7xl mx-auto h-full flex flex-col justify-center px-5 sm:px-10 lg:px-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-15 gap-4">
            <h1 className="font-arsenal font-bold text-2xl sm:text-4xl lg:text-5xl text-[#BF608F]">JoinSangha Teams Blog</h1>
            <form className="relative w-full max-w-xs md:w-80 bg-white md:ml-4 flex-shrink-10 mt-3 lg:mt-10 md:mt-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-gray-400"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <input type="text" placeholder="Search this community" className="border border-gray-200 text-black rounded pl-10 pr-3 py-1.5 text-sm w-full focus:outline-none" />
            </form>
          </div>
          <p className="font-arsenal text-sm sm:text-base text-[#BF608F] max-w-xl mt-3">Stories in the JoinSangha team diary. Latest best practices, news, and trends, directly from the team&apos;s writers.</p>
        </div>
      </div>
      {/* Blog Post Content */}
      <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center text-[#BF608F] hover:text-[#a34e7a] mb-6 font-arsenal text-sm"
          >
            ← Back to Blog
          </button>
        )}

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="bg-[#BF608F] text-white px-2 py-1 rounded text-xs font-arsenal">{post.category}</span>
              <span className="font-arsenal">{post.date}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="font-arsenal">{currentStats.views} views</span>
              <button 
                onClick={handleLike}
                className={`font-arsenal flex items-center gap-1 transition-colors ${
                  currentStats.isLiked ? 'text-[#BF608F]' : 'text-gray-500 hover:text-[#BF608F]'
                }`}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill={currentStats.isLiked ? 'currentColor' : 'none'} 
                  className="transition-colors"
                >
                  <path 
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  />
                </svg>
                {currentStats.likes}
              </button>
              <span className="font-arsenal">{post.comments} comments</span>
            </div>
          </div>
          
          <h1 className="font-arsenal font-bold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-6">{post.title}</h1>
          
          <div className="flex items-center space-x-4 pb-6 border-b border-gray-200">
            <Image 
              src={post.authorImage} 
              alt={post.author}
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <p className="font-arsenal font-bold text-gray-900">{post.author}</p>
              <p className="font-arsenal text-sm text-gray-500">Team Member</p>
            </div>
          </div>
        </header>

        {/* Dynamic Blog Content */}
        <div className="prose prose-lg max-w-none">
          {contentElements.map((element) => {
            if (element.type === 'text') {
              return (
                <p key={element.index} className="font-arsenal text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                  {element.content.split('\n').map((line, lineIndex) => (
                    <span key={lineIndex}>
                      {line}
                      {lineIndex < element.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              );
            } else if (element.type === 'image') {
              return (
                <div key={element.index} className="my-6 sm:my-8 rounded-lg overflow-hidden aspect-[16/9] w-full">
                  <Image 
                    src={element.content}
                    alt={element.alt || "Blog post illustration"}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            }
            return null;
          })}
          
          {/* Fallback content if no contentPost */}
          {contentElements.length === 0 && (
            <p className="font-arsenal text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
              {post.content || "Content coming soon..."}
            </p>
          )}
        </div>

        {/* Author Bio */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-4">
            <Image 
              src={post.authorImage} 
              alt={post.author}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <h3 className="font-arsenal font-bold text-lg text-gray-900 mb-2">{post.author}</h3>
              <p className="font-arsenal text-gray-600 text-sm">
                {post.author} is a mindfulness practitioner and writer on the JoinSangha team, passionate about helping others find balance and peace in their daily lives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BlogPost;