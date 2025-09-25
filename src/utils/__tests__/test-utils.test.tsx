import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  renderWithProviders,
  mockRouter,
  mockSearchParams,
  mockPathname,
  createMockStory,
  createMockUser,
  createMockComment,
  wait,
  mockFetch,
  mockLocalStorage,
  mockSessionStorage,
  mockIntersectionObserver,
} from '../test-utils';

// Mock the ThemeProvider and Toaster components
jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe('Test Utilities', () => {
  describe('renderWithProviders', () => {
    it('should render a component with providers', () => {
      const TestComponent = () => <div data-testid="test-component">Test</div>;

      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should render a component without theme provider if withTheme is false', () => {
      const TestComponent = () => <div data-testid="test-component">Test</div>;

      renderWithProviders(<TestComponent />, { withTheme: false });

      expect(screen.queryByTestId('theme-provider')).not.toBeInTheDocument();
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should render a component without toaster if withToaster is false', () => {
      const TestComponent = () => <div data-testid="test-component">Test</div>;

      renderWithProviders(<TestComponent />, { withToaster: false });

      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
      expect(screen.queryByTestId('toaster')).not.toBeInTheDocument();
      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });

    it('should set window.location.pathname to the provided route', () => {
      const TestComponent = () => <div>Test</div>;

      renderWithProviders(<TestComponent />, { route: '/test' });

      expect(window.location.pathname).toBe('/test');
    });
  });

  describe('mockRouter', () => {
    it('should return a mock router object', () => {
      const router = mockRouter();

      expect(router.useRouter).toBeInstanceOf(Function);

      const mockRouterInstance = router.useRouter();
      expect(mockRouterInstance.push).toBeInstanceOf(Function);
      expect(mockRouterInstance.replace).toBeInstanceOf(Function);
      expect(mockRouterInstance.pathname).toBe('/');
    });

    it('should allow overriding router properties', () => {
      const router = mockRouter({ pathname: '/test', query: { foo: 'bar' } });

      const mockRouterInstance = router.useRouter();
      expect(mockRouterInstance.pathname).toBe('/test');
      expect(mockRouterInstance.query).toEqual({ foo: 'bar' });
    });
  });

  describe('mockSearchParams', () => {
    it('should return a mock search params object', () => {
      const searchParams = mockSearchParams();

      expect(searchParams.useSearchParams).toBeInstanceOf(Function);

      const mockSearchParamsInstance = searchParams.useSearchParams();
      expect(mockSearchParamsInstance).toBeInstanceOf(URLSearchParams);
    });

    it('should set search parameters', () => {
      const searchParams = mockSearchParams({ foo: 'bar', baz: 'qux' });

      const mockSearchParamsInstance = searchParams.useSearchParams();
      expect(mockSearchParamsInstance.get('foo')).toBe('bar');
      expect(mockSearchParamsInstance.get('baz')).toBe('qux');
    });
  });

  describe('mockPathname', () => {
    it('should return a mock pathname function', () => {
      const pathname = mockPathname();

      expect(pathname.usePathname).toBeInstanceOf(Function);
      expect(pathname.usePathname()).toBe('/');
    });

    it('should allow setting a custom pathname', () => {
      const pathname = mockPathname('/test');

      expect(pathname.usePathname()).toBe('/test');
    });
  });

  describe('createMockStory', () => {
    it('should create a mock story object with default values', () => {
      const story = createMockStory();

      expect(story.title).toBe('Test Story');
      expect(story.slug).toBe('test-story');
      expect(story.country).toBe('Australia');
      expect(story.type).toBe('Travel News');
    });

    it('should allow overriding story properties', () => {
      const story = createMockStory({ title: 'Custom Title', country: 'Japan' });

      expect(story.title).toBe('Custom Title');
      expect(story.country).toBe('Japan');
      expect(story.slug).toBe('test-story'); // Not overridden
    });
  });

  describe('createMockUser', () => {
    it('should create a mock user object with default values', () => {
      const user = createMockUser();

      expect(user.id).toBe('1');
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('user');
    });

    it('should allow overriding user properties', () => {
      const user = createMockUser({ id: '2', role: 'admin' });

      expect(user.id).toBe('2');
      expect(user.role).toBe('admin');
      expect(user.name).toBe('Test User'); // Not overridden
    });
  });

  describe('createMockComment', () => {
    it('should create a mock comment object with default values', () => {
      const comment = createMockComment();

      expect(comment.id).toBe('1');
      expect(comment.content).toBe('This is a test comment');
      expect(comment.author).toBe('Test User');
    });

    it('should allow overriding comment properties', () => {
      const comment = createMockComment({ id: '2', content: 'Custom content' });

      expect(comment.id).toBe('2');
      expect(comment.content).toBe('Custom content');
      expect(comment.author).toBe('Test User'); // Not overridden
    });
  });

  describe('wait', () => {
    it('should return a promise that resolves after the specified time', async () => {
      const start = Date.now();
      await wait(100);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(90); // Allow for small timing variations
    });

    it('should default to 0ms if no time is specified', async () => {
      const promise = wait();
      expect(promise).toBeInstanceOf(Promise);
      await promise; // Should resolve immediately
    });
  });

  describe('mockFetch', () => {
    it('should return a mock fetch function', () => {
      const fetch = mockFetch({ data: 'test' });

      expect(fetch).toBeInstanceOf(Function);
    });

    it('should resolve with the provided response', async () => {
      const response = { data: 'test' };
      const fetch = mockFetch(response);

      const result = await fetch('https://example.com');

      expect(result.ok).toBe(true);
      expect(result.status).toBe(200);
      expect(await result.json()).toEqual(response);
    });

    it('should allow customizing the response status and headers', async () => {
      const response = { error: 'Not found' };
      const fetch = mockFetch(response, { status: 404, headers: { 'Content-Type': 'application/json' }, ok: false });

      const result = await fetch('https://example.com');

      expect(result.ok).toBe(false);
      expect(result.status).toBe(404);
      expect(result.headers.get('Content-Type')).toBe('application/json');
      expect(await result.json()).toEqual(response);
    });
  });

  describe('mockLocalStorage', () => {
    it('should return a mock localStorage object', () => {
      const localStorage = mockLocalStorage();

      expect(localStorage.getItem).toBeInstanceOf(Function);
      expect(localStorage.setItem).toBeInstanceOf(Function);
      expect(localStorage.removeItem).toBeInstanceOf(Function);
      expect(localStorage.clear).toBeInstanceOf(Function);
    });

    it('should store and retrieve values', () => {
      const localStorage = mockLocalStorage();

      localStorage.setItem('foo', 'bar');
      expect(localStorage.getItem('foo')).toBe('bar');

      localStorage.removeItem('foo');
      expect(localStorage.getItem('foo')).toBeNull();
    });

    it('should clear all values', () => {
      const localStorage = mockLocalStorage();

      localStorage.setItem('foo', 'bar');
      localStorage.setItem('baz', 'qux');

      localStorage.clear();

      expect(localStorage.getItem('foo')).toBeNull();
      expect(localStorage.getItem('baz')).toBeNull();
    });
  });

  describe('mockSessionStorage', () => {
    it('should return a mock sessionStorage object', () => {
      const sessionStorage = mockSessionStorage();

      expect(sessionStorage.getItem).toBeInstanceOf(Function);
      expect(sessionStorage.setItem).toBeInstanceOf(Function);
      expect(sessionStorage.removeItem).toBeInstanceOf(Function);
      expect(sessionStorage.clear).toBeInstanceOf(Function);
    });
  });

  describe('mockIntersectionObserver', () => {
    it('should return a mock IntersectionObserver class', () => {
      const IntersectionObserver = mockIntersectionObserver();

      expect(IntersectionObserver).toBeInstanceOf(Function);

      const observer = new IntersectionObserver(() => {});
      expect(observer.observe).toBeInstanceOf(Function);
      expect(observer.unobserve).toBeInstanceOf(Function);
      expect(observer.disconnect).toBeInstanceOf(Function);
    });

    it('should call the callback with isIntersecting=true by default', () => {
      const IntersectionObserver = mockIntersectionObserver();
      const callback = jest.fn();

      const observer = new IntersectionObserver(callback);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0][0].isIntersecting).toBe(true);
    });

    it('should allow setting isIntersecting to false', () => {
      const IntersectionObserver = mockIntersectionObserver(false);
      const callback = jest.fn();

      const observer = new IntersectionObserver(callback);

      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0][0].isIntersecting).toBe(false);
    });
  });
});
