const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });

// Inline CSP builder function
function buildCSP({ nonce = '', env = 'production', reportOnly = false } = {}) {
  const isProd = env === 'production';
  // Google reCAPTCHA and Google domains for script-src and frame-src
  const scriptSrc = [
    `'self'`,
    nonce ? `'nonce-${nonce}'` : '',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net', // alternate reCAPTCHA CDN
    // Removed unsafe-eval and unsafe-inline for security
  ].filter(Boolean).join(' ');
  const styleSrc = [
    `'self'`,
    nonce ? `'nonce-${nonce}'` : '',
    'https://fonts.googleapis.com',
    'https://www.gstatic.com'
  ].filter(Boolean).join(' ');
  const imgSrc = [
    `'self'`,
    'data:',
    'blob:',
    'https://images.unsplash.com',
    'https://unsplash.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://i.ytimg.com',
    'https://picsum.photos',
    'https://source.unsplash.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net'
  ].join(' ');
  const connectSrc = [
    `'self'`,
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://api.unsplash.com',
    'https://vitals.vercel-insights.com',
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net'
  ].join(' ');
  const fontSrc = [
    `'self'`,
    'https://fonts.gstatic.com',
    'https://www.gstatic.com'
  ].join(' ');
  const frameSrc = [
    `'self'`,
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://www.recaptcha.net'
  ].join(' ');
  const policy = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `connect-src ${connectSrc}`,
    `font-src ${fontSrc}`,
    `frame-src ${frameSrc}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
    `report-uri /api/security/csp-violation`
  ].join('; ');
  return {
    key: reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
    value: policy
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = withBundleAnalyzer({
  // Enable experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'date-fns',
      '@radix-ui/react-*',
      'lucide-react',
      'react-icons',
    ],
  },
  modularizeImports: {
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
    'react-icons': {
      transform: 'react-icons/{{member}}',
    },
  },

  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'unsplash.com',
      'source.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Security headers
  async headers() {
    const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
    const csp = buildCSP({ env });
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-Download-Options', value: 'noopen' },
          { key: csp.key, value: csp.value },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NODE_ENV === 'production' ? 'https://globaltravelreport.com' : '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        recharts: {
          test: /[\\/]node_modules[\\/]recharts[\\/]/,
          name: 'recharts',
          chunks: 'all',
          priority: 20,
        },
        leaflet: {
          test: /[\\/]node_modules[\\/]leaflet[\\/]/,
          name: 'leaflet',
          chunks: 'all',
          priority: 20,
        },
        framerMotion: {
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          name: 'framer-motion',
          chunks: 'all',
          priority: 20,
        },
      };
    }
    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com',
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // Output configuration for static export if needed
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
});

module.exports = nextConfig;
