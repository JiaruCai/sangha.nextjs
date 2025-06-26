"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useScrollAnimation } from '../useScrollAnimation';
import JobPopup from './JobPopup';
import type { Job } from './JobPopup';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0oRMB3Mq-7qUx9srSkTf2BrNYSnSVpl0t8i0QQbPghWHn3k3thX7KinNLNI8eJLQx0tB9yhZMP4kr/pub?output=csv';

function parseCSV(csv: string): Job[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  
  // Find column indices
  const titleIdx = headers.findIndex(h => h.toLowerCase().includes('title'));
  const locationIdx = headers.findIndex(h => h.toLowerCase().includes('location'));
  const descriptionIdx = headers.findIndex(h => h.toLowerCase().includes('description'));
  const responsibilitiesIdx = headers.findIndex(h => h.toLowerCase().includes('responsibilities'));
  const requirementsIdx = headers.findIndex(h => h.toLowerCase().includes('requirements'));
  const lookingForIdx = headers.findIndex(h => h.toLowerCase().includes('looking_for'));
  const cultureIdx = headers.findIndex(h => h.toLowerCase().includes('culture'));
  const whyJoinUsIdx = headers.findIndex(h => h.toLowerCase().includes('why_join_us'));
  const extraRequirementsIdx = headers.findIndex(h => h.toLowerCase().includes('extra_requirements'));

  return lines.slice(1)
    .map(line => {
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

      // Parse arrays from string values
      const parseArray = (str: string) => str.split('|').map(item => item.trim()).filter(Boolean);

      return {
        title: values[titleIdx]?.replace(/^"|"$/g, ''),
        location: values[locationIdx]?.replace(/^"|"$/g, ''),
        description: parseArray(values[descriptionIdx]?.replace(/^"|"$/g, '') || ''),
        responsibilities: parseArray(values[responsibilitiesIdx]?.replace(/^"|"$/g, '') || ''),
        requirements: parseArray(values[requirementsIdx]?.replace(/^"|"$/g, '') || ''),
        lookingFor: parseArray(values[lookingForIdx]?.replace(/^"|"$/g, '') || ''),
        culture: parseArray(values[cultureIdx]?.replace(/^"|"$/g, '') || ''),
        whyJoinUs: parseArray(values[whyJoinUsIdx]?.replace(/^"|"$/g, '') || ''),
        extraRequirements: parseArray(values[extraRequirementsIdx]?.replace(/^"|"$/g, '') || '')
      };
    })
    .filter(job => job.title && job.title.trim() !== '');
}

