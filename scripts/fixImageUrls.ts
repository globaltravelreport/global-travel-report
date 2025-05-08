/**
 * Script to fix invalid image URLs in story files
 *
 * This script reads all story files in the content/articles directory,
 * checks for invalid image URLs, and fixes them by setting a valid URL.
 */

const { fixImageUrls } = require('./utils');

// Run the fix with command line arguments
fixImageUrls(process.argv.includes('--dry-run'));
