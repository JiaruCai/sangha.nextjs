"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useScrollAnimation } from '../useScrollAnimation';
import JobPopup from '../career/JobPopup';

const Partnership: React.FC = () => {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLElement>(0.1);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>(0.2);
  const { ref: missionRef, isVisible: missionVisible } = useScrollAnimation<HTMLDivElement>(0.2);
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation<HTMLDivElement>(0.2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    partnershipType: '',
    location: '',
    dateTime: '',
    priceRange: '',
    currency: '',
    eventDetails: '',
    quantity: '',
    deliveryAddress: '',
    companySize: '',
    preferredProgram: '',
    techStack: '',
    integrationGoals: '',
    contentType: '',
    audienceSize: '',
    investmentAmount: '',
    companyValuation: '',
    subject: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/send-partnership-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          mobile: '',
          email: '',
          partnershipType: '',
          location: '',
          dateTime: '',
          priceRange: '',
          currency: '',
          eventDetails: '',
          quantity: '',
          deliveryAddress: '',
          companySize: '',
          preferredProgram: '',
          techStack: '',
          integrationGoals: '',
          contentType: '',
          audienceSize: '',
          investmentAmount: '',
          companyValuation: '',
          subject: '',
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDynamicFields = () => {
    switch (formData.partnershipType) {
      case 'hosting event':
        return (
          <>
            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Location"
              />
            </div>
            {/* Date and Time Field */}
            <div>
              <label htmlFor="dateTime" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Date and time
              </label>
              <input
                type="text"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Date and time"
              />
            </div>
            {/* Price Range Field */}
            <div>
              <label htmlFor="priceRange" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Price range
              </label>
              <input
                type="text"
                id="priceRange"
                name="priceRange"
                value={formData.priceRange}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Price range"
              />
            </div>
            {/* Currency Field */}
            <div>
              <label htmlFor="currency" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Currency
              </label>
              <input
                type="text"
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Currency"
              />
            </div>
          </>
        );
      case 'ordering merch':
        return (
          <>
            {/* Quantity Field */}
            <div>
              <label htmlFor="quantity" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Number of items"
                min="1"
              />
            </div>
            {/* Delivery Address Field */}
            <div>
              <label htmlFor="deliveryAddress" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Delivery Address
              </label>
              <input
                type="text"
                id="deliveryAddress"
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Delivery address"
              />
            </div>
          </>
        );
      case 'corporate wellness':
        return (
          <>
            {/* Company Size Field */}
            <div>
              <label htmlFor="companySize" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Company Size
              </label>
              <input
                type="text"
                id="companySize"
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="e.g. 100-500 employees"
              />
            </div>
            {/* Preferred Program Field */}
            <div>
              <label htmlFor="preferredProgram" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Preferred Program
              </label>
              <input
                type="text"
                id="preferredProgram"
                name="preferredProgram"
                value={formData.preferredProgram}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Type of wellness program"
              />
            </div>
            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Location"
              />
            </div>
          </>
        );
      case 'technology integration':
        return (
          <>
            {/* Tech Stack Field */}
            <div>
              <label htmlFor="techStack" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Tech Stack
              </label>
              <input
                type="text"
                id="techStack"
                name="techStack"
                value={formData.techStack}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="e.g. React, Node.js, etc."
              />
            </div>
            {/* Integration Goals Field */}
            <div>
              <label htmlFor="integrationGoals" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Integration Goals
              </label>
              <input
                type="text"
                id="integrationGoals"
                name="integrationGoals"
                value={formData.integrationGoals}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Describe your goals"
              />
            </div>
          </>
        );
      case 'content partnership':
        return (
          <>
            {/* Content Type Field */}
            <div>
              <label htmlFor="contentType" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Content Type
              </label>
              <input
                type="text"
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="e.g. Blog, Video, Podcast"
              />
            </div>
            {/* Audience Size Field */}
            <div>
              <label htmlFor="audienceSize" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Audience Size
              </label>
              <input
                type="text"
                id="audienceSize"
                name="audienceSize"
                value={formData.audienceSize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="e.g. 10,000 followers"
              />
            </div>
          </>
        );
      case 'investment':
        return (
          <>
            {/* Investment Amount Field */}
            <div>
              <label htmlFor="investmentAmount" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Investment Amount
              </label>
              <input
                type="text"
                id="investmentAmount"
                name="investmentAmount"
                value={formData.investmentAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="e.g. $50,000"
              />
            </div>
            {/* Company Valuation Field */}
            <div>
              <label htmlFor="companyValuation" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Company Valuation
              </label>
              <input
                type="text"
                id="companyValuation"
                name="companyValuation"
                value={formData.companyValuation}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="e.g. $1,000,000"
              />
            </div>
          </>
        );
      case 'other':
        return (
          <>
            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                placeholder="Subject of your inquiry"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const CustomDropdown = ({ options, value, onChange, placeholder }: { options: { label: string, value: string }[], value: string, onChange: (v: string) => void, placeholder?: string }) => {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = options.find(opt => opt.value === value);

    return (
      <div className="relative w-full" ref={ref}>
        <button
          type="button"
          className="w-full text-left bg-white border border-gray-300 rounded px-3 py-2 text-black font-arsenal focus:outline-none focus:ring-1 focus:ring-[#BF608F] flex justify-between items-center"
          onClick={() => setOpen(o => !o)}
        >
          <span className={selected && selected.value ? '' : 'text-gray-500'}>{selected && selected.value ? selected.label : placeholder || 'Select...'}</span>
          <svg className="w-4 h-4 ml-2 text-[#BF608F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded shadow-lg">
            {options.map(opt => (
              <div
                key={opt.value}
                className={`px-4 py-2 cursor-pointer font-arsenal text-black hover:bg-pink-50 ${value === opt.value ? 'bg-pink-100' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="
        relative
        min-h-screen
        bg-gradient-to-b from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0]
        px-4 sm:px-6 lg:px-8
        py-16 sm:py-20 lg:py-25
        overflow-hidden
      "
    >

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`
            text-center mb-16 sm:mb-10
            transform transition-all duration-1000 ease-out
            ${headerVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-16 opacity-0'
            }
          `}
        >
          <h1 className="font-arsenal font-bold text-black text-4xl sm:text-4xl lg:text-5xl mb-6">
            Do Business with us!
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left Column - Mission Section */}
          <div 
            ref={missionRef}
            className={`
              space-y-8
              transform transition-all duration-1000 ease-out
              ${missionVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-16 opacity-0'
              }
            `}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="rounded-2xl">
              <h2 className="font-arsenal text-black text-2xl sm:text-3xl mb-6">
                Our Mission
              </h2>
              
              {/* Mission illustration */}
                <Image
                  src="/partnership-drawing.svg"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-75 w-auto"
                />
              
              <p className="font-arsenal text-gray-700 text-base sm:text-lg mt-6 mb-6">
                At Join Sangha, founded by visionaries of the tech world, we understand the 
                challenges faced by those struggling to find balance in a demanding career 
                landscape. Our mission is rooted in the belief that meditation provides not only 
                peace but also a profound sense of community connection.
              </p>
                <Image
                  src="/separator.svg"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-auto w-900"
                />              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex items-start -space-x-2">
                  <div className="w-2 h-2 mt-2 flex-shrink-0"></div>
                  <p className="font-arsenal text-gray-700">
                    <span className="font-bold">Phone:</span> +1 (555) 365-7834
                  </p>
                </div>
                <div className="flex items-start -space-x-2">
                  <div className="w-2 h-2 mt-2 flex-shrink-0"></div>
                  <p className="font-arsenal text-gray-700">
                    <span className="font-bold">Email:</span> info@joinsangha.co
                  </p>
                </div>
                <div className="flex items-start -space-x-2">
                  <div className="w-2 h-2 mt-2 flex-shrink-0"></div>
                  <p className="font-arsenal text-gray-700">
                    <span className="font-bold">Address:</span> Building 1OA, 201 Montgomery St, San Francisco, CA 94104
                  </p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex space-x-3 pt-6">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Image src="/ins.svg" alt="Instagram" width={20} height={20} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Image src="/fb.svg" alt="Facebook" width={20} height={20} />
                </a>
                <a 
                  href="https://www.linkedin.com/company/familia-io/" 
                  className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Image src="/linkedin.svg" alt="LinkedIn" width={20} height={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div 
            ref={formRef}
            className={`
              transform transition-all duration-1000 ease-out
              ${formVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-16 opacity-0'
              }
            `}
            style={{ transitionDelay: '400ms' }}
          >
              <div className="bg-white rounded-2xl p-10 shadow-[-8px_2px_5px_0px] shadow-pink-100">
              <h2 className="font-arsenal font-bold text-black text-2xl sm:text-3xl mb-6">
                Get In Touch
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal"
                    placeholder="Your full name"
                  />
                </div>
                {/* Mobile Field */}
                <div>
                  <label htmlFor="mobile" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                    Mobile
                  </label>
                  <input
                    type="text"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-arsenal"
                    placeholder="Mobile number"
                  />
                </div>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal"
                    placeholder="your.email@company.com"
                  />
                </div>
                {/* Partnership Type Dropdown */}
                <div>
                  <label htmlFor="partnershipType" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                    Partnership Type
                  </label>
                  <CustomDropdown
                    options={[
                      { label: 'Select an option', value: '' },
                      { label: 'Host a meditation event', value: 'hosting event' },
                      { label: 'Order a large quantity of merchandise', value: 'ordering merch' },
                      { label: 'Corporate Wellness', value: 'corporate wellness' },
                      { label: 'Technology Integration', value: 'technology integration' },
                      { label: 'Content Partnership', value: 'content partnership' },
                      { label: 'Investment Opportunity', value: 'investment' },
                      { label: 'Other', value: 'other' },
                    ]}
                    value={formData.partnershipType}
                    onChange={v => setFormData(prev => ({ ...prev, partnershipType: v }))}
                    placeholder="Select an option"
                  />
                </div>
                {/* Dynamic Fields */}
                {renderDynamicFields()}
                {/* Event Details Field (always shown) */}
                <div>
                  <label htmlFor="eventDetails" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                    Event Details
                  </label>
                  <textarea
                    id="eventDetails"
                    name="eventDetails"
                    value={formData.eventDetails}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal resize-vertical"
                    placeholder="Event Details or message..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full text-white font-arsenal font-bold
                    py-4 px-6 rounded-lg
                    transform transition-all duration-200 ease-out
                    focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
                    ${isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#BF608F] to-[#D67BA5] hover:from-[#A5527A] hover:to-[#C26A94] hover:-translate-y-1 hover:shadow-lg'
                    }
                  `}
                >
                  {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                </button>

                {submitStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    Thank you! Your partnership inquiry has been sent successfully.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    Sorry, there was an error sending your message. Make sure you fill out all fields. Please try again.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partnership;