const Career: React.FC = () => {
  // Animation hooks for each section
  const headerAnim = useScrollAnimation();
  const coreValuesAnim = useScrollAnimation();
  const perksAnim = useScrollAnimation();
  const openRolesAnim = useScrollAnimation();
  const referralAnim = useScrollAnimation();

  const [jobData, setJobData] = useState<Job[]>([]);
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);

  useEffect(() => {
    fetch(GOOGLE_SHEET_CSV_URL)
      .then(res => res.text())
      .then(csv => setJobData(parseCSV(csv)))
      .catch(error => {
        console.error('Error fetching job data:', error);
        // Fallback to sample data if fetch fails
      });
  }, []);

  return (
    <section
      className="relative min-h-screen bg-gradient-to-r from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-25 overflow-hidden"
    >
      <div className="relative py-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div
          ref={headerAnim.ref}
          className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16 transition-all duration-700 ease-out ${headerAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="space-y-6">
            <h1 className="font-arsenal font-bold text-black text-3xl sm:text-4xl lg:text-5xl mb-2">
              Join our mission.<br />Build your career with us.
            </h1>
            <p className="font-arsenal text-gray-700 text-base sm:text-lg mt-4 mb-10">
              We're growing fast and looking for passionate people who want to make an impact. Discover our open roles and start your journey with Familia.
            </p>
            <a href="#open-roles" className="inline-flex items-center px-6 py-3 bg-[#BF608F] text-white font-arsenal rounded-lg shadow transform transition-transform duration-200 ease-out hover:-translate-y-1">
              View Open Positions
              <span className="ml-2">→</span>
            </a>
          </div>
          <div className="flex justify-center md:justify-end">
            <Image src="/career-img.svg" alt="Career" width={463} height={463} className="rounded-xl object-cover" />
          </div>
        </div>

        {/* Core Values Section */}
        <div
          ref={coreValuesAnim.ref}
          className={`text-center mb-25 transition-all duration-700 ease-out ${coreValuesAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="font-arsenal font-bold text-black text-2xl sm:text-3xl mb-2">Our Core Values</h2>
          <p className="font-arsenal text-gray-700 text-sm mb-8">At Familia, our culture is built on collaboration, creativity, and a drive to make a difference. See what makes us unique.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="mb-4 "><Image src="/innovate.svg" alt="Innovation" width={22.5} height={30} /></div>
              <h3 className="font-arsenal font-bold text-black text-lg mb-2">Innovation</h3>
              <p className="font-arsenal text-gray-700 text-sm text-center">We encourage bold ideas and continuous learning to drive meaningful impact.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="mb-4"><Image src="/collaborate.svg" alt="Collaboration" width={37.5} height={30} /></div>
              <h3 className="font-arsenal font-bold text-black text-lg mb-2">Collaboration</h3>
              <p className="font-arsenal text-gray-700 text-sm text-center">Teamwork is at our core—we achieve more together than alone.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="mb-4"><Image src="/world.svg" alt="Impact" width={30} height={30} /></div>
              <h3 className="font-arsenal font-bold text-black text-lg mb-2">Impact</h3>
              <p className="font-arsenal text-gray-700 text-sm text-center">We strive to create solutions that make a real difference in the world.</p>
            </div>
          </div>
        </div>

        {/* Perks & Benefits Section */}
        <div
          ref={perksAnim.ref}
          className={`text-center mb-25 transition-all duration-700 ease-out ${perksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="font-arsenal font-bold text-black text-2xl sm:text-3xl mb-2">Perks & Benefits</h2>
          <p className="font-arsenal text-gray-700 text-sm mb-8">We believe people do their best work when they're happy, healthy, and supported. Here's what we offer:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="mb-4"><Image src="/health.svg" alt="Comprehensive Health" width={30} height={30} /></div>
              <h3 className="font-arsenal font-bold text-lg text-black mb-2">Comprehensive Health</h3>
              <p className="font-arsenal text-gray-700 text-sm text-center">Medical, dental, and vision plans for you and your family.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="mb-4"><Image src="/work.svg" alt="Flexible Work" width={37.5} height={30} /></div>
              <h3 className="font-arsenal font-bold text-lg text-black mb-2">Flexible Work</h3>
              <p className="font-arsenal text-gray-700 text-sm text-center">Remote-friendly options and flexible schedules to suit your lifestyle.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="mb-4"><Image src="/growth.svg" alt="Learning & Growth" width={37.5} height={30} /></div>
              <h3 className="font-arsenal font-bold text-lg text-black mb-2">Learning & Growth</h3>
              <p className="font-arsenal text-gray-700 text-sm text-center">Annual stipend for courses, workshops, and conferences.</p>
            </div>
          </div>
        </div>

        {/* Open Roles Section */}
        <div
          ref={openRolesAnim.ref}
          id="open-roles"
          className={`text-center mb-16 transition-all duration-700 ease-out ${openRolesAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <h2 className="font-arsenal font-bold text-black text-2xl sm:text-3xl mb-2">Open Roles</h2>
          <p className="font-arsenal text-gray-700 text-sm mb-8">Browse our current job openings, and find where you fit in!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12 max-w-6xl mx-auto items-stretch">
            {jobData.map((job, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow p-6 flex flex-row items-center h-full ${
                  jobData.length === 1 ? 'md:col-span-2 md:w-1/2 md:mx-auto' : 
                  (jobData.length % 2 !== 0 && index === jobData.length - 1) ? 'md:col-span-2 md:w-1/2 md:mx-auto' : ''
                }`}
              >
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16">
                  <Image 
                    src={`/${job.title.toLowerCase().includes('frontend') ? 'code' : 
                           job.title.toLowerCase().includes('marketing') ? 'graph' : 
                           job.title.toLowerCase().includes('product manager') ? 'stack' : 
                           job.title.toLowerCase().includes('designer') ? 'pen' : 'code'}.svg`} 
                    alt={`${job.title} Icon`} 
                    width={40} 
                    height={40} 
                    className="object-contain" 
                  />
                </div>
                <div className="flex-1 ml-6 flex flex-col justify-center h-full">
                  <div className="flex-1 flex flex-col justify-center pt-10">
                    <h3 className="font-arsenal font-bold text-black text-lg mb-1 text-left">{job.title}</h3>
                    <p className="font-arsenal text-gray-700 text-sm text-left">
                      {job.location}<br />
                      {job.requirements[0]}<br />
                      {job.requirements[1]}
                    </p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <a href="#" className="px-4 py-2 font-bold bg-pink-100 text-[#BF608F] rounded-lg font-arsenal text-sm hover:bg-pink-200 transition-colors duration-200 flex items-center"
                      onClick={() => { setSelectedJob(job); setPopupOpen(true); }}
                    >
                      Apply Now <span className="ml-1"> <Image className="pl-1" src="/newtab.svg" alt="Arrow" width={16} height={16} /></span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm font-arsenal text-gray-700">
            Don't see a role that fits you? <a href="mailto:info@familiaapp.io" className="text-pink-500 hover:underline">Send us your resume</a>
          </div>
        </div>

        {/* Referral Section */}
        <div
          ref={referralAnim.ref}
          className={`flex justify-center mb-16 transition-all duration-700 ease-out ${referralAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="bg-linear-to-r from-[#EEF2F8] via-[#FFFFFF] to-[#FDF2F8] shadow-lg border border-[#E5E7EB] rounded-xl shadow p-8 max-w-xl w-full text-center">
            <h3 className="font-arsenal font-bold text-black text-lg mb-2">Know someone who'd be a perfect fit?</h3>
            <p className="font-arsenal text-gray-700 text-sm mb-4">If you know someone who shares our passion for thoughtful design and mindful living, we'd love for you to send them here – great things happen when good people connect.</p>
            <a href="mailto:info@familiaapp.io" className="inline-flex items-center px-6 py-3 bg-[#BF608F] text-white font-arsenal rounded-lg shadow transform transition-transform duration-200 ease-out hover:-translate-y-1">Refer Now</a>
          </div>
        </div>
      </div>
      {popupOpen && selectedJob && (
        <JobPopup open={popupOpen} onClose={() => setPopupOpen(false)} job={selectedJob} />
      )}
    </section>
  );
};

export default Career; 