import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm">
              Global Travel Report is your trusted source for travel stories, tips, and inspiration from around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/hotels" className="text-sm hover:text-white transition-colors">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/categories/airlines" className="text-sm hover:text-white transition-colors">
                  Airlines
                </Link>
              </li>
              <li>
                <Link href="/categories/cruises" className="text-sm hover:text-white transition-colors">
                  Cruises
                </Link>
              </li>
              <li>
                <Link href="/categories/destinations" className="text-sm hover:text-white transition-colors">
                  Destinations
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-center">
            © {new Date().getFullYear()} Global Travel Report. All rights reserved.
            <br />
            Content is sourced from various travel publications and rewritten for clarity and style.
            Images are provided by Unsplash and their respective photographers.
          </p>
        </div>
      </div>
    </footer>
  );
}; 