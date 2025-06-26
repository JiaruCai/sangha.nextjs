"use client";

import React from 'react';
import Image from 'next/image';
import NavBar from '../download/NavBar';
import Footer from '../career/Footer';

type BlogPostData = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorImage: string;
  date: string;
  image: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
};

interface BlogPostProps {
  post: BlogPostData;
  onBack?: () => void;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, onBack }) => {
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
          <p className="font-arsenal text-sm sm:text-base text-[#BF608F] max-w-xl mt-3">Stories in the JoinSangha team diary. Latest best practices, news, and trends, directly from the team's writers.</p>
        </div>
      </div>
      {/* Blog Post Content */}
      <div className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[#BF608F] hover:text-[#9F4A77] mb-6 font-arsenal transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Blogs
          </button>
        )}
        <article>
          <div className="p-4 sm:p-8 lg:p-12">
            {/* Blog Post Header */}
            <header className="mb-6 sm:mb-8">
              <h1 className="font-arsenal font-bold text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-4 sm:mb-6 leading-tight">
                {post.title}
              </h1>
              
              {/* Author Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden">
                  <Image 
                    src={post.authorImage || '/default-avatar.png'} 
                    alt={post.author} 
                    width={48} 
                    height={48} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-col items-center gap-2 text-sm text-gray-600">
                  <span className="font-arsenal font-medium">{post.author} <br className="hidden sm:block" /> {post.date}</span>
                </div>
              </div>
            </header>

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none">
              <p className="font-arsenal text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
              We’ve all heard the phrase, "The glass is half full or half empty." The difference lies in perspective. The optimist sees the glass as half full, appreciating what’s there, while the pessimist focuses on the emptiness, letting it consume their thoughts and mood. Over time, this negative focus can lead to feelings of frustration, stress, and even depression.
              <br></br>
              Have you ever felt a shift in your friendships? Maybe someone close to you has started distancing themselves. You might think, "Why is this happening? I was just sharing my life, my struggles." It’s easy to feel confused, but sometimes, the issue lies in how we express ourselves.
              <br></br><br></br>
              "I shared how difficult things are with my family. Why is she pulling away from me?" you might ask.
              <br></br>
              “How often have you shared this with her recently?”
              <br></br>
              “A few times, I guess.”
              <br></br>
              "Why do you think she's distancing herself?"
              <br></br>
              “I don’t know... Maybe she’s tired of hearing about it. But isn’t that what friends are for? To be there when things get tough?”
              <br></br><br></br>
              The truth is, it’s not that your friend doesn’t care. It could be that your continuous venting without taking a moment to process your feelings is draining for them. We all tend to get into the habit of unconsciously complaining or ‘nagging,’ trying to get sympathy or support. Often, this habit stems from childhood, when we cried or complained to our parents, and they responded by giving us what we wanted. As adults, we still carry that tendency, but it’s time to change.
              <br></br><br></br>
              So, how can we break this cycle? It starts with self-awareness.
              <br></br>
              <br></br> 
              Instead of immediately venting, take a step back and meditate. This allows you to observe your thoughts without judgment. Ask yourself: Why do I feel upset about my family situation? Why am I angry at my partner’s financial decision? What’s making me jealous of my coworker’s promotion? By acknowledging these emotions first, you gain clarity and understanding, which prevents you from unintentionally passing your unresolved feelings onto others.              </p>
                            
              {/* First Image */}
              <div className="my-6 sm:my-8 rounded-lg overflow-hidden aspect-[16/9] w-full">
                <Image 
                  src="/jiaru-blog1.png" 
                  alt="Meditation scene" 
                  width={800} 
                  height={400} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <p className="font-arsenal text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
              The next step is journaling. Writing down your thoughts gives you the space to reflect deeply. It’s about understanding your emotions before expressing them.              
              </p>

              {/* Second Image */}
              <div className="my-6 sm:my-8 rounded-lg overflow-hidden aspect-[16/9] w-full">
                <Image 
                  src="/jiaru-blog2.png" 
                  alt="Person meditating in nature" 
                  width={800} 
                  height={400} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <p className="font-arsenal text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                When you do decide to share your feelings with those close to you, express them from a place of understanding, not from a need to unload. This helps prevent repetitive complaints and ensures that when you share, your feelings are heard and understood. This deeper reflection and healthier communication are key to strengthening your relationships and your own emotional well-being.
                <br></br><br></br>
                Perhaps right now, you feel overwhelmed, disappointed, and unsupported. Your parents may feel overbearing, and your friends might seem distant. You might be staring at that half-empty glass. But what if you took a moment to pause and meditate instead?
              </p>
              
              {/* Third Image */}
              <div className="my-6 sm:my-8 rounded-lg overflow-hidden aspect-[16/9] w-full">
                <Image 
                  src="/jiaru-blog3.png" 
                  alt="Peaceful meditation setting" 
                  width={800} 
                  height={400} 
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="font-arsenal text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                As you meditate, consider this: What are three things you feel grateful for today? For example: I feel grateful that my parents are always ready to help me. I just need to communicate healthy boundaries to improve our relationship. I feel grateful that my friend is always there to listen when I’m feeling down. I feel grateful for the beautiful weather today, which I finally noticed after being caught up in the tension of everyday life.
                <br></br>
                Meditate today, and begin to see the glass as half full.
              </p>

            </div>
          </div>
        </article>
        {/* Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[#BF608F] hover:text-[#9F4A77] mb-6 font-arsenal transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Blogs
          </button>
        )}
      </div>
      <footer className="relative bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF] to-[#FFFFFF] sm:pt-24 lg:pt-30 pb-8 sm:pb-12 lg:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Round SVG - Full Coverage */}
      <div className="absolute inset-0 pointer-events-none">
        <Image 
          src="/round.svg" 
          alt="" 
					fill
          className=" sm:w-2000 sm:h-2000 lg:translate-y-30 object-cover"
        />
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
        <div className="relative w-full h-full flex items-center justify-center lg:translate-x-16 -translate-y-4 lg:-translate-y-0 overflow-visible">
          <Image 
            src="/mind-illustration.svg" 
            alt="" 
            width={700}
            height={1100} 
            className="object-contain opacity-100 translate-y-40 md:translate-y-0 md:translate-x-30 w-30 sm:w-96 md:w-[600px] lg:w-[700px] h-auto"
          />
        </div>
      </div>

      <div className="relative lg:translate-y-10 max-w-6xl mx-auto">
        {/* Testimonials Section - Add space for testimonials above main content */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          {/* This space is reserved for testimonials that appear above the main footer content */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 lg:translate-y-10 items-start">
          
          {/* Left Column - Content */}
          <div className="space-y-10 sm:space-y-6 text-center md:text-left">
            <div>
              <h3 className="font-arsenal font-bold text-black text-2xl text-4xl sm:text-3xl lg:text-3xl mb-4 sm:mb-6">
                Ready to get started?
              </h3>
            </div>
            
            {/* App Store Buttons */}
            <div className="flex items-center flex-col sm:flex-row gap-6 sm:gap-4 mb-6 sm:mb-8 justify-center md:justify-start">
              <a 
                href="#" 
                className="inline-block hover:opacity-80 transition-opacity transform transition-transform duration-200 ease-out hover:-translate-y-1"
                aria-label="Download on the App Store"
              >
                <Image 
                  src="/app-store-badge.svg" 
                  alt="Download on the App Store" 
                  width={160} 
                  height={48}
                  className="h-10 sm:h-12 w-auto"
                />
              </a>
              
              <a 
                href="#" 
                className="inline-block hover:opacity-80 transition-opacity transform transition-transform duration-200 ease-out hover:-translate-y-1"
                aria-label="Get it on Google Play"
              >
                <Image 
                  src="/google-play-badge.svg" 
                  alt="Get it on Google Play" 
                  width={160} 
                  height={48}
                  className="h-10 sm:h-12 w-auto"
                />
              </a>
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center space-x-3 sm:space-x-4 justify-center md:justify-start">
              <p className="font-arsenal text-black text-sm sm:text-base font-medium">Follow us on:</p>
              <div className="flex space-x-3 sm:space-x-4">
                <a 
                  href="#" 
                  className="hover:opacity-80 transition-opacity transform transition-transform duration-200 ease-out hover:-translate-y-1"
                  aria-label="Follow us on Instagram"
                >
                  <Image 
                    src="/ins.svg" 
                    alt="Instagram" 
                    width={32} 
                    height={32}
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </a>
                
                <a 
                  href="#" 
                  className="hover:opacity-80 transition-opacity transform transition-transform duration-200 ease-out hover:-translate-y-1"
                  aria-label="Follow us on Facebook"
                >
                  <Image 
                    src="/fb.svg" 
                    alt="Facebook" 
                    width={32} 
                    height={32}
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </a>
                
                <a 
                  href="https://www.linkedin.com/company/familia-io/" 
                  className="hover:opacity-80 transition-opacity transform transition-transform duration-200 ease-out hover:-translate-y-1"
                  aria-label="Follow us on LinkedIn"
                >
                  <Image 
                    src="/linkedin.svg" 
                    alt="LinkedIn" 
                    width={32} 
                    height={32}
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Column - Decorative Space */}
          <div className="hidden md:block">
            {/* This space is reserved for the decorative elements positioned absolutely */}
          </div>
          </div>
        
          {/* Copyright */}
          <div className="mt-12 sm:mt-16 pt-4 sm:pt-6">
            <p className="font-bold text-black font-arsenal text-sm sm:text-base translate-y-4 sm:translate-y-6 lg:translate-y-25 text-center md:text-right">
            © 2025, FAMILIA IO, Inc.
          	</p>
        	</div>
      	</div>
    	</footer>
    </main>
  );
};

export default BlogPost; 