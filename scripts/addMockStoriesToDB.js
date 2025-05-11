// Add mock stories to MongoDB
require('dotenv').config({ path: '.env.local' });

// Import mock stories
const { mockStories } = require('../src/mocks/stories');

async function addMockStoriesToDB() {
  try {
    console.log('Adding mock stories to MongoDB...');
    
    // Check if MongoDB URI is set
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      console.log('Using fallback file-based storage instead...');
      return saveMockStoriesToFile();
    }

    // Dynamically import MongoDB
    const { MongoClient } = require('mongodb');
    
    // Create a new MongoDB client
    const client = new MongoClient(process.env.MONGODB_URI);
    
    // Connect to the MongoDB server
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB server successfully!');
    
    // Get the database
    const dbName = process.env.MONGODB_DB || 'global-travel-report';
    const db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
    
    // Get the stories collection
    const storiesCollection = db.collection('stories');
    
    // Add timestamps to stories to make them appear recent
    const now = new Date();
    const storiesWithTimestamps = mockStories.map((story, index) => ({
      ...story,
      publishedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000) // Each story is one day older
    }));
    
    // Check if stories already exist
    const existingCount = await storiesCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing stories in the database`);
      console.log('Updating existing stories...');
      
      // Update each story
      for (const story of storiesWithTimestamps) {
        await storiesCollection.updateOne(
          { id: story.id },
          { $set: story },
          { upsert: true }
        );
      }
      
      console.log(`Updated ${storiesWithTimestamps.length} stories in the database`);
    } else {
      console.log('No existing stories found, inserting mock stories...');
      
      // Insert all stories
      await storiesCollection.insertMany(storiesWithTimestamps);
      console.log(`Inserted ${storiesWithTimestamps.length} mock stories into the database`);
    }
    
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
    
    return true;
  } catch (error) {
    console.error('Error adding mock stories to MongoDB:', error);
    console.log('Using fallback file-based storage instead...');
    return saveMockStoriesToFile();
  }
}

// Fallback function to save stories to a file
async function saveMockStoriesToFile() {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Create content directory if it doesn't exist
    const contentDir = path.join(process.cwd(), 'content');
    const articlesDir = path.join(contentDir, 'articles');
    
    if (!fs.existsSync(contentDir)) {
      fs.mkdirSync(contentDir);
    }
    
    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir);
    }
    
    // Add timestamps to stories to make them appear recent
    const now = new Date();
    const storiesWithTimestamps = mockStories.map((story, index) => ({
      ...story,
      publishedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000) // Each story is one day older
    }));
    
    // Save each story to a file
    for (const story of storiesWithTimestamps) {
      const fileName = `story-${story.slug}.md`;
      const filePath = path.join(articlesDir, fileName);
      
      // Convert story to markdown format
      const content = `---
id: ${story.id}
slug: ${story.slug}
title: ${story.title}
excerpt: ${story.excerpt}
author: Global Travel Report Editorial Team
category: ${story.category}
country: ${story.country}
tags: ${JSON.stringify(story.tags)}
featured: ${story.featured}
editorsPick: ${story.editorsPick}
publishedAt: ${story.publishedAt.toISOString()}
imageUrl: ${story.imageUrl}
photographer:
  name: ${story.photographer?.name || ''}
  url: ${story.photographer?.url || ''}
---

${story.content}
`;
      
      fs.writeFileSync(filePath, content);
      console.log(`Saved story "${story.title}" to ${filePath}`);
    }
    
    console.log(`Saved ${storiesWithTimestamps.length} mock stories to files`);
    return true;
  } catch (error) {
    console.error('Error saving mock stories to files:', error);
    return false;
  }
}

addMockStoriesToDB();
