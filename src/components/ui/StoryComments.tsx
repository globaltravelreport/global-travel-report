'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, ThumbsDown, Reply, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  replies?: Comment[];
  parentId?: string;
}

interface StoryCommentsProps {
  storyId: string;
  initialComments?: Comment[];
  className?: string;
}

export function StoryComments({
  storyId,
  initialComments = [],
  className = ''
}: StoryCommentsProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      author: {
        name: 'Anonymous User', // In production, get from auth
        verified: false
      },
      content: newComment.trim(),
      timestamp: new Date(),
      likes: 0,
      dislikes: 0
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleReply = (commentId: string) => {
    if (!replyContent.trim()) return;

    const reply: Comment = {
      id: `reply_${Date.now()}`,
      author: {
        name: 'Anonymous User',
        verified: false
      },
      content: replyContent.trim(),
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      parentId: commentId
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleReaction = (commentId: string, type: 'like' | 'dislike') => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: type === 'like' ? comment.likes + 1 : comment.likes,
          dislikes: type === 'dislike' ? comment.dislikes + 1 : comment.dislikes
        };
      }
      return comment;
    }));
  };

  const sortedComments = [...comments]
    .filter(comment => !comment.parentId) // Only top-level comments
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp.getTime() - a.timestamp.getTime();
        case 'oldest':
          return a.timestamp.getTime() - b.timestamp.getTime();
        case 'popular':
          return (b.likes - b.dislikes) - (a.likes - a.dislikes);
        default:
          return 0;
      }
    });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comment Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Leave a Comment</h3>
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this story..."
          className="min-h-[100px]"
        />
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Be respectful and follow our community guidelines.
          </p>
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
          >
            Post Comment
          </Button>
        </div>
      </div>

      {/* Sort Options */}
      {comments.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h3>
          <div className="flex gap-2">
            {(['newest', 'oldest', 'popular'] as const).map((option) => (
              <Button
                key={option}
                variant={sortBy === option ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        <AnimatePresence>
          {sortedComments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Main Comment */}
              <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={comment.author.avatar} />
                  <AvatarFallback>
                    {comment.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.author.name}</span>
                    {comment.author.verified && (
                      <span className="text-blue-600 text-xs">✓ Verified</span>
                    )}
                    <span className="text-gray-500 text-sm">
                      {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{comment.content}</p>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(comment.id, 'like')}
                    >
                      <ThumbsUp size={16} className="mr-1" />
                      {comment.likes}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(comment.id, 'dislike')}
                    >
                      <ThumbsDown size={16} className="mr-1" />
                      {comment.dislikes}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )}
                    >
                      <Reply size={16} className="mr-1" />
                      Reply
                    </Button>
                  </div>

                  {/* Reply Form */}
                  <AnimatePresence>
                    {replyingTo === comment.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 ml-8"
                      >
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReply(comment.id)}
                            disabled={!replyContent.trim()}
                          >
                            Reply
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-14 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-4">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={reply.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {reply.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{reply.author.name}</span>
                          <span className="text-gray-500 text-xs">
                            {formatDistanceToNow(reply.timestamp, { addSuffix: true })}
                          </span>
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleReaction(reply.id, 'like')}
                          >
                            <ThumbsUp size={12} className="mr-1" />
                            {reply.likes}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleReaction(reply.id, 'dislike')}
                          >
                            <ThumbsDown size={12} className="mr-1" />
                            {reply.dislikes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}