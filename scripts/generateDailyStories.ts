import { DailyStoryProcessor } from '../src/services/dailyStoryProcessor';
import { Story } from '../src/lib/stories';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function generateDailyStories() {
  try {
    console.log('Starting daily story generation...');
    
    // Initialize the processor
    const processor = DailyStoryProcessor.getInstance();
    
    // Process stories
    await processor.processDailyStories();
    
    // Get the processed stories
    const stories = await processor.getProcessedStories();
    
    // Save stories to markdown files
    for (const story of stories) {
      await saveStoryToMarkdown(story);
    }
    
    // Rebuild the site
    await rebuildSite();
    
    console.log('Daily story generation completed successfully');
  } catch (error) {
    console.error('Error generating daily stories:', error);
    process.exit(1);
  }
}

async function saveStoryToMarkdown(story: Story) {
  const contentDir = path.join(process.cwd(), 'content', 'articles');
  
  // Ensure directory exists
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }
  
  // Create frontmatter
  const frontmatter = `---
title: "${story.title}"
slug: "${story.slug}"
metaTitle: "${story.title}"
metaDescription: "${story.excerpt}"
excerpt: "${story.excerpt}"
country: "${story.country}"
category: "${story.category}"
tags: ${JSON.stringify(story.tags)}
timestamp: "${story.publishedAt.toISOString()}"
imageUrl: "${story.imageUrl || ''}"
---

${story.content}
`;
  
  // Save file
  const filePath = path.join(contentDir, `${story.slug}.md`);
  fs.writeFileSync(filePath, frontmatter);
  
  console.log(`Saved story: ${story.title}`);
}

async function rebuildSite() {
  try {
    console.log('Rebuilding site...');
    await execAsync('npm run build');
    console.log('Site rebuild completed');
  } catch (error) {
    console.error('Error rebuilding site:', error);
    throw error;
  }
}

// Run the script
generateDailyStories(); 