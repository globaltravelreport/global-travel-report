'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, X, ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, MousePointer } from 'lucide-react';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';
import { cn } from '@/utils/cn';

interface AccessibilityMenuProps {
  /**
   * Additional class names to apply
   */
  className?: string;
}

/**
 * A floating accessibility menu with animation and keyboard support
 */
export function AccessibilityMenu({ className }: AccessibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    highContrast,
    toggleHighContrast,
    reducedMotion,
    toggleReducedMotion,
    fontSizeAdjustment,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  } = useAccessibility();

  // Toggle menu
  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  // Close menu when Escape key is pressed
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={cn('fixed bottom-4 right-4 z-50', className)}
      role="navigation"
      aria-label="Accessibility controls"
    >
      {/* Toggle button */}
      <button
        type="button"
        className="bg-[#19273A] text-[#C9A14A] p-3 rounded-full shadow-lg hover:bg-[#2A3F5F] focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
        onClick={toggleMenu}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-label="Accessibility options"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-64 bg-white dark:bg-[#19273A] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            role="dialog"
            aria-label="Accessibility menu"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Accessibility className="w-5 h-5 mr-2" />
                Accessibility
              </h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setIsOpen(false)}
                aria-label="Close accessibility menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="p-4 space-y-4">
              {/* Font size */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text Size</h3>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A]"
                    onClick={decreaseFontSize}
                    aria-label="Decrease text size"
                    disabled={fontSizeAdjustment <= -2}
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>

                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {fontSizeAdjustment === 0 ? 'Normal' : fontSizeAdjustment > 0 ? `+${fontSizeAdjustment}` : fontSizeAdjustment}
                    </span>
                    <button
                      type="button"
                      className="ml-2 p-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C9A14A]"
                      onClick={resetFontSize}
                      aria-label="Reset text size"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A]"
                    onClick={increaseFontSize}
                    aria-label="Increase text size"
                    disabled={fontSizeAdjustment >= 3}
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* High contrast */}
              <div>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A]",
                    highContrast
                      ? "bg-[#C9A14A]/20 text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={toggleHighContrast}
                  aria-pressed={highContrast}
                >
                  <span className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    High Contrast
                  </span>
                  <span className={cn(
                    "w-10 h-5 bg-gray-300 rounded-full relative transition-colors",
                    highContrast && "bg-[#C9A14A]"
                  )}>
                    <span className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                      highContrast && "transform translate-x-5"
                    )} />
                  </span>
                </button>
              </div>

              {/* Reduced motion */}
              <div>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C9A14A]",
                    reducedMotion
                      ? "bg-[#C9A14A]/20 text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={toggleReducedMotion}
                  aria-pressed={reducedMotion}
                >
                  <span className="flex items-center">
                    <MousePointer className="w-5 h-5 mr-2" />
                    Reduce Motion
                  </span>
                  <span className={cn(
                    "w-10 h-5 bg-gray-300 rounded-full relative transition-colors",
                    reducedMotion && "bg-[#C9A14A]"
                  )}>
                    <span className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform",
                      reducedMotion && "transform translate-x-5"
                    )} />
                  </span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                These settings will be saved for your next visit.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AccessibilityMenu;
