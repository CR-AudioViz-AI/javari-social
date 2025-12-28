'use client'

import { useState, useMemo } from 'react'
import { 
  Layout, Search, Star, Download, Eye,
  Instagram, Twitter, Facebook, Linkedin, Youtube,
  ShoppingBag, Megaphone, Calendar, Gift, Zap,
  TrendingUp, Heart, MessageCircle, Lock, Check
} from 'lucide-react'

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Layout },
  { id: 'promotion', name: 'Promotions', icon: Megaphone },
  { id: 'announcement', name: 'Announcements', icon: Zap },
  { id: 'quote', name: 'Quotes', icon: MessageCircle },
  { id: 'product', name: 'Products', icon: ShoppingBag },
  { id: 'event', name: 'Events', icon: Calendar },
  { id: 'holiday', name: 'Holiday', icon: Gift },
  { id: 'stats', name: 'Stats', icon: TrendingUp },
  { id: 'testimonial', name: 'Reviews', icon: Star },
]

const TEMPLATES = [
  { id: 1, name: 'Flash Sale Banner', category: 'promotion', platform: 'instagram', colors: ['#FF6B6B', '#4ECDC4'], premium: false, likes: 1240 },
  { id: 2, name: 'Limited Offer', category: 'promotion', platform: 'facebook', colors: ['#6C63FF', '#F5576C'], premium: false, likes: 890 },
  { id: 3, name: 'Discount Code', category: 'promotion', platform: 'twitter', colors: ['#00C9FF', '#92FE9D'], premium: false, likes: 756 },
  { id: 4, name: 'BOGO Deal', category: 'promotion', platform: 'instagram', colors: ['#FA709A', '#FEE140'], premium: true, likes: 2100 },
  { id: 5, name: 'Clearance Sale', category: 'promotion', platform: 'facebook', colors: ['#667EEA', '#764BA2'], premium: false, likes: 543 },
  { id: 6, name: 'New Product Launch', category: 'announcement', platform: 'instagram', colors: ['#8E2DE2', '#4A00E0'], premium: true, likes: 3200 },
  { id: 7, name: 'Coming Soon', category: 'announcement', platform: 'twitter', colors: ['#11998E', '#38EF7D'], premium: false, likes: 1890 },
  { id: 8, name: 'Grand Opening', category: 'announcement', platform: 'facebook', colors: ['#FC466B', '#3F5EFB'], premium: true, likes: 2456 },
  { id: 9, name: 'Now Hiring', category: 'announcement', platform: 'linkedin', colors: ['#0077B5', '#00A0DC'], premium: false, likes: 987 },
  { id: 10, name: 'Feature Update', category: 'announcement', platform: 'twitter', colors: ['#1DA1F2', '#14171A'], premium: false, likes: 654 },
  { id: 11, name: 'Minimal Quote', category: 'quote', platform: 'instagram', colors: ['#FFFFFF', '#1A1A2E'], premium: false, likes: 4500 },
  { id: 12, name: 'Gradient Quote', category: 'quote', platform: 'instagram', colors: ['#DA22FF', '#9733EE'], premium: false, likes: 3890 },
  { id: 13, name: 'Photo Quote', category: 'quote', platform: 'facebook', colors: ['#000000', '#FFFFFF'], premium: true, likes: 2345 },
  { id: 14, name: 'Motivational', category: 'quote', platform: 'instagram', colors: ['#F2994A', '#F2C94C'], premium: false, likes: 5670 },
  { id: 15, name: 'Business Wisdom', category: 'quote', platform: 'linkedin', colors: ['#2C3E50', '#3498DB'], premium: false, likes: 1234 },
  { id: 16, name: 'Product Spotlight', category: 'product', platform: 'instagram', colors: ['#FF9966', '#FF5E62'], premium: true, likes: 2890 },
  { id: 17, name: 'Before & After', category: 'product', platform: 'instagram', colors: ['#56CCF2', '#2F80ED'], premium: true, likes: 3456 },
  { id: 18, name: 'Feature Highlight', category: 'product', platform: 'twitter', colors: ['#00B4DB', '#0083B0'], premium: false, likes: 876 },
  { id: 19, name: 'Product Compare', category: 'product', platform: 'facebook', colors: ['#ED213A', '#93291E'], premium: true, likes: 1567 },
  { id: 20, name: 'Unboxing', category: 'product', platform: 'youtube', colors: ['#FF0000', '#282828'], premium: false, likes: 2100 },
  { id: 21, name: 'Webinar Invite', category: 'event', platform: 'linkedin', colors: ['#6441A5', '#2A0845'], premium: false, likes: 1890 },
  { id: 22, name: 'Workshop', category: 'event', platform: 'facebook', colors: ['#FF416C', '#FF4B2B'], premium: false, likes: 1234 },
  { id: 23, name: 'Live Stream', category: 'event', platform: 'instagram', colors: ['#C31432', '#240B36'], premium: true, likes: 2567 },
  { id: 24, name: 'Conference', category: 'event', platform: 'linkedin', colors: ['#1A2980', '#26D0CE'], premium: true, likes: 987 },
  { id: 25, name: 'Meetup', category: 'event', platform: 'twitter', colors: ['#F37335', '#FDC830'], premium: false, likes: 654 },
  { id: 26, name: 'Christmas Sale', category: 'holiday', platform: 'instagram', colors: ['#C41E3A', '#165B33'], premium: false, likes: 5670 },
  { id: 27, name: 'New Year', category: 'holiday', platform: 'facebook', colors: ['#FFD700', '#000000'], premium: false, likes: 4532 },
  { id: 28, name: 'Valentines Day', category: 'holiday', platform: 'instagram', colors: ['#FF69B4', '#FFB6C1'], premium: true, likes: 3456 },
  { id: 29, name: 'Halloween', category: 'holiday', platform: 'instagram', colors: ['#FF6600', '#1A1A1A'], premium: false, likes: 2890 },
  { id: 30, name: 'Black Friday', category: 'holiday', platform: 'facebook', colors: ['#000000', '#FFD700'], premium: true, likes: 6789 },
  { id: 31, name: 'Infographic', category: 'stats', platform: 'linkedin', colors: ['#3498DB', '#2C3E50'], premium: true, likes: 3456 },
  { id: 32, name: 'Pie Chart', category: 'stats', platform: 'twitter', colors: ['#9B59B6', '#3498DB'], premium: false, likes: 1234 },
  { id: 33, name: 'Growth Stats', category: 'stats', platform: 'linkedin', colors: ['#27AE60', '#2ECC71'], premium: false, likes: 2100 },
  { id: 34, name: 'Customer Review', category: 'testimonial', platform: 'instagram', colors: ['#FFD93D', '#FFFFFF'], premium: false, likes: 4567 },
  { id: 35, name: 'Star Rating', category: 'testimonial', platform: 'facebook', colors: ['#FFB800', '#1A1A1A'], premium: false, likes: 3210 },
  { id: 36, name: 'Case Study', category: 'testimonial', platform: 'linkedin', colors: ['#0A66C2', '#FFFFFF'], premium: true, likes: 1678 },
  { id: 37, name: 'Tips & Tricks', category: 'announcement', platform: 'instagram', colors: ['#00B09B', '#96C93D'], premium: false, likes: 3456 },
  { id: 38, name: 'Behind Scenes', category: 'product', platform: 'instagram', colors: ['#373B44', '#4286F4'], premium: false, likes: 2100 },
  { id: 39, name: 'Giveaway', category: 'promotion', platform: 'instagram', colors: ['#F953C6', '#B91D73'], premium: true, likes: 5678 },
  { id: 40, name: 'Tutorial Steps', category: 'announcement', platform: 'facebook', colors: ['#4776E6', '#8E54E9'], premium: false, likes: 2345 },
]

