/**
 * Test utilities for React components and hooks
 */
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

/**
 * Custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * Initial route for the test
   */
  route?: string;

  /**
   * Whether to include the theme provider
   */
  withTheme?: boolean;

  /**
   * Whether to include the toaster
   */
  withToaster?: boolean;
}

/**
 * Custom render function that wraps components with necessary providers
 *
 * @param ui - The component to render
 * @param options - Render options
 * @returns The rendered component
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    withTheme = true,
    withToaster = true,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      pathname: route,
      search: '',
      hash: '',
      href: `http://localhost${route}`,
      origin: 'http://localhost',
    },
    writable: true,
  });

  // Create a wrapper with all providers
  function AllProviders({ children }: { children: React.ReactNode }) {
    return (
      <>
        {withTheme ? (
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            {withToaster && <Toaster />}
          </ThemeProvider>
        ) : (
          <>
            {children}
            {withToaster && <Toaster />}
          </>
        )}
      </>
    );
  }

  return render(ui, { wrapper: AllProviders, ...renderOptions });
}

/**
 * Mock for the useRouter hook
 *
 * @param overrides - Override values for the router
 * @returns A mock router object
 */
export function mockRouter(overrides: Record<string, any> = {}) {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    ...overrides,
  };

  return {
    useRouter: jest.fn().mockReturnValue(router),
  };
}

/**
 * Mock for the useSearchParams hook
 *
 * @param params - Search parameters to mock
 * @returns A mock search params object
 */
export function mockSearchParams(params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, value);
  });

  return {
    useSearchParams: jest.fn().mockReturnValue(searchParams),
  };
}

/**
 * Mock for the usePathname hook
 *
 * @param pathname - Pathname to mock
 * @returns A mock pathname function
 */
export function mockPathname(pathname: string = '/') {
  return {
    usePathname: jest.fn().mockReturnValue(pathname),
  };
}

/**
 * Create a mock story object for testing
 *
 * @param overrides - Override values for the story
 * @returns A mock story object
 */
export function createMockStory(overrides: Record<string, any> = {}) {
  return {
    title: 'Test Story',
    slug: 'test-story',
    summary: 'This is a test story',
    content: 'This is the content of the test story',
    date: '2024-03-24',
    lastModified: '2024-03-24',
    author: 'Global Travel Report Editorial Team',
    country: 'Australia',
    type: 'Travel News',
    keywords: ['test', 'story'],
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    photographer: 'Test Photographer',
    photographerUrl: 'https://unsplash.com/@testphotographer',
    featured: false,
    editorsPick: false,
    ...overrides,
  };
}

/**
 * Create a mock user object for testing
 *
 * @param overrides - Override values for the user
 * @returns A mock user object
 */
export function createMockUser(overrides: Record<string, any> = {}) {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: '2024-03-24',
    updatedAt: '2024-03-24',
    ...overrides,
  };
}

/**
 * Create a mock comment object for testing
 *
 * @param overrides - Override values for the comment
 * @returns A mock comment object
 */
export function createMockComment(overrides: Record<string, any> = {}) {
  return {
    id: '1',
    content: 'This is a test comment',
    author: 'Test User',
    createdAt: '2024-03-24',
    updatedAt: '2024-03-24',
    ...overrides,
  };
}

/**
 * Wait for a specified amount of time
 *
 * @param ms - Milliseconds to wait
 * @returns A promise that resolves after the specified time
 */
export function wait(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock the fetch API
 *
 * @param response - The response to return
 * @param options - Options for the mock
 * @returns A mock fetch function
 */
export function mockFetch(
  response: any,
  options: { status?: number; headers?: Record<string, string>; ok?: boolean } = {}
) {
  const { status = 200, headers = {}, ok = true } = options;

  return jest.fn().mockResolvedValue({
    ok,
    status,
    headers: new Headers(headers),
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
  });
}

/**
 * Mock the localStorage API
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    length: jest.fn(() => Object.keys(store).length),
  };
}

/**
 * Mock the sessionStorage API
 */
export function mockSessionStorage() {
  return mockLocalStorage();
}

/**
 * Mock the IntersectionObserver API
 *
 * @param isIntersecting - Whether the element is intersecting
 * @returns A mock IntersectionObserver class
 */
export function mockIntersectionObserver(isIntersecting: boolean = true) {
  return class IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin: string = '';
    readonly thresholds: ReadonlyArray<number> = [];

    constructor(private callback: IntersectionObserverCallback) {}

    observe = jest.fn(() => {
      this.callback([
        {
          isIntersecting,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          target: {} as Element,
          time: Date.now(),
        },
      ], this);
    });

    unobserve = jest.fn();
    disconnect = jest.fn();
    takeRecords = jest.fn(() => []);
  };
}

const testUtils = {
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
};

export default testUtils;
