const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

async function generateSitemap() {
  const storiesDir = path.join(process.cwd(), 'data', 'stories')
  const stories = await glob('**/*.json', { cwd: storiesDir })
  
  const baseUrl = 'https://www.globaltravelreport.com'
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    
    // Add static pages
    `<url><loc>${baseUrl}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
    `<url><loc>${baseUrl}/contact</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,

    // Add story pages
    ...stories.map(story => {
      const slug = path.basename(story, '.json')
      return `<url><loc>${baseUrl}/stories/${slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
    }),

    // Add tag pages
    ...new Set(stories.flatMap(story => {
      const data = JSON.parse(fs.readFileSync(path.join(storiesDir, story), 'utf8'))
      return data.tags.map(tag => 
        `<url><loc>${baseUrl}/tags/${tag}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`
      )
    })),

    // Add country pages
    ...new Set(stories.map(story => {
      const data = JSON.parse(fs.readFileSync(path.join(storiesDir, story), 'utf8'))
      return `<url><loc>${baseUrl}/countries/${data.country}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`
    })),

    // Add category pages
    ...new Set(stories.map(story => {
      const data = JSON.parse(fs.readFileSync(path.join(storiesDir, story), 'utf8'))
      return `<url><loc>${baseUrl}/categories/${data.category}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`
    })),

    '</urlset>'
  ].join('\n')

  // Write sitemap to public directory
  fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap)
  console.log('Sitemap generated successfully!')
}

generateSitemap().catch(console.error) 