interface Template {
  id: number
  name: string
  category: string
  platform: string
  colors: string[]
  premium: boolean
  likes: number
}

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void
  userPlan?: 'free' | 'pro' | 'enterprise'
}

export default function TemplateLibrary({ onSelectTemplate, userPlan = 'free' }: TemplateLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const filteredTemplates = useMemo(() => {
    let result = [...TEMPLATES]
    if (selectedCategory !== 'all') result = result.filter(t => t.category === selectedCategory)
    if (selectedPlatform) result = result.filter(t => t.platform === selectedPlatform)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(t => t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query))
    }
    return result.sort((a, b) => b.likes - a.likes)
  }, [selectedCategory, selectedPlatform, searchQuery])

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, any> = {
      instagram: Instagram, facebook: Facebook, twitter: Twitter, linkedin: Linkedin, youtube: Youtube
    }
    const Icon = icons[platform]
    return Icon ? <Icon className="w-3 h-3" /> : null
  }

  const canUsePremium = userPlan !== 'free'

  const handleSelect = (template: Template) => {
    if (template.premium && !canUsePremium) {
      alert('Upgrade to Pro to use premium templates!')
      return
    }
    onSelectTemplate(template)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <Layout className="w-6 h-6" />
          <div>
            <h2 className="font-semibold text-lg">Template Library</h2>
            <p className="text-white/80 text-sm">{TEMPLATES.length}+ Professional Templates</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
          <select
            value={selectedPlatform || ''}
            onChange={(e) => setSelectedPlatform(e.target.value || null)}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="twitter">Twitter</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="group relative rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => setPreviewTemplate(template)}
            >
              {/* Template Preview */}
              <div 
                className="aspect-square flex items-center justify-center p-4"
                style={{ background: `linear-gradient(135deg, ${template.colors[0]}, ${template.colors[1]})` }}
              >
                <div className="text-white text-center">
                  <p className="font-bold text-lg drop-shadow-lg">{template.name}</p>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelect(template) }}
                    className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                    title="Use Template"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewTemplate(template) }}
                    className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Premium Badge */}
              {template.premium && (
                <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  PRO
                </div>
              )}

              {/* Platform Badge */}
              <div className="absolute top-2 left-2 bg-black/50 text-white p-1.5 rounded-lg">
                {getPlatformIcon(template.platform)}
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm font-medium truncate">{template.name}</p>
                <div className="flex items-center gap-2 text-white/80 text-xs">
                  <Heart className="w-3 h-3" />
                  {template.likes.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <Layout className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No templates found</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div 
              className="aspect-square flex items-center justify-center p-8"
              style={{ background: `linear-gradient(135deg, ${previewTemplate.colors[0]}, ${previewTemplate.colors[1]})` }}
            >
              <div className="text-white text-center">
                <p className="font-bold text-3xl drop-shadow-lg">{previewTemplate.name}</p>
                <p className="mt-2 text-white/80">Your text here</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{previewTemplate.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {getPlatformIcon(previewTemplate.platform)}
                    <span className="capitalize">{previewTemplate.platform}</span>
                    <span>•</span>
                    <span className="capitalize">{previewTemplate.category}</span>
                  </div>
                </div>
                {previewTemplate.premium && !canUsePremium && (
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    <Lock className="w-4 h-4" />
                    Pro Only
                  </div>
                )}
              </div>
              <button
                onClick={() => { handleSelect(previewTemplate); setPreviewTemplate(null) }}
                disabled={previewTemplate.premium && !canUsePremium}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {previewTemplate.premium && !canUsePremium ? 'Upgrade to Use' : 'Use This Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
