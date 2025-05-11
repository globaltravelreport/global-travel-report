#!/usr/bin/env node

/**
 * Image Usage Analysis Script
 * 
 * This script analyzes the codebase to find:
 * 1. Regular <img> tags that should be converted to Next.js Image
 * 2. Images without proper sizing attributes
 * 3. Images without proper loading strategies
 * 4. Large images that should be optimized
 * 
 * Usage:
 * node scripts/analyze-image-usage.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Configuration
const config = {
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  directories: ['./app', './components', './src'],
  excludeDirs: ['node_modules', '.next', 'out', 'build', 'dist'],
  reportPath: './image-analysis-report.md'
};

// Initialize report data
const report = {
  regularImgTags: [],
  missingSizes: [],
  missingLoading: [],
  largeImages: [],
  nonOptimizedComponents: []
};

// Find all files to analyze
function findFiles() {
  const patterns = config.directories.map(dir => 
    `${dir}/**/*{${config.extensions.join(',')}}`
  );
  
  let allFiles = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: config.excludeDirs.map(dir => `**/${dir}/**`)
    });
    allFiles = [...allFiles, ...files];
  });
  
  return allFiles;
}

// Analyze a single file
async function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip empty files
    if (!content.trim()) return;
    
    // Parse the file
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy']
    });
    
    // Traverse the AST
    traverse(ast, {
      // Find regular img tags
      JSXElement(path) {
        const element = path.node;
        if (element.openingElement.name.name === 'img') {
          report.regularImgTags.push({
            file: filePath,
            line: element.loc?.start.line || 0
          });
        }
      },
      
      // Find Image components without proper props
      JSXOpeningElement(path) {
        const element = path.node;
        if (element.name.name === 'Image' || element.name.name === 'NextImage') {
          const props = element.attributes.map(attr => 
            attr.name && attr.name.name
          ).filter(Boolean);
          
          // Check for missing sizes
          if (!props.includes('sizes') && !props.includes('fill')) {
            report.missingSizes.push({
              file: filePath,
              line: element.loc?.start.line || 0
            });
          }
          
          // Check for missing loading strategy
          if (!props.includes('priority') && !props.includes('loading')) {
            report.missingLoading.push({
              file: filePath,
              line: element.loc?.start.line || 0
            });
          }
        }
      }
    });
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
  }
}

// Find large images in the public directory
function findLargeImages() {
  const imageFiles = glob.sync('./public/**/*.{jpg,jpeg,png,gif}');
  
  imageFiles.forEach(imagePath => {
    try {
      const stats = fs.statSync(imagePath);
      const sizeInMB = stats.size / (1024 * 1024);
      
      if (sizeInMB > 0.2) { // Images larger than 200KB
        report.largeImages.push({
          path: imagePath,
          size: sizeInMB.toFixed(2) + ' MB'
        });
      }
    } catch (error) {
      console.error(`Error checking image size for ${imagePath}:`, error.message);
    }
  });
}

// Find components that might be using images without optimization
function findNonOptimizedComponents() {
  const files = findFiles();
  
  files.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for image-related imports without Next.js Image
      if (
        (content.includes('background-image') || content.includes('backgroundImage')) &&
        !content.includes('import Image from') &&
        !content.includes('OptimizedImage')
      ) {
        report.nonOptimizedComponents.push({
          file: filePath
        });
      }
    } catch (error) {
      console.error(`Error checking component ${filePath}:`, error.message);
    }
  });
}

