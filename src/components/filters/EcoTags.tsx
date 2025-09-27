'use client';

import React from 'react';

export type EcoTag =
  | 'eco-friendly'
  | 'sustainable'
  | 'carbon-neutral'
  | 'wildlife-safe'
  | 'plastic-free'
  | 'local-community'
  | 'renewable-energy'
  | 'low-impact';

export interface EcoTagsProps {
  value?: EcoTag[];
  onChange?: (next: EcoTag[]) => void;
  className?: string;
  variant?: 'badges' | 'checkboxes';
  heading?: string;
  disabled?: boolean;
}

/**
 * EcoTags scaffold component
 * - Reusable tag system for "Eco-Friendly" / "Sustainable" filters
 * - Emits selected tags via onChange
 * - Intended to integrate with Search/Stories listing via query params or context
 */
export default function EcoTags({
  value = [],
  onChange,
  className = '',
  variant = 'badges',
  heading = 'Eco-friendly filters',
  disabled = false,
}: EcoTagsProps) {
  const TAGS: { key: EcoTag; label: string; description?: string }[] = [
    { key: 'eco-friendly', label: 'Eco-friendly' },
    { key: 'sustainable', label: 'Sustainable' },
    { key: 'carbon-neutral', label: 'Carbon neutral' },
    { key: 'wildlife-safe', label: 'Wildlife-safe' },
    { key: 'plastic-free', label: 'Plastic-free' },
    { key: 'local-community', label: 'Local community' },
    { key: 'renewable-energy', label: 'Renewable energy' },
    { key: 'low-impact', label: 'Low impact' },
  ];

  const toggle = (tag: EcoTag) => {
    if (disabled) return;
    const exists = value.includes(tag);
    const next = exists ? value.filter(t => t !== tag) : [...value, tag];
    onChange?.(next);
  };

  if (variant === 'checkboxes') {
    return (
      <fieldset className={className} aria-labelledby="eco-tags-legend" aria-disabled={disabled}>
        <legend id="eco-tags-legend" className="mb-2 font-medium">
          {heading}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TAGS.map(t => (
            <label
              key={t.key}
              className={`flex items-start gap-2 rounded border p-3 text-sm ${disabled ? 'opacity-50' : 'hover:bg-gray-50'}`}
            >
              <input
                type="checkbox"
                className="mt-0.5"
                checked={value.includes(t.key)}
                onChange={() => toggle(t.key)}
                disabled={disabled}
                aria-label={t.label}
              />
              <span>
                <span className="font-medium">{t.label}</span>
                {t.description ? <span className="ml-1 text-gray-500">— {t.description}</span> : null}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  // badges
  return (
    <div className={className} aria-label={heading} aria-disabled={disabled}>
      <div className="mb-2 font-medium">{heading}</div>
      <div className="flex flex-wrap gap-2">
        {TAGS.map(t => {
          const active = value.includes(t.key);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => toggle(t.key)}
              disabled={disabled}
              aria-pressed={active}
              aria-label={t.label}
              className={[
                'px-3 py-1 rounded-full text-sm border transition-colors',
                active
                  ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                disabled ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
              title={t.description || t.label}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}