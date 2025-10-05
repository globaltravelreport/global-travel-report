/**
 * Convert Images to WebP and AVIF Formats
 *
 * This script scans the public/images directory for JPG and PNG files
 * and converts them to WebP and AVIF formats for better performance.
 *
 * Usage:
 * node scripts/convert-to-webp.js [--avif] [--quality=80] [--dir=public/images]
 *
 * Options:
 *   --avif       Also convert to AVIF format (default: false)
 *   --quality    Quality setting (1-100, default: 80)
 *   --dir        Directory to scan (default: public/images)
 *   --force      Force conversion even if files already exist
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const sharp = require('sharp');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  avif: false,
  quality: 80,
  dir: 'public/images',
  force: false
};

args.forEach(arg => {
  if (arg === '--avif') {
    options.avif = true;
  } else if (arg.startsWith('--quality=')) {
    options.quality = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--dir=')) {
    options.dir = arg.split('=')[1];
  } else if (arg === '--force') {
    options.force = true;
  }
});

// Configuration
const IMAGES_DIR = path.join(process.cwd(), options.dir);
const QUALITY = options.quality;
const EXTENSIONS = ['.jpg', '.jpeg', '.png'];

// Statistics
const stats = {
  processed: 0,
  webpConverted: 0,
  avifConverted: 0,
  skipped: 0,
  errors: 0,
  totalSavings: 0
};

/**
 * Convert an image to WebP and optionally AVIF format
 * @param {string} inputPath - Path to the input image
 * @returns {Promise<void>}
 */
async function convertToWebP(inputPath) {
  try {
    const webpPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const avifPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.avif');

    // Get original file size
    const originalSize = fsSync.statSync(inputPath).size;
    stats.processed++;

    // Skip if WebP version already exists and not forcing
    const webpExists = fsSync.existsSync(webpPath);
    if (webpExists && !options.force) {
      console.log(`WebP version already exists: ${webpPath}`);
      stats.skipped++;
    } else {
      // Convert to WebP using sharp
      await sharp(inputPath)
        .webp({ quality: QUALITY })
        .toFile(webpPath);

      const webpSize = fsSync.statSync(webpPath).size;
      const savings = originalSize - webpSize;
      const savingsPercent = (savings / originalSize * 100).toFixed(2);

      stats.webpConverted++;
      stats.totalSavings += savings;

      console.log(`Converted to WebP: ${inputPath} -> ${webpPath} (${savingsPercent}% smaller)`);
    }

    // Convert to AVIF if requested
    if (options.avif) {
      const avifExists = fsSync.existsSync(avifPath);
      if (avifExists && !options.force) {
        console.log(`AVIF version already exists: ${avifPath}`);
      } else {
        try {
          await sharp(inputPath)
            .avif({ quality: QUALITY })
            .toFile(avifPath);

          const avifSize = fsSync.statSync(avifPath).size;
          const avifSavings = originalSize - avifSize;
          const avifSavingsPercent = (avifSavings / originalSize * 100).toFixed(2);

          stats.avifConverted++;
          stats.totalSavings += avifSavings;

          console.log(`Converted to AVIF: ${inputPath} -> ${avifPath} (${avifSavingsPercent}% smaller)`);
        } catch (avifError) {
          console.error(`Error converting to AVIF: ${avifError.message}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error converting ${inputPath}:`, error.message);
    stats.errors++;
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
    console.log('Starting image conversion...');
    console.log(`Directory: ${IMAGES_DIR}`);
    console.log(`Quality: ${QUALITY}`);
    console.log(`AVIF conversion: ${options.avif ? 'Enabled' : 'Disabled'}`);
    console.log(`Force mode: ${options.force ? 'Enabled' : 'Disabled'}`);
    console.log('-----------------------------------');

    const startTime = Date.now();

    // Create the images directory if it doesn't exist
    try {
      await fs.access(IMAGES_DIR);
    } catch (__error) {
      console.log(`Creating directory: ${IMAGES_DIR}`);
      await fs.mkdir(IMAGES_DIR, { recursive: true });
    }

    // Scan for images
    const imagePaths = await scanDirectory(IMAGES_DIR);

    if (imagePaths.length === 0) {
      console.log('No images found to convert.');
      return;
    }

    console.log(`Found ${imagePaths.length} images to process.`);

    // Convert images
    for (const imagePath of imagePaths) {
      await convertToWebP(imagePath);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n-----------------------------------');
    console.log('Image conversion completed!');
    console.log(`Time taken: ${duration} seconds`);
    console.log(`Images processed: ${stats.processed}`);
    console.log(`Converted to WebP: ${stats.webpConverted}`);
    if (options.avif) {
      console.log(`Converted to AVIF: ${stats.avifConverted}`);
    }
    console.log(`Skipped (already exists): ${stats.skipped}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`Total space saved: ${(stats.totalSavings / 1024 / 1024).toFixed(2)} MB`);

    // Check if sharp is installed
    if (stats.errors > 0) {
      console.log('\nTIP: If you encountered errors, make sure sharp is installed:');
      console.log('npm install sharp');
    }
  } catch (error) {
    console.error('Error converting images:', error);
  }
}

// Run the script
main();
