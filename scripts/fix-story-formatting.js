const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

const ARTICLES_DIRECTORY = path.join(process.cwd(), 'content/articles');

function cleanValue(value) {
  if (!value) return value;
  // Remove numbered prefixes like "11.", "13.", "7.", etc.
  return value.replace(/^\d+\.\s*/, '')
    // Remove "Primary destination country" prefix
    .replace(/^Primary destination country:?\s*/i, '')
    // Remove "Type of travel" prefix
    .replace(/^Type of travel:?\s*/i, '')
    // Remove asterisks
    .replace(/\*\*/g, '')
    // Remove any trailing numbers (like "12.")
    .replace(/\s+\d+\.?$/, '')
    .trim();
}

function cleanAndDeduplicateArray(arr) {
  if (!Array.isArray(arr)) return [];
  
  // Clean each value and filter out empty strings
  const cleaned = arr
    .map(item => cleanValue(item))
    .filter(Boolean);
  
  // Remove duplicates and sort
  return [...new Set(cleaned)].sort();
}

async function fixStoryFormatting() {
  try {
    // Get all markdown files
    const files = await fs.readdir(ARTICLES_DIRECTORY);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    for (const file of markdownFiles) {
      const filePath = path.join(ARTICLES_DIRECTORY, file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const { data, content: markdownContent } = matter(fileContent);

      // Fix the title
      let title = cleanValue(data.title || '');

      // Fix the country
      let country = cleanValue(data.country);

      // Fix the type
      let type = cleanValue(data.type);

      // Fix keywords array
      let keywords = cleanAndDeduplicateArray(data.keywords);

      // Fix the content
      let content = markdownContent;
      
      // Remove numbered sections
      content = content.replace(/^\d+\.\s*(.*?)(?=\n|$)/gm, '$1');
      
      // Remove markdown formatting
      content = content.replace(/\*\*(.*?)\*\*/g, '$1');

      // Update the frontmatter
      const updatedData = {
        ...data,
        title,
        country,
        type,
        keywords
      };

      // Write the updated content back to the file
      const updatedContent = matter.stringify(content, updatedData);
      await fs.writeFile(filePath, updatedContent);

      console.log(`Updated ${file}:`);
      console.log(`  Title: ${title}`);
      if (country) console.log(`  Country: ${country}`);
      if (type) console.log(`  Type: ${type}`);
      if (keywords.length) console.log(`  Keywords: ${keywords.join(', ')}`);
    }

    console.log('All stories have been updated successfully!');
  } catch (error) {
    console.error('Error updating stories:', error);
    process.exit(1);
  }
}

// Run the script
fixStoryFormatting(); 