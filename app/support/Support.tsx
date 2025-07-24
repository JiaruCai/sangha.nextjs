"use client";

import React, { useState } from 'react';
import { useScrollAnimation } from '../useScrollAnimation';

const Support: React.FC = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>(0.2);
  const { ref: supportOptionsRef, isVisible: supportOptionsVisible } = useScrollAnimation<HTMLDivElement>(0.2);
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation<HTMLDivElement>(0.2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch('/api/send-support-email', {
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
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: '',
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

  return (
    <section
      className="
        relative
        min-h-screen
        bg-gradient-to-b from-[#F9E3E0] via-[#FFFFFF] to-[#F9E3E0]
        px-4 sm:px-6 lg:px-8
        py-16 sm:py-20 lg:py-25
        overflow-hidden
      "
    >
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div 
          ref={headerRef}
          className={`
            text-center mb-16 mt-10 sm:mb-20
            transform transition-all duration-1000 ease-out
            ${headerVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-16 opacity-0'
            }
          `}
        >
          <h1 className="font-arsenal font-bold text-black text-4xl sm:text-5xl lg:text-6xl mb-6">
            How can we help you?
          </h1>
          <p className="font-arsenal text-gray-700 text-lg sm:text-xl max-w-2xl mx-auto">
            We&apos;re here to help you get the most out of our platform. Find answers, get support, 
            and connect with our team.
          </p>
        </div>

        {/* Support Options */}
        <div 
          ref={supportOptionsRef}
          className={`
            max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 sm:mb-20
            transform transition-all duration-1000 ease-out
            ${supportOptionsVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-16 opacity-0'
            }
          `}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Email Support */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#BF608F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-arsenal font-bold text-black text-xl mb-2">Email support</h3>
            <p className="font-arsenal text-gray-600 text-sm mb-4">Get help via email</p>
            <div className="space-y-2">
              <p className="font-arsenal text-black font-medium">support@joinsangha.com</p>
              <div className="bg-pink-100 rounded-md p-1 w-1/2 mx-auto flex items-center justify-center text-gray-500 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-arsenal">Within 24 hours</span>
              </div>
            </div>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#BF608F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-arsenal font-bold text-black text-xl mb-2">Phone support</h3>
            <p className="font-arsenal text-gray-600 text-sm mb-4">Talk to our support team</p>
            <div className="space-y-2">
              <p className="font-arsenal text-black font-medium">+1 510 501 3934</p>
              <div className="bg-pink-100 rounded-md p-1 w-1/2 mx-auto flex items-center justify-center text-gray-500 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-arsenal">Within 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Support Ticket Form */}
        <div 
          ref={formRef}
          className={`
            max-w-3xl mx-auto
            transform transition-all duration-1000 ease-out
            ${formVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-16 opacity-0'
            }
          `}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-lg">
            <h2 className="font-arsenal font-bold text-black text-2xl sm:text-3xl mb-2">
              Submit a Support Ticket
            </h2>
            <p className="font-arsenal text-gray-600 text-base mb-8">
              Describe your issue and we&apos;ll get back to you as soon as possible.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name Field */}
                <div>
                  <label htmlFor="firstName" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>

                {/* Last Name Field */}
                <div>
                  <label htmlFor="lastName" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

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
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 transition-colors duration-200 font-arsenal resize-vertical focus:outline-none focus:ring-2 focus:ring-[#BF608F] focus:border-transparent"
                  placeholder="Description of your issue in detail"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-1/2 text-white font-arsenal font-bold text-lg
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
              </div>

              {submitStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <div className="font-arsenal">
                    Thank you! Your support ticket has been submitted successfully. We&apos;ll get back to you within 24 hours.
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="font-arsenal">
                    Sorry, there was an error submitting your support ticket. Please make sure all fields are filled out and try again.
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Support;