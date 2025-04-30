import { 
  memoize, 
  memoizeMultiArg, 
  memoizeWithExpiration 
} from '@/src/utils/memoization';

describe('Memoization Utilities', () => {
  describe('memoize', () => {
    it('should cache function results', () => {
      // Create a mock function
      const mockFn = jest.fn((x: number) => x * 2);
      
      // Memoize the function
      const memoizedFn = memoize(mockFn);
      
      // Call the function multiple times with the same argument
      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);
      
      // The function should only be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // The results should be the same
      expect(result1).toBe(10);
      expect(result2).toBe(10);
      
      // Call the function with a different argument
      const result3 = memoizedFn(10);
      
      // The function should be called again
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result3).toBe(20);
    });
    
    it('should respect maxCacheSize option', () => {
      // Create a mock function
      const mockFn = jest.fn((x: number) => x * 2);
      
      // Memoize the function with a max cache size of 2
      const memoizedFn = memoize(mockFn, { maxCacheSize: 2 });
      
      // Call the function with 3 different arguments
      memoizedFn(1);
      memoizedFn(2);
      memoizedFn(3);
      
      // The function should be called 3 times
      expect(mockFn).toHaveBeenCalledTimes(3);
      
      // Call the first argument again
      // Since the cache size is 2, the first argument should have been evicted
      memoizedFn(1);
      
      // The function should be called again
      expect(mockFn).toHaveBeenCalledTimes(4);
      
      // Call the third argument again
      // This should be cached
      memoizedFn(3);
      
      // The function should not be called again
      expect(mockFn).toHaveBeenCalledTimes(4);
    });
    
    it('should use custom key generator', () => {
      // Create a mock function
      const mockFn = jest.fn((obj: { id: number; name: string }) => obj.id);
      
      // Memoize the function with a custom key generator
      const memoizedFn = memoize(mockFn, {
        keyGenerator: (obj) => String(obj.id),
      });
      
      // Call the function with objects that have the same ID but different names
      const result1 = memoizedFn({ id: 1, name: 'Alice' });
      const result2 = memoizedFn({ id: 1, name: 'Bob' });
      
      // The function should only be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // The results should be the same
      expect(result1).toBe(1);
      expect(result2).toBe(1);
    });
    
    it('should use shouldCache option', () => {
      // Create a mock function
      const mockFn = jest.fn((x: number) => x * 2);
      
      // Memoize the function with a shouldCache function
      const memoizedFn = memoize(mockFn, {
        shouldCache: (result) => result > 10,
      });
      
      // Call the function with an argument that produces a result <= 10
      memoizedFn(5); // Result: 10
      memoizedFn(5); // Should not be cached
      
      // The function should be called twice
      expect(mockFn).toHaveBeenCalledTimes(2);
      
      // Call the function with an argument that produces a result > 10
      memoizedFn(10); // Result: 20
      memoizedFn(10); // Should be cached
      
      // The function should be called once more
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
  });
  
  describe('memoizeMultiArg', () => {
    it('should cache function results with multiple arguments', () => {
      // Create a mock function
      const mockFn = jest.fn((a: number, b: number) => a + b);
      
      // Memoize the function
      const memoizedFn = memoizeMultiArg(mockFn);
      
      // Call the function multiple times with the same arguments
      const result1 = memoizedFn(5, 10);
      const result2 = memoizedFn(5, 10);
      
      // The function should only be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
      
      // The results should be the same
      expect(result1).toBe(15);
      expect(result2).toBe(15);
      
      // Call the function with different arguments
      const result3 = memoizedFn(10, 20);
      
      // The function should be called again
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result3).toBe(30);
    });
    
    it('should respect maxCacheSize option', () => {
      // Create a mock function
      const mockFn = jest.fn((a: number, b: number) => a + b);
      
      // Memoize the function with a max cache size of 2
      const memoizedFn = memoizeMultiArg(mockFn, { maxCacheSize: 2 });
      
      // Call the function with 3 different argument sets
      memoizedFn(1, 2);
      memoizedFn(3, 4);
      memoizedFn(5, 6);
      
      // The function should be called 3 times
      expect(mockFn).toHaveBeenCalledTimes(3);
      
      // Call the first argument set again
      // Since the cache size is 2, the first argument set should have been evicted
      memoizedFn(1, 2);
      
      // The function should be called again
      expect(mockFn).toHaveBeenCalledTimes(4);
      
      // Call the third argument set again
      // This should be cached
      memoizedFn(5, 6);
      
      // The function should not be called again
      expect(mockFn).toHaveBeenCalledTimes(4);
    });
  });
  
  describe('memoizeWithExpiration', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should cache function results with expiration', () => {
      // Create a mock function
      const mockFn = jest.fn((x: number) => x * 2);
      
      // Memoize the function with a 1000ms TTL
      const memoizedFn = memoizeWithExpiration(mockFn, 1000);
      
      // Call the function
      const result1 = memoizedFn(5);
      
      // The function should be called once
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result1).toBe(10);
      
      // Call the function again before expiration
      const result2 = memoizedFn(5);
      
      // The function should not be called again
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result2).toBe(10);
      
      // Advance time past the TTL
      jest.advanceTimersByTime(1001);
      
      // Call the function again after expiration
      const result3 = memoizedFn(5);
      
      // The function should be called again
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result3).toBe(10);
    });
  });
});
