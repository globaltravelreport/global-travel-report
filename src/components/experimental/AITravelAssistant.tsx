'use client';

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface TravelSuggestion {
  type: 'destination' | 'activity' | 'tip' | 'booking';
  title: string;
  description: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
}

interface AITravelAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: string;
  userPreferences?: {
    budget: 'low' | 'medium' | 'high';
    travelStyle: 'adventure' | 'relaxed' | 'cultural' | 'family';
    interests: string[];
  };
}

export function useAITravelAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Travel Assistant. I can help you discover amazing destinations, plan trips, find activities, and get personalized travel recommendations. What would you like to explore today?',
      timestamp: new Date(),
      suggestions: [
        'Best destinations for 2024',
        'Budget travel tips',
        'Hidden gems in Europe',
        'Family-friendly activities',
      ],
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [_currentLocation, setCurrentLocation] = useState('Unknown');

  const sendMessage = async (content: string): Promise<void> => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const assistantResponse = await generateAIResponse(content);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: assistantResponse.content,
      timestamp: new Date(),
      suggestions: assistantResponse.suggestions,
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const generateAIResponse = async (userInput: string): Promise<{
    content: string;
    suggestions?: string[];
  }> => {
    const input = userInput.toLowerCase();

    // Simple keyword-based responses
    if (input.includes('beach') || input.includes('sea') || input.includes('ocean')) {
      return {
        content: 'I love beach destinations! Here are some amazing options:\n\n🏖️ **Bali, Indonesia** - Stunning beaches, vibrant culture, and incredible food\n🏝️ **Maldives** - Overwater bungalows and crystal-clear waters\n🌊 **Costa Rica** - Beautiful Pacific beaches with adventure activities\n\nWhat type of beach experience are you looking for? Relaxed luxury or adventurous surfing?',
        suggestions: ['Beach resorts under $200/night', 'Best surfing destinations', 'Family beach vacations', 'Romantic beach getaways'],
      };
    }

    if (input.includes('mountain') || input.includes('hiking') || input.includes('adventure')) {
      return {
        content: 'Adventure awaits! Here are some thrilling mountain destinations:\n\n⛰️ **Swiss Alps** - World-class hiking, skiing, and breathtaking scenery\n🏔️ **Patagonia** - Untamed wilderness and epic trekking routes\n🗻 **Nepal** - Home to Mount Everest and incredible Himalayan treks\n\nAre you interested in guided tours or self-guided adventures?',
        suggestions: ['Best hiking trails for beginners', 'Mountain climbing courses', 'Adventure travel insurance', 'Eco-friendly trekking'],
      };
    }

    if (input.includes('city') || input.includes('culture') || input.includes('history')) {
      return {
        content: 'Cultural immersion is my specialty! Consider these incredible cities:\n\n🏛️ **Rome, Italy** - Ancient history, world-class museums, and amazing food\n🎨 **Paris, France** - Art, fashion, and romantic atmosphere\n🏯 **Kyoto, Japan** - Traditional temples, beautiful gardens, and tea ceremonies\n\nWhat aspects of culture interest you most? History, art, food, or local traditions?',
        suggestions: ['Cultural tours and experiences', 'Food and wine destinations', 'Historical sites to visit', 'Local customs and etiquette'],
      };
    }

    if (input.includes('budget') || input.includes('cheap') || input.includes('affordable')) {
      return {
        content: 'Budget travel is smart travel! Here are some amazing affordable destinations:\n\n💰 **Thailand** - Beautiful beaches, delicious food, budget-friendly accommodations\n🇻🇳 **Vietnam** - Rich culture, stunning landscapes, very affordable\n🇲🇽 **Mexico** - Diverse experiences from beaches to ancient ruins\n\nWhat\'s your approximate budget per day? I can provide more specific recommendations!',
        suggestions: ['Destinations under $50/day', 'Budget accommodation tips', 'Cheap eats around the world', 'Money-saving travel hacks'],
      };
    }

    if (input.includes('family') || input.includes('kids') || input.includes('children')) {
      return {
        content: 'Family travel is wonderful! Here are some family-friendly destinations:\n\n👨‍👩‍👧‍👦 **Orlando, USA** - Theme parks, family entertainment, and endless fun\n🏰 **London, UK** - Interactive museums, parks, and child-friendly attractions\n🦁 **South Africa** - Safari adventures and wildlife experiences\n\nWhat ages are your children? I can tailor recommendations to their interests and energy levels!',
        suggestions: ['Family resorts with kids clubs', 'Educational travel for children', 'Safe destinations for families', 'Family travel packing tips'],
      };
    }

    // Default response
    return {
      content: 'I\'d love to help you plan your perfect trip! Could you tell me more about:\n\n• What type of destination interests you? (beach, mountain, city, adventure)\n• Your budget range?\n• Travel dates and duration?\n• Who you\'re traveling with?\n• Any specific interests or preferences?\n\nThe more details you share, the better recommendations I can provide!',
      suggestions: ['Popular destinations', 'Travel deals', 'Trip planning checklist', 'Travel insurance options'],
    };
  };

  const getLocationBasedSuggestions = async (location: string): Promise<TravelSuggestion[]> => {
    // Simulate location-based suggestions
    const suggestions: TravelSuggestion[] = [
      {
        type: 'destination',
        title: 'Local Hidden Gems',
        description: 'Discover amazing places near you that most tourists miss',
        actionText: 'Explore Nearby',
      },
      {
        type: 'activity',
        title: 'Weekend Getaways',
        description: 'Perfect short trips for recharging and exploring',
        actionText: 'View Options',
      },
      {
        type: 'tip',
        title: 'Local Events This Month',
        description: 'Festivals, markets, and cultural events happening nearby',
        actionText: 'See Events',
      },
    ];

    return suggestions;
  };

  const getPersonalizedRecommendations = async (_preferences: any): Promise<TravelSuggestion[]> => {
    const recommendations: TravelSuggestion[] = [
      {
        type: 'destination',
        title: 'Curated Just for You',
        description: 'Destinations that match your travel style and budget',
        actionText: 'View Recommendations',
      },
      {
        type: 'booking',
        title: 'Exclusive Deals',
        description: 'Special offers tailored to your preferences',
        actionText: 'See Deals',
      },
    ];

    return recommendations;
  };

  return {
    messages,
    isTyping,
    currentLocation: _currentLocation,
    sendMessage,
    getLocationBasedSuggestions,
    getPersonalizedRecommendations,
  };
}

