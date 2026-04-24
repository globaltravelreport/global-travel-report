/**
 * Trending Destinations Component
 *
 * Shows trending travel destinations based on user searches,
 * story views, and social media mentions.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=400';

interface TrendingDestination {
  id: string;
  name: string;
  country: string;
  trendScore: number;
  storyCount: number;
  imageUrl: string;
  description: string;
  trending: boolean;
  category: string;
}

interface TrendingDestinationsProps {
  maxItems?: number;
  showImages?: boolean;
  className?: string;
}

export function TrendingDestinations({
  maxItems = 6,
  showImages = true,
  className = ''
}: TrendingDestinationsProps) {
  const [destinations, setDestinations] = useState<TrendingDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe] = useState<'week' | 'month'>('week');

  useEffect(() => {
    // Simulate loading trending destinations
    const loadTrendingDestinations = async () => {
      setLoading(true);

      const mockDestinations: TrendingDestination[] = [
        {
          id: 'tokyo-japan',
          name: 'Tokyo',
          country: 'Japan',
          trendScore: 95,
          storyCount: 12,
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&q=80&w=400',
          description: 'Vibrant metropolis blending tradition and modernity',
          trending: true,
          category: 'City'
        }
      ];

      setTimeout(() => {
        setDestinations(mockDestinations);
        setLoading(false);
      }, 800);
    };

    loadTrendingDestinations();
  }, [timeframe]);

  if (loading) {
    return (
      <div className={`trending-destinations ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`trending-destinations ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Destinations</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {destinations.slice(0, maxItems).map((destination) => (
          <Link key={destination.id} href={`/destinations/${destination.id}`}>
            <div className="rounded-lg overflow-hidden bg-white shadow-sm">
              {showImages && (
                <img
                  src={destination.imageUrl || FALLBACK_IMAGE}
                  alt={destination.name}
                  className="w-full h-24 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              )}
              <div className="p-3">
                <h4 className="text-sm font-medium">{destination.name}</h4>
                <p className="text-xs text-gray-500">{destination.country}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default TrendingDestinations;