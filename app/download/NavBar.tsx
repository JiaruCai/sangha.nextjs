"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navigationLinks = [
    { href: '/download', label: 'Download' },
    { href: '/partnership', label: 'Partnership' },
    { href: '/team-blog', label: 'Team Blog' },
    { href: '/merchandise', label: 'Merchandise' },
    { href: '/career', label: 'Career' },
  ]

  const isActiveLink = (href: string) => {
    return pathname === href
  }

  return (
    <nav 
      className="absolute top-0 left-0 right-0 z-50 border-b border-gray-200/30"
      style={{ 
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/joinsangha-logo.svg"
              alt="Logo"
              width={40}
              height={40}
              className="h-auto w-auto"
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sub-arsenal transition-colors duration-200 ${
                  isActiveLink(link.href)
                    ? 'text-pink-500 hover:text-pink-600'
                    : 'text-gray-800 hover:text-pink-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-pink-600 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 transition-colors duration-200"
              aria-expanded="false"
              aria-label="Toggle navigation menu"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div 
            className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200/30 rounded-b-lg"
            style={{ 
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-sub-arsenal transition-colors duration-200 ${
                  isActiveLink(link.href)
                    ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-50/50'
                    : 'text-gray-800 hover:text-pink-600 hover:bg-gray-50/70'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar