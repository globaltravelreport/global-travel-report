#!/usr/bin/env node

/**
 * Keyword Optimizer for Global Travel Report
 * 
 * This script analyzes content files and suggests SEO improvements:
 * - Keyword density analysis
 * - Title and meta description optimization
 * - Heading structure analysis
 * - Internal linking suggestions
 * - Image alt text recommendations
 * 
 * Usage: node scripts/keyword-optimizer.js [--file=path/to/file.md] [--dir=path/to/directory]
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const chalk = require('chalk');

// Travel-related keyword lists
const PRIMARY_KEYWORDS = [
  'travel', 'destination', 'vacation', 'holiday', 'tourism', 
  'adventure', 'cruise', 'flight', 'hotel', 'resort',
  'australia', 'sydney', 'melbourne', 'brisbane', 'perth',
  'global travel', 'travel guide', 'travel tips', 'travel news'
];

const SECONDARY_KEYWORDS = [
  'budget travel', 'luxury travel', 'family travel', 'solo travel',
  'beach vacation', 'city break', 'road trip', 'backpacking',
  'all-inclusive', 'tour package', 'travel insurance', 'travel agency',
  'australian tourism', 'australian travel', 'travel australia'
];

const LONG_TAIL_KEYWORDS = [
  'best time to visit australia',
  'how to plan a cruise vacation',
  'budget travel tips for australia',
  'luxury resorts in sydney',
  'family-friendly destinations in australia',
  'best beaches in australia',
  'australian travel guide for beginners',
  'hidden gems in sydney',
  'must-see attractions in melbourne',
  'how to save money on australian travel'
];

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  file: getArgValue(args, '--file'),
  dir: getArgValue(args, '--dir', 'content/articles'),
  verbose: args.includes('--verbose')
};

// Main function
async function main() {
  console.log(chalk.blue.bold('🔍 Global Travel Report - Keyword Optimizer'));
  console.log(chalk.blue('===========================================\n'));

  if (options.file) {
    // Analyze a single file
    await analyzeFile(options.file);
  } else if (options.dir) {
    // Analyze all files in a directory
    await analyzeDirectory(options.dir);
  } else {
    console.log(chalk.yellow('No file or directory specified. Using default directory: content/articles'));
    await analyzeDirectory('content/articles');
  }
}

// Analyze a single file
async function analyzeFile(filePath) {
  try {
    console.log(chalk.cyan(`\nAnalyzing file: ${filePath}`));
    
    // Read the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter and content
    const { data, content } = matter(fileContent);
    
    // Analyze the content
    const analysis = analyzeContent(data, content);
    
    // Print the analysis
    printAnalysis(filePath, analysis);
    
    // Suggest improvements
    suggestImprovements(filePath, data, content, analysis);
    
    return analysis;
  } catch (error) {
    console.error(chalk.red(`Error analyzing file ${filePath}: ${error.message}`));
    return null;
  }
}

// Analyze all files in a directory
async function analyzeDirectory(dirPath) {
  try {
    // Get all markdown files in the directory
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md'))
      .map(file => path.join(dirPath, file));
    
    console.log(chalk.cyan(`Found ${files.length} files in ${dirPath}`));
    
    // Analyze each file
    const results = [];
    for (const file of files) {
      const analysis = await analyzeFile(file);
      if (analysis) {
        results.push({ file, analysis });
      }
    }
    
    // Print summary
    console.log(chalk.blue.bold('\n📊 Summary'));
    console.log(chalk.blue('==================='));
    
    console.log(chalk.cyan(`Total files analyzed: ${results.length}`));
    
    const lowKeywordDensity = results.filter(r => r.analysis.keywordDensity < 1).length;
    console.log(chalk.yellow(`Files with low keyword density (<1%): ${lowKeywordDensity}`));
    
    const shortContent = results.filter(r => r.analysis.wordCount < 500).length;
    console.log(chalk.yellow(`Files with short content (<500 words): ${shortContent}`));
    
    const missingMeta = results.filter(r => !r.analysis.hasMetaDescription).length;
    console.log(chalk.yellow(`Files missing meta description: ${missingMeta}`));
    
    const missingAlt = results.filter(r => r.analysis.missingAltText > 0).length;
    console.log(chalk.yellow(`Files with images missing alt text: ${missingAlt}`));
    
    return results;
  } catch (error) {
    console.error(chalk.red(`Error analyzing directory ${dirPath}: ${error.message}`));
    return [];
  }
}

// Analyze content for SEO metrics
function analyzeContent(frontmatter, content) {
  // Count words
  const wordCount = content.split(/\s+/).length;
  
  // Count primary keywords
  const primaryKeywordCount = countKeywords(content, PRIMARY_KEYWORDS);
  
  // Count secondary keywords
  const secondaryKeywordCount = countKeywords(content, SECONDARY_KEYWORDS);
  
  // Count long-tail keywords
  const longTailKeywordCount = countKeywords(content, LONG_TAIL_KEYWORDS);
  
  // Calculate keyword density
  const totalKeywordCount = primaryKeywordCount + secondaryKeywordCount;
  const keywordDensity = (totalKeywordCount / wordCount) * 100;
  
  // Check meta description
  const hasMetaDescription = frontmatter.description && frontmatter.description.length > 0;
  
  // Check title
  const hasOptimizedTitle = frontmatter.title && 
    (containsAnyKeyword(frontmatter.title, PRIMARY_KEYWORDS) || 
     containsAnyKeyword(frontmatter.title, SECONDARY_KEYWORDS));
  
  // Check headings
  const headings = content.match(/#{1,6}\s+.+/g) || [];
  const headingCount = headings.length;
  
  // Check images and alt text
  const imageMatches = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
  const imageCount = imageMatches.length;
  const missingAltText = imageMatches.filter(img => img.match(/!\[\]\(/)).length;
  
  // Check internal links
  const internalLinks = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [])
    .filter(link => !link.includes('http'));
  const internalLinkCount = internalLinks.length;
  
  return {
    wordCount,
    primaryKeywordCount,
    secondaryKeywordCount,
    longTailKeywordCount,
    keywordDensity,
    hasMetaDescription,
    hasOptimizedTitle,
    headingCount,
    imageCount,
    missingAltText,
    internalLinkCount
  };
}

// Print analysis results
function printAnalysis(filePath, analysis) {
  console.log(chalk.green.bold('\n📝 Content Analysis'));
  console.log(chalk.green('-------------------'));
  console.log(`Word count: ${analysis.wordCount}`);
  console.log(`Primary keywords: ${analysis.primaryKeywordCount}`);
  console.log(`Secondary keywords: ${analysis.secondaryKeywordCount}`);
  console.log(`Long-tail keywords: ${analysis.longTailKeywordCount}`);
  console.log(`Keyword density: ${analysis.keywordDensity.toFixed(2)}%`);
  console.log(`Meta description: ${analysis.hasMetaDescription ? 'Yes' : 'No'}`);
  console.log(`Optimized title: ${analysis.hasOptimizedTitle ? 'Yes' : 'No'}`);
  console.log(`Headings: ${analysis.headingCount}`);
  console.log(`Images: ${analysis.imageCount}`);
  console.log(`Images missing alt text: ${analysis.missingAltText}`);
  console.log(`Internal links: ${analysis.internalLinkCount}`);
}

// Suggest improvements based on analysis
function suggestImprovements(filePath, frontmatter, content, analysis) {
  console.log(chalk.yellow.bold('\n🔧 Suggested Improvements'));
  console.log(chalk.yellow('------------------------'));
  
  const suggestions = [];
  
  // Word count suggestions
  if (analysis.wordCount < 300) {
    suggestions.push('Content is very short. Aim for at least 500 words for better SEO.');
  } else if (analysis.wordCount < 500) {
    suggestions.push('Content is a bit short. Consider expanding to 800+ words for better ranking.');
  }
  
  // Keyword density suggestions
  if (analysis.keywordDensity < 0.5) {
    suggestions.push('Keyword density is too low. Include more relevant keywords naturally.');
  } else if (analysis.keywordDensity > 3) {
    suggestions.push('Keyword density may be too high. Avoid keyword stuffing.');
  }
  
  // Meta description suggestions
  if (!analysis.hasMetaDescription) {
    suggestions.push('Add a meta description with primary keywords.');
  }
  
  // Title suggestions
  if (!analysis.hasOptimizedTitle) {
    suggestions.push('Optimize the title to include primary keywords.');
  }
  
  // Heading suggestions
  if (analysis.headingCount < 3) {
    suggestions.push('Add more headings (H2, H3) with keywords to structure content better.');
  }
  
  // Image suggestions
  if (analysis.missingAltText > 0) {
    suggestions.push(`Add alt text to ${analysis.missingAltText} images for better accessibility and SEO.`);
  }
  
  // Internal linking suggestions
  if (analysis.internalLinkCount < 2) {
    suggestions.push('Add more internal links to related content.');
  }
  
  // Print suggestions
  if (suggestions.length === 0) {
    console.log(chalk.green('✅ Content is well-optimized!'));
  } else {
    suggestions.forEach(suggestion => {
      console.log(`- ${suggestion}`);
    });
  }
}

// Helper functions
function countKeywords(text, keywords) {
  const lowerText = text.toLowerCase();
  return keywords.reduce((count, keyword) => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    const matches = lowerText.match(regex) || [];
    return count + matches.length;
  }, 0);
}

function containsAnyKeyword(text, keywords) {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g');
    return regex.test(lowerText);
  });
}

function getArgValue(args, name, defaultValue = null) {
  const arg = args.find(arg => arg.startsWith(`${name}=`));
  if (!arg) return defaultValue;
  return arg.split('=')[1];
}

// Run the script
main().catch(console.error);
