import { NextResponse } from 'next/server';
import { StoryDraft } from '@/types/content';
import fs from 'fs/promises';
import path from 'path';

const ARTICLES_FILE = path.join(process.cwd(), 'app/data/articles.json');

// In a real application, this would be a database
let publishedStories: StoryDraft[] = [];

export async function POST(request: Request) {
  try {
    const story: StoryDraft = await request.json();

    // Validate required fields
    if (!story.title || !story.content || !story.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read existing articles
    let articles = [];
    try {
      const fileContent = await fs.readFile(ARTICLES_FILE, 'utf-8');
      articles = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, create it with an empty array
      await fs.writeFile(ARTICLES_FILE, '[]', 'utf-8');
    }

    // Add new article with timestamp and slug
    const newArticle = {
      ...story,
      createdAt: new Date().toISOString(),
      slug: story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      image: story.featuredImage?.url || '/images/articles/default.jpg'
    };

    // Add to beginning of array (most recent first)
    articles.unshift(newArticle);

    // Save back to file
    await fs.writeFile(ARTICLES_FILE, JSON.stringify(articles, null, 2));

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('Error publishing story:', error);
    return NextResponse.json(
      { error: 'Failed to publish story' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // In a real application, this would fetch from a database
  return NextResponse.json(publishedStories);
} 