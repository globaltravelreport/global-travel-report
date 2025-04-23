// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() { return null }
  unobserve() { return null }
  disconnect() { return null }
}

window.IntersectionObserver = MockIntersectionObserver

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock fetch
global.fetch = jest.fn()

// Mock console.error and console.warn to fail tests
const originalError = console.error
const originalWarn = console.warn
const originalLog = console.log

console.error = (...args) => {
  originalError.call(console, ...args)
  throw new Error('Console error was called')
}

console.warn = (...args) => {
  originalWarn.call(console, ...args)
  throw new Error('Console warn was called')
}

console.log = (...args) => {
  originalLog.call(console, ...args)
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn()
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null)
    }
  }
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} fill={undefined} />
  }
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key'
process.env.NEXT_PUBLIC_OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'test-key'

// Suppress console errors and warnings during tests
beforeAll(() => {
  console.error = (...args) => {
    // Ignore React-specific warnings
    if (args[0]?.includes('Warning:')) return
    if (args[0]?.includes('Error: Console error was called')) return
    if (args[0]?.includes('Failed to publish')) return
    originalError.call(console, ...args)
  }
  
  console.warn = (...args) => {
    // Ignore React-specific warnings
    if (args[0]?.includes('Warning:')) return
    originalWarn.call(console, ...args)
  }

  console.log = (...args) => {
    // Ignore specific log messages
    if (args[0]?.includes('StoryEditor:')) return
    originalLog.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
  console.log = originalLog
}) 