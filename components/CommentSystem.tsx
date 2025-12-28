'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  MessageSquare, Send, Reply, MoreHorizontal, Pin,
  Check, CheckCheck, Trash2, Edit3, X, AtSign,
  ThumbsUp, Smile, Paperclip, ChevronDown, ChevronUp,
  Bell, BellOff, Filter, Clock, User
} from 'lucide-react'

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  position?: { x: number; y: number }
  replies: Comment[]
  reactions: { emoji: string; users: string[] }[]
  isPinned: boolean
  isResolved: boolean
  createdAt: string
  editedAt?: string
  mentions: string[]
}

interface CommentSystemProps {
  designId: string
  onPositionClick?: (position: { x: number; y: number }) => void
  selectedPosition?: { x: number; y: number } | null
}

const DEMO_COMMENTS: Comment[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Roy Henderson',
    userAvatar: '',
    content: 'Can we make the headline larger? It should pop more against the background.',
    position: { x: 150, y: 80 },
    replies: [
      {
        id: '1-1',
        userId: 'user2',
        userName: 'Sarah Chen',
        userAvatar: '',
        content: 'Agreed! Maybe 20% bigger and add a subtle drop shadow?',
        replies: [],
        reactions: [{ emoji: '👍', users: ['user1'] }],
        isPinned: false,
        isResolved: false,
        createdAt: '2 hours ago',
        mentions: []
      }
    ],
    reactions: [{ emoji: '👍', users: ['user2', 'user3'] }, { emoji: '💡', users: ['user2'] }],
    isPinned: true,
    isResolved: false,
    createdAt: '3 hours ago',
    mentions: []
  },
  {
    id: '2',
    userId: 'user3',
    userName: 'Mike Johnson',
    userAvatar: '',
    content: 'The color scheme looks great! Matches our brand guidelines perfectly.',
    position: { x: 300, y: 200 },
    replies: [],
    reactions: [{ emoji: '❤️', users: ['user1', 'user2'] }],
    isPinned: false,
    isResolved: true,
    createdAt: '5 hours ago',
    mentions: []
  },
  {
    id: '3',
    userId: 'user2',
    userName: 'Sarah Chen',
    userAvatar: '',
    content: '@Roy Henderson Could you review the CTA button placement? I feel it might be too close to the edge.',
    position: { x: 400, y: 350 },
    replies: [],
    reactions: [],
    isPinned: false,
    isResolved: false,
    createdAt: '1 day ago',
    mentions: ['Roy Henderson']
  }
]

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '💡', '🎯', '✨', '👏', '🚀']

