'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlind: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean | string) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  focusVisible: true,
  screenReader: false,
  keyboardNavigation: true,
  colorBlind: false,
  fontSize: 'medium',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
  defaultSettings?: Partial<AccessibilitySettings>;
}

export function AccessibilityProvider({
  children,
  defaultSettings: customDefaults = {},
}: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...defaultSettings,
    ...customDefaults,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('Failed to parse accessibility settings from localStorage');
      }
    }

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSettings(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean | string) => {
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
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    announceToScreenReader,
    resetSettings,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      <AccessibilityStyles settings={settings} />
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

// Dynamic styles based on accessibility settings
interface AccessibilityStylesProps {
  settings: AccessibilitySettings;
}

function AccessibilityStyles({ settings }: AccessibilityStylesProps) {
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'accessibility-styles';

    let css = '';

    // Reduced motion
    if (settings.reducedMotion) {
      css += `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
    }

    // High contrast
    if (settings.highContrast) {
      css += `
        body {
          filter: contrast(150%) brightness(120%);
        }
        .bg-gray-50 { background-color: #000 !important; }
        .bg-white { background-color: #fff !important; }
        .text-gray-600 { color: #000 !important; }
        .text-gray-800 { color: #000 !important; }
        .border-gray-200 { border-color: #000 !important; }
      `;
    }

    // Large text
    if (settings.largeText) {
      css += `
        html { font-size: 120% !important; }
        h1 { font-size: 2.5rem !important; }
        h2 { font-size: 2rem !important; }
        h3 { font-size: 1.75rem !important; }
        .text-sm { font-size: 1rem !important; }
        .text-base { font-size: 1.125rem !important; }
        .text-lg { font-size: 1.25rem !important; }
      `;
    }

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px',
    };

    css += `html { font-size: ${fontSizeMap[settings.fontSize]} !important; }`;

    // Focus visible
    if (settings.focusVisible) {
      css += `
        .focus-visible:focus {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
      `;
    }

    // Color blind friendly
    if (settings.colorBlind) {
      css += `
        .text-red-500 { color: #d97706 !important; }
        .text-green-500 { color: #059669 !important; }
        .bg-red-500 { background-color: #d97706 !important; }
        .bg-green-500 { background-color: #059669 !important; }
        .border-red-500 { border-color: #d97706 !important; }
        .border-green-500 { border-color: #059669 !important; }
      `;
    }

    style.textContent = css;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('accessibility-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [settings]);

  return null;
}

// Accessibility menu component
interface AccessibilityMenuProps {
  className?: string;
}

export function AccessibilityMenu({ className = '' }: AccessibilityMenuProps) {
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    if (typeof settings[key] === 'boolean') {
      updateSetting(key, !settings[key]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg border bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Accessibility settings"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close accessibility menu"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(false);
              }
            }}
            tabIndex={0}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Accessibility Settings</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Reduced Motion */}
                <div className="flex items-center justify-between" role="group" aria-label="Reduced Motion">
                  <div>
                    <div className="font-medium">Reduced Motion</div>
                    <div className="text-sm text-gray-600">Minimize animations and transitions</div>
                  </div>
                  <button
                    onClick={() => toggleSetting('reducedMotion')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between" role="group" aria-label="High Contrast">
                  <div>
                    <div className="font-medium">High Contrast</div>
                    <div className="text-sm text-gray-600">Increase contrast for better visibility</div>
                  </div>
                  <button
                    onClick={() => toggleSetting('highContrast')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.highContrast ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Large Text */}
                <div className="flex items-center justify-between" role="group" aria-label="Large Text">
                  <div>
                    <div className="font-medium">Large Text</div>
                    <div className="text-sm text-gray-600">Increase text size by 20%</div>
                  </div>
                  <button
                    onClick={() => toggleSetting('largeText')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.largeText ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.largeText ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Font Size */}
                <div>
                  <label htmlFor="access-font-size" className="block text-sm font-medium mb-2">Font Size</label>
                  <select
                    id="access-font-size"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>

                {/* Color Blind Support */}
                <div className="flex items-center justify-between" role="group" aria-label="Color Blind Support">
                  <div>
                    <div className="font-medium">Color Blind Support</div>
                    <div className="text-sm text-gray-600">Adjust colors for better accessibility</div>
                  </div>
                  <button
                    onClick={() => toggleSetting('colorBlind')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.colorBlind ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.colorBlind ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Reset Button */}
                <button
                  onClick={resetSettings}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Skip to content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  );
}

// Screen reader only text
interface ScreenReaderTextProps {
  children: ReactNode;
  className?: string;
}

export function ScreenReaderText({ children, className = '' }: ScreenReaderTextProps) {
  return (
    <span className={`sr-only ${className}`}>
      {children}
    </span>
  );
}

// Accessible image component
interface AccessibleImageProps {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
  priority?: boolean;
}

export function AccessibleImage({ src, alt, className = '', caption, priority = false }: AccessibleImageProps) {
  return (
    <figure className={className}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        className="w-full h-auto"
      />
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}