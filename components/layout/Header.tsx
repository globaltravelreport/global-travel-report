"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";

function handleTabKey(e: KeyboardEvent, firstElement: HTMLElement, lastElement: HTMLElement) {
  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trap focus inside mobile menu
  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      menuRef.current.addEventListener('keydown', (e) => handleTabKey(e, firstElement, lastElement));
      return () => menuRef.current?.removeEventListener('keydown', (e) => handleTabKey(e, firstElement, lastElement));
    }
  }, [isMenuOpen]);

  return (
    <header className="border-b" role="banner">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
          <Link 
            href="/" 
            className="text-2xl font-bold hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label="Global Travel Report homepage"
          >
            Global Travel Report
          </Link>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen ? "true" : "false"}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/stories" 
              className="hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Browse all stories"
            >
              Stories
            </Link>
            <Link 
              href="/destinations" 
              className="hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Explore destinations"
            >
              Destinations
            </Link>
            <Link 
              href="/about" 
              className="hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="About us"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Contact us"
            >
              Contact
            </Link>
            <Button asChild>
              <Link 
                href="/submit"
                aria-label="Share your travel story"
              >
                Share Your Story
              </Link>
            </Button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          ref={menuRef}
          id="mobile-menu"
          className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4 space-y-4 transition-all duration-300 ease-in-out`}
          role="navigation"
          aria-label="Mobile menu"
        >
          <div className="flex flex-col space-y-4">
            <Link 
              href="/stories" 
              className="block hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Browse all stories"
            >
              Stories
            </Link>
            <Link 
              href="/destinations" 
              className="block hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Explore destinations"
            >
              Destinations
            </Link>
            <Link 
              href="/about" 
              className="block hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="About us"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="block hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="Contact us"
            >
              Contact
            </Link>
            <Button asChild className="w-full">
              <Link 
                href="/submit"
                aria-label="Share your travel story"
              >
                Share Your Story
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 