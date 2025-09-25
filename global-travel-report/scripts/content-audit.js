#!/usr/bin/env node

/**
 * Content Audit Script
 * 
 * This script analyzes the content in the data/stories directory and generates
 * a report on content freshness, quality, and SEO optimization.
 * 
 * Usage:
 *   node scripts/content-audit.js [--output=report.json] [--threshold=180]
 * 
 * Options:
 *   --output     Output file for the report (default: content-audit-report.json)
 *   --threshold  Number of days after which content is considered outdated (default: 180)
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  output: 'content-audit-report.json',
  threshold: 180
};

args.forEach(arg => {
  if (arg.startsWith('--output=')) {
    options.output = arg.split('=')[1];
  } else if (arg.startsWith('--threshold=')) {
    options.threshold = parseInt(arg.split('=')[1], 10);
  }
});

// Configuration
const STORIES_DIR = path.join(process.cwd(), 'data', 'stories');
const OUTPUT_FILE = path.join(process.cwd(), options.output);
const OUTDATED_THRESHOLD_DAYS = options.threshold;

// Utility functions
function calculateDaysSince(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getContentQualityScore(story) {
  let score = 0;
  
  // Check content length (longer content tends to be more comprehensive)
  if (story.content) {
    const wordCount = story.content.split(/\s+/).length;
    if (wordCount > 1500) score += 30;
    else if (wordCount > 1000) score += 20;
    else if (wordCount > 500) score += 10;
  }
  
  // Check if it has an excerpt
  if (story.excerpt && story.excerpt.length > 100) score += 10;
  
  // Check if it has tags
  if (story.tags && story.tags.length >= 3) score += 10;
  
  // Check if it has a category
  if (story.category) score += 10;
  
  // Check if it has a country
  if (story.country) score += 10;
  
  // Check if it has an image
  if (story.imageUrl) score += 10;
  
  // Check if it has a photographer
  if (story.photographer && story.photographer.name) score += 10;
  
  // Check if it's featured or editor's pick
  if (story.featured) score += 5;
  if (story.editorsPick) score += 5;
  
  return score;
}

function getSeoScore(story) {
  let score = 0;
  
  // Check title length (optimal is 50-60 characters)
  if (story.title) {
    const titleLength = story.title.length;
    if (titleLength >= 40 && titleLength <= 60) score += 20;
    else if (titleLength >= 30 && titleLength <= 70) score += 10;
  }
  
  // Check excerpt length (optimal is 150-160 characters)
  if (story.excerpt) {
    const excerptLength = story.excerpt.length;
    if (excerptLength >= 140 && excerptLength <= 160) score += 20;
    else if (excerptLength >= 120 && excerptLength <= 180) score += 10;
  }
  
  // Check if slug is SEO-friendly
  if (story.slug && story.slug.length > 0) {
    // Check if slug contains keywords from title
    const titleWords = story.title ? story.title.toLowerCase().split(/\s+/) : [];
    const slugWords = story.slug.toLowerCase().split('-');
    
    const keywordMatch = titleWords.filter(word => 
      word.length > 3 && slugWords.includes(word)
    ).length;
    
    if (keywordMatch >= 2) score += 20;
    else if (keywordMatch >= 1) score += 10;
  }
  
  // Check if it has tags
  if (story.tags && story.tags.length >= 5) score += 10;
  else if (story.tags && story.tags.length >= 3) score += 5;
  
  // Check if it has a category
  if (story.category) score += 10;
  
  // Check if it has a country
  if (story.country) score += 10;
  
  // Check if it has an image with alt text
  if (story.imageUrl && story.title) score += 10;
  
  return score;
}

// Main function
async function runContentAudit() {
  console.log('Running content audit...');
  
  try {
    // Check if stories directory exists
    if (!fs.existsSync(STORIES_DIR)) {
      console.error(`Stories directory not found: ${STORIES_DIR}`);
      process.exit(1);
    }
    
    // Get all story files
    const storyFiles = await glob('**/*.json', { cwd: STORIES_DIR });
    
    console.log(`Found ${storyFiles.length} stories to analyze.`);
    
    // Analyze each story
    const storyAnalysis = await Promise.all(storyFiles.map(async (file) => {
      try {
        const filePath = path.join(STORIES_DIR, file);
        const content = await fs.promises.readFile(filePath, 'utf8');
        const story = JSON.parse(content);
        
        // Calculate days since publication or update
        const publishedAt = story.publishedAt ? new Date(story.publishedAt) : null;
        const updatedAt = story.updatedAt ? new Date(story.updatedAt) : null;
        
        // Use the most recent date
        const mostRecentDate = updatedAt && updatedAt > publishedAt ? updatedAt : publishedAt;
        const daysSince = mostRecentDate ? calculateDaysSince(mostRecentDate) : null;
        
        // Calculate content quality score
        const qualityScore = getContentQualityScore(story);
        
        // Calculate SEO score
        const seoScore = getSeoScore(story);
        
        // Determine freshness status
        let freshnessStatus = 'unknown';
        if (daysSince !== null) {
          if (daysSince <= 30) freshnessStatus = 'fresh';
          else if (daysSince <= OUTDATED_THRESHOLD_DAYS) freshnessStatus = 'recent';
          else freshnessStatus = 'outdated';
        }
        
        return {
          slug: story.slug,
          title: story.title,
          category: story.category,
          country: story.country,
          publishedAt: story.publishedAt,
          updatedAt: story.updatedAt,
          daysSinceLastUpdate: daysSince,
          freshnessStatus,
          qualityScore,
          seoScore,
          totalScore: qualityScore + seoScore,
          wordCount: story.content ? story.content.split(/\s+/).length : 0,
          hasTags: story.tags && story.tags.length > 0,
          tagCount: story.tags ? story.tags.length : 0,
          hasImage: !!story.imageUrl,
          hasPhotographer: !!(story.photographer && story.photographer.name),
          isFeatured: !!story.featured,
          isEditorsPick: !!story.editorsPick
        };
      } catch (error) {
        console.error(`Error analyzing story ${file}:`, error);
        return null;
      }
    }));
    
    // Filter out null values
    const validAnalysis = storyAnalysis.filter(Boolean);
    
    // Generate summary statistics
    const totalStories = validAnalysis.length;
    const outdatedStories = validAnalysis.filter(story => story.freshnessStatus === 'outdated').length;
    const recentStories = validAnalysis.filter(story => story.freshnessStatus === 'recent').length;
    const freshStories = validAnalysis.filter(story => story.freshnessStatus === 'fresh').length;
    
    const averageQualityScore = validAnalysis.reduce((sum, story) => sum + story.qualityScore, 0) / totalStories;
    const averageSeoScore = validAnalysis.reduce((sum, story) => sum + story.seoScore, 0) / totalStories;
    const averageTotalScore = validAnalysis.reduce((sum, story) => sum + story.totalScore, 0) / totalStories;
    
    // Sort stories by total score (descending)
    const sortedByScore = [...validAnalysis].sort((a, b) => b.totalScore - a.totalScore);
    
    // Sort stories by freshness (most outdated first)
    const sortedByFreshness = [...validAnalysis].sort((a, b) => {
      if (a.daysSinceLastUpdate === null) return 1;
      if (b.daysSinceLastUpdate === null) return -1;
      return b.daysSinceLastUpdate - a.daysSinceLastUpdate;
    });
    
    // Generate the report
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalStories,
        freshness: {
          fresh: freshStories,
          recent: recentStories,
          outdated: outdatedStories,
          unknown: totalStories - freshStories - recentStories - outdatedStories,
          percentOutdated: (outdatedStories / totalStories * 100).toFixed(2)
        },
        scores: {
          averageQualityScore: averageQualityScore.toFixed(2),
          averageSeoScore: averageSeoScore.toFixed(2),
          averageTotalScore: averageTotalScore.toFixed(2)
        }
      },
      topStories: sortedByScore.slice(0, 10).map(story => ({
        slug: story.slug,
        title: story.title,
        totalScore: story.totalScore
      })),
      needsUpdate: sortedByFreshness.filter(story => story.freshnessStatus === 'outdated').slice(0, 20).map(story => ({
        slug: story.slug,
        title: story.title,
        daysSinceLastUpdate: story.daysSinceLastUpdate,
        totalScore: story.totalScore
      })),
      needsImprovement: sortedByScore.filter(story => story.totalScore < 50).slice(0, 20).map(story => ({
        slug: story.slug,
        title: story.title,
        qualityScore: story.qualityScore,
        seoScore: story.seoScore,
        totalScore: story.totalScore
      })),
      detailedAnalysis: validAnalysis
    };
    
    // Write the report to a file
    await fs.promises.writeFile(OUTPUT_FILE, JSON.stringify(report, null, 2));
    
    console.log(`Content audit complete! Report saved to ${OUTPUT_FILE}`);
    console.log('\nSummary:');
    console.log(`Total stories: ${totalStories}`);
    console.log(`Fresh stories: ${freshStories} (${(freshStories / totalStories * 100).toFixed(2)}%)`);
    console.log(`Recent stories: ${recentStories} (${(recentStories / totalStories * 100).toFixed(2)}%)`);
    console.log(`Outdated stories: ${outdatedStories} (${(outdatedStories / totalStories * 100).toFixed(2)}%)`);
    console.log(`Average quality score: ${averageQualityScore.toFixed(2)}`);
    console.log(`Average SEO score: ${averageSeoScore.toFixed(2)}`);
    console.log(`Average total score: ${averageTotalScore.toFixed(2)}`);
  } catch (error) {
    console.error('Error running content audit:', error);
    process.exit(1);
  }
}

// Run the content audit
runContentAudit();
