const fs = require('fs').promises
const path = require('path')
const matter = require('gray-matter')

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles')

// Define category mappings
const CATEGORY_MAPPINGS = {
  'Destination': ['destination', 'country', 'city', 'region'],
  'Hotel': ['hotel', 'accommodation', 'resort', 'stay'],
  'Airline': ['airline', 'flight', 'airport', 'travel'],
  'Experience': ['experience', 'adventure', 'activity', 'tour']
}

async function fixStoryCategories() {
  try {
    const files = await fs.readdir(ARTICLES_DIR)
    const mdFiles = files.filter(file => file.endsWith('.md'))

    for (const file of mdFiles) {
      const filePath = path.join(ARTICLES_DIR, file)
      const content = await fs.readFile(filePath, 'utf8')
      const { data, content: markdownContent } = matter(content)

      // Fix the type field
      let type = data.type || ''
      if (typeof type === 'string') {
        // Remove any numbering or prefixes
        type = type.replace(/^\d+\.\s*/, '')
        
        // Map to correct category
        for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
          if (keywords.some(keyword => type.toLowerCase().includes(keyword))) {
            type = category
            break
          }
        }
      }

      // Fix the country field
      let country = data.country || ''
      if (typeof country === 'string') {
        // Remove any numbering or prefixes
        country = country.replace(/^\d+\.\s*/, '')
      }

      // Fix the slug
      let slug = data.slug || file.replace('.md', '')
      if (typeof slug === 'string') {
        // Remove any numbering or prefixes
        slug = slug.replace(/^\d+\.\s*/, '')
        // Convert to URL-friendly format
        slug = slug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }

      // Update the frontmatter
      const updatedData = {
        ...data,
        type,
        country,
        slug,
        date: data.date || new Date().toISOString(),
        published: data.published !== false
      }

      // Write the updated content back to the file
      const updatedContent = matter.stringify(markdownContent, updatedData)
      await fs.writeFile(filePath, updatedContent)

      console.log(`Updated ${file}:`)
      console.log(`  Type: ${type}`)
      console.log(`  Country: ${country}`)
      console.log(`  Slug: ${slug}`)
    }

    console.log('All stories have been updated successfully!')
  } catch (error) {
    console.error('Error updating stories:', error)
  }
}

fixStoryCategories() 