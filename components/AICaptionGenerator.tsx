'use client'

import { useState } from 'react'
import { 
  Sparkles, Copy, RefreshCw, Check, Loader2,
  Instagram, Facebook, Twitter, Linkedin,
  Hash, ThumbsUp, Zap, Target, MessageCircle,
  TrendingUp, Heart, Star
} from 'lucide-react'

interface AICaptionGeneratorProps {
  onCaptionSelect: (caption: string, hashtags: string[]) => void
  platform?: string
  context?: string
}

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional', icon: Target, description: 'Business-appropriate tone' },
  { id: 'casual', label: 'Casual', icon: MessageCircle, description: 'Friendly and relaxed' },
  { id: 'humorous', label: 'Humorous', icon: Heart, description: 'Fun and witty' },
  { id: 'inspirational', label: 'Inspirational', icon: Star, description: 'Motivating and uplifting' },
  { id: 'educational', label: 'Educational', icon: TrendingUp, description: 'Informative and helpful' },
]

const PLATFORM_LIMITS = {
  instagram: { caption: 2200, hashtags: 30 },
  facebook: { caption: 63206, hashtags: 10 },
  twitter: { caption: 280, hashtags: 5 },
  linkedin: { caption: 3000, hashtags: 5 },
  youtube: { caption: 5000, hashtags: 15 },
}

