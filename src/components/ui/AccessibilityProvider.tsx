'use client';

/**
 * Compatibility layer for the UI accessibility hook.
 *
 * The root layout wraps the app with `src/components/accessibility/AccessibilityProvider`.
 * Image and menu components historically imported a *different* context from this file,
 * which caused `useAccessibility must be used within an AccessibilityProvider` and
 * blank country pages. Both entry points now share the same provider/context.
 */

import {
  AccessibilityProvider,
  useAccessibility as useAccessibilitySettings,
} from '@/components/accessibility/AccessibilityProvider';

const FONT_SIZES = ['small', 'medium', 'large', 'extra-large'] as const;
type FontSize = (typeof FONT_SIZES)[number];

const SIZE_TO_ADJUSTMENT: Record<FontSize, number> = {
  small: -1,
  medium: 0,
  large: 1,
  'extra-large': 2,
};

const ADJUSTMENT_TO_SIZE: Record<number, FontSize> = {
  [-2]: 'small',
  [-1]: 'small',
  0: 'medium',
  1: 'large',
  2: 'extra-large',
  3: 'extra-large',
};

/**
 * Hook that maps the layout provider's settings API onto the older UI shape
 * expected by EnhancedImage, OptimizedImageV2, and AccessibilityMenu.
 */
const FALLBACK_SETTINGS = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  focusVisible: true,
  screenReader: false,
  keyboardNavigation: true,
  colorBlind: false,
  fontSize: 'medium' as FontSize,
};

function useAccessibilitySettingsSafe() {
  try {
    return useAccessibilitySettings();
  } catch {
    // Tests and any tree rendered without the root provider should still work.
    return {
      settings: FALLBACK_SETTINGS,
      updateSetting: () => undefined,
      resetSettings: () => undefined,
      announceToScreenReader: () => undefined,
    };
  }
}

export function useAccessibility() {
  const { settings, updateSetting, resetSettings } = useAccessibilitySettingsSafe();
  const fontSize = (FONT_SIZES.includes(settings.fontSize as FontSize)
    ? settings.fontSize
    : 'medium') as FontSize;

  return {
    highContrast: settings.highContrast,
    toggleHighContrast: () => updateSetting('highContrast', !settings.highContrast),
    reducedMotion: settings.reducedMotion,
    toggleReducedMotion: () => updateSetting('reducedMotion', !settings.reducedMotion),
    fontSizeAdjustment: SIZE_TO_ADJUSTMENT[fontSize],
    increaseFontSize: () => {
      const index = FONT_SIZES.indexOf(fontSize);
      updateSetting('fontSize', FONT_SIZES[Math.min(index + 1, FONT_SIZES.length - 1)]);
    },
    decreaseFontSize: () => {
      const index = FONT_SIZES.indexOf(fontSize);
      updateSetting('fontSize', FONT_SIZES[Math.max(index - 1, 0)]);
    },
    resetFontSize: () => updateSetting('fontSize', 'medium'),
    focusVisible: settings.focusVisible,
    setFocusVisible: (visible: boolean) => updateSetting('focusVisible', visible),
    resetSettings,
    settings,
    updateSetting,
    // Allow callers that pass a numeric adjustment to still land on a valid size
    setFontSizeFromAdjustment: (adjustment: number) => {
      updateSetting('fontSize', ADJUSTMENT_TO_SIZE[adjustment] || 'medium');
    },
  };
}

export { AccessibilityProvider };
export default AccessibilityProvider;
