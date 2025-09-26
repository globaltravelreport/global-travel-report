'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SustainabilityCriteria {
  carbonFootprint: 'low' | 'medium' | 'high' | 'any';
  ecoCertifications: boolean;
  localCommunity: boolean;
  wildlifeProtection: boolean;
  wasteReduction: boolean;
  renewableEnergy: boolean;
  sustainableTransport: boolean;
  culturalPreservation: boolean;
}

interface SustainabilityLabel {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: Partial<SustainabilityCriteria>;
}

interface TravelOption {
  id: string;
  title: string;
  type: 'destination' | 'activity' | 'accommodation' | 'transport';
  location: string;
  sustainabilityScore: number;
  labels: string[];
  carbonFootprint: number; // kg CO2 per person
  description: string;
  price: number;
  imageUrl?: string;
}

interface SustainabilityFiltersProps {
  onFiltersChange: (filters: SustainabilityCriteria) => void;
  onSortChange: (sortBy: string) => void;
  travelOptions: TravelOption[];
  className?: string;
}

const sustainabilityLabels: SustainabilityLabel[] = [
  {
    id: 'carbon-neutral',
    name: 'Carbon Neutral',
    description: 'This option offsets 100% of its carbon emissions',
    icon: '🌱',
    color: 'green',
    criteria: { carbonFootprint: 'low' },
  },
  {
    id: 'eco-certified',
    name: 'Eco-Certified',
    description: 'Certified by recognized environmental organizations',
    icon: '🏆',
    color: 'blue',
    criteria: { ecoCertifications: true },
  },
  {
    id: 'community-focused',
    name: 'Community Focused',
    description: 'Supports local communities and economies',
    icon: '🤝',
    color: 'purple',
    criteria: { localCommunity: true },
  },
  {
    id: 'wildlife-friendly',
    name: 'Wildlife Friendly',
    description: 'Protects and respects local wildlife',
    icon: '🦋',
    color: 'teal',
    criteria: { wildlifeProtection: true },
  },
  {
    id: 'zero-waste',
    name: 'Zero Waste',
    description: 'Minimizes waste and promotes recycling',
    icon: '♻️',
    color: 'orange',
    criteria: { wasteReduction: true },
  },
  {
    id: 'renewable-energy',
    name: 'Renewable Energy',
    description: 'Powered by renewable energy sources',
    icon: '⚡',
    color: 'yellow',
    criteria: { renewableEnergy: true },
  },
  {
    id: 'sustainable-transport',
    name: 'Sustainable Transport',
    description: 'Uses low-emission transportation methods',
    icon: '🚲',
    color: 'indigo',
    criteria: { sustainableTransport: true },
  },
  {
    id: 'cultural-heritage',
    name: 'Cultural Heritage',
    description: 'Preserves and promotes cultural traditions',
    icon: '🏛️',
    color: 'pink',
    criteria: { culturalPreservation: true },
  },
];

