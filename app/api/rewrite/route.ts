import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

export async function POST(request: Request) {
  console.log('Rewrite API called');
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const { text, platform } = body;

    if (!text || !platform) {
      console.error('Missing required fields:', { hasText: !!text, hasPlatform: !!platform });
      return NextResponse.json(
        { error: 'Both text and platform are required' },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['facebook', 'linkedin', 'twitter', 'instagram', 'blog'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      console.error('Invalid platform:', platform);
      return NextResponse.json(
        { error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    // Create system prompt based on platform
    const systemPrompt = `You are a professional content writer specializing in ${platform} content. 
    Rewrite the provided text to be more engaging and appropriate for ${platform}, 
    while maintaining the core message and adding relevant formatting or hashtags if appropriate.`;

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const rewrittenContent = completion.choices[0]?.message?.content;

    if (!rewrittenContent) {
      console.error('No content received from OpenAI');
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    console.log('Successfully rewrote content');
    return NextResponse.json({ content: rewrittenContent });

  } catch (error) {
    console.error('Error in rewrite API:', error);
    
    // Handle specific error types
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key configuration.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 