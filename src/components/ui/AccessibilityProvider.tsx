'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SkipToContent } from '@/components/ui/SkipToContent';

interface AccessibilityContextType {
  /**
   * Whether high contrast mode is enabled
   */
  highContrast: boolean;
  
  /**
   * Toggle high contrast mode
   */
  toggleHighContrast: () => void;
  
  /**
   * Whether reduced motion is enabled
   */
  reducedMotion: boolean;
  
  /**
   * Toggle reduced motion
   */
  toggleReducedMotion: () => void;
  
  /**
   * Current font size adjustment
   */
  fontSizeAdjustment: number;
  
  /**
   * Increase font size
   */
  increaseFontSize: () => void;
  
  /**
   * Decrease font size
   */
  decreaseFontSize: () => void;
  
  /**
   * Reset font size to default
   */
  resetFontSize: () => void;
  
  /**
   * Whether focus indicators are visible
   */
  focusVisible: boolean;
  
  /**
   * Set focus visibility
   */
  setFocusVisible: (visible: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  /**
   * Children to render
   */
  children: ReactNode;
}

/**
 * Provider component for accessibility features
 */
export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // State for accessibility preferences
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSizeAdjustment, setFontSizeAdjustment] = useState(0);
  const [focusVisible, setFocusVisible] = useState(true);
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load high contrast preference
    const savedHighContrast = localStorage.getItem('highContrast');
    if (savedHighContrast) {
      setHighContrast(savedHighContrast === 'true');
    }
    
    // Load reduced motion preference
    const savedReducedMotion = localStorage.getItem('reducedMotion');
    if (savedReducedMotion) {
      setReducedMotion(savedReducedMotion === 'true');
    } else {
      // Check for prefers-reduced-motion media query
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(prefersReducedMotion);
    }
    
    // Load font size adjustment
    const savedFontSize = localStorage.getItem('fontSizeAdjustment');
    if (savedFontSize) {
      setFontSizeAdjustment(parseInt(savedFontSize, 10));
    }
  }, []);
  
  // Update document with accessibility preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Save preference
    localStorage.setItem('highContrast', highContrast.toString());
  }, [highContrast]);
  
  // Update document with reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Save preference
    localStorage.setItem('reducedMotion', reducedMotion.toString());
  }, [reducedMotion]);
  
  // Update document with font size adjustment
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Apply font size adjustment
    document.documentElement.style.setProperty('--font-size-adjustment', `${fontSizeAdjustment}`);
    
    // Save preference
    localStorage.setItem('fontSizeAdjustment', fontSizeAdjustment.toString());
  }, [fontSizeAdjustment]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show focus indicators when using keyboard
      if (event.key === 'Tab') {
        setFocusVisible(true);
      }
    };
    
    const handleMouseDown = () => {
      // Hide focus indicators when using mouse
      setFocusVisible(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  // Toggle high contrast mode
  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };
  
  // Toggle reduced motion
  const toggleReducedMotion = () => {
    setReducedMotion(prev => !prev);
  };
  
  // Increase font size
  const increaseFontSize = () => {
    setFontSizeAdjustment(prev => Math.min(prev + 1, 3));
  };
  
  // Decrease font size
  const decreaseFontSize = () => {
    setFontSizeAdjustment(prev => Math.max(prev - 1, -2));
  };
  
  // Reset font size
  const resetFontSize = () => {
    setFontSizeAdjustment(0);
  };
  
  // Context value
  const value = {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    fontSizeAdjustment,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    focusVisible,
    setFocusVisible,
  };
  
  return (
    <AccessibilityContext.Provider value={value}>
      <SkipToContent />
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to use accessibility context
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
}

export default AccessibilityProvider;
