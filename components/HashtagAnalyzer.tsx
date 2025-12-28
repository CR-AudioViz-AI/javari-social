'use client'

import { useState } from 'react'
import {
  Hash, TrendingUp, Search, Copy, Check, Plus,
  Sparkles, BarChart3, Users, Eye, Star, Bookmark,
  RefreshCw, Filter, ArrowUp, ArrowDown, Flame
} from 'lucide-react'

interface HashtagData {
  tag: string
  posts: number
  growth: number
  difficulty: 'easy' | 'medium' | 'hard'
  trending: boolean
  avgLikes: number
  avgComments: number
  relevance: number
}

interface HashtagSet {
  id: string
  name: string
  tags: string[]
  category: string
}

const TRENDING_HASHTAGS: HashtagData[] = [
  { tag: 'smallbusiness', posts: 28500000, growth: 12.5, difficulty: 'hard', trending: true, avgLikes: 450, avgComments: 32, relevance: 95 },
  { tag: 'entrepreneur', posts: 35200000, growth: 8.2, difficulty: 'hard', trending: true, avgLikes: 380, avgComments: 28, relevance: 92 },
  { tag: 'motivation', posts: 82000000, growth: 5.1, difficulty: 'hard', trending: false, avgLikes: 520, avgComments: 45, relevance: 88 },
  { tag: 'businesstips', posts: 4200000, growth: 18.3, difficulty: 'medium', trending: true, avgLikes: 620, avgComments: 55, relevance: 97 },
  { tag: 'digitalmarketing', posts: 15800000, growth: 15.2, difficulty: 'hard', trending: true, avgLikes: 340, avgComments: 22, relevance: 94 },
  { tag: 'startup', posts: 22100000, growth: 9.8, difficulty: 'hard', trending: false, avgLikes: 290, avgComments: 18, relevance: 90 },
  { tag: 'socialmediatips', posts: 2100000, growth: 22.5, difficulty: 'easy', trending: true, avgLikes: 780, avgComments: 68, relevance: 98 },
  { tag: 'contentcreator', posts: 18500000, growth: 14.2, difficulty: 'medium', trending: true, avgLikes: 510, avgComments: 42, relevance: 96 },
  { tag: 'growthhacking', posts: 890000, growth: 28.1, difficulty: 'easy', trending: true, avgLikes: 920, avgComments: 85, relevance: 93 },
  { tag: 'brandstrategy', posts: 1200000, growth: 19.4, difficulty: 'easy', trending: false, avgLikes: 680, avgComments: 52, relevance: 91 },
]

