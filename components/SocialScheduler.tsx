'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, Clock, Send, Plus, Trash2, Edit2, 
  Instagram, Facebook, Twitter, Linkedin, Youtube,
  CheckCircle, XCircle, AlertCircle, Loader2,
  ChevronLeft, ChevronRight, RefreshCw, Copy,
  Hash, MapPin, Sparkles, Eye
} from 'lucide-react'
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO } from 'date-fns'

interface ScheduledPost {
  id: string
  design_id: string
  design_preview?: string
  platform: string
  scheduled_for: string
  timezone: string
  caption: string
  hashtags: string[]
  location?: string
  status: 'scheduled' | 'posted' | 'failed' | 'cancelled'
  post_id?: string
  error_message?: string
}

interface SocialSchedulerProps {
  designId?: string
  designPreview?: string
  onClose?: () => void
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'bg-black' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-600' },
]

const BEST_TIMES = {
  instagram: ['9:00 AM', '12:00 PM', '3:00 PM', '7:00 PM'],
  facebook: ['9:00 AM', '1:00 PM', '4:00 PM'],
  twitter: ['8:00 AM', '12:00 PM', '5:00 PM'],
  linkedin: ['7:30 AM', '12:00 PM', '5:00 PM'],
  youtube: ['2:00 PM', '4:00 PM'],
}

