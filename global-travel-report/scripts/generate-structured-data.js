#!/usr/bin/env node

/**
 * Structured Data Generator
 * 
 * This script generates structured data for all pages:
 * 1. Adds Article schema to all story pages
 * 2. Adds TouristAttraction schema to destination pages
 * 3. Adds FAQPage schema to guide pages
 * 4. Adds BreadcrumbList schema to all pages
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');

// Configuration
const CONTENT_DIR = path.join(process.cwd(), 'content/articles');
const OUTPUT_DIR = path.join(process.cwd(), 'public/structured-data');
const SITE_URL = 'https://globaltravelreport.com';
const LOG_FILE = path.join(process.cwd(), 'logs', `structured-data-${new Date().toISOString().split('T')[0]}.log`);

// Create the output directory if it doesn't exist
async function createOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

// Create the logs directory if it doesn't exist
async function createLogsDir() {
  await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
  console.log(`Created logs directory: ${path.dirname(LOG_FILE)}`);
}

// Get all story files
async function getStoryFiles() {
  const files = await fs.readdir(CONTENT_DIR);
  return files.filter(file => file.endsWith('.md'));
}

// Parse a story file
async function parseStoryFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const { data, content: markdown } = matter(content);
  
  // Extract the first paragraph as the description if no summary is provided
  let description = data.summary || data.metaDescription || '';
  if (!description && markdown) {
    const match = markdown.match(/^(.+?)(?:\n\n|\n$)/);
    if (match) {
      description = match[1].replace(/[#*_]/g, '').trim();
    }
  }
  
  return {
    ...data,
    content: markdown,
    description
  };
}

// Generate Article schema for a story
function generateArticleSchema(story, slug) {
  const url = `${SITE_URL}/${slug}`;
  const datePublished = story.date || new Date().toISOString();
  const dateModified = story.updatedAt || datePublished;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': story.title,
    'description': story.description,
    'image': story.imageUrl ? [story.imageUrl] : [],
    'author': {
      '@type': 'Organization',
      'name': 'Global Travel Report Editorial Team',
      'url': `${SITE_URL}/about`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/logo-gtr.png`,
        'width': 600,
        'height': 60
      }
    },
    'datePublished': datePublished,
    'dateModified': dateModified,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    }
  };
}

// Generate TouristAttraction schema for destination pages
function generateTouristAttractionSchema(story, slug) {
  // Only generate for stories with a country
  if (!story.country || story.country === 'Global') {
    return null;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    'name': story.title,
    'description': story.description,
    'url': `${SITE_URL}/${slug}`,
    'image': story.imageUrl,
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': story.country
    }
  };
}

// Generate BreadcrumbList schema for a story
function generateBreadcrumbSchema(story, slug) {
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': SITE_URL
    }
  ];
  
  // Add category if available
  if (story.type) {
    const category = story.type.split(',')[0].trim();
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': 2,
      'name': category,
      'item': `${SITE_URL}/category/${category.toLowerCase().replace(/\s+/g, '-')}`
    });
  }
  
  // Add country if available
  if (story.country && story.country !== 'Global') {
    const position = breadcrumbItems.length + 1;
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': position,
      'name': story.country,
      'item': `${SITE_URL}/destination/${story.country.toLowerCase().replace(/\s+/g, '-')}`
    });
  }
  
  // Add the current page
  breadcrumbItems.push({
    '@type': 'ListItem',
    'position': breadcrumbItems.length + 1,
    'name': story.title,
    'item': `${SITE_URL}/${slug}`
  });
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems
  };
}

// Generate FAQPage schema for guide pages
function generateFAQSchema(story, content) {
  // Only generate for stories that are guides
  if (!story.title.toLowerCase().includes('guide') && 
      !story.title.toLowerCase().includes('tips') &&
      !story.title.toLowerCase().includes('how to')) {
    return null;
  }
  
  // Extract questions and answers from the content
  const faqs = [];
  const questionRegex = /#+\s*(.+?)\s*\n+([^#]+?)(?=\n+#|$)/g;
  let match;
  
  while ((match = questionRegex.exec(content)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim();
    
    if (question && answer) {
      faqs.push({
        '@type': 'Question',
        'name': question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': answer
        }
      });
    }
  }
  
  // Only create schema if we found at least one FAQ
  if (faqs.length === 0) {
    return null;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs
  };
}

// Generate all structured data for a story
async function generateStructuredData(storyFile) {
  const filePath = path.join(CONTENT_DIR, storyFile);
  const story = await parseStoryFile(filePath);
  
  // Get the slug from the filename or the frontmatter
  const slug = story.slug || storyFile.replace(/\.md$/, '');
  
  // Generate schemas
  const articleSchema = generateArticleSchema(story, slug);
  const touristAttractionSchema = generateTouristAttractionSchema(story, slug);
  const breadcrumbSchema = generateBreadcrumbSchema(story, slug);
  const faqSchema = generateFAQSchema(story, story.content);
  
  // Combine all schemas
  const schemas = [articleSchema];
  
  if (touristAttractionSchema) {
    schemas.push(touristAttractionSchema);
  }
  
  if (breadcrumbSchema) {
    schemas.push(breadcrumbSchema);
  }
  
  if (faqSchema) {
    schemas.push(faqSchema);
  }
  
  // Write the schemas to a file
  const outputPath = path.join(OUTPUT_DIR, `${slug}.json`);
  await fs.writeFile(outputPath, JSON.stringify(schemas, null, 2));
  
  return {
    file: storyFile,
    schemas: schemas.map(schema => schema['@type']),
    outputPath
  };
}

// Main function
async function main() {
  try {
    // Create output and logs directories
    await createOutputDir();
    await createLogsDir();
    
    // Initialize the log file
    await fs.writeFile(LOG_FILE, `Structured Data Generation Log - ${new Date().toISOString()}\n\n`);
    
    // Get all story files
    const storyFiles = await getStoryFiles();
    console.log(`Found ${storyFiles.length} story files.`);
    
    // Generate structured data for each story
    const results = [];
    
    for (let i = 0; i < storyFiles.length; i++) {
      const storyFile = storyFiles[i];
      console.log(`Processing ${i + 1}/${storyFiles.length}: ${storyFile}`);
      
      try {
        const result = await generateStructuredData(storyFile);
        results.push(result);
        await fs.appendFile(LOG_FILE, `Generated structured data for ${storyFile}: ${result.schemas.join(', ')}\n`);
      } catch (error) {
        console.error(`Error processing ${storyFile}:`, error);
        await fs.appendFile(LOG_FILE, `Error processing ${storyFile}: ${error.message}\n`);
      }
    }
    
    // Generate index file with all structured data
    const index = {
      lastUpdated: new Date().toISOString(),
      stories: results.map(result => ({
        file: result.file,
        slug: result.file.replace(/\.md$/, ''),
        schemas: result.schemas,
        path: path.relative(process.cwd(), result.outputPath)
      }))
    };
    
    await fs.writeFile(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index, null, 2));
    
    console.log('Done!');
    console.log(`Generated structured data for ${results.length} stories.`);
    console.log(`Log file created at: ${LOG_FILE}`);
  } catch (error) {
    console.error('Error generating structured data:', error);
  }
}

// Run the script
main();
