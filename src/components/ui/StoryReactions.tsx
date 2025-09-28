'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ThumbsUp, Globe, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';

interface ReactionType {
  emoji: string;
  label: string;
  color: string;
}

interface StoryReactionsProps {
  storyId: string;
  initialReactions?: {
    likes: number;
    loves: number;
    explores: number;
    comments: number;
    shares: number;
  };
  onReaction?: (type: string) => void;
  onComment?: () => void;
  onShare?: () => void;
  className?: string;
  compact?: boolean;
}

const reactionTypes: ReactionType[] = [
  { emoji: '👍', label: 'Like', color: 'text-blue-600' },
  { emoji: '❤️', label: 'Love', color: 'text-red-600' },
  { emoji: '🌍', label: 'Explore', color: 'text-green-600' },
];

export function StoryReactions({
  storyId,
  initialReactions = {
    likes: 0,
    loves: 0,
    explores: 0,
    comments: 0,
    shares: 0
  },
  onReaction,
  onComment,
  onShare,
  className,
  compact = false
}: StoryReactionsProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [showAllReactions, setShowAllReactions] = useState(false);

  const handleReaction = (type: string) => {
    const newUserReactions = new Set(userReactions);

    if (newUserReactions.has(type)) {
      newUserReactions.delete(type);
      // Decrease count
      setReactions(prev => ({
        ...prev,
        [type]: Math.max(0, prev[type as keyof typeof prev] - 1)
      }));
    } else {
      newUserReactions.add(type);
      // Increase count
      setReactions(prev => ({
        ...prev,
        [type]: prev[type as keyof typeof prev] + 1
      }));
    }

    setUserReactions(newUserReactions);
    onReaction?.(type);
  };

  const totalReactions = reactions.likes + reactions.loves + reactions.explores;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-4", className)}>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('likes')}
            className={cn(
              "flex items-center gap-1",
              userReactions.has('likes') && "text-blue-600"
            )}
          >
            <ThumbsUp size={16} />
            <span className="text-sm">{reactions.likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReaction('loves')}
            className={cn(
              "flex items-center gap-1",
              userReactions.has('loves') && "text-red-600"
            )}
          >
            <Heart size={16} />
            <span className="text-sm">{reactions.loves}</span>
          </Button>
        </div>

        <Button variant="ghost" size="sm" onClick={onComment}>
          <MessageCircle size={16} className="mr-1" />
          <span className="text-sm">{reactions.comments}</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={onShare}>
          <Share2 size={16} className="mr-1" />
          <span className="text-sm">{reactions.shares}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Reaction Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {totalReactions > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1">
                {reactionTypes.map((type) => {
                  const count = reactions[type.label.toLowerCase() as keyof typeof reactions];
                  if (count === 0) return null;

                  return (
                    <div
                      key={type.label}
                      className="w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-xs"
                    >
                      {type.emoji}
                    </div>
                  );
                })}
              </div>
              <span className="text-sm text-gray-600">
                {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{reactions.comments} comments</span>
            <span>{reactions.shares} shares</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllReactions(!showAllReactions)}
        >
          {showAllReactions ? 'Hide' : 'Show'} reactions
        </Button>
      </div>

      {/* Detailed Reactions */}
      <AnimatePresence>
        {showAllReactions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex flex-wrap gap-2">
              {reactionTypes.map((type) => {
                const count = reactions[type.label.toLowerCase() as keyof typeof reactions];
                const isSelected = userReactions.has(type.label.toLowerCase());

                return (
                  <Button
                    key={type.label}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleReaction(type.label.toLowerCase())}
                    className={cn(
                      "flex items-center gap-2",
                      isSelected && type.color
                    )}
                  >
                    <span>{type.emoji}</span>
                    <span>{type.label}</span>
                    <span className="bg-black/10 rounded-full px-2 py-1 text-xs">
                      {count}
                    </span>
                  </Button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onComment}>
                <MessageCircle size={16} className="mr-2" />
                Comment
              </Button>

              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}