// Generate a markdown report
function generateReport() {
  let markdown = `# Image Usage Analysis Report\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Regular img tags
  markdown += `## Regular \`<img>\` Tags\n\n`;
  if (report.regularImgTags.length === 0) {
    markdown += `✅ No regular \`<img>\` tags found. Great job!\n\n`;
  } else {
    markdown += `⚠️ Found ${report.regularImgTags.length} regular \`<img>\` tags that should be converted to Next.js Image:\n\n`;
    markdown += `| File | Line |\n|------|------|\n`;
    report.regularImgTags.forEach(item => {
      markdown += `| ${item.file} | ${item.line} |\n`;
    });
    markdown += `\n`;
  }
  
  // Missing sizes
  markdown += `## Missing \`sizes\` Attribute\n\n`;
  if (report.missingSizes.length === 0) {
    markdown += `✅ All Image components have proper \`sizes\` attributes. Great job!\n\n`;
  } else {
    markdown += `⚠️ Found ${report.missingSizes.length} Image components without proper \`sizes\` attribute:\n\n`;
    markdown += `| File | Line |\n|------|------|\n`;
    report.missingSizes.forEach(item => {
      markdown += `| ${item.file} | ${item.line} |\n`;
    });
    markdown += `\n`;
  }
  
  // Missing loading strategy
  markdown += `## Missing Loading Strategy\n\n`;
  if (report.missingLoading.length === 0) {
    markdown += `✅ All Image components have proper loading strategies. Great job!\n\n`;
  } else {
    markdown += `⚠️ Found ${report.missingLoading.length} Image components without proper loading strategy:\n\n`;
    markdown += `| File | Line |\n|------|------|\n`;
    report.missingLoading.forEach(item => {
      markdown += `| ${item.file} | ${item.line} |\n`;
    });
    markdown += `\n`;
  }
  
  // Large images
  markdown += `## Large Images\n\n`;
  if (report.largeImages.length === 0) {
    markdown += `✅ No large unoptimized images found. Great job!\n\n`;
  } else {
    markdown += `⚠️ Found ${report.largeImages.length} large images that should be optimized:\n\n`;
    markdown += `| Image Path | Size |\n|-----------|------|\n`;
    report.largeImages.forEach(item => {
      markdown += `| ${item.path} | ${item.size} |\n`;
    });
    markdown += `\n`;
  }
  
  // Non-optimized components
  markdown += `## Potential Non-Optimized Components\n\n`;
  if (report.nonOptimizedComponents.length === 0) {
    markdown += `✅ No components with potential non-optimized images found. Great job!\n\n`;
  } else {
    markdown += `⚠️ Found ${report.nonOptimizedComponents.length} components that might be using non-optimized images:\n\n`;
    markdown += `| Component File |\n|---------------|\n`;
    report.nonOptimizedComponents.forEach(item => {
      markdown += `| ${item.file} |\n`;
    });
    markdown += `\n`;
  }
  
  // Recommendations
  markdown += `## Recommendations\n\n`;
  markdown += `1. **Convert Regular \`<img>\` Tags**: Replace all regular \`<img>\` tags with Next.js \`<Image>\` or \`<OptimizedImage>\` component.\n`;
  markdown += `2. **Add \`sizes\` Attribute**: Ensure all Image components have proper \`sizes\` attribute for responsive loading.\n`;
  markdown += `3. **Add Loading Strategy**: Use \`priority\` for above-the-fold images and \`loading="lazy"\` for below-the-fold images.\n`;
  markdown += `4. **Optimize Large Images**: Compress large images and convert them to WebP format.\n`;
  markdown += `5. **Use OptimizedImage Component**: Replace direct image usage with the \`<OptimizedImage>\` component.\n\n`;
  
  // Next steps
  markdown += `## Next Steps\n\n`;
  markdown += `1. Run the image optimization script: \`node scripts/optimize-images.js\`\n`;
  markdown += `2. Fix the issues identified in this report\n`;
  markdown += `3. Re-run this analysis to verify improvements\n`;
  
  return markdown;
}

// Main function
async function main() {
  console.log('Starting image usage analysis...');
  
  // Find all files to analyze
  const files = findFiles();
  console.log(`Found ${files.length} files to analyze.`);
  
  // Analyze each file
  for (const file of files) {
    await analyzeFile(file);
  }
  
  // Find large images
  findLargeImages();
  
  // Find non-optimized components
  findNonOptimizedComponents();
  
  // Generate report
  const reportContent = generateReport();
  fs.writeFileSync(config.reportPath, reportContent);
  
  console.log(`Analysis complete! Report saved to ${config.reportPath}`);
}

// Check if required modules are installed
try {
  require.resolve('@babel/parser');
  require.resolve('@babel/traverse');
  require.resolve('glob');
} catch (error) {
  console.error('Required dependencies not found. Please install them:');
  console.error('npm install --save-dev @babel/parser @babel/traverse glob');
  process.exit(1);
}

// Run the analysis
main().catch(error => {
  console.error('Error running image analysis:', error);
});
