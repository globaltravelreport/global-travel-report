#!/usr/bin/env node

/**
 * Daily Content Automation Script
 *
 * This script runs the content automation system to ingest 3-5 new stories daily
 * from RSS feeds with proper error handling and logging.
 */

const { ContentAutomationService } = require('../src/services/contentAutomationService');
const fs = require('fs');
const path = require('path');

class DailyContentAutomation {
  constructor() {
    this.automationService = ContentAutomationService.getInstance();
    this.logFile = path.join(__dirname, '..', 'logs', 'daily-automation.log');
    this.maxRetries = 3;
  }

  /**
   * Initialize logging
   */
  initializeLogging() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Log message with timestamp
   */
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;

    console.log(logMessage.trim());

    // Append to log file
    try {
      fs.appendFileSync(this.logFile, logMessage);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  /**
   * Check if we should run automation today
   */
  shouldRunToday() {
    try {
      // Read last run date
      const lastRunFile = path.join(__dirname, '..', 'logs', 'last-run.json');

      if (!fs.existsSync(lastRunFile)) {
        return true; // First run
      }

      const lastRunData = JSON.parse(fs.readFileSync(lastRunFile, 'utf8'));
      const lastRunDate = new Date(lastRunData.date);
      const today = new Date();

      // Check if it's been at least 24 hours
      const hoursDiff = (today.getTime() - lastRunDate.getTime()) / (1000 * 60 * 60);

      return hoursDiff >= 24;
    } catch (error) {
      this.log(`Error checking last run date: ${error.message}`, 'ERROR');
      return true; // Run if we can't determine last run
    }
  }

  /**
   * Update last run timestamp
   */
  updateLastRun() {
    try {
      const lastRunFile = path.join(__dirname, '..', 'logs', 'last-run.json');
      const lastRunData = {
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      fs.writeFileSync(lastRunFile, JSON.stringify(lastRunData, null, 2));
    } catch (error) {
      this.log(`Error updating last run timestamp: ${error.message}`, 'ERROR');
    }
  }

  /**
   * Run content automation with retry logic
   */
  async runWithRetry() {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.log(`Starting content automation attempt ${attempt}/${this.maxRetries}`);

        // Configure automation service
        this.automationService.configure({
          enableAutoIngestion: true,
          maxStoriesPerDay: 5,
          qualityThreshold: 0.7,
          requireManualApproval: false,
          autoRefreshSchedule: '0 9 * * *' // Daily at 9 AM
        });

        // Run content ingestion
        const result = await this.automationService.ingestContent();

        if (result.success) {
          this.log(`Content automation successful: ${result.storiesIngested} stories ingested, ${result.storiesRejected} rejected`);
          return result;
        } else {
          throw new Error(`Ingestion failed: ${result.errors.join(', ')}`);
        }

      } catch (error) {
        lastError = error;
        this.log(`Attempt ${attempt} failed: ${error.message}`, 'ERROR');

        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          this.log(`Waiting ${delay/1000}s before retry...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get automation statistics
   */
  async getStats() {
    try {
      const stats = await this.automationService.getAutomationStats();
      return stats;
    } catch (error) {
      this.log(`Error getting automation stats: ${error.message}`, 'ERROR');
      return null;
    }
  }

  /**
   * Main execution method
   */
  async execute() {
    try {
      this.initializeLogging();
      this.log('=== Daily Content Automation Started ===');

      // Check if we should run today
      if (!this.shouldRunToday()) {
        this.log('Skipping automation - already ran today');
        return { skipped: true, reason: 'Already ran today' };
      }

      // Run content automation
      const result = await this.runWithRetry();

      // Update last run timestamp
      this.updateLastRun();

      // Get and log statistics
      const stats = await this.getStats();
      if (stats) {
        this.log(`Automation Stats: ${stats.totalStories} total, ${stats.storiesThisWeek} this week, avg quality: ${stats.averageQualityScore.toFixed(2)}`);
      }

      this.log('=== Daily Content Automation Completed Successfully ===');
      return { success: true, result, stats };

    } catch (error) {
      this.log(`Daily content automation failed: ${error.message}`, 'ERROR');
      this.log('=== Daily Content Automation Failed ===');

      // Still update last run to prevent infinite retries
      this.updateLastRun();

      return { success: false, error: error.message };
    }
  }
}

/**
 * Main execution when run directly
 */
if (require.main === module) {
  const automation = new DailyContentAutomation();
  automation.execute()
    .then(result => {
      process.exit(result.success === false ? 1 : 0);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = DailyContentAutomation;