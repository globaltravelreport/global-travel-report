# Global Travel Report

A modern web application for sharing and discovering travel stories from around the world. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 📝 Share your travel stories
- 🌍 Discover stories from around the world
- 🖼️ Image optimization with Next.js Image
- 📱 Fully responsive design
- ⚡ Fast page loads with Next.js App Router
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui
- 🔍 SEO optimized with metadata and sitemaps

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/global-travel-report.git
   cd global-travel-report
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                 # Next.js 14 app directory
│   ├── api/            # API routes
│   ├── stories/        # Story pages
│   └── submit/         # Story submission page
├── components/         # React components
│   ├── layout/        # Layout components
│   ├── stories/       # Story-related components
│   └── ui/            # UI components
├── public/            # Static files
└── types/             # TypeScript type definitions
```

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Adding New Stories

Stories are stored as JSON files in the `data/stories` directory. Each story should follow this structure:

```json
{
  "title": "Story Title",
  "slug": "story-title",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "category": "Category",
  "country": "Country",
  "body": "Story content in Markdown format",
  "featured": false,
  "published": true,
  "timestamp": "2024-03-20T12:00:00Z",
  "imageName": "image.jpg",
  "author": "Author Name",
  "readTime": 5,
  "tags": ["tag1", "tag2"],
  "isSponsored": false,
  "editorsPick": false
}
```

## Configuration

### Authors
Add new authors in `data/authors.json`. Each author should have:
- name
- bio
- social links
- profile image

### Countries & Categories
Update `data/countries.json` and `data/categories.json` to add new options.

### Tags
Tags are managed in `data/tags.json`. Add new tags with:
- name
- description
- related keywords

### Feature Toggles
Enable/disable features in `config/features.json`:
- comments
- social sharing
- newsletter signup
- related stories

## SEO & Sitemap

- Each story has meta title and description
- Dynamic sitemap generated at `/sitemap.xml`
- Robots.txt at `/robots.txt`
- OpenGraph and Twitter card meta tags

## reCAPTCHA Setup

1. Get API keys from Google reCAPTCHA
2. Add to `.env`:
   ```
   RECAPTCHA_SITE_KEY=your_site_key
   RECAPTCHA_SECRET_KEY=your_secret_key
   ```

## Deployment

The project is configured for Vercel deployment:

1. Push to main branch
2. Vercel will automatically deploy
3. Environment variables are managed in Vercel dashboard

## Version 1.0 Features

- Story listing with pagination
- Filtering by category, country, tags
- Search functionality
- Mobile-responsive design
- SEO optimization
- Basic analytics

## Future Enhancements

- User authentication
- Comments system
- Newsletter integration
- Advanced analytics
- Story export functionality
- Additional sort options

## Project Status (2025)

- ✅ No Sentry or error tracking code (fully removed)
- ✅ Builds cleanly with Next.js 14, React 18, and TypeScript
- ✅ GitHub repository connected for version control and collaboration
- ✅ Automated CI build checks via GitHub Actions
- ✅ Consistent dependency installs enforced with .npmrc

## Continuous Integration (CI)

A basic GitHub Actions workflow is included to automatically run build checks on every push to main and pull request. See `.github/workflows/ci.yml` for details.

## Dependency Management

A `.npmrc` file is included to enforce consistent installs across all environments 