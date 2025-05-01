'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

import { ThemeToggle } from '@/src/components/ui/theme-toggle';
import { cn } from '@/src/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled
        ? "bg-white/95 backdrop-blur shadow-md supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/80"
        : "bg-transparent"
    )}>
      {/* Top bar with contact info */}
      <div className="hidden lg:block bg-[#19273A] text-white py-1">
        <div className="container flex justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              editorial@globaltravelreport.com
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Sydney, Australia
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <a href="https://facebook.com/globaltravelreport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </a>
            <a href="https://x.com/GTravelReport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="https://instagram.com/globaltravelreport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className={cn(
        "container transition-all duration-300",
        isScrolled ? "py-3" : "py-5"
      )}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#19273A] flex items-center justify-center">
              <span className="text-[#C9A14A] font-bold text-lg">GTR</span>
            </div>
            <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-[#19273A] to-[#2A3F5F] bg-clip-text text-transparent dark:from-[#C9A14A] dark:to-[#E5C675]">
              Global Travel Report
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/'
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              Home
            </Link>
            <Link
              href="/stories"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/stories' || pathname.startsWith('/stories/')
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              Stories
            </Link>
            <Link
              href="/destinations"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/destinations' || pathname.startsWith('/destinations/')
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              Destinations
            </Link>
            <Link
              href="/about"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/about'
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/contact'
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              Contact
            </Link>
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/search">
              <Button variant="ghost" size="sm" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="sr-only">Search</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="container py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/'
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/stories"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/stories' || pathname.startsWith('/stories/')
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Stories
              </Link>
              <Link
                href="/destinations"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/destinations' || pathname.startsWith('/destinations/')
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Destinations
              </Link>
              <Link
                href="/about"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/about'
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/contact'
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile contact info */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    editorial@globaltravelreport.com
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Sydney, Australia
                  </span>
                </div>

                <div className="flex items-center space-x-4 mt-4">
                  <a href="https://facebook.com/globaltravelreport" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </a>
                  <a href="https://x.com/GTravelReport" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                  <a href="https://instagram.com/globaltravelreport" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}