/**
 * Convert Images to WebP Format
 * 
 * This script scans the public/images directory for JPG and PNG files
 * and converts them to WebP format for better performance.
 * 
 * Usage:
 * node scripts/convert-to-webp.js
 */

const fs = require('fs').promises;
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Configuration
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');
const QUALITY = 80;
const EXTENSIONS = ['.jpg', '.jpeg', '.png'];

/**
 * Convert an image to WebP format
 * @param {string} inputPath - Path to the input image
 * @returns {Promise<void>}
 */
async function convertToWebP(inputPath) {
  try {
    const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Skip if WebP version already exists
    try {
      await fs.access(outputPath);
      console.log(`WebP version already exists: ${outputPath}`);
      return;
    } catch (error) {
      // File doesn't exist, continue with conversion
    }
    
    // Load the image
    const image = await loadImage(inputPath);
    
    // Create a canvas with the same dimensions
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0);
    
    // Convert to WebP
    const webpData = canvas.toBuffer('image/webp', { quality: QUALITY / 100 });
    
    // Save the WebP image
    await fs.writeFile(outputPath, webpData);
    
    console.log(`Converted: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error);
  }
}

/**
 * Recursively scan a directory for images
 * @param {string} dir - Directory to scan
 * @returns {Promise<string[]>} - Array of image paths
 */
async function scanDirectory(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      return scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (EXTENSIONS.includes(ext)) {
        return [fullPath];
      }
    }
    
    return [];
  }));
  
  return files.flat();
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Starting image conversion to WebP...');
    
    // Create the images directory if it doesn't exist
    try {
      await fs.access(IMAGES_DIR);
    } catch (error) {
      console.log(`Creating directory: ${IMAGES_DIR}`);
      await fs.mkdir(IMAGES_DIR, { recursive: true });
    }
    
    // Scan for images
    const imagePaths = await scanDirectory(IMAGES_DIR);
    
    if (imagePaths.length === 0) {
      console.log('No images found to convert.');
      return;
    }
    
    console.log(`Found ${imagePaths.length} images to convert.`);
    
    // Convert images to WebP
    for (const imagePath of imagePaths) {
      await convertToWebP(imagePath);
    }
    
    console.log('Image conversion completed successfully!');
  } catch (error) {
    console.error('Error converting images:', error);
  }
}

// Run the script
main();
