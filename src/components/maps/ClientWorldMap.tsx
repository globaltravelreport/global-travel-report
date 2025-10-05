'use client';

import React, { useCallback } from 'react';
// import { useState } from 'react';
import dynamic from 'next/dynamic';

// Import the WorldMap component dynamically with no SSR
const WorldMap = dynamic(() => import('./WorldMap'), { ssr: false });

// Define the props for the WorldMap component
export interface WorldMapProps {
  highlightedCountries?: string[];
  onCountryClick?: (country: string) => void;
  className?: string;
  width?: number | string;
  height?: number | string;
  enableZoom?: boolean;
  initialZoom?: number;
  highlightColor?: string;
  baseColor?: string;
  borderColor?: string;
  showLabels?: boolean;
}

/**
 * Client component wrapper for the WorldMap component
 * This component handles the onCountryClick event on the client side
 * to avoid the "Event handlers cannot be passed to Client Component props" error
 */
export function ClientWorldMap(props: Omit<WorldMapProps, 'onCountryClick'> & {
  onCountryClick?: (country: string) => void;
}) {
  const { onCountryClick, ...restProps } = props;

  // Handle country click on the client side using useCallback to memoize the function
  const handleCountryClick = useCallback((country: string) => {
    if (onCountryClick) {
      // For destinations page specific behavior
      const element = document.getElementById(`country-${country.toLowerCase().replace(/\s+/g, '-')}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = `/countries/${country.toLowerCase().replace(/\s+/g, '-')}`;
      }
    }
  }, [onCountryClick]);

  return (
    <WorldMap
      {...restProps}
      onCountryClick={handleCountryClick}
    />
  );
}

export default ClientWorldMap;