export function SustainabilityFilters({
  onFiltersChange,
  onSortChange,
  travelOptions,
  className = '',
}: SustainabilityFiltersProps) {
  const [filters, setFilters] = useState<SustainabilityCriteria>({
    carbonFootprint: 'any',
    ecoCertifications: false,
    localCommunity: false,
    wildlifeProtection: false,
    wasteReduction: false,
    renewableEnergy: false,
    sustainableTransport: false,
    culturalPreservation: false,
  });

  const [sortBy, setSortBy] = useState('sustainability');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const handleFilterChange = (key: keyof SustainabilityCriteria, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    onSortChange(newSortBy);
  };

  const handleLabelToggle = (labelId: string) => {
    const newSelectedLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];

    setSelectedLabels(newSelectedLabels);

    // Update filters based on selected labels
    const newFilters = { ...filters };
    sustainabilityLabels.forEach(label => {
      if (newSelectedLabels.includes(label.id)) {
        Object.entries(label.criteria).forEach(([key, value]) => {
          if (value === true) {
            (newFilters as any)[key] = true;
          }
        });
      }
    });
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      carbonFootprint: 'any' as const,
      ecoCertifications: false,
      localCommunity: false,
      wildlifeProtection: false,
      wasteReduction: false,
      renewableEnergy: false,
      sustainableTransport: false,
      culturalPreservation: false,
    };
    setFilters(clearedFilters);
    setSelectedLabels([]);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'carbonFootprint') return value !== 'any';
      return value === true;
    }).length;
  };

  const getFilteredOptionsCount = () => {
    return travelOptions.filter(option => {
      if (filters.carbonFootprint !== 'any') {
        const maxCarbon = filters.carbonFootprint === 'low' ? 50 :
                         filters.carbonFootprint === 'medium' ? 150 : 300;
        if (option.carbonFootprint > maxCarbon) return false;
      }

      if (filters.ecoCertifications && !option.labels.includes('eco-certified')) return false;
      if (filters.localCommunity && !option.labels.includes('community-focused')) return false;
      if (filters.wildlifeProtection && !option.labels.includes('wildlife-friendly')) return false;
      if (filters.wasteReduction && !option.labels.includes('zero-waste')) return false;
      if (filters.renewableEnergy && !option.labels.includes('renewable-energy')) return false;
      if (filters.sustainableTransport && !option.labels.includes('sustainable-transport')) return false;
      if (filters.culturalPreservation && !option.labels.includes('cultural-heritage')) return false;

      return true;
    }).length;
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌍</span>
          <h3 className="text-lg font-semibold">Sustainability Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Quick Filters</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleFilterChange('carbonFootprint', 'low')}
            className={`p-3 rounded-lg border text-sm transition-colors ${
              filters.carbonFootprint === 'low'
                ? 'bg-green-100 border-green-300 text-green-800'
                : 'hover:bg-gray-50'
            }`}
          >
            🌱 Low Carbon
          </button>
          <button
            onClick={() => handleFilterChange('carbonFootprint', 'medium')}
            className={`p-3 rounded-lg border text-sm transition-colors ${
              filters.carbonFootprint === 'medium'
                ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                : 'hover:bg-gray-50'
            }`}
          >
            ⚡ Medium Carbon
          </button>
          <button
            onClick={() => handleFilterChange('carbonFootprint', 'high')}
            className={`p-3 rounded-lg border text-sm transition-colors ${
              filters.carbonFootprint === 'high'
                ? 'bg-red-100 border-red-300 text-red-800'
                : 'hover:bg-gray-50'
            }`}
          >
            🔥 High Carbon
          </button>
          <button
            onClick={() => handleFilterChange('carbonFootprint', 'any')}
            className={`p-3 rounded-lg border text-sm transition-colors ${
              filters.carbonFootprint === 'any'
                ? 'bg-blue-100 border-blue-300 text-blue-800'
                : 'hover:bg-gray-50'
            }`}
          >
            🌍 Any Carbon
          </button>
        </div>
      </div>

      {/* Sustainability Labels */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Sustainability Labels</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {sustainabilityLabels.map((label) => (
            <button
              key={label.id}
              onClick={() => handleLabelToggle(label.id)}
              className={`p-2 rounded-lg border text-xs transition-colors flex items-center space-x-2 ${
                selectedLabels.includes(label.id)
                  ? 'bg-gray-100 border-gray-300'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span>{label.icon}</span>
              <span>{label.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <h4 className="font-medium mb-3">Advanced Criteria</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'ecoCertifications', label: 'Eco-Certified', icon: '🏆' },
                { key: 'localCommunity', label: 'Supports Local Community', icon: '🤝' },
                { key: 'wildlifeProtection', label: 'Wildlife Protection', icon: '🦋' },
                { key: 'wasteReduction', label: 'Waste Reduction', icon: '♻️' },
                { key: 'renewableEnergy', label: 'Renewable Energy', icon: '⚡' },
                { key: 'sustainableTransport', label: 'Sustainable Transport', icon: '🚲' },
                { key: 'culturalPreservation', label: 'Cultural Preservation', icon: '🏛️' },
              ].map(({ key, label, icon }) => (
                <label key={key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters[key as keyof SustainabilityCriteria] as boolean}
                    onChange={(e) => handleFilterChange(key as keyof SustainabilityCriteria, e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm">{icon} {label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sort Options */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Sort By</h4>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="sustainability">Sustainability Score</option>
          <option value="carbon-low">Lowest Carbon Footprint</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">User Rating</option>
        </select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>
          Showing {getFilteredOptionsCount()} of {travelOptions.length} options
        </span>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Carbon Footprint Legend */}
      <div className="text-xs text-gray-500">
        <p className="mb-1">🌱 Low Carbon: {'<'}50kg CO₂ per person</p>
        <p className="mb-1">⚡ Medium Carbon: 50-150kg CO₂ per person</p>
        <p>🔥 High Carbon: {'>'}150kg CO₂ per person</p>
      </div>
    </div>
  );
}

// Travel Option Card with Sustainability Labels
interface TravelOptionCardProps {
  option: TravelOption;
  onSelect?: (option: TravelOption) => void;
  className?: string;
}

export function TravelOptionCard({ option, onSelect, className = '' }: TravelOptionCardProps) {
  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getCarbonLabel = (carbon: number) => {
    if (carbon < 50) return { label: 'Low Carbon', color: 'green' };
    if (carbon < 150) return { label: 'Medium Carbon', color: 'yellow' };
    return { label: 'High Carbon', color: 'red' };
  };

  const carbonInfo = getCarbonLabel(option.carbonFootprint);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-white rounded-lg shadow-md border overflow-hidden cursor-pointer transition-all ${className}`}
      onClick={() => onSelect?.(option)}
    >
      {option.imageUrl && (
        <div className="relative h-48 bg-gray-200">
          <img
            src={option.imageUrl}
            alt={option.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${getSustainabilityColor(option.sustainabilityScore)}-100 text-${getSustainabilityColor(option.sustainabilityScore)}-800`}>
              {option.sustainabilityScore}% Sustainable
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{option.title}</h3>
          <div className={`px-2 py-1 rounded text-xs font-medium bg-${carbonInfo.color}-100 text-${carbonInfo.color}-800`}>
            {carbonInfo.label}
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3">{option.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">{option.location}</span>
          <span className="font-semibold text-green-600">${option.price}</span>
        </div>

        {/* Sustainability Labels */}
        <div className="flex flex-wrap gap-1 mb-3">
          {option.labels.map((labelId) => {
            const label = sustainabilityLabels.find(l => l.id === labelId);
            return label ? (
              <span
                key={labelId}
                className={`px-2 py-1 rounded-full text-xs bg-${label.color}-100 text-${label.color}-800`}
                title={label.description}
              >
                {label.icon} {label.name}
              </span>
            ) : null;
          })}
        </div>

        {/* Carbon Footprint Info */}
        <div className="text-xs text-gray-500">
          Carbon footprint: {option.carbonFootprint}kg CO₂ per person
        </div>
      </div>
    </motion.div>
  );
}

// Carbon Footprint Calculator
interface CarbonCalculatorProps {
  travelType: 'flight' | 'train' | 'car' | 'bus';
  distance: number; // in km
  passengers: number;
  className?: string;
}

export function CarbonCalculator({
  travelType,
  distance,
  passengers,
  className = '',
}: CarbonCalculatorProps) {
  const [result, setResult] = useState<{
    totalCarbon: number;
    perPersonCarbon: number;
    comparison: string;
  } | null>(null);

  useEffect(() => {
    calculateCarbon();
  }, [travelType, distance, passengers]);

  const calculateCarbon = () => {
    const emissionFactors = {
      flight: 0.25, // kg CO2 per passenger km
      train: 0.04,  // kg CO2 per passenger km
      car: 0.17,    // kg CO2 per passenger km (assuming average car)
      bus: 0.08,    // kg CO2 per passenger km
    };

    const factor = emissionFactors[travelType];
    const totalCarbon = distance * factor;
    const perPersonCarbon = totalCarbon / passengers;

    const comparison = getComparisonText(perPersonCarbon);

    setResult({
      totalCarbon: Math.round(totalCarbon * 100) / 100,
      perPersonCarbon: Math.round(perPersonCarbon * 100) / 100,
      comparison,
    });
  };

  const getComparisonText = (carbon: number) => {
    if (carbon < 10) return 'Excellent! This is very low carbon travel.';
    if (carbon < 50) return 'Good carbon footprint for this distance.';
    if (carbon < 100) return 'Moderate carbon footprint - consider alternatives.';
    return 'High carbon footprint - consider lower-emission alternatives.';
  };

  if (!result) return null;

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h4 className="font-medium mb-3">Carbon Footprint Calculator</h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Total CO₂ emissions:</span>
          <span className="font-medium">{result.totalCarbon} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Per person CO₂:</span>
          <span className="font-medium">{result.perPersonCarbon} kg</span>
        </div>
        <div className="flex justify-between">
          <span>Equivalent to:</span>
          <span className="font-medium">{result.comparison}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-gray-600">
          💡 Tip: Consider carbon offset programs to neutralize your travel emissions.
        </p>
      </div>
    </div>
  );
}