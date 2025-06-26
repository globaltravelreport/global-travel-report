/**
 * Generate Open Graph Images Script
 * 
 * This script creates Open Graph images for social media sharing.
 * It generates:
 * 1. og-image.jpg (1200x630) for Facebook and general sharing
 * 2. twitter-image.jpg (1200x600) for Twitter/X
 * 
 * Usage: node scripts/generate-og-images.js
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');

// Configuration
const OUTPUT_DIR = path.join(process.cwd(), 'public/images');
const LOGO_PATH = path.join(process.cwd(), 'public/logo-gtr.png');
const FALLBACK_LOGO_PATH = path.join(process.cwd(), 'public/logo.png');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

// Function to generate OG image
async function generateOGImage() {
  try {
    // Create canvas for Facebook OG image (1200x630)
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // Fill background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 630);
    gradient.addColorStop(0, '#0c4a6e');  // Dark blue
    gradient.addColorStop(1, '#0ea5e9');  // Light blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add logo
    let logoPath = LOGO_PATH;
    if (!fs.existsSync(logoPath)) {
      console.log(`Logo not found at ${logoPath}, trying fallback...`);
      logoPath = FALLBACK_LOGO_PATH;
      
      if (!fs.existsSync(logoPath)) {
        console.log(`Fallback logo not found at ${logoPath}, creating text-only image`);
        // If no logo is found, just add text
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('Global Travel Report', 600, 315);
        
        // Add tagline
        ctx.font = '30px Arial';
        ctx.fillText('Travel Stories from Around the World', 600, 375);
      } else {
        const logo = await loadImage(logoPath);
        // Calculate dimensions to maintain aspect ratio
        const aspectRatio = logo.width / logo.height;
        const logoWidth = 400;
        const logoHeight = logoWidth / aspectRatio;
        
        // Center the logo
        const x = (1200 - logoWidth) / 2;
        const y = (630 - logoHeight) / 2;
        
        ctx.drawImage(logo, x, y, logoWidth, logoHeight);
      }
    } else {
      const logo = await loadImage(logoPath);
      // Calculate dimensions to maintain aspect ratio
      const aspectRatio = logo.width / logo.height;
      const logoWidth = 400;
      const logoHeight = logoWidth / aspectRatio;
      
      // Center the logo
      const x = (1200 - logoWidth) / 2;
      const y = (630 - logoHeight) / 2;
      
      ctx.drawImage(logo, x, y, logoWidth, logoHeight);
    }

    // Add text below logo
    ctx.font = '30px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Travel Stories from Around the World', 600, 430);

    // Save the image
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9 });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'og-image.jpg'), buffer);
    console.log(`Created OG image: ${path.join(OUTPUT_DIR, 'og-image.jpg')}`);

    // Create Twitter image (same but with different dimensions)
    const twitterCanvas = createCanvas(1200, 600);
    const twitterCtx = twitterCanvas.getContext('2d');

    // Fill background with gradient
    const twitterGradient = twitterCtx.createLinearGradient(0, 0, 0, 600);
    twitterGradient.addColorStop(0, '#0c4a6e');  // Dark blue
    twitterGradient.addColorStop(1, '#0ea5e9');  // Light blue
    twitterCtx.fillStyle = twitterGradient;
    twitterCtx.fillRect(0, 0, 1200, 600);

    // Add logo
    if (fs.existsSync(logoPath)) {
      const logo = await loadImage(logoPath);
      // Calculate dimensions to maintain aspect ratio
      const aspectRatio = logo.width / logo.height;
      const logoWidth = 400;
      const logoHeight = logoWidth / aspectRatio;
      
      // Center the logo
      const x = (1200 - logoWidth) / 2;
      const y = (600 - logoHeight) / 2;
      
      twitterCtx.drawImage(logo, x, y, logoWidth, logoHeight);
    } else {
      // If no logo is found, just add text
      twitterCtx.font = 'bold 60px Arial';
      twitterCtx.fillStyle = '#ffffff';
      twitterCtx.textAlign = 'center';
      twitterCtx.fillText('Global Travel Report', 600, 300);
    }

    // Add text below logo
    twitterCtx.font = '30px Arial';
    twitterCtx.fillStyle = '#ffffff';
    twitterCtx.textAlign = 'center';
    twitterCtx.fillText('Travel Stories from Around the World', 600, 400);

    // Save the Twitter image
    const twitterBuffer = twitterCanvas.toBuffer('image/jpeg', { quality: 0.9 });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'twitter-image.jpg'), twitterBuffer);
    console.log(`Created Twitter image: ${path.join(OUTPUT_DIR, 'twitter-image.jpg')}`);

    console.log('OG images generated successfully!');
  } catch (error) {
    console.error('Error generating OG images:', error);
  }
}

// Run the function
generateOGImage();