export default function CommentSystem({ designId, onPositionClick, selectedPosition }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>(DEMO_COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'pinned'>('all')
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set(['1']))
  const [notifications, setNotifications] = useState(true)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const filteredComments = comments.filter(c => {
    if (filter === 'unresolved') return !c.isResolved
    if (filter === 'pinned') return c.isPinned
    return true
  })

  const sortedComments = [...filteredComments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const mentions = newComment.match(/@[\w\s]+/g)?.map(m => m.slice(1)) || []
    
    const comment: Comment = {
      id: Date.now().toString(),
      userId: 'currentUser',
      userName: 'You',
      userAvatar: '',
      content: newComment,
      position: selectedPosition || undefined,
      replies: [],
      reactions: [],
      isPinned: false,
      isResolved: false,
      createdAt: 'Just now',
      mentions
    }
    
    setComments([comment, ...comments])
    setNewComment('')
  }

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return

    const mentions = replyContent.match(/@[\w\s]+/g)?.map(m => m.slice(1)) || []
    
    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      userId: 'currentUser',
      userName: 'You',
      userAvatar: '',
      content: replyContent,
      replies: [],
      reactions: [],
      isPinned: false,
      isResolved: false,
      createdAt: 'Just now',
      mentions
    }

    setComments(comments.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...c.replies, reply] }
      }
      return c
    }))
    
    setReplyingTo(null)
    setReplyContent('')
  }

  const handleToggleResolve = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, isResolved: !c.isResolved } : c
    ))
  }

  const handleTogglePin = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, isPinned: !c.isPinned } : c
    ))
  }

  const handleAddReaction = (commentId: string, emoji: string, isReply?: boolean, parentId?: string) => {
    const addReaction = (comment: Comment): Comment => {
      const existingReaction = comment.reactions.find(r => r.emoji === emoji)
      if (existingReaction) {
        if (existingReaction.users.includes('currentUser')) {
          return {
            ...comment,
            reactions: comment.reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, users: r.users.filter(u => u !== 'currentUser') }
                : r
            ).filter(r => r.users.length > 0)
          }
        } else {
          return {
            ...comment,
            reactions: comment.reactions.map(r => 
              r.emoji === emoji 
                ? { ...r, users: [...r.users, 'currentUser'] }
                : r
            )
          }
        }
      } else {
        return {
          ...comment,
          reactions: [...comment.reactions, { emoji, users: ['currentUser'] }]
        }
      }
    }

    if (isReply && parentId) {
      setComments(comments.map(c => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: c.replies.map(r => r.id === commentId ? addReaction(r) : r)
          }
        }
        return c
      }))
    } else {
      setComments(comments.map(c => c.id === commentId ? addReaction(c) : c))
    }
    
    setShowEmojiPicker(null)
  }

  const handleDelete = (commentId: string, isReply?: boolean, parentId?: string) => {
    if (isReply && parentId) {
      setComments(comments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: c.replies.filter(r => r.id !== commentId) }
        }
        return c
      }))
    } else {
      setComments(comments.filter(c => c.id !== commentId))
    }
  }

  const toggleExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  const renderComment = (comment: Comment, isReply = false, parentId?: string) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-8 pl-4 border-l-2 border-gray-700' : ''} ${
        comment.isResolved ? 'opacity-60' : ''
      }`}
    >
      <div className={`p-3 rounded-lg ${comment.isPinned ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-gray-800'}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
              {comment.userName[0]}
            </div>
            <div>
              <span className="font-medium text-white">{comment.userName}</span>
              <span className="text-xs text-gray-500 ml-2">{comment.createdAt}</span>
              {comment.editedAt && (
                <span className="text-xs text-gray-500 ml-1">(edited)</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {comment.isPinned && (
              <Pin className="w-3 h-3 text-purple-400" />
            )}
            {comment.isResolved && (
              <CheckCheck className="w-4 h-4 text-green-400" />
            )}
            {comment.position && (
              <div 
                className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded cursor-pointer hover:bg-blue-500/30"
                onClick={() => onPositionClick?.(comment.position!)}
              >
                View on design
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {editingId === comment.id ? (
          <div className="mb-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setComments(comments.map(c => 
                    c.id === comment.id ? { ...c, content: editContent, editedAt: 'Just now' } : c
                  ))
                  setEditingId(null)
                }}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 text-sm mb-2 whitespace-pre-wrap">
            {comment.content.split(/(@[\w\s]+)/).map((part, i) => 
              part.startsWith('@') ? (
                <span key={i} className="text-purple-400 font-medium">{part}</span>
              ) : part
            )}
          </p>
        )}

        {/* Reactions */}
        {comment.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {comment.reactions.map((reaction, i) => (
              <button
                key={i}
                onClick={() => handleAddReaction(comment.id, reaction.emoji, isReply, parentId)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                  reaction.users.includes('currentUser')
                    ? 'bg-purple-500/30 text-purple-300'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
          <button
            onClick={() => {
              setReplyingTo(comment.id)
              setReplyContent('')
            }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
          >
            <Reply className="w-3 h-3" />
            Reply
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
            >
              <Smile className="w-3 h-3" />
              React
            </button>
            
            {showEmojiPicker === comment.id && (
              <div className="absolute bottom-full left-0 mb-1 p-2 bg-gray-800 rounded-lg border border-gray-700 flex gap-1 z-10">
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleAddReaction(comment.id, emoji, isReply, parentId)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isReply && (
            <>
              <button
                onClick={() => handleToggleResolve(comment.id)}
                className={`flex items-center gap-1 text-xs ${
                  comment.isResolved ? 'text-green-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Check className="w-3 h-3" />
                {comment.isResolved ? 'Resolved' : 'Resolve'}
              </button>
              
              <button
                onClick={() => handleTogglePin(comment.id)}
                className={`flex items-center gap-1 text-xs ${
                  comment.isPinned ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Pin className="w-3 h-3" />
                {comment.isPinned ? 'Pinned' : 'Pin'}
              </button>
            </>
          )}

          {comment.userId === 'currentUser' && (
            <>
              <button
                onClick={() => {
                  setEditingId(comment.id)
                  setEditContent(comment.content)
                }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(comment.id, isReply, parentId)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Replies */}
      {!isReply && comment.replies.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => toggleExpanded(comment.id)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-2"
          >
            {expandedComments.has(comment.id) ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          
          {expandedComments.has(comment.id) && (
            <div className="space-y-2">
              {comment.replies.map(reply => renderComment(reply, true, comment.id))}
            </div>
          )}
        </div>
      )}

      {/* Reply Input */}
      {replyingTo === comment.id && (
        <div className="mt-2 ml-8 pl-4 border-l-2 border-gray-700">
          <div className="flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
              autoFocus
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleSubmitReply(comment.id)}
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </button>
              <button
                onClick={() => setReplyingTo(null)}
                className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h2 className="font-semibold text-white">Comments</h2>
          <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
            {comments.filter(c => !c.isResolved).length} unresolved
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifications(!notifications)}
            className={`p-2 rounded-lg ${notifications ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400 bg-gray-800'}`}
          >
            {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Comments</option>
            <option value="unresolved">Unresolved</option>
            <option value="pinned">Pinned</option>
          </select>
        </div>
      </div>

      {/* New Comment Input */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            Y
          </div>
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={selectedPosition ? 'Add comment to this position...' : 'Add a comment... Use @ to mention'}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
            />
            {selectedPosition && (
              <div className="flex items-center gap-2 mt-2 text-xs text-blue-400">
                <Pin className="w-3 h-3" />
                Comment will be pinned at position ({selectedPosition.x}, {selectedPosition.y})
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                  <AtSign className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-4 max-h-96 overflow-y-auto space-y-3">
        {sortedComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No comments yet</p>
            <p className="text-sm text-gray-500">Click on the design to add a comment at a specific position</p>
          </div>
        ) : (
          sortedComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  )
}