export function AITravelAssistant({
  isOpen,
  onClose,
  userLocation = 'Unknown',
  userPreferences,
}: AITravelAssistantProps) {
  const {
    messages,
    isTyping,
    sendMessage,
    getLocationBasedSuggestions,
    getPersonalizedRecommendations,
  } = useAITravelAssistant();

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TravelSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && userLocation !== 'Unknown') {
      getLocationBasedSuggestions(userLocation).then(setSuggestions);
    }
  }, [isOpen, userLocation, getLocationBasedSuggestions]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    await sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        className="bg-white rounded-lg shadow-2xl border w-96 h-[600px] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">AI Travel Assistant</h3>
                <p className="text-sm opacity-90">Online</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages[messages.length - 1]?.suggestions && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {messages[messages.length - 1]?.suggestions?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about travel..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </motion.div>

      {/* Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border p-4 w-80"
        >
          <h4 className="font-medium mb-3">Personalized Suggestions</h4>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                <h5 className="font-medium text-sm">{suggestion.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                {suggestion.actionText && (
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                    {suggestion.actionText}
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Floating Action Button to open the assistant
interface AITravelButtonProps {
  onClick: () => void;
  className?: string;
}

export function AITravelButton({ onClick, className = '' }: AITravelButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${className}`}
      aria-label="Open AI Travel Assistant"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  );
}