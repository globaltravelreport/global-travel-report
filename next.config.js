/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './'),
    };
    return config;
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Remove experimental.serverActions as it's now enabled by default
  staticPageGenerationTimeout: 1000,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  experimental: {
    // Remove serverActions as it's now enabled by default
  },
  viewport: {
    themeColor: '#000000',
  },
};

module.exports = nextConfig; 