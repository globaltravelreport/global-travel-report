import React from 'react';
import { render, screen } from '@testing-library/react';
import { StoryCard } from '../StoryCard';
import { Story } from '@/types/Story';

// Mock the next/link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <span data-href={href}>{children}</span>;
  };
});

// Mock the ResponsiveImage component
jest.mock('@/components/ui/ResponsiveImage', () => {
  return {
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    default: ({ src, alt }: { src: string; alt: string }) => {
      return <img src={src} alt={alt} data-testid="responsive-image" />;
    },
  };
});

// Mock the ResponsiveImageV2 component used by StoryCard
jest.mock('@/components/ui/ResponsiveImageV2', () => {
  return {
    __esModule: true,
    // eslint-disable-next-line @next/next/no-img-element
    ResponsiveImageV2: ({ src, alt }: { src: string; alt: string }) => {
      return <img src={src} alt={alt} data-testid="responsive-image" />;
    },
    default: ({ src, alt }: { src: string; alt: string }) => {
      return <img src={src} alt={alt} data-testid="responsive-image" />;
    }
  };
});

// Mock the FreshnessIndicator component
jest.mock('@/components/ui/FreshnessIndicator', () => {
  return {
    __esModule: true,
    default: ({ publishedDate }: { publishedDate: string }) => {
      return <span data-testid="freshness-indicator">{publishedDate}</span>;
    },
    FreshnessIndicator: ({ publishedDate }: { publishedDate: string }) => {
      return <span data-testid="freshness-indicator">{publishedDate}</span>;
    },
  };
});

// Mock the withErrorBoundary HOC
jest.mock('@/components/ui/ErrorBoundary', () => {
  return {
    withErrorBoundary: (Component: React.ComponentType, _options: unknown) => {
      return Component;
    },
  };
});

// Mock the date-utils functions
jest.mock('@/utils/date-utils', () => {
  return {
    formatDisplayDate: (_date: string | Date) => 'Formatted Date',
    getSafeDateString: (_date: string | Date) => '2023-05-15T12:00:00Z',
  };
});

// Sample story data for testing
const sampleStory: Story = {
  id: '1',
  slug: 'test-story',
  title: 'Test Story',
  excerpt: 'This is a test story excerpt',
  content: 'This is the full content of the test story',
  publishedAt: '2023-05-15T12:00:00Z',
  author: 'Global Travel Report Editorial Team',
  category: 'Travel',
  country: 'Japan',
  tags: ['travel', 'japan', 'adventure'],
  featured: false,
  editorsPick: false,
  imageUrl: 'https://example.com/image.jpg',
  photographer: {
    name: 'Test Photographer',
    url: 'https://unsplash.com/@testphotographer',
  },
};

describe('StoryCard Component', () => {
  it('renders the story title', () => {
    render(<StoryCard story={sampleStory} />);
    expect(screen.getByText('Test Story')).toBeInTheDocument();
  });

  it('renders the story excerpt', () => {
    render(<StoryCard story={sampleStory} />);
    expect(screen.getByText('This is a test story excerpt')).toBeInTheDocument();
  });

  it('renders the category', () => {
    render(<StoryCard story={sampleStory} />);
    expect(screen.getByText('Travel')).toBeInTheDocument();
  });

  it('renders the country', () => {
    render(<StoryCard story={sampleStory} />);
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('renders the tags', () => {
    render(<StoryCard story={sampleStory} />);
    expect(screen.getByText(/#\s*travel/i)).toBeInTheDocument();
    expect(screen.getByText(/#\s*japan/i)).toBeInTheDocument();
    expect(screen.getByText(/#\s*adventure/i)).toBeInTheDocument();
  });

  it('renders the photographer credit', () => {
    render(<StoryCard story={sampleStory} />);
    expect(screen.getByText('Test Photographer')).toBeInTheDocument();
    expect(screen.getByText('Unsplash')).toBeInTheDocument();
  });

  it('renders the featured badge when story is featured', () => {
    const featuredStory = { ...sampleStory, featured: true };
    render(<StoryCard story={featuredStory} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders the editor\'s pick badge when story is an editor\'s pick', () => {
    const editorsPickStory = { ...sampleStory, editorsPick: true };
    render(<StoryCard story={editorsPickStory} />);
    expect(screen.getByText('Editor\'s Pick')).toBeInTheDocument();
  });

  it('renders the responsive image with correct props', () => {
    render(<StoryCard story={sampleStory} />);
    const image = screen.getByTestId('responsive-image') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Test Story');
    expect(image.getAttribute('src')).toMatch(/^https?:\/\//);
  });

  it('renders the freshness indicator', () => {
    render(<StoryCard story={sampleStory} />);
    expect(screen.getByTestId('freshness-indicator')).toBeInTheDocument();
  });

  it('renders the author credit', () => {
    render(<StoryCard story={sampleStory} />);
    expect(screen.getByText('By Global Travel Report Editorial Team')).toBeInTheDocument();
  });
});
