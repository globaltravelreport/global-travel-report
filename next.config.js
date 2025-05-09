/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Enable TypeScript checking during build to ensure code quality
  typescript: {
    // We've fixed the TypeScript errors, so we can enable checking
    ignoreBuildErrors: false,
  },
  // Enable ESLint during build
  eslint: {
    // We've fixed the ESLint errors, so we can enable checking
    ignoreDuringBuilds: false,
  },
  // Redirects
  async redirects() {
    return [
      {
        source: '/resources',
        destination: '/offers',
        permanent: true,
      },
      {
        source: '/stories',
        destination: '/',
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
    ],
    // Enable caching for images to improve performance
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    // Enable image optimization
    unoptimized: false,
    // Set default image formats
    formats: ['image/webp', 'image/avif'],
    // Set default image quality
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };

    // Ignore problematic modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      http: false,
      https: false,
      timers: false,
      string_decoder: false,
      crypto: false,
      stream: false,
      os: false,
      zlib: false,
    };

    // Ignore specific modules that cause issues
    config.module = {
      ...config.module,
      exprContextCritical: false,
      rules: [
        ...config.module.rules,
        {
          test: /node_modules[\\\/](rss-parser|xml2js|sax)/,
          use: 'null-loader',
        },
      ],
    };

    return config;
  },
  // Exclude problematic API routes from the build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Output directory for the build
  output: 'standalone',
}

module.exports = withBundleAnalyzer(nextConfig)
