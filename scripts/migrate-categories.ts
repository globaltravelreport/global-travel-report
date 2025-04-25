import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles')

async function migrateCategories() {
  try {
    // Get all markdown files
    const files = await fs.promises.readdir(ARTICLES_DIRECTORY)
    const mdFiles = files.filter(file => file.endsWith('.md'))

    for (const filename of mdFiles) {
      const filePath = path.join(ARTICLES_DIRECTORY, filename)
      const fileContents = await fs.promises.readFile(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      // Skip if already has categories array
      if (Array.isArray(data.categories)) {
        console.log(`✓ ${filename} already has categories array`)
        continue
      }

      // Convert single category to array if it exists
      if (data.category) {
        data.categories = [data.category]
        delete data.category
        console.log(`→ ${filename}: converted '${data.category}' to categories array`)
      } else {
        data.categories = []
        console.log(`→ ${filename}: added empty categories array`)
      }

      // Write back to file
      const newFileContent = matter.stringify(content, data)
      await fs.promises.writeFile(filePath, newFileContent)
    }

    console.log('\nMigration completed successfully!')
  } catch (error) {
    console.error('Error during migration:', error)
    process.exit(1)
  }
}

migrateCategories() 