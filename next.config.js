/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'globaltravelreport.com',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = process.cwd();
    return config;
  },
};

module.exports = nextConfig; 