import { 
  paginate, 
  generatePaginationLinks, 
  paginatedStoryFilter,
  createLazyStoryFilter
} from '@/src/utils/pagination';
import { Story } from '@/types/Story';

describe('Pagination Utilities', () => {
  describe('paginate', () => {
    it('should paginate an array of items', () => {
      // Create an array of 10 items
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      
      // Paginate the array with page 1 and limit 3
      const result = paginate(items, { page: 1, limit: 3 });
      
      // Should return the first 3 items
      expect(result.data).toHaveLength(3);
      expect(result.data[0].id).toBe(1);
      expect(result.data[1].id).toBe(2);
      expect(result.data[2].id).toBe(3);
      
      // Should include pagination metadata
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(3);
      expect(result.meta.total).toBe(10);
      expect(result.meta.totalPages).toBe(4);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPrevPage).toBe(false);
    });
    
    it('should handle page 2', () => {
      // Create an array of 10 items
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      
      // Paginate the array with page 2 and limit 3
      const result = paginate(items, { page: 2, limit: 3 });
      
      // Should return items 4-6
      expect(result.data).toHaveLength(3);
      expect(result.data[0].id).toBe(4);
      expect(result.data[1].id).toBe(5);
      expect(result.data[2].id).toBe(6);
      
      // Should include pagination metadata
      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPrevPage).toBe(true);
    });
    
    it('should handle the last page', () => {
      // Create an array of 10 items
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      
      // Paginate the array with page 4 and limit 3
      const result = paginate(items, { page: 4, limit: 3 });
      
      // Should return the last item
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(10);
      
      // Should include pagination metadata
      expect(result.meta.page).toBe(4);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPrevPage).toBe(true);
    });
    
    it('should handle empty arrays', () => {
      // Paginate an empty array
      const result = paginate([], { page: 1, limit: 10 });
      
      // Should return an empty array
      expect(result.data).toHaveLength(0);
      
      // Should include pagination metadata
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPrevPage).toBe(false);
    });
    
    it('should handle page numbers beyond the total pages', () => {
      // Create an array of 10 items
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      
      // Paginate the array with page 5 and limit 3 (beyond the total pages)
      const result = paginate(items, { page: 5, limit: 3 });
      
      // Should return an empty array
      expect(result.data).toHaveLength(0);
      
      // Should include pagination metadata
      expect(result.meta.page).toBe(5);
      expect(result.meta.totalPages).toBe(4);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPrevPage).toBe(true);
    });
  });
  
  describe('generatePaginationLinks', () => {
    it('should generate pagination links', () => {
      // Create pagination metadata
      const meta = {
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      };
      
      // Generate pagination links
      const links = generatePaginationLinks('/stories', meta);
      
      // Should include all pagination links
      expect(links.first).toBe('/stories?page=1');
      expect(links.prev).toBe('/stories?page=1');
      expect(links.current).toBe('/stories?page=2');
      expect(links.next).toBe('/stories?page=3');
      expect(links.last).toBe('/stories?page=5');
    });
    
    it('should handle first page', () => {
      // Create pagination metadata for first page
      const meta = {
        page: 1,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: false,
      };
      
      // Generate pagination links
      const links = generatePaginationLinks('/stories', meta);
      
      // Should have null prev link
      expect(links.first).toBe('/stories?page=1');
      expect(links.prev).toBeNull();
      expect(links.current).toBe('/stories?page=1');
      expect(links.next).toBe('/stories?page=2');
      expect(links.last).toBe('/stories?page=5');
    });
    
    it('should handle last page', () => {
      // Create pagination metadata for last page
      const meta = {
        page: 5,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: false,
        hasPrevPage: true,
      };
      
      // Generate pagination links
      const links = generatePaginationLinks('/stories', meta);
      
      // Should have null next link
      expect(links.first).toBe('/stories?page=1');
      expect(links.prev).toBe('/stories?page=4');
      expect(links.current).toBe('/stories?page=5');
      expect(links.next).toBeNull();
      expect(links.last).toBe('/stories?page=5');
    });
    
    it('should handle URLs with trailing slashes', () => {
      // Create pagination metadata
      const meta = {
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNextPage: true,
        hasPrevPage: true,
      };
      
      // Generate pagination links with URL that has trailing slash
      const links = generatePaginationLinks('/stories/', meta);
      
      // Should remove trailing slash
      expect(links.first).toBe('/stories?page=1');
      expect(links.prev).toBe('/stories?page=1');
    });
  });
  
  describe('paginatedStoryFilter', () => {
    // Create mock stories
    const mockStories: Story[] = [
      {
        id: '1',
        slug: 'story-1',
        title: 'Story 1',
        excerpt: 'Excerpt 1',
        content: 'Content 1',
        publishedAt: new Date('2023-01-01'),
        author: 'Author 1',
        category: 'Category 1',
        country: 'Country 1',
        tags: ['tag1', 'tag2'],
        featured: true,
        editorsPick: false,
        imageUrl: '/image1.jpg',
      },
      {
        id: '2',
        slug: 'story-2',
        title: 'Story 2',
        excerpt: 'Excerpt 2',
        content: 'Content 2',
        publishedAt: new Date('2023-01-02'),
        author: 'Author 2',
        category: 'Category 2',
        country: 'Country 2',
        tags: ['tag2', 'tag3'],
        featured: false,
        editorsPick: true,
        imageUrl: '/image2.jpg',
      },
      {
        id: '3',
        slug: 'story-3',
        title: 'Story 3',
        excerpt: 'Excerpt 3',
        content: 'Content 3',
        publishedAt: new Date('2023-01-03'),
        author: 'Author 1',
        category: 'Category 1',
        country: 'Country 3',
        tags: ['tag1', 'tag3'],
        featured: true,
        editorsPick: true,
        imageUrl: '/image3.jpg',
      },
    ];
    
    it('should filter and paginate stories', () => {
      // Filter stories by category
      const filterFn = (story: Story) => story.category === 'Category 1';
      
      // Apply filter and pagination
      const result = paginatedStoryFilter(mockStories, filterFn, { page: 1, limit: 10 });
      
      // Should return 2 stories in Category 1
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('1');
      expect(result.data[1].id).toBe('3');
      
      // Should include pagination metadata
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(2);
    });
  });
  
  describe('createLazyStoryFilter', () => {
    // Create mock stories
    const mockStories: Story[] = [
      {
        id: '1',
        slug: 'story-1',
        title: 'Story 1',
        excerpt: 'Excerpt 1',
        content: 'Content 1',
        publishedAt: new Date('2023-01-01'),
        author: 'Author 1',
        category: 'Category 1',
        country: 'Country 1',
        tags: ['tag1', 'tag2'],
        featured: true,
        editorsPick: false,
        imageUrl: '/image1.jpg',
      },
      {
        id: '2',
        slug: 'story-2',
        title: 'Story 2',
        excerpt: 'Excerpt 2',
        content: 'Content 2',
        publishedAt: new Date('2023-01-02'),
        author: 'Author 2',
        category: 'Category 2',
        country: 'Country 2',
        tags: ['tag2', 'tag3'],
        featured: false,
        editorsPick: true,
        imageUrl: '/image2.jpg',
      },
      {
        id: '3',
        slug: 'story-3',
        title: 'Story 3',
        excerpt: 'Excerpt 3',
        content: 'Content 3',
        publishedAt: new Date('2023-01-03'),
        author: 'Author 1',
        category: 'Category 1',
        country: 'Country 3',
        tags: ['tag1', 'tag3'],
        featured: true,
        editorsPick: true,
        imageUrl: '/image3.jpg',
      },
    ];
    
    it('should create a lazy story filter', async () => {
      // Mock getStories function
      const getStories = jest.fn().mockResolvedValue(mockStories);
      
      // Create a filter function
      const filterFn = (story: Story) => story.category === 'Category 1';
      
      // Create a lazy story filter
      const lazyFilter = createLazyStoryFilter(getStories, filterFn);
      
      // Call the lazy filter
      const result = await lazyFilter({ page: 1, limit: 10 });
      
      // getStories should be called once
      expect(getStories).toHaveBeenCalledTimes(1);
      
      // Should return 2 stories in Category 1
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('1');
      expect(result.data[1].id).toBe('3');
      
      // Call the lazy filter again
      const result2 = await lazyFilter({ page: 1, limit: 10 });
      
      // getStories should not be called again
      expect(getStories).toHaveBeenCalledTimes(1);
      
      // Should return the same 2 stories
      expect(result2.data).toHaveLength(2);
    });
  });
});
