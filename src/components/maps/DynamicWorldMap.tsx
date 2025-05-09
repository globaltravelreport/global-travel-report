'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Define the props for the WorldMap component
export interface WorldMapProps {
  /**
   * Countries to highlight on the map
   */
  highlightedCountries?: string[];

  /**
   * Callback when a country is clicked
   */
  onCountryClick?: (country: string) => void;

  /**
   * CSS class name for the container
   */
  className?: string;

  /**
   * Width of the map
   */
  width?: number | string;

  /**
   * Height of the map
   */
  height?: number | string;

  /**
   * Whether to enable zooming
   */
  enableZoom?: boolean;

  /**
   * Initial zoom level
   */
  initialZoom?: number;

  /**
   * Color for highlighted countries
   */
  highlightColor?: string;

  /**
   * Base color for countries
   */
  baseColor?: string;

  /**
   * Border color for countries
   */
  borderColor?: string;

  /**
   * Whether to show country labels
   */
  showLabels?: boolean;
}

/**
 * Loading component for the WorldMap
 */
const MapLoading = ({ width, height }: { width?: number | string; height?: number | string }) => (
  <div
    className="flex items-center justify-center bg-gray-100 rounded-lg"
    style={{ width: width || '100%', height: height || 500 }}
  >
    <div className="flex flex-col items-center space-y-2">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500">Loading interactive map...</p>
    </div>
  </div>
);

/**
 * Dynamically imported WorldMap component
 *
 * This component uses dynamic imports to load the WorldMap component only on the client side,
 * which reduces the initial bundle size and improves performance.
 */
const DynamicWorldMap = dynamic<WorldMapProps>(
  () => import('./WorldMap'),
  { ssr: false, loading: () => <MapLoading /> }
);

export { DynamicWorldMap };
