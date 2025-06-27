"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useScrollAnimation } from '../useScrollAnimation';
import Footer from '../career/Footer';
import NavBar from '../download/NavBar';
import BlogPost from './BlogPost';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRcQdRytGznfkar_e-DexGkIKYmxZGZN5e7BIZgs6APETdlwcHd4RYP1w21vx7A6J6wYJ-Qfq74yob-/pub?output=csv';
type TeamMember = {
  name: string;
  role: string;
  img: string;
};

type BlogPost = {
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

function parseCSV(csv: string): TeamMember[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const nameIdx = headers.findIndex(h => h.toLowerCase().includes('name'));
  const roleIdx = headers.findIndex(h => h.toLowerCase().includes('role'));
  const imgIdx = headers.findIndex(h => h.toLowerCase().includes('profile'));
  return lines.slice(1).map(line => {
    // Handle quoted fields and commas in values
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return {
      name: values[nameIdx]?.replace(/^"|"$/g, ''),
      role: values[roleIdx]?.replace(/^"|"$/g, ''),
      img: values[imgIdx]?.replace(/^"|"$/g, '').trim(),
    };
  });
}

// Function to arrange team members in center-outward pattern
function arrangeMembersForDisplay(members: TeamMember[]): (TeamMember | null)[] {
    const totalMembers = members.length;
    if (totalMembers === 0) return [];
    
    // Calculate how many complete rows of 3 we need
    const completeRows = Math.floor(totalMembers / 3);
    const remainingMembers = totalMembers % 3;
    
    const arranged: (TeamMember | null)[] = [];
    
    // Fill complete rows of 3
    for (let row = 0; row < completeRows; row++) {
      const startIdx = row * 3;
      arranged.push(members[startIdx], members[startIdx + 1], members[startIdx + 2]);
    }
    
    // Handle the remaining members in the last row
    if (remainingMembers > 0) {
      const lastRowStart = completeRows * 3;
      
      if (remainingMembers === 1) {
        // Single member: place in center
        arranged.push(null, members[lastRowStart], null);
      } else if (remainingMembers === 2) {
        // Two members: place symmetrically around center
        arranged.push(members[lastRowStart], null, members[lastRowStart + 1]);
      }
    }
    
    return arranged;
  }

const TeamBlog: React.FC = () => {
  const teamAnim = useScrollAnimation();
  const blogAnim = useScrollAnimation();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogStats, setBlogStats] = useState<Record<string, {views: number, likes: number}>>({});
  const [activeTab, setActiveTab] = useState('new-issues');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetch(GOOGLE_SHEET_CSV_URL)
      .then(res => res.text())
      .then(csv => setTeamMembers(parseCSV(csv)));
    
    // Fetch blog stats
    fetch('/api/get-blog-stats')
      .then(res => res.json())
      .then(stats => setBlogStats(stats))
      .catch(err => console.warn('Could not load blog stats:', err));
    
    // Initialize with sample blog posts - you can replace this with actual data
    setBlogPosts([
      {
        id: '1',
        title: 'Let Meditation Change Your Perspective – Stop the Nagging Habit Today',
        content: 'We&apos;ve all heard the phrase, &quot;The glass is half full or half empty.&quot; The difference lies in perspective...',
        author: 'Jiaru Cai',
        date: 'May 22, 2024',
        image: '/jiaru-blog.png',
        authorImage: '/jiaru-cai.png',
        views: 0,
        likes: 0,
        comments: 0,
        category: 'JoinSangha Teams Blog'
      },
    ]);
  }, []);

  const arrangedMembers = arrangeMembersForDisplay(teamMembers);

  const handleBack = () => {
    setSelectedPost(null);
    // Refresh stats when returning from individual post
    fetch('/api/get-blog-stats')
      .then(res => res.json())
      .then(stats => setBlogStats(stats))
      .catch(err => console.warn('Could not refresh blog stats:', err));
  };

  if (selectedPost) {
    return <BlogPost post={selectedPost} onBack={handleBack} blogStats={blogStats} />;
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-r from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0] flex flex-col overflow-x-hidden">
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
      {/* Main Content Section */}
      <section className="relative pt-10 pb-12 px-5 sm:px-10 lg:px-20 max-w-7xl mx-auto w-full">
        {/* Blog Content */}
        <div ref={blogAnim.ref} className={`bg-white rounded-xl shadow mb-14 transition-all duration-700 ease-out ${blogAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="p-6">
            <div className="flex space-x-5 border-b border-gray-200 mb-8 text-base font-arsenal">
              <button 
                onClick={() => setActiveTab('new-issues')}
                className={`px-3 py-1.5 border-b-2 font-bold ${activeTab === 'new-issues' ? 'border-[#BF608F] text-[#BF608F]' : 'border-transparent text-gray-500'}`}
              >
                New Issues
              </button>
              <button 
                onClick={() => setActiveTab('most-viewed')}
                className={`px-3 py-1.5 border-b-2 font-bold ${activeTab === 'most-viewed' ? 'border-[#BF608F] text-[#BF608F]' : 'border-transparent text-gray-500'}`}
              >
                Most Viewed
              </button>
              <button 
                onClick={() => setActiveTab('meet-team')}
                className={`px-3 py-1.5 border-b-2 font-bold ${activeTab === 'meet-team' ? 'border-[#BF608F] text-[#BF608F]' : 'border-transparent text-gray-500'}`}
              >
                Meet Team
              </button>
            </div>
            
            {/* Blog Posts Content */}
            {activeTab === 'new-issues' && (
              <div className="space-y-6">
                {blogPosts.map((post) => (
                  <article 
                    key={post.id} 
                    className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                      <Image 
                        src={post.authorImage || '/default-avatar.png'} 
                        alt={post.author} 
                        width={64} 
                        height={64} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-arsenal font-bold text-lg sm:text-xl text-gray-900 mb-2">{post.title}</h3>
                      <p className="font-arsenal text-gray-600 text-sm mb-4 line-clamp-2">{post.content}</p>
                      
                      {/* Thumbnail Image */}
                      <div className="mb-4 rounded-lg overflow-hidden ">
                        <Image 
                          src={post.image} 
                          alt={post.title} 
                          width={315} 
                          height={200} 
                          className=" object-cover"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-500 gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.date}</span>
                          <span>•</span>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_323_3007)">
                            <path d="M6.30959 0.5V5C6.30989 5.04099 6.32193 5.08104 6.34429 5.1154C6.36664 5.14976 6.39837 5.17699 6.43572 5.19388C6.47307 5.21076 6.51448 5.21659 6.55504 5.21068C6.5956 5.20476 6.63362 5.18735 6.66459 5.1605L6.69159 5.133L8.10859 3.988L9.44009 5.133C9.46587 5.16492 9.50025 5.1888 9.53916 5.20182C9.57808 5.21483 9.6199 5.21644 9.6597 5.20645C9.6995 5.19646 9.73561 5.1753 9.76376 5.14545C9.79192 5.1156 9.81094 5.07831 9.81859 5.038L9.82159 5V0.5H10.3086C10.5609 0.49992 10.8039 0.595203 10.9889 0.766749C11.1739 0.938294 11.2872 1.17342 11.3061 1.425L11.3086 1.5V11C11.3087 11.2523 11.2134 11.4953 11.0418 11.6803C10.8703 11.8653 10.6352 11.9786 10.3836 11.9975L10.3086 12H2.83559V0.5H6.30959ZM2.32359 0.5V12H1.80859C1.67599 12 1.54881 11.9473 1.45504 11.8536C1.36127 11.7598 1.30859 11.6326 1.30859 11.5V1C1.30859 0.867392 1.36127 0.740215 1.45504 0.646447C1.54881 0.552678 1.67599 0.5 1.80859 0.5H2.32359ZM9.29709 0.5V4.1885L8.24709 3.3215C8.229 3.29901 8.20657 3.2804 8.18114 3.26676C8.1557 3.25313 8.12778 3.24476 8.09904 3.24214C8.07029 3.23953 8.04132 3.24273 8.01384 3.25156C7.98636 3.26038 7.96094 3.27464 7.93909 3.2935L7.91209 3.3215L6.80859 4.1885V0.5H9.29709Z" fill="#BF608F"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_323_3007">
                            <rect width="12" height="12" fill="white" transform="translate(0.308594 0.5)"/>
                            </clipPath>
                            </defs>
                          </svg>
                          <span className="text-[#BF608F]">{post.category}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{blogStats[post.id]?.views || post.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{blogStats[post.id]?.likes || post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            <span>{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                
                {blogPosts.length === 0 && (
                  <div className="text-center py-12">
                    <p className="font-arsenal text-gray-500">No blog posts yet. Check back soon!</p>
                  </div>
                )}
                
              </div>
            )}
            
            {activeTab === 'most-viewed' && (
              <div className="text-center py-12">
                <p className="font-arsenal text-gray-500">Most viewed posts coming soon!</p>
              </div>
            )}
            
            {activeTab === 'meet-team' && (
              <div className="text-center py-12">
                <p className="font-arsenal text-gray-500">Team introductions coming soon!</p>
              </div>
            )}
          </div>
        </div>
        {/* Meet Our Team */}
        <div ref={teamAnim.ref} className={`text-center mb-12 transition-all duration-700 ease-out ${teamAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}> 
          <h2 className="font-arsenal font-bold text-black text-3xl sm:text-4xl mb-4">Meet Our Team</h2>
          <p className="font-arsenal text-base text-gray-700 mb-8 max-w-xl mx-auto">Get to know the passionate people behind our success. Each member brings their own unique vision and perspective, driving our mission forward every day.</p>
          <div className="bg-[#FEDEEE] rounded-xl py-4 mb-12 max-w-5lg mx-auto flex items-center justify-center gap-3">
            <svg width="40" style={{marginRight: 10}} height="47" viewBox="0 0 60 47" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.775 0C15.731 0 17.6068 0.773714 18.9899 2.15093C20.373 3.52815 21.15 5.39607 21.15 7.34375C21.15 9.29143 20.373 11.1593 18.9899 12.5366C17.6068 13.9138 15.731 14.6875 13.775 14.6875C11.819 14.6875 9.94317 13.9138 8.56009 12.5366C7.17701 11.1593 6.4 9.29143 6.4 7.34375C6.4 5.39607 7.17701 3.52815 8.56009 2.15093C9.94317 0.773714 11.819 0 13.775 0ZM47.7 0C49.656 0 51.5318 0.773714 52.9149 2.15093C54.298 3.52815 55.075 5.39607 55.075 7.34375C55.075 9.29143 54.298 11.1593 52.9149 12.5366C51.5318 13.9138 49.656 14.6875 47.7 14.6875C45.744 14.6875 43.8682 13.9138 42.4851 12.5366C41.102 11.1593 40.325 9.29143 40.325 7.34375C40.325 5.39607 41.102 3.52815 42.4851 2.15093C43.8682 0.773714 45.744 0 47.7 0ZM0.5 27.4197C0.5 22.0129 4.90656 17.625 10.3364 17.625H14.2728C15.7386 17.625 17.1306 17.9463 18.3844 18.5154C18.2645 19.1764 18.2092 19.8648 18.2092 20.5625C18.2092 24.0691 19.758 27.2178 22.2009 29.375C22.1825 29.375 22.1641 29.375 22.1364 29.375H2.46359C1.385 29.375 0.5 28.4938 0.5 27.4197ZM37.8636 29.375C37.8452 29.375 37.8267 29.375 37.7991 29.375C40.2513 27.2178 41.7908 24.0691 41.7908 20.5625C41.7908 19.8648 41.7262 19.1855 41.6156 18.5154C42.8694 17.9371 44.2614 17.625 45.7272 17.625H49.6636C55.0934 17.625 59.5 22.0129 59.5 27.4197C59.5 28.5029 58.615 29.375 57.5364 29.375H37.8636ZM21.15 20.5625C21.15 18.2253 22.0824 15.9838 23.7421 14.3311C25.4018 12.6785 27.6528 11.75 30 11.75C32.3472 11.75 34.5982 12.6785 36.2579 14.3311C37.9176 15.9838 38.85 18.2253 38.85 20.5625C38.85 22.8997 37.9176 25.1412 36.2579 26.7939C34.5982 28.4465 32.3472 29.375 30 29.375C27.6528 29.375 25.4018 28.4465 23.7421 26.7939C22.0824 25.1412 21.15 22.8997 21.15 20.5625ZM12.3 44.549C12.3 37.7928 17.8036 32.3125 24.5886 32.3125H35.4114C42.1964 32.3125 47.7 37.7928 47.7 44.549C47.7 45.8984 46.603 47 45.2386 47H14.7614C13.4062 47 12.3 45.9076 12.3 44.549Z" fill="#BF608F"/>
            </svg>
            <span className="text-[#BF608F] font-bold text-lg">Diverse Voices, One Team</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 max-w-6xl mx-auto mb-12">
            {arrangedMembers.map((member, i) => (
              member ? (
                <div key={`${member.name}-${i}`} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center hover:shadow-xl hover:translate-y-[-10px] transition-all duration-500">
                  <div className="w-28 h-28 rounded-full bg-gray-100 mb-6 overflow-hidden flex items-center justify-center">
                    <Image src={member.img} alt={member.name} width={112} height={112} className="object-cover w-full h-full" />
                  </div>
                  <div className="font-arsenal font-bold text-black text-lg mb-2">{member.name}</div>
                  <div className="font-arsenal text-base text-gray-500">{member.role}</div>
                </div>
              ) : (
                <div key={`empty-${i}`} className="invisible"></div>
              )
            ))}
          </div>
          <div className="flex justify-center mt-25">
            <div className="bg-linear-to-r from-[#EEF2F8] via-[#FFFFFF] to-[#FDF2F8] shadow-lg border border-[#E5E7EB] rounded-xl px-8 py-6 max-w-md w-full text-center">
              <div className="font-arsenal font-bold text-black text-lg mb-2">Want to join our team?</div>
              <div className="font-arsenal text-sm text-gray-700 mb-4">We&apos;re always looking for new voices to add to our story.</div>
              <a href="/career" className="inline-block px-6 py-2 bg-[#BF608F] text-white font-arsenal rounded-lg shadow transform transition-transform duration-200 ease-out hover:-translate-y-1 text-base">Check opening roles</a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default TeamBlog; 