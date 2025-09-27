import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
console.error = jest.fn();

describe('/api/affiliates/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the cache before each test
    // Note: In a real implementation, you'd want to expose a way to clear the cache for testing
  });

  describe('GET endpoint', () => {
    it('should return 400 when no URLs are provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/affiliates/verify');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No URLs provided for verification');
    });

    it('should successfully verify working URLs', async () => {
      const mockUrls = ['https://example.com', 'https://test.com'];
      const request = new NextRequest(`http://localhost:3000/api/affiliates/verify?urls=${encodeURIComponent(mockUrls.join(','))}`);

      // Mock successful fetch responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        })
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
        });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results).toHaveProperty('https://example.com');
      expect(data.results).toHaveProperty('https://test.com');
      expect(data.results['https://example.com'].isValid).toBe(true);
      expect(data.results['https://test.com'].isValid).toBe(true);
    });

    it('should handle failed URL verification', async () => {
      const mockUrls = ['https://failing-url.com'];
      const request = new NextRequest(`http://localhost:3000/api/affiliates/verify?urls=${encodeURIComponent(mockUrls.join(','))}`);

      // Mock failed fetch response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 404,
        ok: false,
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results['https://failing-url.com'].isValid).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      const mockUrls = ['https://network-error.com'];
      const request = new NextRequest(`http://localhost:3000/api/affiliates/verify?urls=${encodeURIComponent(mockUrls.join(','))}`);

      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results['https://network-error.com'].isValid).toBe(false);
      expect(data.results['https://network-error.com'].error).toBe('Network error');
    });

    it('should handle timeout errors', async () => {
      const mockUrls = ['https://timeout-url.com'];
      const request = new NextRequest(`http://localhost:3000/api/affiliates/verify?urls=${encodeURIComponent(mockUrls.join(','))}`);

      // Mock timeout (AbortError)
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.results['https://timeout-url.com'].isValid).toBe(false);
    });
  });

  describe('POST endpoint', () => {
    it('should clear cache when action is clear_cache', async () => {
      const request = new NextRequest('http://localhost:3000/api/affiliates/verify', {
        method: 'POST',
        body: JSON.stringify({ action: 'clear_cache' }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Verification cache cleared');
    });

    it('should return 400 for invalid action', async () => {
      const request = new NextRequest('http://localhost:3000/api/affiliates/verify', {
        method: 'POST',
        body: JSON.stringify({ action: 'invalid_action' }),
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid action');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/affiliates/verify', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'content-type': 'application/json',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('Performance and caching', () => {
    it('should include cache information in response', async () => {
      const mockUrls = ['https://example.com'];
      const request = new NextRequest(`http://localhost:3000/api/affiliates/verify?urls=${encodeURIComponent(mockUrls.join(','))}`);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        status: 200,
        ok: true,
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('cacheInfo');
      expect(data.cacheInfo).toHaveProperty('totalCached');
      expect(data.cacheInfo).toHaveProperty('cacheDuration');
      expect(data).toHaveProperty('timestamp');
    });

    it('should handle multiple URLs efficiently', async () => {
      const mockUrls = Array.from({ length: 5 }, (_, i) => `https://example${i}.com`);
      const request = new NextRequest(`http://localhost:3000/api/affiliates/verify?urls=${encodeURIComponent(mockUrls.join(','))}`);

      // Mock all successful responses
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        ok: true,
      });

      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();

      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Should verify all URLs
      mockUrls.forEach(url => {
        expect(data.results).toHaveProperty(url);
        expect(data.results[url].isValid).toBe(true);
      });

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});