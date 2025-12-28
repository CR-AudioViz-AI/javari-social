'use client'

import { useState } from 'react'
import {
  Instagram, Facebook, Linkedin, Twitter, Youtube,
  Monitor, Smartphone, Square, RectangleVertical,
  Image, Sparkles, RefreshCw, Download, Copy, Check,
  AlertTriangle, CheckCircle, Info, Zap, Wand2
} from 'lucide-react'

interface PlatformSpec {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  formats: {
    name: string
    width: number
    height: number
    aspectRatio: string
    recommended: boolean
  }[]
  maxCharacters: number
  maxHashtags: number
  bestTimes: string[]
  tips: string[]
}

interface OptimizedContent {
  platform: string
  format: string
  caption: string
  hashtags: string[]
  preview?: string
}

const PLATFORMS: PlatformSpec[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: <Instagram className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    formats: [
      { name: 'Feed Post', width: 1080, height: 1080, aspectRatio: '1:1', recommended: true },
      { name: 'Portrait', width: 1080, height: 1350, aspectRatio: '4:5', recommended: true },
      { name: 'Story/Reel', width: 1080, height: 1920, aspectRatio: '9:16', recommended: true },
      { name: 'Landscape', width: 1080, height: 566, aspectRatio: '1.91:1', recommended: false },
    ],
    maxCharacters: 2200,
    maxHashtags: 30,
    bestTimes: ['6-9 AM', '12-2 PM', '7-9 PM'],
    tips: ['Use 3-5 hashtags for best engagement', 'First line is crucial - make it catchy', 'Include a call-to-action']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="w-5 h-5" />,
    color: 'from-blue-600 to-blue-500',
    formats: [
      { name: 'Feed Post', width: 1200, height: 630, aspectRatio: '1.91:1', recommended: true },
      { name: 'Square', width: 1200, height: 1200, aspectRatio: '1:1', recommended: true },
      { name: 'Story', width: 1080, height: 1920, aspectRatio: '9:16', recommended: true },
      { name: 'Cover Photo', width: 820, height: 312, aspectRatio: '2.63:1', recommended: false },
    ],
    maxCharacters: 63206,
    maxHashtags: 10,
    bestTimes: ['1-4 PM', '6-9 PM'],
    tips: ['Shorter posts perform better', 'Native video gets more reach', 'Ask questions to boost engagement']
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: <Twitter className="w-5 h-5" />,
    color: 'from-sky-500 to-sky-400',
    formats: [
      { name: 'Single Image', width: 1200, height: 675, aspectRatio: '16:9', recommended: true },
      { name: 'Square', width: 1200, height: 1200, aspectRatio: '1:1', recommended: true },
      { name: '2 Images', width: 700, height: 800, aspectRatio: '7:8', recommended: false },
    ],
    maxCharacters: 280,
    maxHashtags: 2,
    bestTimes: ['8-10 AM', '12-1 PM', '4-5 PM'],
    tips: ['Use 1-2 hashtags only', 'Threads perform well', 'Include media for 35% more engagement']
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5" />,
    color: 'from-blue-700 to-blue-600',
    formats: [
      { name: 'Feed Post', width: 1200, height: 627, aspectRatio: '1.91:1', recommended: true },
      { name: 'Square', width: 1200, height: 1200, aspectRatio: '1:1', recommended: true },
      { name: 'Portrait', width: 627, height: 1200, aspectRatio: '1:1.91', recommended: false },
    ],
    maxCharacters: 3000,
    maxHashtags: 5,
    bestTimes: ['7-8 AM', '12 PM', '5-6 PM'],
    tips: ['Professional tone performs best', 'Use line breaks for readability', 'Tag relevant people/companies']
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <Youtube className="w-5 h-5" />,
    color: 'from-red-600 to-red-500',
    formats: [
      { name: 'Thumbnail', width: 1280, height: 720, aspectRatio: '16:9', recommended: true },
      { name: 'Shorts', width: 1080, height: 1920, aspectRatio: '9:16', recommended: true },
      { name: 'Banner', width: 2560, height: 1440, aspectRatio: '16:9', recommended: false },
    ],
    maxCharacters: 5000,
    maxHashtags: 15,
    bestTimes: ['2-4 PM', '6-9 PM'],
    tips: ['Thumbnails should be eye-catching', 'First 48 hours are critical', 'Use timestamps in description']
  }
]

