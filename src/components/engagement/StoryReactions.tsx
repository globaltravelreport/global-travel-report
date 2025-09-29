/**
 * Story Reactions Component
 *
 * Allows users to react to stories with emoji reactions and add comments.
 * Includes real-time updates and engagement tracking.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Reaction {
  id: string;
  storyId: string;
  type: '👍' | '❤️' | '🌍' | '😮' | '😢';
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

interface StoryReactionsProps {
  storyId: string;
  initialReactions?: Reaction[];
  initialComments?: Comment[];
  className?: string;
}

const REACTION_TYPES = [
  { emoji: '👍', label: 'Helpful', color: 'text-blue-600' },
  { emoji: '❤️', label: 'Love it', color: 'text-red-600' },
  { emoji: '🌍', label: 'Wanderlust', color: 'text-green-600' },
  { emoji: '😮', label: 'Amazing', color: 'text-yellow-600' },
  { emoji: '😢', label: 'Sad', color: 'text-purple-600' }
] as const;

export function StoryReactions({
  storyId,
  initialReactions = [],
  initialComments = [],
  className = ''
}: StoryReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('user_name');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // Group reactions by type
  const reactionsByType = reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleReaction = async (type: Reaction['type']) => {
    if (!userName.trim()) {
      // Prompt for user name
      const name = prompt('Please enter your name to react:');
      if (!name?.trim()) return;

      setUserName(name.trim());
      localStorage.setItem('user_name', name.trim());
    }

    const userId = localStorage.getItem('user_id') || uuidv4();
    localStorage.setItem('user_id', userId);

    // Check if user already reacted with this type
    const existingReaction = reactions.find(
      r => r.userId === userId && r.type === type
    );

    if (existingReaction) {
      // Remove reaction
      const updatedReactions = reactions.filter(r => r.id !== existingReaction.id);
      setReactions(updatedReactions);
    } else {
      // Add new reaction
      const reaction: Reaction = {
        id: uuidv4(),
        storyId,
        type,
        userId,
        userName: userName.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedReactions = [...reactions, reaction];
      setReactions(updatedReactions);

      // Reaction handled locally
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || !userName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const userId = localStorage.getItem('user_id') || uuidv4();
    localStorage.setItem('user_id', userId);

    const comment: Comment = {
      id: uuidv4(),
      storyId,
      userId,
      userName: userName.trim(),
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      likes: 0
    };

    const updatedComments = [...comments, comment];
    setComments(updatedComments);
    setNewComment('');

    // Comment handled locally
    setIsSubmitting(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`story-reactions ${className}`}>
      {/* Reaction Buttons */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">How do you feel about this story?</span>
        <div className="flex gap-2">
          {REACTION_TYPES.map(({ emoji, label, color }) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji as Reaction['type'])}
              className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                reactionsByType[emoji]
                  ? `${color} bg-white shadow-sm`
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
              title={label}
            >
              <span className="text-lg">{emoji}</span>
              {reactionsByType[emoji] && (
                <span className="text-xs">{reactionsByType[emoji]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </button>

        {showComments && (
          <div className="space-y-4">
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || !userName.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(comment.timestamp)}
                      </span>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {comment.likes}
                    </button>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryReactions;