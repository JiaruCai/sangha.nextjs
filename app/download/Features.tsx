"use client";

import React from 'react'
import Image from 'next/image'
import { useScrollAnimation } from '../useScrollAnimation';

const Features: React.FC = () => {
  const { ref: feature1Ref, isVisible: feature1Visible } = useScrollAnimation<HTMLDivElement>(0.2);
  const { ref: feature2Ref, isVisible: feature2Visible } = useScrollAnimation<HTMLDivElement>(0.2);
  const { ref: feature3Ref, isVisible: feature3Visible } = useScrollAnimation<HTMLDivElement>(0.2);

  return (
    <>
      <section  
        className="
          relative
          flex flex-col lg:flex-row
          items-center justify-center
          overflow-hidden
          bg-gradient-to-b from-[#FFFFFF] via-[#FFFFFF] to-[#F8F8F8]
          px-4 sm:px-6 md:px-8 lg:px-14
          py-16 sm:py-20 md:py-24 lg:py-10
        "
      >
        {/* Background Image */}
        <div className="absolute lg:top-60 xl:top-15 inset-0 z-5">
          <Image 
            src={"/statement.svg"} 
            fill
            // width={2703} 
            // height={100} 
            alt={''} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content Container */}
        <div className="relative space-y-32 z-10 sm:space-y-46 md:space-y-100 lg:space-y-120 xl:space-y-130 w-full max-w-7xl mx-auto">
          <div 
            ref={feature1Ref}
            className={`
              flex flex-col mt-8 sm:mt-12 md:mt-16 lg:mt-160 lg:flex-row items-center justify-center space-y-6 sm:space-y-8 lg:space-y-55 lg:space-x-16
              transform transition-all duration-1000 ease-out relative
              ${feature1Visible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-16 opacity-0'
              }
            `}
          >
            {/* Left: Circular Illustration */}
            <div className="flex-shrink-0">
              <div className=" w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mt-4 sm:mt-6 md:mt-8 lg:mt-24 lg:w-176 lg:h-176 rounded-full overflow-hidden">
                <Image
                  src="/garden.svg" 
                  alt="Inner Garden Illustration"
                  width={384}
                  height={384}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            
            {/* Right: Text Content */}
            <div className="flex-1 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 flex flex-col justify-center text-center lg:text-left">
              <h3 className="font-arsenal font-bold text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                Creating an Inner Garden.
              </h3>
              <p className="font-arsenal text-black text-sm sm:text-base md:text-lg lg:text-2xl text-gray-600">
                Watch your personal garden bloom with each meditation. The more you practice, the more your space flourishes.
              </p>
            </div> 
          </div>

          <div 
            ref={feature2Ref}
            className={`
              flex flex-col lg:flex-row items-center justify-center space-y-6 sm:space-y-8 lg:space-y-0 lg:space-x-16
              transform transition-all duration-1000 ease-out relative z-10
              ${feature2Visible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-16 opacity-0'
              }
            `}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Right: Text Content */}
            <div className="flex-1 z-6 max-w-lg space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
              <h3 className="font-arsenal font-bold text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
                Journaling mindful reflections.
              </h3>
              <p className="font-arsenal text-black text-sm sm:text-base md:text-lg lg:text-2xl text-gray-600">
                Capture thoughts and emotions after each session, helping you deepen self-awareness and see your growth over time.
              </p>
            </div> 
            
            {/* Left: Circular Illustration */}
            <div className="z-10 flex-shrink-0 order-1 lg:order-2">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-176 lg:h-176 rounded-full overflow-hidden">
                <Image
                  src="/journaling.svg" 
                  alt="Journaling Illustration"
                  width={384}
                  height={384}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          <div 
            ref={feature3Ref}
            className={`
              flex flex-col lg:flex-row items-center justify-center space-y-6 sm:space-y-8 lg:space-y-0 lg:space-x-16
              transform transition-all duration-1000 ease-out relative z-10
              ${feature3Visible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-16 opacity-0'
              }
            `}
            style={{ transitionDelay: '400ms' }}
          >
            {/* Left: Circular Illustration */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-176 lg:h-176 rounded-full overflow-hidden">
                <Image
                  src="/matching.svg" 
                  alt="Matching Illustration"
                  width={384}
                  height={384}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            {/* Right: Text Content */}
            <div className="flex-1 z-10 max-w-lg space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 flex flex-col justify-center text-center lg:text-left">
              <h3 className="font-arsenal font-bold text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight">
                Matching with like-minded peers. 
              </h3>
              <p className="font-arsenal text-black text-sm sm:text-base md:text-lg lg:text-2xl text-gray-600">
                Whether you&apos;re starting your practice or deepening it, meditating alongside a like-minded peer can create a sense of connection and support.
              </p>
            </div> 
          </div>
        </div>
      </section>
    </>
  )
}

export default Features