'use client';

import React, { useState } from 'react';
import { DynamicWorldMap, WorldMapProps } from './DynamicWorldMap';

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
    <DynamicWorldMap
      {...restProps}
      onCountryClick={handleCountryClick}
    />
  );
}

export default ClientWorldMap;