export default function PlatformOptimizer() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram'])
  const [originalContent, setOriginalContent] = useState('')
  const [optimizedContent, setOptimizedContent] = useState<OptimizedContent[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [activeTab, setActiveTab] = useState<'optimize' | 'formats' | 'tips'>('optimize')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const handleOptimize = async () => {
    if (!originalContent.trim() || selectedPlatforms.length === 0) return

    setIsOptimizing(true)

    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 1500))

    const optimized: OptimizedContent[] = selectedPlatforms.map(platformId => {
      const platform = PLATFORMS.find(p => p.id === platformId)!
      
      // Truncate content for platform limits
      let caption = originalContent
      if (caption.length > platform.maxCharacters) {
        caption = caption.substring(0, platform.maxCharacters - 3) + '...'
      }

      // Generate platform-specific hashtags
      const hashtags = generateHashtags(platformId, platform.maxHashtags)

      return {
        platform: platformId,
        format: platform.formats[0].name,
        caption,
        hashtags
      }
    })

    setOptimizedContent(optimized)
    setIsOptimizing(false)
  }

  const generateHashtags = (platform: string, max: number): string[] => {
    const baseHashtags = ['marketing', 'socialmedia', 'business', 'entrepreneur', 'success', 'motivation', 'growth']
    const platformSpecific: Record<string, string[]> = {
      instagram: ['instagood', 'photooftheday', 'instadaily'],
      twitter: ['trending', 'viral'],
      linkedin: ['leadership', 'networking', 'career'],
      facebook: ['community', 'smallbusiness'],
      youtube: ['subscribe', 'youtubechannel']
    }
    
    const combined = [...(platformSpecific[platform] || []), ...baseHashtags]
    return combined.slice(0, max).map(h => `#${h}`)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Platform Optimizer</h2>
            <p className="text-sm text-gray-400">Optimize content for each platform</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'optimize', label: 'Optimize Content', icon: Sparkles },
          { id: 'formats', label: 'Size Guide', icon: Monitor },
          { id: 'tips', label: 'Best Practices', icon: Info }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-pink-400 border-b-2 border-pink-500 bg-pink-500/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Optimize Tab */}
      {activeTab === 'optimize' && (
        <div className="p-4 space-y-4">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    selectedPlatforms.includes(platform.id)
                      ? `bg-gradient-to-r ${platform.color} border-transparent text-white`
                      : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {platform.icon}
                  <span className="text-sm">{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Your Content</label>
            <textarea
              value={originalContent}
              onChange={(e) => setOriginalContent(e.target.value)}
              placeholder="Paste your content here and we'll optimize it for each platform..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{originalContent.length} characters</span>
              <button
                onClick={handleOptimize}
                disabled={!originalContent.trim() || selectedPlatforms.length === 0 || isOptimizing}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Optimize for All
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optimized Results */}
          {optimizedContent.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-white">Optimized Content</h3>
              {optimizedContent.map(content => {
                const platform = PLATFORMS.find(p => p.id === content.platform)!
                return (
                  <div key={content.platform} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${platform.color}`}>
                        {platform.icon}
                        <span className="text-sm font-medium">{platform.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`text-xs ${content.caption.length > platform.maxCharacters * 0.9 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {content.caption.length}/{platform.maxCharacters}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-900 rounded-lg p-3 mb-3">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{content.caption}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {content.hashtags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-700 text-blue-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(content.caption + '\n\n' + content.hashtags.join(' '), content.platform)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                      >
                        {copiedId === content.platform ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copiedId === content.platform ? 'Copied!' : 'Copy All'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Formats Tab */}
      {activeTab === 'formats' && (
        <div className="p-4 space-y-4">
          {PLATFORMS.map(platform => (
            <div key={platform.id} className="bg-gray-800 rounded-lg p-4">
              <div className={`flex items-center gap-2 mb-3 bg-gradient-to-r ${platform.color} px-3 py-1.5 rounded-lg w-fit`}>
                {platform.icon}
                <span className="font-medium">{platform.name}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {platform.formats.map(format => (
                  <div
                    key={format.name}
                    className={`p-3 rounded-lg border ${
                      format.recommended
                        ? 'border-green-500/30 bg-green-500/10'
                        : 'border-gray-700 bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-medium">{format.name}</span>
                      {format.recommended && <CheckCircle className="w-3 h-3 text-green-400" />}
                    </div>
                    <p className="text-xs text-gray-400">{format.width} × {format.height}</p>
                    <p className="text-xs text-gray-500">{format.aspectRatio}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <div className="p-4 space-y-4">
          {PLATFORMS.map(platform => (
            <div key={platform.id} className="bg-gray-800 rounded-lg p-4">
              <div className={`flex items-center gap-2 mb-3 bg-gradient-to-r ${platform.color} px-3 py-1.5 rounded-lg w-fit`}>
                {platform.icon}
                <span className="font-medium">{platform.name}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase">Best Posting Times</p>
                  <div className="flex flex-wrap gap-1">
                    {platform.bestTimes.map((time, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 text-green-400 text-xs rounded">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-2 uppercase">Limits</p>
                  <p className="text-sm text-gray-300">
                    Max {platform.maxCharacters.toLocaleString()} chars · {platform.maxHashtags} hashtags
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2 uppercase">Pro Tips</p>
                <ul className="space-y-1">
                  {platform.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <Zap className="w-3 h-3 text-yellow-400 mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
