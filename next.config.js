/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'source.unsplash.com',
      'picsum.photos',
      'placehold.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
}

module.exports = nextConfig 