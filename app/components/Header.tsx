import Link from 'next/link'

const Header = () => {
  const menuItems = [
    { label: 'News', href: '/news' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Deals', href: '/deals' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Tips', href: '/tips' },
  ]

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-brand-navy">
              Global Travel Report
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-brand-teal transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="md:hidden p-2">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 