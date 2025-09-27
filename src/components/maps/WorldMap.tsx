'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
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
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Function to load the map on demand
  const loadMap = async () => {
    if (isMapLoaded || typeof window === 'undefined') return;

    try {
      // Import Leaflet dynamically
      const L = await import('leaflet');

      // Import GeoJSON data
      const response = await fetch('/data/world-countries.geo.json');
      const data = await response.json();

      setLeaflet(L);
      setGeoJSON(data);
      setIsMapLoaded(true);
    } catch (error) {
      console.error('Error loading map:', error);
    }
  };

  // Initialize the map when the component mounts (but don't load heavy assets yet)
  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    // Set initialized state but don't load heavy assets yet
    setIsMapInitialized(true);
  }, []);

  // Set up the map when Leaflet and GeoJSON data are loaded
  useEffect(() => {
    if (!leaflet || !geoJSON || !mapRef.current || !isMapLoaded) return;

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
      {!isMapLoaded ? (
        // Static placeholder with load button
        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive World Map</h3>
            <p className="text-gray-600 mb-4">Click to explore destinations and view stories by country</p>
          </div>
          <button
            onClick={loadMap}
            className="px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
          >
            Load Interactive Map
          </button>
        </div>
      ) : (
        // Interactive map
        <>
          <div ref={mapRef} className="w-full h-full" />
          {!leaflet && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A]"></div>
              <span className="ml-3 text-gray-600">Loading map...</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WorldMap;
