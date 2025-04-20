# Global Travel Report

A Next.js-based travel news and content platform.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Vercel account (for deployment)

## Environment Variables

Create a `.env.local` file in the root directory with:

```env
# OpenAI API Key for content generation
OPENAI_API_KEY=your_openai_key

# reCAPTCHA Keys
RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key

# Optional: Development overrides
NODE_ENV=development
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
global-travel-report/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── data/             # Static data
│   └── (articles)/       # Article pages
├── public/               # Static assets
├── scripts/             # Build and utility scripts
└── types/              # TypeScript types
```

## Authentication

The `/rewrite` route is protected with Basic Authentication:
- Username: `Admin`
- Password: `Nuch07!`

## Deployment

1. Push to GitHub:
```bash
git push origin main
```

2. Vercel will automatically deploy from the main branch.

### Required Vercel Environment Variables

- `OPENAI_API_KEY`
- `RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`

## Data Structure

Articles are stored in `app/data/articles.json` with the following structure:

```typescript
interface Article {
  title: string;
  slug: string;
  content: string;
  date: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  summary?: string;
  category?: string;
  status?: 'draft' | 'published';
  author?: string;
}
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check `.env.local` exists with required variables
   - Verify `articles.json` is valid JSON
   - Ensure all required fields are present in articles

2. **Image Loading**
   - Verify image paths in articles
   - Check `next.config.js` remote patterns
   - Ensure images are in the correct format

3. **Authentication**
   - Verify middleware.ts configuration
   - Check credentials in development
   - Confirm production environment variables

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests: `npm run test`
4. Submit pull request

## License

MIT 