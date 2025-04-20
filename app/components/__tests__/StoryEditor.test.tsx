import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import StoryEditor from '../StoryEditor'
import { Category, StoryDraft } from '@/types/content'

const mockInitialData: StoryDraft = {
  title: 'Test Story',
  content: 'Test content',
  category: 'news' as Category,
  status: 'draft',
  author: 'Test Author',
  isReadyToPublish: false,
  summary: 'Test summary',
  slug: 'test-story',
  featuredImage: {
    url: 'https://example.com/image.jpg',
    alt: 'Test image'
  },
  seo: {
    title: 'Test SEO Title',
    description: 'Test SEO Description',
    keywords: ['test', 'keywords']
  }
}

const mockOnPublish = jest.fn()

describe('StoryEditor', () => {
  it('renders with initial data', () => {
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)
    
    expect(screen.getByDisplayValue('Test Story')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test summary')).toBeInTheDocument()
  })

  it('updates title when changed', () => {
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)
    
    const titleInput = screen.getByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: 'New Title' } })
    
    expect(screen.getByDisplayValue('New Title')).toBeInTheDocument()
  })

  it('updates content when changed', () => {
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)
    
    const contentInput = screen.getByLabelText('Content')
    fireEvent.change(contentInput, { target: { value: 'New content' } })
    
    expect(screen.getByDisplayValue('New content')).toBeInTheDocument()
  })

  it('updates summary when changed', () => {
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)
    
    const summaryInput = screen.getByLabelText('Summary')
    fireEvent.change(summaryInput, { target: { value: 'New summary' } })
    
    expect(screen.getByDisplayValue('New summary')).toBeInTheDocument()
  })

  it('toggles ready to publish status', () => {
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)
    
    const checkbox = screen.getByLabelText('Ready to Publish')
    fireEvent.click(checkbox)
    
    expect(checkbox).toBeChecked()
  })

  it('handles category changes', () => {
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)
    
    const categorySelect = screen.getByLabelText('Category')
    fireEvent.change(categorySelect, { target: { value: 'destinations' } })
    
    expect(screen.getByDisplayValue('destinations')).toBeInTheDocument()
  })

  it('handles publish action', async () => {
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)
    
    const publishButton = screen.getByText('Publish')
    fireEvent.click(publishButton)
    
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalled()
    })
  })
}) 