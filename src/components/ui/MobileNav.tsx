'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { X, Menu, ChevronDown, ChevronRight, Search } from 'lucide-react';

interface MobileNavProps {
  /**
   * Navigation items to display
   */
  items: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    children?: {
      label: string;
      href: string;
      icon?: React.ReactNode;
    }[];
  }[];
  
  /**
   * Additional class names to apply
   */
  className?: string;
  
  /**
   * Logo component to display
   */
  logo?: React.ReactNode;
  
  /**
   * Whether to show a search button
   */
  showSearch?: boolean;
  
  /**
   * Callback when search button is clicked
   */
  onSearchClick?: () => void;
}

/**
 * A mobile navigation component with smooth animations and accessibility features
 */
export function MobileNav({
  items,
  className,
  logo,
  showSearch = true,
  onSearchClick,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  
  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.mobile-nav-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Close the menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  // Prevent body scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Toggle expanded state for items with children
  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label) 
        : [...prev, label]
    );
  };
  
  // Check if an item is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };
  
  return (
    <div className={cn('mobile-nav-container relative md:hidden', className)}>
      {/* Toggle button */}
      <button
        type="button"
        className="p-2 text-[#C9A14A] hover:text-white rounded-md hover:bg-[#2A3F5F]/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#19273A]/90 backdrop-blur-sm z-50"
            aria-modal="true"
            role="dialog"
            aria-label="Mobile navigation"
          >
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#C9A14A]/20">
                {logo && (
                  <div className="flex-1">
                    {logo}
                  </div>
                )}
                <button
                  type="button"
                  className="p-2 text-[#C9A14A] hover:text-white rounded-md hover:bg-[#2A3F5F]/50 transition-colors"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Navigation items */}
              <div className="flex-1 overflow-y-auto py-4 px-4">
                <nav className="space-y-1">
                  {items.map((item) => (
                    <div key={item.label} className="py-1">
                      {item.children ? (
                        <div>
                          <button
                            type="button"
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-md transition-colors",
                              isActive(item.href) 
                                ? "bg-[#2A3F5F] text-white font-medium" 
                                : "text-[#C9A14A] hover:bg-[#2A3F5F]/50 hover:text-white"
                            )}
                            onClick={() => toggleExpanded(item.label)}
                            aria-expanded={expandedItems.includes(item.label)}
                          >
                            <span className="flex items-center">
                              {item.icon && <span className="mr-3">{item.icon}</span>}
                              {item.label}
                            </span>
                            <ChevronDown 
                              className={cn(
                                "w-5 h-5 transition-transform",
                                expandedItems.includes(item.label) ? "rotate-180" : ""
                              )} 
                            />
                          </button>
                          
                          <AnimatePresence>
                            {expandedItems.includes(item.label) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 py-2 space-y-1">
                                  {item.children.map((child) => (
                                    <Link
                                      key={child.label}
                                      href={child.href}
                                      className={cn(
                                        "flex items-center p-2 rounded-md transition-colors",
                                        isActive(child.href) 
                                          ? "bg-[#2A3F5F]/70 text-white font-medium" 
                                          : "text-[#C9A14A] hover:bg-[#2A3F5F]/30 hover:text-white"
                                      )}
                                    >
                                      {child.icon && <span className="mr-3">{child.icon}</span>}
                                      <span>{child.label}</span>
                                      <ChevronRight className="w-4 h-4 ml-auto" />
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center p-3 rounded-md transition-colors",
                            isActive(item.href) 
                              ? "bg-[#2A3F5F] text-white font-medium" 
                              : "text-[#C9A14A] hover:bg-[#2A3F5F]/50 hover:text-white"
                          )}
                        >
                          {item.icon && <span className="mr-3">{item.icon}</span>}
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-[#C9A14A]/20">
                {showSearch && (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center p-3 bg-[#C9A14A] text-[#19273A] rounded-md font-medium hover:bg-[#E6C677] transition-colors"
                    onClick={() => {
                      if (onSearchClick) {
                        onSearchClick();
                      }
                      setIsOpen(false);
                    }}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileNav;
