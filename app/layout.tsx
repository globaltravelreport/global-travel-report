import './globals.css'

export const metadata = {
  title: 'Global Travel Report | Travel Insights & Stories',
  description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <header className="bg-[#19273A] text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <a href="/" className="text-xl font-bold">Global Travel Report</a>
              <nav>
                <ul className="flex space-x-4">
                  <li><a href="/" className="hover:text-[#C9A14A]">Home</a></li>
                  <li><a href="/about" className="hover:text-[#C9A14A]">About</a></li>
                  <li><a href="/contact" className="hover:text-[#C9A14A]">Contact</a></li>
                </ul>
              </nav>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-[#19273A] text-white p-4 text-center">
            <p>© {new Date().getFullYear()} Global Travel Report. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  )
}