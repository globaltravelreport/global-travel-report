'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  slug: string;
  author: {
    name: string;
    avatar: string;
  };
}

interface RelatedStoriesProps {
  currentStoryId: string;
  currentCategory?: string;
  currentTags?: string[];
  maxStories?: number;
  className?: string;
  variant?: 'grid' | 'list' | 'carousel';
}

const sampleStories: Story[] = [
  {
    id: '1',
    title: 'The Ultimate Guide to Tokyo Street Food',
    excerpt: 'Discover the best hidden gems and local favorites in Tokyo\'s vibrant street food scene.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&q=80&w=2400',
    publishedAt: '2024-01-15',
    readTime: 8,
    category: 'Food & Dining',
    tags: ['Tokyo', 'street food', 'Japan', 'food guide'],
    slug: 'tokyo-street-food-guide',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&q=80&w=2400',
    },
  },
  {
    id: '2',
    title: 'Hidden Beaches of the Amalfi Coast',
    excerpt: 'Escape the crowds and discover secluded beaches along Italy\'s stunning coastline.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=2400',
    publishedAt: '2024-01-12',
    readTime: 6,
    category: 'Beaches',
    tags: ['Italy', 'Amalfi Coast', 'hidden gems', 'beach'],
    slug: 'hidden-beaches-amalfi-coast',
    author: {
      name: 'Marco Rossi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&q=80&w=2400',
    },
  },
  {
    id: '3',
    title: 'Budget Travel Tips for Southeast Asia',
    excerpt: 'How to travel extensively through Southeast Asia without breaking the bank.',
    imageUrl: 'https://images.unsplash.com/photo-1528184039931-a224460b8d4b?auto=format&q=80&w=2400',
    publishedAt: '2024-01-10',
    readTime: 10,
    category: 'Budget Travel',
    tags: ['Southeast Asia', 'budget travel', 'backpacking', 'tips'],
    slug: 'budget-travel-southeast-asia',
    author: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&q=80&w=2400',
    },
  },
  {
    id: '4',
    title: 'Cultural Experiences in Marrakech',
    excerpt: 'Immerse yourself in the rich culture and traditions of Morocco\'s Red City.',
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73b0e?auto=format&q=80&w=2400',
    publishedAt: '2024-01-08',
    readTime: 7,
    category: 'Culture',
    tags: ['Morocco', 'Marrakech', 'culture', 'traditions'],
    slug: 'cultural-experiences-marrakech',
    author: {
      name: 'Zahra Alami',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&q=80&w=2400',
    },
  },
  {
    id: '5',
    title: 'Hiking Patagonia: Torres del Paine',
    excerpt: 'A comprehensive guide to hiking in one of the world\'s most beautiful national parks.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&q=80&w=2400',
    publishedAt: '2024-01-05',
    readTime: 12,
    category: 'Adventure',
    tags: ['Patagonia', 'hiking', 'Chile', 'national parks'],
    slug: 'hiking-patagonia-torres-del-paine',
    author: {
      name: 'Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&q=80&w=2400',
    },
  },
];

export function RelatedStories({
  currentStoryId,
  currentCategory,
  currentTags = [],
  maxStories = 4,
  className = '',
  variant = 'grid',
}: RelatedStoriesProps) {
  const [relatedStories, setRelatedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get related stories
    const getRelatedStories = () => {
      setLoading(true);

      // Filter out current story
      const filtered = sampleStories.filter(story => story.id !== currentStoryId);
 
      // Score stories based on relevance
      const scored = filtered.map(story => {
        let score = 0;

        // Category match (high weight)
        if (currentCategory && story.category === currentCategory) {
          score += 10;
        }

        // Tag matches (medium weight)
        const matchingTags = story.tags.filter(tag =>
          currentTags.some(currentTag =>
            currentTag.toLowerCase() === tag.toLowerCase()
          )
        );
        score += matchingTags.length * 3;

        // Random factor to vary results
        score += Math.random() * 2;

        return { ...story, score };
      });

      // Sort by score and take top results
      const sorted = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, maxStories);

      setTimeout(() => {
        setRelatedStories(sorted);
        setLoading(false);
      }, 500);
    };

    getRelatedStories();
  }, [currentStoryId, currentCategory, currentTags, maxStories]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
      case 'list':
        return 'space-y-4';
      case 'carousel':
        return 'flex space-x-4 overflow-x-auto pb-4';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className={getVariantClasses()}>
          {[...Array(maxStories)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedStories.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600">No related stories found</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Related Stories</h3>
        <Link
          href="/stories"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View all stories →
        </Link>
      </div>

      <div className={getVariantClasses()}>
        {relatedStories.map((story, index) => (
          <motion.article
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group cursor-pointer ${
              variant === 'carousel' ? 'flex-shrink-0 w-80' : ''
            }`}
          >
            <Link href={`/stories/${story.slug}`}>
              <div className="relative overflow-hidden rounded-lg mb-3">
                <Image
                  src={story.imageUrl}
                  alt={story.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {story.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {story.readTime} min read
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {story.title}
              </h4>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {story.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Image
                    src={story.author.avatar}
                    alt={story.author.name}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  <span>{story.author.name}</span>
                </div>
                <span>{new Date(story.publishedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex flex-wrap gap-1 mt-2">
                {story.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

// Popular tags component
interface PopularTagsProps {
  tags: { name: string; count: number; color?: string }[];
  maxTags?: number;
  className?: string;
  onTagClick?: (tag: string) => void;
}

export function PopularTags({
  tags,
  maxTags = 20,
  className = '',
  onTagClick,
}: PopularTagsProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleTagClick = (tagName: string) => {
    setSelectedTag(selectedTag === tagName ? null : tagName);
    onTagClick?.(tagName);
  };

  const displayTags = tags.slice(0, maxTags);

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <button
            key={tag.name}
            onClick={() => handleTagClick(tag.name)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
              selectedTag === tag.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            #{tag.name}
            <span className="ml-1 opacity-75">({tag.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Comment system component
interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
  parentId?: string;
}

interface CommentSystemProps {
  storyId: string;
  initialComments?: Comment[];
  className?: string;
}

export function CommentSystem({
  storyId,
  initialComments = [],
  className = '',
}: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&q=80&w=2400',
        verified: true,
      },
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'popular':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">
          Comments ({comments.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Liked</option>
        </select>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {sortedComments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-4"
          >
            <Image
              src={comment.author.avatar}
              alt={comment.author.name}
              width={40}
              height={40}
              className="rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium">{comment.author.name}</span>
                {comment.author.verified && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Verified
                  </span>
                )}
                <span className="text-gray-500 text-sm">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{comment.content}</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{comment.likes}</span>
                </button>
                <button className="text-gray-500 hover:text-blue-500 transition-colors text-sm">
                  Reply
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}