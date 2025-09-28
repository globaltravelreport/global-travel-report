/**
 * Trending Destinations Component
 *
 * Shows trending travel destinations based on user searches,
 * story views, and social media mentions.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('week');

  useEffect(() => {
    // Simulate loading trending destinations
    const loadTrendingDestinations = async () => {
      setLoading(true);

      // Mock trending destinations data
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
        },
        {
          id: 'santorini-greece',
          name: 'Santorini',
          country: 'Greece',
          trendScore: 87,
          storyCount: 8,
          imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&q=80&w=400',
          description: 'Stunning sunsets and white-washed architecture',
          trending: true,
          category: 'Island'
        },
        {
          id: 'machu-picchu-peru',
          name: 'Machu Picchu',
          country: 'Peru',
          trendScore: 82,
          storyCount: 6,
          imageUrl: 'https://images.unsplash.com/photo-1587595437715-1e9d6e0a2d6e?auto=format&q=80&w=400',
          description: 'Ancient Incan citadel in the Andes mountains',
          trending: false,
          category: 'Historical'
        },
        {
          id: 'bali-indonesia',
          name: 'Bali',
          country: 'Indonesia',
          trendScore: 78,
          storyCount: 10,
          imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?auto=format&q=80&w=400',
          description: 'Tropical paradise with rich culture and beaches',
          trending: true,
          category: 'Island'
        },
        {
          id: 'paris-france',
          name: 'Paris',
          country: 'France',
          trendScore: 75,
          storyCount: 15,
          imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?auto=format&q=80&w=400',
          description: 'City of Light, love, and iconic landmarks',
          trending: false,
          category: 'City'
        },
        {
          id: 'iceland',
          name: 'Iceland',
          country: 'Iceland',
          trendScore: 71,
          storyCount: 7,
          imageUrl: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&q=80&w=400',
          description: 'Land of fire and ice with natural wonders',
          trending: true,
          category: 'Nature'
        }
      ];

      setTimeout(() => {
        setDestinations(mockDestinations);
        setLoading(false);
      }, 800);
    };

    loadTrendingDestinations();
  }, [timeframe]);

  const getTrendIndicator = (score: number) => {
    if (score >= 85) return { color: 'text-red-500', icon: '🔥', label: 'Hot' };
    if (score >= 70) return { color: 'text-orange-500', icon: '📈', label: 'Rising' };
    return { color: 'text-blue-500', icon: '✨', label: 'Popular' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-red-100 text-red-800';
    if (score >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className={`trending-destinations ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="w-full h-24 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`trending-destinations ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Trending Destinations</h3>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              timeframe === 'week'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              timeframe === 'month'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {destinations.slice(0, maxItems).map((destination) => {
          const trendIndicator = getTrendIndicator(destination.trendScore);

          return (
            <Link
              key={destination.id}
              href={`/destinations/${destination.id}`}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                {/* Image */}
                {showImages && (
                  <div className="relative h-24 overflow-hidden">
                    <img
                      src={destination.imageUrl}
                      alt={destination.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {/* Trend Indicator */}
                    <div className="absolute top-2 left-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(destination.trendScore)}`}>
                        <span className="mr-1">{trendIndicator.icon}</span>
                        {destination.trendScore}
                      </div>
                    </div>

                    {/* Trending Badge */}
                    {destination.trending && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Trending
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-3">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 text-sm mb-1">
                    {destination.name}
                  </h4>

                  <p className="text-xs text-gray-600 mb-2">
                    {destination.country}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{destination.storyCount} stories</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {destination.category}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          href="/destinations/trending"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
        >
          View all trending destinations
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default TrendingDestinations;