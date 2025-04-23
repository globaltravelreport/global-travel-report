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

// Mock window.alert before tests
const mockAlert = jest.fn()
window.alert = mockAlert

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
    // Mock successful publish
    mockOnPublish.mockResolvedValueOnce(undefined)
    
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)

    // First check the "Ready to Publish" checkbox
    const readyToPublishCheckbox = screen.getByLabelText('Ready to Publish')
    fireEvent.click(readyToPublishCheckbox)

    // Then click the publish button
    const publishButton = screen.getByText('Publish')
    fireEvent.click(publishButton)

    // Wait for the async publish action to complete
    await waitFor(() => {
      expect(mockOnPublish).toHaveBeenCalledWith(expect.objectContaining({
        ...mockInitialData,
        isReadyToPublish: true
      }))
      expect(mockAlert).toHaveBeenCalledWith('✅ Story published successfully!')
    })
  })

  it('handles publish errors', async () => {
    // Mock failed publish
    const error = new Error('Failed to publish')
    mockOnPublish.mockRejectedValueOnce(error)
    
    render(<StoryEditor initialData={mockInitialData} onPublish={mockOnPublish} />)

    // First check the "Ready to Publish" checkbox
    const readyToPublishCheckbox = screen.getByLabelText('Ready to Publish')
    fireEvent.click(readyToPublishCheckbox)

    // Then click the publish button
    const publishButton = screen.getByText('Publish')
    fireEvent.click(publishButton)

    // Wait for the error alert
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Failed to publish story. Please try again.')
    })
  })
}) 