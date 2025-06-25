'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

// Define the props for the WorldMap component
interface WorldMapProps {
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
 * Interactive World Map Component
 *
 * This component renders an interactive world map using Leaflet.js.
 * It allows highlighting countries and handling click events.
 *
 * @example
 * ```tsx
 * <WorldMap
 *   highlightedCountries={['France', 'Japan', 'Australia']}
 *   onCountryClick={(country) => router.push(`/countries/${country.toLowerCase()}`)}
 *   width="100%"
 *   height={500}
 * />
 * ```
 */
export function WorldMap({
  highlightedCountries = [],
  onCountryClick,
  className,
  width = '100%',
  height = 500,
  enableZoom = true,
  initialZoom = 2,
  highlightColor = '#3b82f6', // blue-500
  baseColor = '#e5e7eb', // gray-200
  borderColor = '#ffffff', // white
  showLabels = false,
}: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [geoJSON, setGeoJSON] = useState<any>(null);

  // Initialize the map when the component mounts
  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    // Load Leaflet and GeoJSON data
    const initializeMap = async () => {
      try {
        // Import Leaflet dynamically
        const L = await import('leaflet');

        // Import GeoJSON data
        const response = await fetch('/data/world-countries.geo.json');
        const data = await response.json();

        setLeaflet(L);
        setGeoJSON(data);
        setIsMapInitialized(true);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    if (!isMapInitialized) {
      initializeMap();
    }
  }, [isMapInitialized]);

  // Set up the map when Leaflet and GeoJSON data are loaded
  useEffect(() => {
    if (!leaflet || !geoJSON || !mapRef.current || !isMapInitialized) return;

    // Initialize the map
    const L = leaflet;
    const map = L.map(mapRef.current, {
      center: [20, 0],
      zoom: initialZoom,
      zoomControl: enableZoom,
      scrollWheelZoom: enableZoom,
      dragging: enableZoom,
      touchZoom: enableZoom,
      doubleClickZoom: enableZoom,
      boxZoom: enableZoom,
      keyboard: enableZoom,
    });

    // Add the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add the GeoJSON layer
    L.geoJSON(geoJSON, {
      style: (feature) => {
        const countryName = feature?.properties?.name;
        const isHighlighted = highlightedCountries.includes(countryName);

        return {
          fillColor: isHighlighted ? highlightColor : baseColor,
          weight: 1,
          opacity: 1,
          color: borderColor,
          fillOpacity: isHighlighted ? 0.7 : 0.3,
        };
      },
      onEachFeature: (feature, layer) => {
        const countryName = feature?.properties?.name;

        // Add tooltip
        if (showLabels) {
          layer.bindTooltip(countryName, {
            permanent: false,
            direction: 'center',
            className: 'country-tooltip',
          });
        }

        // Add click handler
        if (onCountryClick) {
          layer.on('click', () => {
            onCountryClick(countryName);
          });

          // Change cursor on hover
          layer.on('mouseover', () => {
            layer.getElement()?.setAttribute('style', 'cursor: pointer;');
          });
        }
      },
    }).addTo(map);

    // Clean up when the component unmounts
    return () => {
      map.remove();
    };
  }, [
    leaflet,
    geoJSON,
    isMapInitialized,
    highlightedCountries,
    onCountryClick,
    enableZoom,
    initialZoom,
    highlightColor,
    baseColor,
    borderColor,
    showLabels,
  ]);

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg', className)}
      style={{ width, height }}
    >
      <div ref={mapRef} className="w-full h-full" />
      {!isMapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  );
}

export default WorldMap;
