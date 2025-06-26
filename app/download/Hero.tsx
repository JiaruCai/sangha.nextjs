"use client";

import Image from 'next/image'
import { useScrollAnimation } from '../useScrollAnimation';

export default function Hero() {
  const { ref: textRef, isVisible: textVisible } = useScrollAnimation<HTMLDivElement>(0.2);
  const { ref: imageRef, isVisible: imageVisible } = useScrollAnimation<HTMLDivElement>(0.2);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes orbit {
            0% {
              transform: rotate(0deg) translateX(500px) rotate(0deg);
            }
            100% {
              transform: rotate(360deg) translateX(500px) rotate(-360deg);
            }
          }
          
          .gradient-container {
            position: relative;
            overflow: hidden;
            background: radial-gradient(circle at 50% 50%, #E2E8EE 0%, #FFFFFF 20%, #E2E8EE 60%, #FFFFFF 100%);
            background-size: 200% 150%;
          }
          
          .gradient-container::before {
            content: '';
            position: absolute;
            top: 20%;
            left: 50%;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, #F8E1F3 0%, rgba(248, 225, 243, 0.6) 30%, transparent 70%);
            border-radius: 50%;
            animation: orbit 10s linear infinite;
            transform-origin: center;
            pointer-events: none;
            z-index: 1;
          }
          
          .content-layer {
            position: relative;
            z-index: 10;
          }
        `
      }} />
      
      <section
        className="
          relative
          flex flex-col lg:flex-row
          items-center justify-center
          overflow-hidden
          gradient-container
          px-6 sm:px-8 lg:px-46
          py-24 sm:py-12 lg:py-30
        "
      >
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFFFFF] to-transparent z-5"></div>

        <div 
          ref={textRef}
          className={`
            w-full lg:w-1/2 max-w-lg text-center lg:text-left space-y-6 content-layer
            transform transition-all duration-1000 ease-out
            ${textVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-16 opacity-0'
            }
          `}
        >
          <h1 className="font-arsenal font-bold text-3xl sm:text-4xl lg:text-5xl text-black">
            Meditate Anywhere,
            <br className="hidden inline-block" />
            Connect Everywhere.
          </h1>
          <p className="font-sub-arsenal text-inline sm:text-lg text-gray-600">
            From your quiet corner to the wider world, explore mindfulness practices that ground you—and connections that uplift you.
          </p>
          <div className="mt-15 flex justify-center lg:justify-start space-x-4">
            <a
              href="#"
              className="
                h-10 sm:h-12
                transform transition-transform duration-200 ease-out
                hover:-translate-y-2
              "
            >
              <Image
                src="/app-store-badge.svg"
                alt="App Store"
                width={120}
                height={40}
                className="w-auto h-full"
              />
            </a>
            <a
              href="#"
              className="
                h-10 sm:h-12
                transform transition-transform duration-200 ease-out
                hover:-translate-y-2
              "
            >
              <Image
                src="/google-play-badge.svg"
                alt="Google Play"
                width={135}
                height={40}
                className="w-auto h-full"
              />
            </a>
          </div>
          <div className="w-full max-w-lg lg:mt-40">
            <p className="font-sub-arsenal text-base mt-15 sm:text-lg text-gray-500">
              Trusted by:
            </p>
            <div className="flex justify-center lg:justify-start space-x-6 mt-2">
              <div className="h-10 sm:h-12 drop-shadow-lg">
                <Image
                  src="/ibt-logo.svg"
                  alt="IBT"
                  width={138}
                  height={54}
                  className="w-auto h-full"
                />
              </div>
              <div className="h-10 sm:h-12 drop-shadow-lg">
                <Image
                  src="/investing-logo.svg"
                  alt="Investing.com"
                  width={138}
                  height={54}
                  className="w-auto h-full"
                />
              </div>
              <div className="h-10 sm:h-12 drop-shadow-lg">
                <Image
                  src="/hackernoon-logo.svg"
                  alt="Hackernoon"
                  width={138}
                  height={54}
                  className="w-auto h-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div 
          ref={imageRef}
          className={`
            w-full lg:w-1/2 flex justify-center lg:justify-end mt-12 lg:mt-0 content-layer
            transform transition-all duration-1000 ease-out
            ${imageVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-20 opacity-0'
            }
          `}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="w-56 sm:w-64 md:w-72 lg:w-96">
            <Image
              src="/mockup1.svg"
              alt="JoinSangha App Mockup"
              width={330}
              height={679}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>
    </>
  )
}