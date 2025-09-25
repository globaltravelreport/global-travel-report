'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  skipToContent: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
  defaultSettings?: Partial<AccessibilitySettings>;
}

export function AccessibilityProvider({
  children,
  defaultSettings = {}
}: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    focusVisible: true,
    screenReader: false,
    keyboardNavigation: true,
    ...defaultSettings,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse accessibility settings:', error);
      }
    }

    // Detect user preferences
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSettings(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));

    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    setSettings(prev => ({ ...prev, highContrast: highContrastQuery.matches }));

    // Add event listeners for preference changes
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }));
    };

    mediaQuery.addEventListener('change', handleMotionChange);
    highContrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      highContrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply CSS classes based on settings
  useEffect(() => {
    const root = document.documentElement;

    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const skipToContent = () => {
    const content = document.getElementById('main-content') || document.querySelector('main');
    if (content) {
      content.focus();
      content.scrollIntoView({ behavior: 'smooth' });
      announceToScreenReader('Skipped to main content');
    }
  };

  const toggleReducedMotion = () => {
    updateSetting('reducedMotion', !settings.reducedMotion);
    announceToScreenReader(
      `Reduced motion ${!settings.reducedMotion ? 'enabled' : 'disabled'}`
    );
  };

  const toggleHighContrast = () => {
    updateSetting('highContrast', !settings.highContrast);
    announceToScreenReader(
      `High contrast ${!settings.highContrast ? 'enabled' : 'disabled'}`
    );
  };

  const toggleLargeText = () => {
    updateSetting('largeText', !settings.largeText);
    announceToScreenReader(
      `Large text ${!settings.largeText ? 'enabled' : 'disabled'}`
    );
  };

  const resetSettings = () => {
    setSettings({
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      focusVisible: true,
      screenReader: false,
      keyboardNavigation: true,
    });
    announceToScreenReader('Accessibility settings reset to defaults');
  };

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    announceToScreenReader,
    skipToContent,
    toggleReducedMotion,
    toggleHighContrast,
    toggleLargeText,
    resetSettings,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Skip to Content Link Component
interface SkipToContentProps {
  className?: string;
}

export function SkipToContent({ className = '' }: SkipToContentProps) {
  const { skipToContent } = useAccessibility();

  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        skipToContent();
      }}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 ${className}`}
    >
      Skip to main content
    </a>
  );
}

// Accessibility Menu Component
interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function AccessibilityMenu({ isOpen, onClose, className = '' }: AccessibilityMenuProps) {
  const {
    settings,
    updateSetting,
    toggleReducedMotion,
    toggleHighContrast,
    toggleLargeText,
    resetSettings,
    announceToScreenReader,
  } = useAccessibility();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      announceToScreenReader('Accessibility menu opened');
    }
  }, [isOpen, announceToScreenReader]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="accessibility-title"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 id="accessibility-title" className="text-lg font-semibold">
              Accessibility Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close accessibility menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Reduce Motion</label>
                <p className="text-sm text-gray-600">Minimize animations and transitions</p>
              </div>
              <button
                onClick={toggleReducedMotion}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-pressed={settings.reducedMotion}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">High Contrast</label>
                <p className="text-sm text-gray-600">Increase contrast for better visibility</p>
              </div>
              <button
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-pressed={settings.highContrast}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Large Text</label>
                <p className="text-sm text-gray-600">Increase text size for better readability</p>
              </div>
              <button
                onClick={toggleLargeText}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.largeText ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-pressed={settings.largeText}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.largeText ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Enhanced Focus</label>
                <p className="text-sm text-gray-600">Show focus indicators for keyboard navigation</p>
              </div>
              <button
                onClick={() => updateSetting('focusVisible', !settings.focusVisible)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.focusVisible ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-pressed={settings.focusVisible}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.focusVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <button
              onClick={resetSettings}
              className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Screen Reader Only Component
interface ScreenReaderOnlyProps {
  children: ReactNode;
  id?: string;
}

export function ScreenReaderOnly({ children, id }: ScreenReaderOnlyProps) {
  return (
    <div
      id={id}
      className="sr-only"
      aria-hidden="false"
    >
      {children}
    </div>
  );
}

// Accessible Image Component
interface AccessibleImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function AccessibleImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad,
  onError,
}: AccessibleImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  // Validate alt text
  const hasAltText = alt && alt.trim().length > 0;
  const isDecorative = alt === '';

  if (!hasAltText && !isDecorative) {
    console.warn('Image missing alt text:', src);
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}

      {imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Image failed to load
          </div>
        </div>
      )}
    </div>
  );
}

// Keyboard Navigation Hook
export function useKeyboardNavigation() {
  const [currentFocus, setCurrentFocus] = useState<number>(-1);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const focusNext = (elements: HTMLElement[]) => {
    if (elements.length === 0) return;

    const nextIndex = currentFocus >= elements.length - 1 ? 0 : currentFocus + 1;
    elements[nextIndex]?.focus();
    setCurrentFocus(nextIndex);
  };

  const focusPrevious = (elements: HTMLElement[]) => {
    if (elements.length === 0) return;

    const prevIndex = currentFocus <= 0 ? elements.length - 1 : currentFocus - 1;
    elements[prevIndex]?.focus();
    setCurrentFocus(prevIndex);
  };

  return {
    isKeyboardUser,
    focusNext,
    focusPrevious,
    currentFocus,
    setCurrentFocus,
  };
}