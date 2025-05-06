#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * This script optimizes all images in the public directory:
 * 1. Converts images to WebP format for better compression
 * 2. Generates responsive image sizes
 * 3. Optimizes existing JPG/PNG images
 * 4. Creates image metadata for faster loading
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGE_DIRS = ['images', 'img', 'assets/images'];
const SIZES = [640, 750, 828, 1080, 1200, 1920, 2048];
const LOG_FILE = path.join(process.cwd(), 'logs', `image-optimization-${new Date().toISOString().split('T')[0]}.log`);

// Check if required modules are installed
function checkRequirements() {
  try {
    require.resolve('sharp');
    require.resolve('imagemin');
    require.resolve('imagemin-webp');
    return true;
  } catch (error) {
    console.error('Required modules are not installed. Please run:');
    console.error('npm install sharp imagemin imagemin-webp --save-dev');
    return false;
  }
}

// Find all image files in the specified directories
async function findImageFiles() {
  const imageFiles = [];

  for (const dir of IMAGE_DIRS) {
    const dirPath = path.join(PUBLIC_DIR, dir);

    try {
      await fs.access(dirPath);
    } catch (error) {
      console.log(`Directory ${dirPath} does not exist, skipping.`);
      continue;
    }

    // Use glob to find all image files
    const pattern = path.join(dirPath, '**/*.{jpg,jpeg,png,gif}');
    const files = glob.sync(pattern);

    // Convert to the format we need
    const formattedFiles = files.map(file => {
      const relativePath = path.relative(PUBLIC_DIR, file);
      return {
        fullPath: file,
        relativePath
      };
    });

    imageFiles.push(...formattedFiles);
  }

  return imageFiles;
}

// Check if a file is an image
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
}

// Optimize a single image
async function optimizeImage(imageFile) {
  const { fullPath, relativePath } = imageFile;
  const ext = path.extname(fullPath).toLowerCase();
  const baseName = path.basename(fullPath, ext);
  const dirName = path.dirname(fullPath);

  // Read the image
  const imageBuffer = await fs.readFile(fullPath);

  // Create WebP version
  const webpPath = path.join(dirName, `${baseName}.webp`);
  await sharp(imageBuffer)
    .webp({ quality: 80 })
    .toFile(webpPath);

  // Optimize original image
  if (ext === '.jpg' || ext === '.jpeg') {
    await sharp(imageBuffer)
      .jpeg({ quality: 85, progressive: true })
      .toFile(fullPath);
  } else if (ext === '.png') {
    await sharp(imageBuffer)
      .png({ progressive: true, compressionLevel: 9 })
      .toFile(fullPath);
  }

  // Generate responsive sizes for WebP
  for (const size of SIZES) {
    const resizedPath = path.join(dirName, `${baseName}-${size}.webp`);
    await sharp(imageBuffer)
      .resize(size)
      .webp({ quality: 80 })
      .toFile(resizedPath);
  }

  return {
    original: relativePath,
    webp: relativePath.replace(ext, '.webp'),
    sizes: SIZES.map(size => ({
      width: size,
      path: relativePath.replace(ext, `-${size}.webp`)
    }))
  };
}

// Generate image metadata file
async function generateImageMetadata(optimizationResults) {
  const metadata = {
    lastUpdated: new Date().toISOString(),
    images: optimizationResults
  };

  const metadataPath = path.join(PUBLIC_DIR, 'image-metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  return metadataPath;
}

// Main function
async function main() {
  try {
    // Create logs directory if it doesn't exist
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });

    // Initialize the log file
    await fs.writeFile(LOG_FILE, `Image Optimization Log - ${new Date().toISOString()}\n\n`);

    // Check requirements
    if (!checkRequirements()) {
      await fs.appendFile(LOG_FILE, 'Required tools are not installed. Aborting.\n');
      return;
    }

    console.log('Finding image files...');
    const imageFiles = await findImageFiles();
    console.log(`Found ${imageFiles.length} image files.`);

    if (imageFiles.length === 0) {
      console.log('No images found to optimize.');
      await fs.appendFile(LOG_FILE, 'No images found to optimize.\n');
      return;
    }

    console.log('Optimizing images...');
    const optimizationResults = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      console.log(`Optimizing ${i + 1}/${imageFiles.length}: ${imageFile.relativePath}`);

      try {
        const result = await optimizeImage(imageFile);
        optimizationResults.push(result);
        await fs.appendFile(LOG_FILE, `Optimized: ${imageFile.relativePath}\n`);
      } catch (error) {
        console.error(`Error optimizing ${imageFile.relativePath}:`, error);
        await fs.appendFile(LOG_FILE, `Error optimizing ${imageFile.relativePath}: ${error.message}\n`);
      }
    }

    console.log('Generating image metadata...');
    const metadataPath = await generateImageMetadata(optimizationResults);
    console.log(`Image metadata generated at ${metadataPath}`);

    console.log('Done!');

    // Log statistics
    const statsLog = `
Statistics:
- Total images: ${imageFiles.length}
- Successfully optimized: ${optimizationResults.length}
- Failed: ${imageFiles.length - optimizationResults.length}
- WebP images created: ${optimizationResults.length}
- Responsive sizes created: ${optimizationResults.length * SIZES.length}
`;

    console.log(statsLog);
    await fs.appendFile(LOG_FILE, statsLog);

    console.log(`Log file created at: ${LOG_FILE}`);
  } catch (error) {
    console.error('Error optimizing images:', error);
    await fs.appendFile(LOG_FILE, `Error optimizing images: ${error.message}\n`);
  }
}

// Run the script
main();
