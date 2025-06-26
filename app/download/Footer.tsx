import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#F8F8F8] via-[#FFFFFF] to-[#F8F8F8] sm:pt-24 lg:pt-30 pb-8 sm:pb-12 lg:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
          <p className="font-bold text-black font-arsenal text-sm sm:text-base translate-y-4 sm:translate-y-6 lg:translate-y-3 text-center md:text-right">
            © 2025, FAMILIA IO, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}