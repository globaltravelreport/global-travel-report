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
  // Include articles.json in the build
  experimental: {
    serverComponentsExternalPackages: ['fs'],
  },
};

module.exports = nextConfig; 