#!/usr/bin/env node

/**
 * Content Ingestion Script
 *
 * This script automatically ingests new travel stories from RSS feeds and APIs.
 * It can be run manually or scheduled via cron job for regular content updates.
 *
 * Usage:
 *   node scripts/content-ingestion.js
 *   npm run ingest:content
 */

const { ContentAutomationService } = require('../src/services/contentAutomationService');

async function main() {
  console.log('🚀 Starting content ingestion process...');
  console.log('=====================================');

  try {
    const automationService = ContentAutomationService.getInstance();

    // Configure for automated ingestion
    automationService.configure({
      enableAutoIngestion: true,
      maxStoriesPerDay: 5,
      qualityThreshold: 0.7,
      requireManualApproval: false,
      autoRefreshSchedule: '0 9 * * 1,3,5' // Mon, Wed, Fri at 9 AM
    });

    console.log('📊 Configuration:');
    console.log('   - Max stories per day: 5');
    console.log('   - Quality threshold: 0.7');
    console.log('   - Manual approval: Disabled');
    console.log('');

    // Trigger content ingestion
    const result = await automationService.ingestContent();

    console.log('✅ Content ingestion completed!');
    console.log('=====================================');
    console.log(`📈 Results:`);
    console.log(`   - Stories ingested: ${result.storiesIngested}`);
    console.log(`   - Stories rejected: ${result.storiesRejected}`);
    console.log(`   - Success rate: ${result.storiesIngested > 0 ? '✅' : '❌'}`);

    if (result.errors.length > 0) {
      console.log('');
      console.log('⚠️  Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (result.storiesIngested > 0) {
      console.log('');
      console.log('🎯 Quality Report:');
      Object.entries(result.qualityReport).forEach(([storyId, metrics]) => {
        console.log(`   Story ${storyId}:`);
        console.log(`     - Relevance: ${(metrics.relevanceScore * 100).toFixed(1)}%`);
        console.log(`     - Readability: ${(metrics.readabilityScore * 100).toFixed(1)}%`);
        console.log(`     - Completeness: ${(metrics.completenessScore * 100).toFixed(1)}%`);
        console.log(`     - Overall: ${(metrics.overallScore * 100).toFixed(1)}%`);
      });
    }

    // Get final statistics
    const stats = await automationService.getAutomationStats();
    console.log('');
    console.log('📊 Final Statistics:');
    console.log(`   - Total stories: ${stats.totalStories}`);
    console.log(`   - Stories this week: ${stats.storiesThisWeek}`);
    console.log(`   - Average quality: ${(stats.averageQualityScore * 100).toFixed(1)}%`);

    if (stats.lastIngestion) {
      console.log(`   - Last ingestion: ${stats.lastIngestion.toISOString()}`);
    }

    console.log('');
    console.log('✨ Content ingestion process completed successfully!');

    // Exit with success code
    process.exit(0);

  } catch (error) {
    console.error('❌ Content ingestion failed:', error);
    console.error('');
    console.error('Stack trace:', error.stack);

    // Exit with error code
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };