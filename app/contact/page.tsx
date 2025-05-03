import { ContactForm } from "@/components/ContactForm";
import type { Metadata } from "next";
import Image from "next/image";
import { FaFacebook, FaXTwitter, FaMedium, FaLinkedin, FaYoutube, FaTiktok, FaInstagram } from "react-icons/fa6";
import { NewsletterSignup } from "@/components/NewsletterSignup";

export const metadata: Metadata = {
  title: "Contact Us - Global Travel Report",
  description: "Get in touch with our team. We'd love to hear from you about your travel stories, suggestions, or any questions you might have.",
  openGraph: {
    title: "Contact Us - Global Travel Report",
    description: "Get in touch with our team. We'd love to hear from you about your travel stories, suggestions, or any questions you might have.",
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="relative h-[300px] mb-12 rounded-lg overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828"
          alt="Contact us - Global Travel Report"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white text-center">Contact Us</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="text-gray-600">
              We'd love to hear from you! Whether you have a story to share, a question to ask, or feedback to provide,
              our team is here to help.
            </p>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <NewsletterSignup
              variant="inline"
              title="Subscribe to Updates"
              description="Get our latest travel stories and news delivered to your inbox."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-[#19273A] p-3 rounded-full">
                <svg className="w-6 h-6 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">editorial@globaltravelreport.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-[#19273A] p-3 rounded-full">
                <svg className="w-6 h-6 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-gray-600">Sydney, Australia</p>
              </div>
            </div>
          </div>

          <div className="bg-[#19273A] p-6 rounded-lg text-white">
            <h3 className="text-xl font-semibold mb-4 text-[#C9A14A]">Follow Us</h3>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.facebook.com/globaltravelreport" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C9A14A] transition-colors" aria-label="Facebook">
                <FaFacebook className="w-6 h-6" />
              </a>
              <a href="https://x.com/GTravelReport" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C9A14A] transition-colors" aria-label="Twitter (X)">
                <FaXTwitter className="w-6 h-6" />
              </a>
              <a href="https://medium.com/@editorial_31000" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C9A14A] transition-colors" aria-label="Medium">
                <FaMedium className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/company/globaltravelreport/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C9A14A] transition-colors" aria-label="LinkedIn">
                <FaLinkedin className="w-6 h-6" />
              </a>
              <a href="https://www.youtube.com/@GlobalTravelReport" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C9A14A] transition-colors" aria-label="YouTube">
                <FaYoutube className="w-6 h-6" />
              </a>
              <a href="https://www.tiktok.com/@globaltravelreport" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C9A14A] transition-colors" aria-label="TikTok">
                <FaTiktok className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/globaltravelreport" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C9A14A] transition-colors" aria-label="Instagram">
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}