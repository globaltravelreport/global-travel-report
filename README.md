# Global Travel Report

A modern travel blog platform built with Next.js, TypeScript, and Tailwind CSS.

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with required environment variables
4. Run the development server: `npm run dev`

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