export default function SocialScheduler({ designId, designPreview, onClose }: SocialSchedulerProps) {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showNewPost, setShowNewPost] = useState(!!designId)
  const [aiGenerating, setAiGenerating] = useState(false)
  
  // New post form
  const [newPost, setNewPost] = useState({
    platform: 'instagram',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    caption: '',
    hashtags: [] as string[],
    location: '',
    hashtagInput: ''
  })

  useEffect(() => {
    loadScheduledPosts()
  }, [])

  const loadScheduledPosts = async () => {
    try {
      const response = await fetch('/api/scheduling')
      if (response.ok) {
        const data = await response.json()
        setScheduledPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to load scheduled posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const schedulePost = async () => {
    if (!newPost.caption.trim()) {
      alert('Please add a caption')
      return
    }
    
    setSaving(true)
    try {
      const scheduledFor = `${newPost.date}T${newPost.time}:00`
      const response = await fetch('/api/scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design_id: designId,
          platform: newPost.platform,
          scheduled_for: scheduledFor,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          caption: newPost.caption,
          hashtags: newPost.hashtags,
          location: newPost.location || undefined
        })
      })
      
      if (response.ok) {
        await loadScheduledPosts()
        setShowNewPost(false)
        setNewPost({
          platform: 'instagram',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '12:00',
          caption: '',
          hashtags: [],
          location: '',
          hashtagInput: ''
        })
      }
    } catch (error) {
      console.error('Failed to schedule post:', error)
    } finally {
      setSaving(false)
    }
  }

  const cancelPost = async (id: string) => {
    if (!confirm('Cancel this scheduled post?')) return
    
    try {
      await fetch(`/api/scheduling?id=${id}`, { method: 'DELETE' })
      await loadScheduledPosts()
    } catch (error) {
      console.error('Failed to cancel post:', error)
    }
  }

  const generateCaption = async () => {
    setAiGenerating(true)
    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_caption',
          platform: newPost.platform,
          context: 'social media post',
          style: 'engaging'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setNewPost(prev => ({
          ...prev,
          caption: data.caption || prev.caption,
          hashtags: data.hashtags || prev.hashtags
        }))
      }
    } catch (error) {
      console.error('Failed to generate caption:', error)
    } finally {
      setAiGenerating(false)
    }
  }

  const addHashtag = () => {
    const tag = newPost.hashtagInput.trim().replace(/^#/, '')
    if (tag && !newPost.hashtags.includes(tag) && newPost.hashtags.length < 30) {
      setNewPost(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, tag],
        hashtagInput: ''
      }))
    }
  }

  const removeHashtag = (tag: string) => {
    setNewPost(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(t => t !== tag)
    }))
  }

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      isSameDay(parseISO(post.scheduled_for), date)
    )
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      posted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    }
    const icons = {
      scheduled: Clock,
      posted: CheckCircle,
      failed: XCircle,
      cancelled: AlertCircle,
    }
    const Icon = icons[status as keyof typeof icons] || AlertCircle
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const PlatformIcon = ({ platformId }: { platformId: string }) => {
    const platform = PLATFORMS.find(p => p.id === platformId)
    if (!platform) return null
    const Icon = platform.icon
    return (
      <div className={`w-8 h-8 ${platform.color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Social Scheduler</h2>
          <p className="text-sm text-gray-500">Plan and schedule your social media posts</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Schedule Post
        </button>
      </div>

      {/* Calendar View */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Week Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, -1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">
            {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 divide-x divide-gray-200 dark:divide-gray-700">
          {weekDays.map((day, i) => {
            const posts = getPostsForDate(day)
            const isToday = isSameDay(day, new Date())
            const isSelected = isSameDay(day, selectedDate)
            
            return (
              <div
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`min-h-[120px] p-2 cursor-pointer transition-colors ${
                  isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className={`text-center mb-2 ${isToday ? 'font-bold text-purple-600' : ''}`}>
                  <div className="text-xs text-gray-500">{format(day, 'EEE')}</div>
                  <div className={`text-lg ${isToday ? 'bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {posts.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                    >
                      <PlatformIcon platformId={post.platform} />
                      <span className="truncate flex-1">{format(parseISO(post.scheduled_for), 'h:mm a')}</span>
                    </div>
                  ))}
                  {posts.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{posts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Posts */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {format(selectedDate, 'EEEE, MMMM d')}
        </h3>
        
        {getPostsForDate(selectedDate).length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No posts scheduled for this day</p>
          </div>
        ) : (
          getPostsForDate(selectedDate).map(post => (
            <div
              key={post.id}
              className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <PlatformIcon platformId={post.platform} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{format(parseISO(post.scheduled_for), 'h:mm a')}</span>
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.caption}</p>
                {post.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.hashtags.slice(0, 5).map(tag => (
                      <span key={tag} className="text-xs text-purple-600">#{tag}</span>
                    ))}
                    {post.hashtags.length > 5 && (
                      <span className="text-xs text-gray-500">+{post.hashtags.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
              
              {post.status === 'scheduled' && (
                <button
                  onClick={() => cancelPost(post.id)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Schedule New Post</h3>
                <button onClick={() => setShowNewPost(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Design Preview */}
              {designPreview && (
                <div className="aspect-square w-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mx-auto">
                  <img src={designPreview} alt="Design" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <div className="grid grid-cols-5 gap-2">
                  {PLATFORMS.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => setNewPost(prev => ({ ...prev, platform: platform.id }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newPost.platform === platform.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <platform.icon className="w-6 h-6 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={newPost.date}
                    onChange={(e) => setNewPost(prev => ({ ...prev, date: e.target.value }))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newPost.time}
                    onChange={(e) => setNewPost(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Best Times Suggestion */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Best times:</span>
                {BEST_TIMES[newPost.platform as keyof typeof BEST_TIMES]?.map(time => (
                  <button
                    key={time}
                    onClick={() => {
                      const [h, m, period] = time.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || []
                      let hour = parseInt(h)
                      if (period?.toUpperCase() === 'PM' && hour !== 12) hour += 12
                      if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0
                      setNewPost(prev => ({ ...prev, time: `${hour.toString().padStart(2, '0')}:${m}` }))
                    }}
                    className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full hover:bg-purple-200"
                  >
                    {time}
                  </button>
                ))}
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Caption</label>
                  <button
                    onClick={generateCaption}
                    disabled={aiGenerating}
                    className="flex items-center gap-1 text-xs text-purple-600 hover:underline disabled:opacity-50"
                  >
                    {aiGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Generate with AI
                  </button>
                </div>
                <textarea
                  value={newPost.caption}
                  onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Write your caption..."
                  className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg h-24 resize-none"
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {newPost.caption.length} / {newPost.platform === 'twitter' ? 280 : 2200}
                </div>
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Hashtags ({newPost.hashtags.length}/30)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPost.hashtagInput}
                    onChange={(e) => setNewPost(prev => ({ ...prev, hashtagInput: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                    placeholder="Add hashtag"
                    className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  />
                  <button
                    onClick={addHashtag}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {newPost.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newPost.hashtags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full text-xs"
                      >
                        #{tag}
                        <button onClick={() => removeHashtag(tag)} className="hover:text-red-500">
                          <XCircle className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={newPost.location}
                  onChange={(e) => setNewPost(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Add location"
                  className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={schedulePost}
                disabled={saving || !newPost.caption.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
