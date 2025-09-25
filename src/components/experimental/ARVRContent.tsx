'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VRScene {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  sceneUrl: string;
  type: '360' | 'interactive' | 'guided';
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  destinations: string[];
  tags: string[];
}

interface ARContent {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  modelUrl: string;
  type: 'overlay' | 'marker' | 'location';
  supportedDevices: string[];
  destinations: string[];
  tags: string[];
}

interface ARVRContentProps {
  className?: string;
}

const sampleVRScenes: VRScene[] = [
  {
    id: '1',
    title: 'Machu Picchu Virtual Tour',
    description: 'Experience the ancient Incan citadel in stunning 360° detail',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400',
    sceneUrl: 'https://example.com/vr/machu-picchu',
    type: '360',
    duration: 15,
    difficulty: 'easy',
    destinations: ['Peru', 'Machu Picchu'],
    tags: ['historical', 'ancient', 'mountains'],
  },
  {
    id: '2',
    title: 'Great Barrier Reef Dive',
    description: 'Dive into the vibrant underwater world of the Great Barrier Reef',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    sceneUrl: 'https://example.com/vr/great-barrier-reef',
    type: 'interactive',
    duration: 20,
    difficulty: 'medium',
    destinations: ['Australia', 'Great Barrier Reef'],
    tags: ['marine', 'underwater', 'wildlife'],
  },
  {
    id: '3',
    title: 'Tokyo Street Food Tour',
    description: 'Navigate the bustling streets of Tokyo in this guided VR experience',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    sceneUrl: 'https://example.com/vr/tokyo-food',
    type: 'guided',
    duration: 25,
    difficulty: 'medium',
    destinations: ['Japan', 'Tokyo'],
    tags: ['food', 'culture', 'urban'],
  },
  {
    id: '4',
    title: 'Northern Lights Experience',
    description: 'Witness the magical Aurora Borealis from the Arctic Circle',
    thumbnailUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
    sceneUrl: 'https://example.com/vr/northern-lights',
    type: '360',
    duration: 10,
    difficulty: 'easy',
    destinations: ['Norway', 'Iceland', 'Finland'],
    tags: ['nature', 'aurora', 'arctic'],
  },
];

const sampleARContent: ARContent[] = [
  {
    id: '1',
    title: 'Ancient Rome Reconstruction',
    description: 'See the Colosseum as it looked in ancient times',
    thumbnailUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73b0e?w=400',
    modelUrl: 'https://example.com/ar/ancient-rome',
    type: 'overlay',
    supportedDevices: ['iOS 12+', 'Android 8+'],
    destinations: ['Italy', 'Rome'],
    tags: ['historical', 'reconstruction', 'ancient'],
  },
  {
    id: '2',
    title: 'Wildlife AR Guide',
    description: 'Identify animals and learn about wildlife in real-time',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=400',
    modelUrl: 'https://example.com/ar/wildlife-guide',
    type: 'marker',
    supportedDevices: ['iOS 11+', 'Android 7+'],
    destinations: ['Safari destinations', 'National Parks'],
    tags: ['wildlife', 'education', 'nature'],
  },
  {
    id: '3',
    title: 'Historical Walking Tour',
    description: 'Overlay historical information on real-world locations',
    thumbnailUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400',
    modelUrl: 'https://example.com/ar/historical-tour',
    type: 'location',
    supportedDevices: ['iOS 13+', 'Android 9+'],
    destinations: ['Historical cities', 'Cultural sites'],
    tags: ['history', 'culture', 'education'],
  },
];

