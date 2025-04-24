import { render, screen } from '@testing-library/react'
import StoryCard from '../StoryCard'
import { Story } from '../../lib/stories'

const mockStory: Story = {
  title: 'Test Story',
  summary: 'Test summary',
  keywords: ['test', 'story'],
  slug: 'test-story',
  date: '2024-04-22',
  country: 'Test Country',
  type: 'Travel News',
  content: 'Test content that is long enough to calculate reading time',
  imageUrl: 'https://example.com/test-image.jpg',
  imageAlt: 'Test image',
  imageCredit: 'Test Photographer',
  imageLink: 'https://example.com/photo',
  lastModified: '2024-04-22T00:00:00.000Z'
}

describe('StoryCard', () => {
  it('renders story information correctly', () => {
    render(<StoryCard story={mockStory} />)
    
    expect(screen.getByRole('heading', { level: 3, name: mockStory.title })).toBeInTheDocument()
    expect(screen.getByText(mockStory.type)).toBeInTheDocument()
    expect(screen.getByText(mockStory.country)).toBeInTheDocument()
    expect(screen.getByText(mockStory.summary)).toBeInTheDocument()
    
    mockStory.keywords.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })
  })

  it('renders without image when imageUrl is not provided', () => {
    const storyWithoutImage = { ...mockStory, imageUrl: undefined }
    render(<StoryCard story={storyWithoutImage} />)
    
    expect(screen.getByRole('heading', { level: 3, name: storyWithoutImage.title })).toBeInTheDocument()
  })

  it('shows reading time', () => {
    render(<StoryCard story={mockStory} />)
    expect(screen.getByText(/min read$/)).toBeInTheDocument()
  })

  it('renders with hidden tags', () => {
    render(<StoryCard story={mockStory} showTags={false} />)
    mockStory.keywords.forEach(tag => {
      expect(screen.queryByText(tag)).not.toBeInTheDocument()
    })
  })

  it('shows sponsored tag when story is sponsored', () => {
    const sponsoredStory = { ...mockStory, isSponsored: true }
    render(<StoryCard story={sponsoredStory} />)
    
    expect(screen.getByText('Sponsored')).toBeInTheDocument()
  })
}) 