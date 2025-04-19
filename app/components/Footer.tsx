import Link from 'next/link'
import Image from 'next/image'
import { FaTwitter, FaYoutube, FaTumblr, FaLinkedin, FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'

const Footer = () => {
  const links = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
  ]

  const socialLinks = [
    { icon: FaTwitter, href: 'https://x.com/GTravelReport', label: 'Twitter' },
    { icon: FaYoutube, href: 'https://www.youtube.com/@GlobalTravelReport', label: 'YouTube' },
    { icon: FaTiktok, href: 'https://www.tiktok.com/@globaltravelreport', label: 'TikTok' },
    { icon: FaTumblr, href: 'https://www.tumblr.com/globaltravelreport', label: 'Tumblr' },
    { icon: FaLinkedin, href: 'https://www.linkedin.com/company/globaltravelreport', label: 'LinkedIn' },
    { icon: FaFacebook, href: 'https://www.facebook.com/globaltravelreport', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://www.instagram.com/globaltravelreport', label: 'Instagram' },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center">
              <div className="relative w-[150px] h-[150px]">
                <Image
                  src="/images/logo.png"
                  alt="Global Travel Report Logo"
                  fill
                  className="invert object-contain"
                />
              </div>
            </Link>
            <p className="mt-4 text-sm">
              Your trusted source for authentic travel experiences and industry insights.
            </p>
          </div>
          <div className="md:text-center">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-teal transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:text-right">
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-4 md:justify-end">
              {socialLinks.map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-teal transition-colors duration-200"
                    aria-label={link.label}
                  >
                    <Icon className="h-6 w-6" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Global Travel Report. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 