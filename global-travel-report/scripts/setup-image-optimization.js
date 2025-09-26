#!/usr/bin/env node

/**
 * Setup Image Optimization
 * 
 * This script:
 * 1. Installs necessary dependencies for image optimization
 * 2. Creates required directories
 * 3. Sets up configuration files
 * 
 * Usage:
 * node scripts/setup-image-optimization.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  dependencies: {
    prod: [],
    dev: [
      'sharp',
      'glob',
      'imagemin',
      'imagemin-webp',
      '@babel/parser',
      '@babel/traverse'
    ]
  },
  directories: [
    './logs',
    './public/images/optimized'
  ]
};

// Install dependencies
function installDependencies() {
  console.log('Installing production dependencies...');
  if (config.dependencies.prod.length > 0) {
    execSync(`npm install ${config.dependencies.prod.join(' ')}`, { stdio: 'inherit' });
  } else {
    console.log('No production dependencies to install.');
  }
  
  console.log('Installing development dependencies...');
  if (config.dependencies.dev.length > 0) {
    execSync(`npm install --save-dev ${config.dependencies.dev.join(' ')}`, { stdio: 'inherit' });
  } else {
    console.log('No development dependencies to install.');
  }
}

// Create required directories
function createDirectories() {
  console.log('Creating required directories...');
  
  config.directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    } else {
      console.log(`Directory already exists: ${dir}`);
    }
  });
}

// Update next.config.js to optimize images
function updateNextConfig() {
  console.log('Updating Next.js configuration...');
  
  const configPath = './next.config.js';
  
  if (!fs.existsSync(configPath)) {
    console.error('next.config.js not found. Please create it first.');
    return;
  }
  
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Check if images configuration already exists
  if (configContent.includes('images:')) {
    console.log('Image configuration already exists in next.config.js');
    return;
  }
  
  // Add images configuration
  const imageConfig = `
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [
      'images.unsplash.com',
      'images.pexels.com',
      'res.cloudinary.com',
      'globaltravelreport.com',
      'www.globaltravelreport.com'
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },`;
  
  // Insert the configuration into the module.exports object
  const moduleExportsRegex = /module\.exports\s*=\s*{/;
  if (moduleExportsRegex.test(configContent)) {
    configContent = configContent.replace(
      moduleExportsRegex,
      `module.exports = {\n${imageConfig}`
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log('Updated next.config.js with image optimization settings');
  } else {
    console.error('Could not find module.exports in next.config.js');
  }
}

// Create a README file for image optimization
function createReadme() {
  console.log('Creating image optimization README...');
  
  const readmePath = './docs/IMAGE_OPTIMIZATION.md';
  const readmeDir = path.dirname(readmePath);
  
  if (!fs.existsSync(readmeDir)) {
    fs.mkdirSync(readmeDir, { recursive: true });
  }
  
  const readmeContent = `# Image Optimization Guide

## Overview

This project uses Next.js Image optimization along with custom scripts to ensure optimal image performance.

## Key Components

1. **OptimizedImage Component**: A wrapper around Next.js Image with additional features
2. **Image Optimization Scripts**: Tools to convert and optimize images
3. **Image Analysis**: Tools to identify image optimization opportunities

## Usage Guidelines

### Using the OptimizedImage Component

\`\`\`jsx
import { OptimizedImage } from '@/src/components/ui/OptimizedImage';

// For fixed size images
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description of the image"
  width={800}
  height={600}
  priority={isAboveTheFold}
  quality={85}
/>

// For responsive images that fill their container
<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description of the image"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
\`\`\`

### Running the Optimization Scripts

1. **Analyze Image Usage**:
   \`\`\`
   node scripts/analyze-image-usage.js
   \`\`\`

2. **Optimize Images**:
   \`\`\`
   node scripts/optimize-images.js
   \`\`\`

## Best Practices

1. **Always use the OptimizedImage component** instead of regular \`<img>\` tags
2. **Set the \`priority\` attribute** for above-the-fold images
3. **Provide proper \`sizes\` attribute** for responsive images
4. **Use WebP format** whenever possible
5. **Optimize large images** before adding them to the project

## Performance Impact

- Reduced page load time
- Improved Core Web Vitals scores
- Lower bandwidth usage
- Better user experience on all devices
`;
  
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`Created README at ${readmePath}`);
}

// Main function
function main() {
  console.log('Setting up image optimization...');
  
  try {
    installDependencies();
    createDirectories();
    updateNextConfig();
    createReadme();
    
    console.log('\nImage optimization setup complete!');
    console.log('\nNext steps:');
    console.log('1. Run the image analysis: node scripts/analyze-image-usage.js');
    console.log('2. Run the image optimization: node scripts/optimize-images.js');
    console.log('3. Read the documentation: docs/IMAGE_OPTIMIZATION.md');
  } catch (error) {
    console.error('Error setting up image optimization:', error);
  }
}

// Run the setup
main();
