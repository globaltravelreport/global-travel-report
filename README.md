# Global Travel Report

A modern travel website built with Next.js, featuring RSS story fetching, OpenAI integration, and Unsplash images.

## Features

- Responsive design for mobile, tablet, and desktop
- Country and category dropdowns with search functionality
- RSS feed integration for travel stories
- OpenAI integration for story rewriting
- Unsplash integration for high-quality images
- Contact form with reCAPTCHA protection
- Newsletter signup
- SEO optimization
- Automatic story archiving

## Prerequisites

- Node.js 18+ and npm
- Git
- Vercel account
- OpenAI API key
- Unsplash API key
- reCAPTCHA site and secret keys

## Environment Variables

Create a `.env` file in the root directory with the following variables:

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

# RSS Feeds
RSS_FEED_URLS=https://www.lonelyplanet.com/blog/feed/,https://www.nationalgeographic.com/travel/feeds/travel-rss/,https://www.travelandleisure.com/rss/all.xml
```

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

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── countries/         # Country pages
│   ├── categories/        # Category pages
│   └── ...
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...
├── lib/                  # Utility functions
├── public/              # Static assets
└── scripts/             # Deployment scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Rodney & Nuch - [contact@globaltravelreport.com](mailto:contact@globaltravelreport.com)

Project Link: [https://github.com/yourusername/global-travel-report](https://github.com/yourusername/global-travel-report) 