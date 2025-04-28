import React from 'react';
import { FaFacebook, FaXTwitter, FaMedium, FaLinkedin, FaYoutube, FaTiktok } from "react-icons/fa6";

export const Footer = () => {
  return (
    <footer className="bg-[#19273A] text-[#C9A14A] py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <span className="font-bold text-lg">Global Travel Report</span>
          <p className="text-sm text-[#C9A14A]/80">News, Reviews & Real Travel Talk</p>
        </div>
        <div className="flex space-x-4">
          <a
            href="https://www.facebook.com/globaltravelreport"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-white transition-colors"
          >
            <FaFacebook className="w-6 h-6" />
          </a>
          <a
            href="https://x.com/GTravelReport"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="hover:text-white transition-colors"
          >
            <FaXTwitter className="w-6 h-6" />
          </a>
          <a
            href="https://medium.com/@editorial_31000"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Medium"
            className="hover:text-white transition-colors"
          >
            <FaMedium className="w-6 h-6" />
          </a>
          <a
            href="https://www.linkedin.com/company/globaltravelreport/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-white transition-colors"
          >
            <FaLinkedin className="w-6 h-6" />
          </a>
          <a
            href="https://www.youtube.com/@GlobalTravelReport"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="hover:text-white transition-colors"
          >
            <FaYoutube className="w-6 h-6" />
          </a>
          <a
            href="https://www.tiktok.com/@globaltravelreport"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
            className="hover:text-white transition-colors"
          >
            <FaTiktok className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}; 