export function ARVRContent({ className = '' }: ARVRContentProps) {
  const [activeTab, setActiveTab] = useState<'vr' | 'ar'>('vr');
  const [selectedScene, setSelectedScene] = useState<VRScene | null>(null);
  const [selectedAR, setSelectedAR] = useState<ARContent | null>(null);
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const vrViewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = async () => {
    // Check for VR support
    if ('xr' in navigator) {
      try {
        const xr = (navigator as any).xr;
        const supported = await xr?.isSessionSupported('immersive-vr');
        setIsVRSupported(supported || false);
      } catch (error) {
        setIsVRSupported(false);
      }
    }

    // Check for AR support (WebXR AR)
    if ('xr' in navigator) {
      try {
        const xr = (navigator as any).xr;
        const supported = await xr?.isSessionSupported('immersive-ar');
        setIsARSupported(supported || false);
      } catch (error) {
        setIsARSupported(false);
      }
    }

    // Fallback detection for mobile AR
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile && !isARSupported) {
      // Check for ARCore/ARKit support via user agent
      const hasARCore = /Android/i.test(navigator.userAgent);
      const hasARKit = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      setIsARSupported(hasARCore || hasARKit);
    }
  };

  const filteredVRScenes = sampleVRScenes.filter(scene => {
    const matchesSearch = scene.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scene.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.some(tag => scene.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const filteredARContent = sampleARContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 ||
                       selectedTags.some(tag => content.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const allTags = Array.from(new Set([
    ...sampleVRScenes.flatMap(scene => scene.tags),
    ...sampleARContent.flatMap(content => content.tags),
  ]));

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const launchVRScene = async (scene: VRScene) => {
    if (!isVRSupported) {
      alert('VR is not supported on this device. Please use a VR headset for the best experience.');
      return;
    }

    setSelectedScene(scene);

    try {
      // In a real implementation, this would launch the VR scene
      // For demo purposes, we'll show a modal
      console.log('Launching VR scene:', scene.title);
    } catch (error) {
      console.error('Error launching VR scene:', error);
    }
  };

  const launchARContent = async (content: ARContent) => {
    if (!isARSupported) {
      alert('AR is not supported on this device. Please use a compatible mobile device.');
      return;
    }

    setSelectedAR(content);

    try {
      // In a real implementation, this would launch the AR experience
      // For demo purposes, we'll show a modal
      console.log('Launching AR content:', content.title);
    } catch (error) {
      console.error('Error launching AR content:', error);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🥽</span>
            <h2 className="text-2xl font-bold">AR/VR Travel Experiences</h2>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className={`flex items-center space-x-2 ${isVRSupported ? 'text-green-600' : 'text-gray-400'}`}>
              <span>🕶️</span>
              <span>VR {isVRSupported ? 'Supported' : 'Not Supported'}</span>
            </div>
            <div className={`flex items-center space-x-2 ${isARSupported ? 'text-green-600' : 'text-gray-400'}`}>
              <span>📱</span>
              <span>AR {isARSupported ? 'Supported' : 'Not Supported'}</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search AR/VR experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('vr')}
          className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
            activeTab === 'vr'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🕶️ Virtual Reality
        </button>
        <button
          onClick={() => setActiveTab('ar')}
          className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
            activeTab === 'ar'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📱 Augmented Reality
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'vr' ? (
          <VRContentSection
            scenes={filteredVRScenes}
            onLaunchScene={launchVRScene}
            isSupported={isVRSupported}
          />
        ) : (
          <ARContentSection
            content={filteredARContent}
            onLaunchContent={launchARContent}
            isSupported={isARSupported}
          />
        )}
      </div>

      {/* VR Scene Viewer Modal */}
      <AnimatePresence>
        {selectedScene && (
          <VRSceneModal
            scene={selectedScene}
            onClose={() => setSelectedScene(null)}
          />
        )}
      </AnimatePresence>

      {/* AR Content Viewer Modal */}
      <AnimatePresence>
        {selectedAR && (
          <ARContentModal
            content={selectedAR}
            onClose={() => setSelectedAR(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface VRContentSectionProps {
  scenes: VRScene[];
  onLaunchScene: (scene: VRScene) => void;
  isSupported: boolean;
}

function VRContentSection({ scenes, onLaunchScene, isSupported }: VRContentSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Virtual Reality Experiences</h3>
        <p className="text-gray-600 text-sm">
          Immerse yourself in destinations around the world with our VR experiences.
          {isSupported ? ' Your device supports VR!' : ' VR requires a compatible headset.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenes.map(scene => (
          <VRSceneCard
            key={scene.id}
            scene={scene}
            onLaunch={() => onLaunchScene(scene)}
            isSupported={isSupported}
          />
        ))}
      </div>

      {scenes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">🕶️</span>
          <p>No VR experiences match your search criteria.</p>
        </div>
      )}
    </div>
  );
}

interface ARContentSectionProps {
  content: ARContent[];
  onLaunchContent: (content: ARContent) => void;
  isSupported: boolean;
}

function ARContentSection({ content, onLaunchContent, isSupported }: ARContentSectionProps) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Augmented Reality Experiences</h3>
        <p className="text-gray-600 text-sm">
          Enhance your real-world travels with interactive AR content.
          {isSupported ? ' Your device supports AR!' : ' AR works best on mobile devices.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map(item => (
          <ARContentCard
            key={item.id}
            content={item}
            onLaunch={() => onLaunchContent(item)}
            isSupported={isSupported}
          />
        ))}
      </div>

      {content.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">📱</span>
          <p>No AR content matches your search criteria.</p>
        </div>
      )}
    </div>
  );
}

