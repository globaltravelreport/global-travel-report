import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { RewrittenContent } from '@/types/content'

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
    const { content, sourceUrl, guidelines } = await request.json();

    if (!content && !sourceUrl) {
      return NextResponse.json(
        { error: 'Either content or sourceUrl must be provided' },
        { status: 400 }
      );
    }

    // In a real application, this would call an AI service to rewrite the content
    // For now, we'll return a mock response
    const rewrittenContent: RewrittenContent = {
      title: 'New Travel Trends: Digital Nomads Reshape Tourism Industry',
      summary: 'Remote work revolution sparks surge in long-term travel as digital nomads seek authentic cultural experiences while maintaining professional careers.',
      content: `The landscape of global travel is undergoing a dramatic transformation as digital nomads increasingly influence tourism patterns and destination choices. This shift represents more than just a trend; it's a fundamental change in how people approach work, travel, and lifestyle choices.

Recent data shows a significant uptick in extended-stay travel bookings, with many destinations adapting their infrastructure to accommodate this new breed of traveler. Cities like Lisbon, Bali, and Mexico City are emerging as digital nomad hubs, offering a blend of modern amenities and cultural experiences.

Local economies are responding to this evolution by developing co-working spaces, improving internet infrastructure, and creating community centers that cater to remote workers. These changes are not only benefiting digital nomads but also contributing to sustainable tourism practices and more meaningful cultural exchange.

The impact extends beyond just the tourism sector. Real estate markets in popular digital nomad destinations are seeing increased demand for monthly rentals, while local businesses are adapting their services to cater to longer-term visitors. This symbiotic relationship between digital nomads and host communities is creating new opportunities for economic growth and cultural understanding.

Stay tuned to Global Travel Report for more updates on this evolving trend and insights into the best destinations for digital nomads.`,
      keywords: ['digital nomads', 'remote work', 'travel trends', 'sustainable tourism', 'cultural exchange']
    };

    return NextResponse.json(rewrittenContent);
  } catch (error) {
    console.error('Error rewriting content:', error);
    return NextResponse.json(
      { error: 'Failed to rewrite content' },
      { status: 500 }
    );
  }
} 