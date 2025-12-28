'use client'

import { useState } from 'react'
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock,
  Instagram, Facebook, Linkedin, Twitter, Youtube,
  Image, Video, FileText, MoreVertical, Edit3, Trash2,
  Copy, Eye, CheckCircle, AlertCircle, Sparkles,
  Filter, Grid, List, Download
} from 'lucide-react'

interface ScheduledPost {
  id: string
  title: string
  content: string
  platforms: ('instagram' | 'facebook' | 'linkedin' | 'twitter' | 'youtube')[]
  scheduledDate: string
  scheduledTime: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  mediaType: 'image' | 'video' | 'carousel' | 'story' | 'reel'
  thumbnail?: string
  engagement?: { likes: number; comments: number; shares: number }
}

interface ContentCalendarProps {
  onCreatePost?: () => void
  onEditPost?: (post: ScheduledPost) => void
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  facebook: 'bg-blue-600',
  linkedin: 'bg-blue-700',
  twitter: 'bg-sky-500',
  youtube: 'bg-red-600'
}

const DEMO_POSTS: ScheduledPost[] = [
  {
    id: '1',
    title: 'New Year Sale Announcement',
    content: '🎉 Ring in 2025 with our biggest sale ever! Up to 50% off all products.',
    platforms: ['instagram', 'facebook', 'twitter'],
    scheduledDate: '2025-01-01',
    scheduledTime: '10:00',
    status: 'scheduled',
    mediaType: 'image',
    thumbnail: '/api/placeholder/200/200'
  },
  {
    id: '2',
    title: 'Product Feature Video',
    content: 'Check out our latest feature update! 🚀',
    platforms: ['youtube', 'instagram'],
    scheduledDate: '2025-01-03',
    scheduledTime: '14:00',
    status: 'scheduled',
    mediaType: 'video'
  },
  {
    id: '3',
    title: 'Behind the Scenes',
    content: 'Take a peek behind the curtain 👀',
    platforms: ['instagram'],
    scheduledDate: '2025-01-05',
    scheduledTime: '18:00',
    status: 'draft',
    mediaType: 'story'
  },
  {
    id: '4',
    title: 'Customer Testimonial',
    content: 'Hear what our customers have to say! ⭐️',
    platforms: ['linkedin', 'facebook'],
    scheduledDate: '2024-12-28',
    scheduledTime: '09:00',
    status: 'published',
    mediaType: 'carousel',
    engagement: { likes: 245, comments: 32, shares: 18 }
  },
  {
    id: '5',
    title: 'Weekly Tips',
    content: '5 tips to boost your productivity this week 💡',
    platforms: ['twitter', 'linkedin'],
    scheduledDate: '2024-12-30',
    scheduledTime: '12:00',
    status: 'scheduled',
    mediaType: 'image'
  }
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ContentCalendar({ onCreatePost, onEditPost }: ContentCalendarProps) {
  const [posts, setPosts] = useState<ScheduledPost[]>(DEMO_POSTS)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month')
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const getPostsForDate = (date: string) => {
    return posts.filter(post => {
      const matchesDate = post.scheduledDate === date
      const matchesPlatform = filterPlatform === 'all' || post.platforms.includes(filterPlatform as any)
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus
      return matchesDate && matchesPlatform && matchesStatus
    })
  }

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500'
      case 'scheduled': return 'bg-blue-500'
      case 'draft': return 'bg-gray-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'reel': return <Video className="w-3 h-3" />
      case 'carousel': return <Grid className="w-3 h-3" />
      default: return <Image className="w-3 h-3" />
    }
  }

  // Stats
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length
  const publishedCount = posts.filter(p => p.status === 'published').length
  const draftCount = posts.filter(p => p.status === 'draft').length

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Content Calendar</h2>
              <p className="text-sm text-gray-400">Plan and schedule your content</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCreatePost}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Post
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{scheduledCount}</p>
            <p className="text-xs text-gray-400">Scheduled</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{publishedCount}</p>
            <p className="text-xs text-gray-400">Published</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-400">{draftCount}</p>
            <p className="text-xs text-gray-400">Drafts</p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold min-w-[180px] text-center">
              {MONTHS[month]} {year}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm text-pink-400 hover:bg-pink-500/20 rounded-lg ml-2"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Filters */}
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`p-1.5 rounded ${viewMode === 'month' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === 'month' && (
        <div className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first day of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] bg-gray-800/30 rounded-lg" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = formatDate(day)
              const dayPosts = getPostsForDate(dateStr)
              const today = isToday(day)

              return (
                <div
                  key={day}
                  className={`min-h-[100px] bg-gray-800 rounded-lg p-2 hover:bg-gray-750 transition-colors ${
                    today ? 'ring-2 ring-pink-500' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${today ? 'text-pink-400' : 'text-gray-400'}`}>
                    {day}
                  </div>

                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map(post => (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="w-full text-left"
                      >
                        <div className={`text-xs p-1.5 rounded ${getStatusColor(post.status)} bg-opacity-20 hover:bg-opacity-30 transition-colors`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            {getMediaIcon(post.mediaType)}
                            <span className="truncate font-medium">{post.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-gray-400" />
                            <span className="text-gray-400">{post.scheduledTime}</span>
                            <div className="flex -space-x-1 ml-auto">
                              {post.platforms.slice(0, 2).map(p => (
                                <div key={p} className={`w-4 h-4 rounded-full ${PLATFORM_COLORS[p]} flex items-center justify-center`}>
                                  <span className="text-white scale-50">{PLATFORM_ICONS[p]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {dayPosts.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayPosts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="divide-y divide-gray-800">
          {posts
            .filter(post => {
              const matchesPlatform = filterPlatform === 'all' || post.platforms.includes(filterPlatform as any)
              const matchesStatus = filterStatus === 'all' || post.status === filterStatus
              return matchesPlatform && matchesStatus
            })
            .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
            .map(post => (
              <div
                key={post.id}
                className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    {getMediaIcon(post.mediaType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{post.title}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(post.status)} bg-opacity-20`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mb-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.scheduledDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.scheduledTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.platforms.map(p => (
                      <div key={p} className={`w-8 h-8 rounded-lg ${PLATFORM_COLORS[p]} flex items-center justify-center text-white`}>
                        {PLATFORM_ICONS[p]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="font-semibold">{selectedPost.title}</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedPost.status)} bg-opacity-20`}>
                  {selectedPost.status.charAt(0).toUpperCase() + selectedPost.status.slice(1)}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(selectedPost.scheduledDate).toLocaleDateString()} at {selectedPost.scheduledTime}
                </span>
              </div>

              {/* Content Preview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                  {getMediaIcon(selectedPost.mediaType)}
                  <span className="text-sm capitalize">{selectedPost.mediaType}</span>
                </div>
                <p className="text-gray-300">{selectedPost.content}</p>
              </div>

              {/* Platforms */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Platforms</p>
                <div className="flex gap-2">
                  {selectedPost.platforms.map(p => (
                    <div
                      key={p}
                      className={`px-3 py-2 rounded-lg ${PLATFORM_COLORS[p]} flex items-center gap-2 text-white`}
                    >
                      {PLATFORM_ICONS[p]}
                      <span className="capitalize text-sm">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement (if published) */}
              {selectedPost.engagement && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-3">Engagement</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-pink-400">{selectedPost.engagement.likes}</p>
                      <p className="text-xs text-gray-500">Likes</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-blue-400">{selectedPost.engagement.comments}</p>
                      <p className="text-xs text-gray-500">Comments</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-green-400">{selectedPost.engagement.shares}</p>
                      <p className="text-xs text-gray-500">Shares</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-800 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
