/**
 * Script to fix photographer attribution in story files
 *
 * This script reads all story files in the content/articles directory,
 * checks for missing photographer information, and adds it based on imageCredit and imageLink fields.
 */

const { fixPhotographerAttribution } = require('./utils');

// Run the fix with command line arguments
fixPhotographerAttribution(process.argv.includes('--dry-run'));