const SAVED_SETS: HashtagSet[] = [
  {
    id: '1',
    name: 'Business Growth',
    tags: ['smallbusiness', 'entrepreneur', 'businessgrowth', 'startuplife', 'businessowner'],
    category: 'Business'
  },
  {
    id: '2',
    name: 'Social Media',
    tags: ['socialmedia', 'marketing', 'digitalmarketing', 'contentcreator', 'influencer'],
    category: 'Marketing'
  },
  {
    id: '3',
    name: 'Motivation',
    tags: ['motivation', 'success', 'mindset', 'goals', 'inspiration'],
    category: 'Lifestyle'
  }
]

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export default function HashtagAnalyzer() {
  const [hashtags, setHashtags] = useState<HashtagData[]>(TRENDING_HASHTAGS)
  const [savedSets, setSavedSets] = useState<HashtagSet[]>(SAVED_SETS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [copiedTags, setCopiedTags] = useState(false)
  const [activeTab, setActiveTab] = useState<'discover' | 'analyze' | 'saved'>('discover')
  const [sortBy, setSortBy] = useState<'relevance' | 'posts' | 'growth'>('relevance')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const copyTags = () => {
    const tagString = selectedTags.map(t => `#${t}`).join(' ')
    navigator.clipboard.writeText(tagString)
    setCopiedTags(true)
    setTimeout(() => setCopiedTags(false), 2000)
  }

  const analyzeInput = async () => {
    if (!searchQuery.trim()) return
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    // In real app, this would call AI API
    setIsAnalyzing(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'hard': return 'text-red-400 bg-red-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const filteredHashtags = hashtags
    .filter(h => filterDifficulty === 'all' || h.difficulty === filterDifficulty)
    .sort((a, b) => {
      if (sortBy === 'relevance') return b.relevance - a.relevance
      if (sortBy === 'posts') return b.posts - a.posts
      if (sortBy === 'growth') return b.growth - a.growth
      return 0
    })

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Hashtag Analyzer</h2>
              <p className="text-sm text-gray-400">Find the best hashtags for your content</p>
            </div>
          </div>
          
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{selectedTags.length} selected</span>
              <button
                onClick={copyTags}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
              >
                {copiedTags ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedTags ? 'Copied!' : 'Copy All'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'discover', label: 'Discover', icon: Search },
          { id: 'analyze', label: 'Analyze', icon: BarChart3 },
          { id: 'saved', label: 'Saved Sets', icon: Bookmark }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="p-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search hashtags or enter topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && analyzeInput()}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="posts">Sort: Posts</option>
              <option value="growth">Sort: Growth</option>
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-800 rounded-lg">
              {selectedTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-sm rounded-full"
                >
                  #{tag}
                  <span className="ml-1">×</span>
                </button>
              ))}
              <button
                onClick={() => setSelectedTags([])}
                className="text-xs text-gray-400 hover:text-white ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Hashtag Grid */}
          <div className="space-y-2">
            {filteredHashtags.map(hashtag => (
              <div
                key={hashtag.tag}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                  selectedTags.includes(hashtag.tag)
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'bg-gray-800 hover:bg-gray-750 border border-transparent'
                }`}
                onClick={() => toggleTag(hashtag.tag)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    selectedTags.includes(hashtag.tag) ? 'bg-purple-600' : 'bg-gray-700'
                  }`}>
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{hashtag.tag}</span>
                      {hashtag.trending && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded">
                          <Flame className="w-3 h-3" />
                          Trending
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatNumber(hashtag.posts)} posts</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {hashtag.avgLikes} avg likes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      {hashtag.growth > 0 ? (
                        <ArrowUp className="w-3 h-3 text-green-400" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-red-400" />
                      )}
                      <span className={hashtag.growth > 0 ? 'text-green-400' : 'text-red-400'}>
                        {hashtag.growth}%
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">growth</span>
                  </div>

                  <div className={`px-2 py-1 rounded text-xs ${getDifficultyColor(hashtag.difficulty)}`}>
                    {hashtag.difficulty}
                  </div>

                  <div className="w-12 text-right">
                    <div className="text-sm font-medium text-purple-400">{hashtag.relevance}%</div>
                    <span className="text-xs text-gray-500">match</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyze Tab */}
      {activeTab === 'analyze' && (
        <div className="p-4">
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <label className="block text-sm text-gray-400 mb-2">Enter your caption or topic</label>
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Paste your caption here and we'll suggest the best hashtags..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <button
              onClick={analyzeInput}
              disabled={!searchQuery.trim() || isAnalyzing}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze & Suggest
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-3">Hashtag Strategy Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-0.5" />
                Mix popular, medium, and niche hashtags (30-30-40 ratio)
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-0.5" />
                Use 3-5 hashtags on Twitter, 5-10 on LinkedIn, up to 30 on Instagram
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-0.5" />
                Avoid banned or shadowbanned hashtags
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-400 mt-0.5" />
                Create hashtag sets for different content types
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Saved Sets Tab */}
      {activeTab === 'saved' && (
        <div className="p-4 space-y-3">
          {savedSets.map(set => (
            <div key={set.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">{set.name}</h3>
                  <span className="text-xs text-gray-500">{set.category} · {set.tags.length} tags</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(set.tags.map(t => `#${t}`).join(' '))
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {set.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-700 text-purple-400 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <button className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition-colors">
            <Plus className="w-4 h-4" />
            Create New Set
          </button>
        </div>
      )}
    </div>
  )
}
