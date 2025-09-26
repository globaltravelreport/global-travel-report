/**
 * Script to fix invalid dates in story files
 *
 * This script reads all story files in the content/articles directory,
 * checks for invalid dates, and fixes them by setting a valid date.
 */

const { fixStoryDates } = require('./utils');

// Run the fix with command line arguments
fixStoryDates(process.argv.includes('--dry-run'));
