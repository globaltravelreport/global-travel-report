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
  // Ensure static files are served correctly
  output: 'standalone',
  // Enable static file serving
  staticPageGenerationTimeout: 1000,
  // Enable static generation for all pages
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
};

module.exports = nextConfig; 