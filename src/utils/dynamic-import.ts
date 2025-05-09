/**
 * Dynamic Import Utilities
 * 
 * This module provides utilities for dynamic imports and code splitting.
 */

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

/**
 * Options for dynamic imports
 */
export interface DynamicImportOptions {
  /**
   * Whether to load the component on the server side
   */
  ssr?: boolean;
  
  /**
   * Loading component to show while the dynamic component is loading
   */
  loading?: ComponentType | (() => ReactNode);
  
  /**
   * Whether to load the component only when it's visible in the viewport
   */
  loadOnlyWhenVisible?: boolean;
}

/**
 * Dynamically import a component with code splitting
 * 
 * @param importFunc - Function that imports the component
 * @param options - Options for dynamic import
 * @returns Dynamically imported component
 * 
 * @example
 * ```tsx
 * const DynamicMap = dynamicImport(() => import('@/components/Map'), {
 *   ssr: false,
 *   loading: () => <div>Loading map...</div>
 * });
 * ```
 */
export function dynamicImport<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
) {
  const { ssr = true, loading, loadOnlyWhenVisible = false } = options;
  
  // If loadOnlyWhenVisible is true, use IntersectionObserver to load the component
  // only when it's visible in the viewport
  if (loadOnlyWhenVisible && typeof window !== 'undefined') {
    return dynamic(
      () => import('@/src/components/ui/LazyLoad').then(mod => {
        const LazyLoad = mod.LazyLoad;
        
        return importFunc().then(component => {
          const Component = component.default;
          
          return (props: any) => (
            <LazyLoad
              placeholder={loading ? loading : <div />}
            >
              <Component {...props} />
            </LazyLoad>
          );
        });
      }),
      { ssr, loading }
    );
  }
  
  // Otherwise, use regular dynamic import
  return dynamic(importFunc, { ssr, loading });
}

/**
 * Dynamically import a component with code splitting and no server-side rendering
 * 
 * @param importFunc - Function that imports the component
 * @param options - Options for dynamic import
 * @returns Dynamically imported component
 * 
 * @example
 * ```tsx
 * const DynamicChart = clientOnly(() => import('@/components/Chart'), {
 *   loading: () => <div>Loading chart...</div>
 * });
 * ```
 */
export function clientOnly<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: Omit<DynamicImportOptions, 'ssr'> = {}
) {
  return dynamicImport(importFunc, { ...options, ssr: false });
}

/**
 * Dynamically import a component with code splitting and lazy loading
 * 
 * @param importFunc - Function that imports the component
 * @param options - Options for dynamic import
 * @returns Dynamically imported component
 * 
 * @example
 * ```tsx
 * const LazyVideo = lazyLoad(() => import('@/components/Video'), {
 *   loading: () => <div>Loading video...</div>
 * });
 * ```
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: Omit<DynamicImportOptions, 'loadOnlyWhenVisible'> = {}
) {
  return dynamicImport(importFunc, { ...options, loadOnlyWhenVisible: true });
}