interface VRSceneCardProps {
  scene: VRScene;
  onLaunch: () => void;
  isSupported: boolean;
}

function VRSceneCard({ scene, onLaunch, isSupported }: VRSceneCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gray-50 rounded-lg overflow-hidden border hover:shadow-md transition-all"
    >
      <div className="relative h-48">
        <img
          src={scene.thumbnailUrl}
          alt={scene.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {scene.type === '360' ? '360°' : scene.type === 'interactive' ? 'Interactive' : 'Guided'}
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            scene.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            scene.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {scene.difficulty}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-semibold mb-2">{scene.title}</h4>
        <p className="text-sm text-gray-600 mb-3">{scene.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>⏱️ {scene.duration} min</span>
          <span>📍 {scene.destinations.join(', ')}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {scene.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>

        <button
          onClick={onLaunch}
          disabled={!isSupported}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isSupported
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSupported ? 'Launch VR Experience' : 'VR Not Supported'}
        </button>
      </div>
    </motion.div>
  );
}

interface ARContentCardProps {
  content: ARContent;
  onLaunch: () => void;
  isSupported: boolean;
}

function ARContentCard({ content, onLaunch, isSupported }: ARContentCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-gray-50 rounded-lg overflow-hidden border hover:shadow-md transition-all"
    >
      <div className="relative h-48">
        <img
          src={content.thumbnailUrl}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {content.type === 'overlay' ? 'Overlay' : content.type === 'marker' ? 'Marker' : 'Location'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-semibold mb-2">{content.title}</h4>
        <p className="text-sm text-gray-600 mb-3">{content.description}</p>

        <div className="text-sm text-gray-500 mb-3">
          <span className="font-medium">Supported Devices:</span> {content.supportedDevices.join(', ')}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {content.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>

        <button
          onClick={onLaunch}
          disabled={!isSupported}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isSupported
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSupported ? 'Launch AR Experience' : 'AR Not Supported'}
        </button>
      </div>
    </motion.div>
  );
}

interface VRSceneModalProps {
  scene: VRScene;
  onClose: () => void;
}

function VRSceneModal({ scene, onClose }: VRSceneModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-96 md:h-[500px]">
          <img
            src={scene.thumbnailUrl}
            alt={scene.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-2xl font-bold mb-2">{scene.title}</h3>
            <p className="text-lg opacity-90">{scene.description}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Experience Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span>{scene.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="capitalize">{scene.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{scene.type}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Destinations</h4>
              <div className="flex flex-wrap gap-2">
                {scene.destinations.map(dest => (
                  <span key={dest} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {dest}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {scene.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start VR Experience
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface ARContentModalProps {
  content: ARContent;
  onClose: () => void;
}

function ARContentModal({ content, onClose }: ARContentModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-96 md:h-[500px]">
          <img
            src={content.thumbnailUrl}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-2xl font-bold mb-2">{content.title}</h3>
            <p className="text-lg opacity-90">{content.description}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">AR Experience Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{content.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Supported Devices:</span>
                  <span>{content.supportedDevices.join(', ')}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Destinations</h4>
              <div className="flex flex-wrap gap-2">
                {content.destinations.map(dest => (
                  <span key={dest} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                    {dest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {content.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-pink-100 text-pink-800 rounded text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Start AR Experience
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}