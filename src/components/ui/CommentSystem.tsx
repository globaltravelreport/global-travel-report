'use client';

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isLiked?: boolean;
}

interface CommentSystemProps {
  storyId: string;
  className?: string;
  maxDepth?: number;
}

export default function CommentSystem({
  storyId,
  className = '',
  maxDepth = 3
}: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  useEffect(() => {
    fetchComments();
  }, [storyId, sortBy]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/comments?storyId=${storyId}&sort=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: FormEvent, parentId?: string) => {
    e.preventDefault();

    if (!newComment.trim() || !authorName.trim() || !authorEmail.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyId,
          content: newComment.trim(),
          author: authorName.trim(),
          email: authorEmail.trim(),
          parentId,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => {
          if (parentId) {
            return prev.map(c => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), comment]
                };
              }
              return c;
            });
          }
          return [comment, ...prev];
        });

        // Reset form
        setNewComment('');
        if (!parentId) {
          setAuthorName('');
          setAuthorEmail('');
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        setComments(prev => updateCommentLikes(prev, commentId));
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const updateCommentLikes = (comments: Comment[], commentId: string): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          isLiked: !comment.isLiked,
        };
      }

      if (comment.replies) {
        return {
          ...comment,
          replies: updateCommentLikes(comment.replies, commentId),
        };
      }

      return comment;
    });
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth: number }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyAuthor, setReplyAuthor] = useState('');
    const [replyEmail, setReplyEmail] = useState('');

    const handleReplySubmit = async (e: FormEvent) => {
      e.preventDefault();

      if (!replyContent.trim() || !replyAuthor.trim() || !replyEmail.trim()) {
        return;
      }

      try {
        const response = await fetch('/api/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId,
            content: replyContent.trim(),
            author: replyAuthor.trim(),
            email: replyEmail.trim(),
            parentId: comment.id,
          }),
        });

        if (response.ok) {
          const reply = await response.json();
          setComments(prev => {
            return prev.map(c => {
              if (c.id === comment.id) {
                return {
                  ...c,
                  replies: [...(c.replies || []), reply]
                };
              }
              return c;
            });
          });

          setShowReplyForm(false);
          setReplyContent('');
          setReplyAuthor('');
          setReplyEmail('');
        }
      } catch (error) {
        console.error('Error submitting reply:', error);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`py-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}
      >
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.author.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900">{comment.author}</h4>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center space-x-4 mt-2">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center space-x-1 text-xs transition-colors ${
                  comment.isLiked
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-gray-500 hover:text-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill={comment.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{comment.likes}</span>
              </button>

              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
                >
                  Reply
                </button>
              )}
            </div>

            <AnimatePresence>
              {showReplyForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleReplySubmit}
                  className="mt-4 space-y-3"
                >
                  <div>
                    <input
                      type="text"
                      value={replyAuthor}
                      onChange={(e) => setReplyAuthor(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      value={replyEmail}
                      onChange={(e) => setReplyEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={!replyContent.trim() || !replyAuthor.trim() || !replyEmail.trim()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(false)}
                      className="px-4 py-2 text-gray-600 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'popular')}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="popular">Most Liked</option>
        </select>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <input
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="Your email"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim() || !authorName.trim() || !authorEmail.trim()}
          className="px-6 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-1 divide-y divide-gray-200">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm py-8 text-center">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} depth={0} />
          ))
        )}
      </div>
    </div>
  );
}