'use client';

import React, { useState } from 'react';
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
export function ClientWorldMap(props: WorldMapProps) {
  const { onCountryClick, ...restProps } = props;

  // Handle country click on the client side
  const handleCountryClick = (country: string) => {
    if (onCountryClick) {
      onCountryClick(country);
    }
  };

  return (
    <WorldMap
      {...restProps}
      onCountryClick={handleCountryClick}
    />
  );
}

export default ClientWorldMap;
