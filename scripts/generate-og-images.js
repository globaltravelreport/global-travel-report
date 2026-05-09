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

const path = require('path');
const sharp = require('sharp');

// Configuration
const OG_DIR = path.join(process.cwd(), 'public/og');
const IMAGES_DIR = path.join(process.cwd(), 'public/images');

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildOgSvg(width, height) {
  const title = 'Global Travel Report';
  const subtitleLineOne = 'Travel news, cruise updates and airline stories';
  const subtitleLineTwo = 'for Australian travellers';
  const footer = 'globaltravelreport.com';
  const cardHeight = Math.round(height * 0.74);
  const cardY = Math.round((height - cardHeight) / 2);

  return `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#06283d"/>
      <stop offset="0.48" stop-color="#0f766e"/>
      <stop offset="1" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.98"/>
      <stop offset="1" stop-color="#eef6f8" stop-opacity="0.92"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#03131f" flood-opacity="0.32"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky)"/>
  <path d="M-40 ${height * 0.76} C180 ${height * 0.56} 340 ${height * 0.95} 560 ${height * 0.72} C760 ${height * 0.51} 940 ${height * 0.8} ${width + 40} ${height * 0.58} L${width + 40} ${height + 40} L-40 ${height + 40} Z" fill="#022c3a" opacity="0.35"/>
  <circle cx="${width * 0.83}" cy="${height * 0.24}" r="${height * 0.17}" fill="#ffd166" opacity="0.92"/>
  <path d="M${width * 0.08} ${height * 0.18} C${width * 0.24} ${height * 0.1} ${width * 0.34} ${height * 0.24} ${width * 0.48} ${height * 0.16} C${width * 0.62} ${height * 0.08} ${width * 0.73} ${height * 0.18} ${width * 0.92} ${height * 0.1}" stroke="#ffffff" stroke-opacity="0.22" stroke-width="3" stroke-dasharray="11 16"/>

  <g filter="url(#shadow)">
    <rect x="${width * 0.075}" y="${cardY}" width="${width * 0.85}" height="${cardHeight}" rx="34" fill="url(#card)"/>
  </g>
  <rect x="${width * 0.075}" y="${cardY}" width="${width * 0.85}" height="12" rx="6" fill="#f97316"/>
  <text x="${width * 0.12}" y="${cardY + 88}" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="3">INDEPENDENT TRAVEL NEWS</text>
  <text x="${width * 0.12}" y="${cardY + 205}" fill="#08111f" font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="800">${escapeXml(title)}</text>
  <text x="${width * 0.12}" y="${cardY + 270}" fill="#334155" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="500">${escapeXml(subtitleLineOne)}</text>
  <text x="${width * 0.12}" y="${cardY + 314}" fill="#334155" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="500">${escapeXml(subtitleLineTwo)}</text>
  <g transform="translate(${width * 0.12} ${cardY + cardHeight - 72})">
    <rect x="0" y="-34" width="348" height="52" rx="26" fill="#0f766e"/>
    <text x="28" y="1" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">${escapeXml(footer)}</text>
  </g>
  <g transform="translate(${width * 0.755} ${cardY + 102})">
    <rect x="0" y="0" width="142" height="96" rx="20" fill="#0f172a"/>
    <path d="M36 62 L64 30 L86 52 L102 36 L122 62 Z" fill="#14b8a6"/>
    <circle cx="98" cy="28" r="10" fill="#f97316"/>
    <rect x="24" y="70" width="94" height="8" rx="4" fill="#ffffff" opacity="0.78"/>
  </g>
  <g transform="translate(${width * 0.72} ${cardY + 260})" fill="#0f172a" opacity="0.78" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700">
    <text x="0" y="0">Cruises</text>
    <text x="0" y="42">Airlines</text>
    <text x="0" y="84">Destinations</text>
    <text x="0" y="126">Travel Advice</text>
  </g>
</svg>`;
}

// Function to generate OG image
async function generateOGImage() {
  try {
    const ogBuffer = Buffer.from(buildOgSvg(1200, 630));
    const twitterBuffer = Buffer.from(buildOgSvg(1200, 600));

    await sharp(ogBuffer)
      .jpeg({ quality: 92, progressive: true })
      .toFile(path.join(OG_DIR, 'home-1200x630.jpg'));

    await sharp(ogBuffer)
      .webp({ quality: 90 })
      .toFile(path.join(IMAGES_DIR, 'og-image-1200.webp'));

    await sharp(ogBuffer)
      .jpeg({ quality: 92, progressive: true })
      .toFile(path.join(IMAGES_DIR, 'og-image.jpg'));

    await sharp(twitterBuffer)
      .jpeg({ quality: 92, progressive: true })
      .toFile(path.join(IMAGES_DIR, 'twitter-image.jpg'));

    console.log('OG images generated successfully!');
  } catch (error) {
    console.error('Error generating OG images:', error);
  }
}

// Run the function
generateOGImage();
