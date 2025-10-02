'use client';

import React from 'react';

/**
 * 360Viewer (placeholder)
 *
 * Non-functional scaffold for future integration of a 360° image/video viewer.
 * - Accessible container with clear ARIA labeling
 * - Props allow swapping providers later (e.g., PhotoSphere, React 360, Spline)
 * - Displays a poster image and a call-to-action overlay
 */
export interface ViewerSource {
  type: 'image' | 'video' | 'embed';
  src: string;           // URL to equirectangular image, 360 video, or embed URL
  poster?: string;       // Optional poster/thumbnail
  title?: string;        // Display title
  credit?: string;       // Attribution/credit text
  provider?: 'generic' | 'react-360' | 'photosphere' | 'spline';
}

export interface ViewerHotspot {
  id: string;
  label: string;
  description?: string;
  yaw?: number;   // for future orientation targeting
  pitch?: number; // for future orientation targeting
  href?: string;  // optional link for hotspot
}

export interface ViewerProps {
  source: ViewerSource;
  hotspots?: ViewerHotspot[];
  className?: string;
  style?: React.CSSProperties;
  onOpen?: () => void;    // called when user clicks "Open 360 Viewer"
  onClose?: () => void;   // for future modal usage
}

export default function Viewer360Placeholder({
  source,
  hotspots = [],
  className = '',
  style,
  onOpen,
}: ViewerProps) {
  const { poster, title = '360° Viewer', credit } = source;

  return (
    <div
      className={['relative rounded-lg border bg-white overflow-hidden', className].join(' ')}
      style={style}
      role="region"
      aria-label="360 degree viewer placeholder"
    >
      {/* Poster / Placeholder */}
      <div className="relative">
        <div
          className="w-full aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
          aria-hidden={!poster}
        >
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <svg width="80" height="80" viewBox="0 0 24 24" className="text-gray-500">
              <path fill="currentColor" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2Zm1 17.93V19a1 1 0 10-2 0v.93A8.016 8.016 0 014.07 13H5a1 1 0 100-2h-.93A8.016 8.016 0 0111 4.07V5a1 1 0 102 0v-.93A8.016 8.016 0 0119.93 11H19a1 1 0 100 2h.93A8.016 8.016 0 0113 19.93ZM12 8a4 4 0 104 4a4 4 0 00-4-4Z"/>
            </svg>
          )}

          {/* Overlay CTA */}
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center p-4">
            <div className="text-center text-white">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M12 3c-5 0-9 2.24-9 5v8c0 2.76 4 5 9 5s9-2.24 9-5V8c0-2.76-4-5-9-5Zm7 13c0 1.65-3.58 3-7 3s-7-1.35-7-3v-1.12c1.66 1.07 4.31 1.62 7 1.62s5.34-.55 7-1.62Zm0-4c0 1.65-3.58 3-7 3s-7-1.35-7-3V8c0-1.65 3.58-3 7-3s7 1.35 7 3Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm opacity-90 mb-3">Interactive 360° experience (coming soon)</p>
              <button
                type="button"
                onClick={onOpen}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                aria-label="Open 360 degree viewer"
              >
                Open 360 Viewer
              </button>

              {hotspots.length > 0 && (
                <p className="text-xs opacity-80 mt-3">
                  {hotspots.length} hotspot{hotspots.length > 1 ? 's' : ''} available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Credit */}
      <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-600">
        <span>Provider: {source.provider ?? 'generic'}</span>
        {credit && <span className="italic">Credit: {credit}</span>}
      </div>
    </div>
  );
}