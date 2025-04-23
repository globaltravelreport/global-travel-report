import { render, screen } from '@testing-library/react'
import StoryCard from '../StoryCard'

const mockStory = {
  title: 'Test Story',
  slug: 'test-story',
  metaTitle: 'Test Story - Meta Title',
  metaDescription: 'Test story description',
  excerpt: 'Test excerpt',
  category: 'Test Category',
  country: 'Test Country',
  body: 'Test body content',
  featured: true,
  published: true,
  timestamp: '2024-04-22T00:00:00.000Z',
  imageName: 'test-image.jpg',
  author: 'Test Author',
  readTime: 5,
  tags: ['test', 'story'],
  isSponsored: false,
  editorsPick: true
}

describe('StoryCard', () => {
  it('renders story information correctly', () => {
    render(<StoryCard story={mockStory} />)
    
    // Check the main heading (h2)
    expect(screen.getByRole('heading', { level: 2, name: mockStory.title })).toBeInTheDocument()
    expect(screen.getByText(mockStory.category)).toBeInTheDocument()
    expect(screen.getByText(mockStory.country)).toBeInTheDocument()
    expect(screen.getByText(mockStory.author)).toBeInTheDocument()
    expect(screen.getByText(mockStory.excerpt)).toBeInTheDocument()
    
    mockStory.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })
  })

  it('renders without image when imageName is not provided', () => {
    const storyWithoutImage = { ...mockStory, imageName: undefined }
    render(<StoryCard story={storyWithoutImage} />)
    
    expect(screen.getByRole('heading', { level: 2, name: storyWithoutImage.title })).toBeInTheDocument()
  })

  it('shows sponsored tag when story is sponsored', () => {
    const sponsoredStory = { ...mockStory, isSponsored: true }
    render(<StoryCard story={sponsoredStory} />)
    
    expect(screen.getByText('Sponsored')).toBeInTheDocument()
  })
}) 