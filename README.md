# Global Travel Report

A modern travel website built with Next.js, featuring RSS story fetching, OpenAI integration, and Unsplash images. The platform provides travel stories, guides, and insights from around the world with advanced search and filtering capabilities.

## Website

Visit the live site at [https://www.globaltravelreport.com/](https://www.globaltravelreport.com/)

![Global Travel Report Screenshot](public/images/screenshot.png)

## Features

### Core Features
- Responsive design for mobile, tablet, and desktop
- Country and category dropdowns with search functionality
- RSS feed integration for travel stories
- OpenAI integration for story rewriting and enhancement
- Unsplash integration for high-quality images
- Contact form with reCAPTCHA protection
- Newsletter signup with double opt-in
- Automatic story archiving

### Advanced Features
- Advanced search with multiple filters (country, category, tags, date range)
- Pagination for all story listings
- Structured data (JSON-LD) for better SEO
- WebP image optimization with fallbacks
- Lazy loading and infinite scroll options
- Social media sharing integration
- Comprehensive error handling and logging
- Rate limiting for API endpoints
- Response caching for improved performance

### Security Features
- Content Security Policy (CSP) implementation
- CSRF protection for all forms
- Input validation using Zod
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- API rate limiting to prevent abuse
- Secure authentication flows (if enabled)
- Regular security audits with automated tools

## Prerequisites

- Node.js 18+ and npm
- Git
- Vercel account
- OpenAI API key
- Unsplash API key
- reCAPTCHA site and secret keys

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# API Keys
OPENAI_API_KEY=your_openai_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here

# reCAPTCHA
RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# Redis (for caching)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://globaltravelreport.com
NEXT_PUBLIC_SITE_NAME="Global Travel Report"
NEXT_PUBLIC_SITE_DESCRIPTION="Travel stories, guides, and insights from around the world"

# RSS Feeds
RSS_FEED_URLS=https://www.lonelyplanet.com/blog/feed/,https://www.nationalgeographic.com/travel/feeds/travel-rss/,https://www.travelandleisure.com/rss/all.xml

# Email Configuration (for contact form and newsletter)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@globaltravelreport.com

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
ENABLE_NEWSLETTER=true
ENABLE_COMMENTS=false
ENABLE_USER_ACCOUNTS=false

# Performance
ENABLE_IMAGE_OPTIMIZATION=true
ENABLE_API_CACHING=true
CACHE_TTL=3600
```

For production environments, make sure to set these variables in your hosting platform (e.g., Vercel).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/global-travel-report.git
   cd global-travel-report
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues
- `npm test` - Run Jest tests
- `npm run security-audit` - Run security audit on the codebase
- `npm run convert-to-functional` - Convert class components to functional components

## Deployment

### Automatic Deployment

Use the provided deployment script:

```bash
./scripts/deploy.sh
```

This script will:
1. Commit any uncommitted changes
2. Push changes to GitHub
3. Deploy to Vercel

### Manual Deployment

1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Project Structure

```
global-travel-report/
├── app/                     # Next.js app directory
│   ├── api/                # API routes
│   │   ├── contact/       # Contact form API
│   │   ├── newsletter/    # Newsletter signup API
│   │   ├── story/         # Story-related APIs
│   │   └── ...
│   ├── countries/          # Country pages
│   ├── categories/         # Category pages
│   ├── search/             # Search page
│   ├── stories/            # Individual story pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/             # React components
│   ├── analytics/         # Analytics components
│   ├── layout/            # Layout components
│   ├── search/            # Search components
│   ├── seo/               # SEO components
│   ├── stories/           # Story components
│   └── ui/                # UI components
├── hooks/                  # Custom React hooks
│   ├── useApi.ts          # API request hook
│   ├── useFormSubmit.ts   # Form submission hook
│   └── ...
├── lib/                    # Utility functions
│   ├── stories.ts         # Story-related utilities
│   └── ...
├── middleware.ts           # Next.js middleware
├── public/                 # Static assets
│   ├── images/            # Static images
│   ├── fonts/             # Fonts
│   └── ...
├── scripts/                # Utility scripts
│   ├── convert-to-functional.js  # Convert class to functional components
│   ├── security-audit.js         # Security audit script
│   └── ...
├── src/                    # Source code
│   ├── api/                # API types and utilities
│   ├── config/             # Configuration
│   ├── middleware/         # Middleware modules
│   ├── mocks/              # Mock data
│   ├── services/           # Service modules
│   └── utils/              # Utility modules
├── styles/                 # Global styles
│   ├── globals.css        # Global CSS
│   └── ...
├── types/                  # TypeScript type definitions
│   ├── Story.ts           # Story type definitions
│   └── ...
├── __tests__/              # Test files
│   ├── components/        # Component tests
│   ├── lib/               # Library tests
│   └── utils/             # Utility tests
├── .env.example            # Example environment variables
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore file
├── jest.config.js          # Jest configuration
├── next.config.js          # Next.js configuration
├── package.json            # NPM package file
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Testing

The project uses Jest for unit and integration testing. To run the tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- __tests__/lib/stories.test.ts
```

### Test Structure

- Unit tests for utility functions
- Component tests using React Testing Library
- Integration tests for API routes
- End-to-end tests using Cypress (optional)

## Documentation

### Code Documentation

- All functions, components, and types are documented with JSDoc comments
- Complex logic includes inline comments explaining the approach
- API endpoints are documented with request/response examples

### API Documentation

API endpoints are documented in the codebase. Here are the main endpoints:

- `GET /api/stories` - Get all stories with optional filtering
- `GET /api/stories/:slug` - Get a specific story by slug
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/story/rewrite` - Rewrite a story using OpenAI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write tests for new features
- Update documentation for API changes
- Run the security audit before submitting PRs
- Ensure all tests pass before submitting PRs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Rodney & Nuch - [contact@globaltravelreport.com](mailto:contact@globaltravelreport.com)

Project Link: [https://github.com/yourusername/global-travel-report](https://github.com/yourusername/global-travel-report)