export default function AICaptionGenerator({ onCaptionSelect, platform = 'instagram', context }: AICaptionGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [selectedTone, setSelectedTone] = useState('casual')
  const [includeEmoji, setIncludeEmoji] = useState(true)
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeCTA, setIncludeCTA] = useState(true)
  const [generatedCaptions, setGeneratedCaptions] = useState<Array<{caption: string, hashtags: string[]}>>([])
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState(platform)

  const generateCaptions = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic or description')
      return
    }

    setLoading(true)
    setGeneratedCaptions([])

    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_captions',
          topic,
          platform: selectedPlatform,
          tone: selectedTone,
          include_emoji: includeEmoji,
          include_hashtags: includeHashtags,
          include_cta: includeCTA,
          count: 3,
          context,
          max_length: PLATFORM_LIMITS[selectedPlatform as keyof typeof PLATFORM_LIMITS]?.caption || 2200,
          max_hashtags: PLATFORM_LIMITS[selectedPlatform as keyof typeof PLATFORM_LIMITS]?.hashtags || 30
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedCaptions(data.captions || [])
      } else {
        // Fallback to local generation if API fails
        const fallbackCaptions = generateLocalCaptions()
        setGeneratedCaptions(fallbackCaptions)
      }
    } catch (error) {
      console.error('Failed to generate captions:', error)
      // Fallback to local generation
      const fallbackCaptions = generateLocalCaptions()
      setGeneratedCaptions(fallbackCaptions)
    } finally {
      setLoading(false)
    }
  }

  const generateLocalCaptions = () => {
    const templates = {
      professional: [
        `Excited to share our latest insights on ${topic}. Here's what we've learned... 💡`,
        `${topic} is transforming our industry. Let's discuss the key takeaways.`,
        `Our team has been working hard on ${topic}. Check out the results!`
      ],
      casual: [
        `Just vibing with ${topic} today ✨ Who else is into this?`,
        `${topic} hits different when you really think about it 🤔`,
        `Can we talk about ${topic}? Because wow! 🔥`
      ],
      humorous: [
        `Me: I'll be productive today. Also me: *deep dives into ${topic}* 😅`,
        `POV: You discovered ${topic} and now it's your whole personality 💀`,
        `${topic} said "hold my coffee" and we were not ready 😂`
      ],
      inspirational: [
        `${topic} taught us that every journey starts with a single step. Keep going! 🌟`,
        `Dreams become reality when you embrace ${topic}. What's your next move? ✨`,
        `The beauty of ${topic} lies in its ability to transform us. Stay inspired! 💪`
      ],
      educational: [
        `Let's break down ${topic}: Here are 3 key things you need to know 📚`,
        `Understanding ${topic} can be a game-changer. Here's why...`,
        `Quick guide to ${topic} for beginners and experts alike 🎯`
      ]
    }

    const selectedTemplates = templates[selectedTone as keyof typeof templates] || templates.casual
    
    return selectedTemplates.map(template => ({
      caption: template,
      hashtags: generateHashtags(topic)
    }))
  }

  const generateHashtags = (topic: string): string[] => {
    const baseHashtags = topic.toLowerCase().split(' ').filter(w => w.length > 2).slice(0, 3)
    const commonHashtags = ['contentcreator', 'socialmedia', 'viral', 'trending', 'instagood']
    const platformHashtags = {
      instagram: ['instagram', 'instadaily', 'photooftheday'],
      facebook: ['facebook', 'facebooklive', 'fbpost'],
      twitter: ['twitter', 'twitterpost', 'viral'],
      linkedin: ['linkedin', 'networking', 'business'],
      youtube: ['youtube', 'youtuber', 'subscribe']
    }
    
    const platformTags = platformHashtags[selectedPlatform as keyof typeof platformHashtags] || []
    const allTags = [...baseHashtags, ...commonHashtags.slice(0, 3), ...platformTags.slice(0, 2)]
    
    return [...new Set(allTags)].slice(0, 10)
  }

  const copyToClipboard = async (caption: string, hashtags: string[], index: number) => {
    const fullText = `${caption}\n\n${hashtags.map(t => `#${t}`).join(' ')}`
    await navigator.clipboard.writeText(fullText)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const platforms = [
    { id: 'instagram', icon: Instagram, color: 'from-purple-600 via-pink-500 to-orange-400' },
    { id: 'facebook', icon: Facebook, color: 'from-blue-600 to-blue-600' },
    { id: 'twitter', icon: Twitter, color: 'from-gray-900 to-gray-900' },
    { id: 'linkedin', icon: Linkedin, color: 'from-blue-700 to-blue-700' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Caption Generator</h2>
        <p className="text-gray-500 mt-1">Create engaging captions in seconds</p>
      </div>

      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Platform</label>
        <div className="flex gap-2 justify-center">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlatform(p.id)}
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedPlatform === p.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${p.color} rounded-lg flex items-center justify-center`}>
                <p.icon className="w-5 h-5 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Topic Input */}
      <div>
        <label className="block text-sm font-medium mb-2">What's your post about?</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Describe your post topic, product launch, event, or any content you want to share..."
          className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl h-24 resize-none focus:ring-2 focus:ring-purple-500 outline-none"
        />
      </div>

      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Tone</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TONE_OPTIONS.map(tone => (
            <button
              key={tone.id}
              onClick={() => setSelectedTone(tone.id)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                selectedTone === tone.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <tone.icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm font-medium">{tone.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeEmoji}
            onChange={(e) => setIncludeEmoji(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm">Include emojis</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeHashtags}
            onChange={(e) => setIncludeHashtags(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm">Generate hashtags</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeCTA}
            onChange={(e) => setIncludeCTA(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm">Add call-to-action</span>
        </label>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateCaptions}
        disabled={loading || !topic.trim()}
        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Generate Captions
          </>
        )}
      </button>

      {/* Generated Captions */}
      {generatedCaptions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Generated Captions
          </h3>
          
          {generatedCaptions.map((item, index) => (
            <div
              key={index}
              className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">{item.caption}</p>
              
              {item.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.hashtags.map(tag => (
                    <span key={tag} className="text-sm text-purple-600">#{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500">
                  {item.caption.length} characters
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.caption, item.hashtags, index)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onCaptionSelect(item.caption, item.hashtags)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Use This
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={generateCaptions}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 hover:border-purple-500 hover:text-purple-500"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Generate More
          </button>
        </div>
      )}
    </div>
  )
}
