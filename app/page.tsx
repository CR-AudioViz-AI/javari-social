'use client'

import { useState } from 'react'
import {
  Image, Plus, Download, Share2, Layers, Palette,
  Type, Sparkles, Menu, X, Settings, Clock, Users,
  Instagram, Facebook, Linkedin, Twitter, Youtube,
  Wand2, Grid, Calendar, Hash, BarChart3, Bookmark,
  RefreshCw, Eye, Edit3, Trash2, Copy, Filter
} from 'lucide-react'

import TemplateLibrary from '@/components/TemplateLibrary'
import BrandKitManager from '@/components/BrandKitManager'
import MagicResize from '@/components/MagicResize'
import AIImageGenerator from '@/components/AIImageGenerator'
import AICaptionGenerator from '@/components/AICaptionGenerator'
import BackgroundRemover from '@/components/BackgroundRemover'
import BatchExport from '@/components/BatchExport'
import SocialScheduler from '@/components/SocialScheduler'
import TeamWorkspace from '@/components/TeamWorkspace'
import ContentCalendar from '@/components/ContentCalendar'
import PlatformOptimizer from '@/components/PlatformOptimizer'
import HashtagAnalyzer from '@/components/HashtagAnalyzer'
import CrossMarketingFooter from '@/components/CrossMarketingFooter'
import JavariWidget from '@/components/JavariWidget'

type ActiveView = 'dashboard' | 'create' | 'templates' | 'calendar' | 'optimizer' | 'hashtags' | 'brand' | 'team' | 'settings'

interface Design {
  id: string
  name: string
  type: string
  platform: string
  thumbnail: string
  createdAt: string
  status: 'draft' | 'scheduled' | 'published'
}

const DEMO_DESIGNS: Design[] = [
  { id: '1', name: 'New Year Sale', type: 'Post', platform: 'instagram', thumbnail: '/api/placeholder/200/200', createdAt: '2024-12-27', status: 'scheduled' },
  { id: '2', name: 'Product Launch', type: 'Story', platform: 'instagram', thumbnail: '/api/placeholder/200/200', createdAt: '2024-12-26', status: 'draft' },
  { id: '3', name: 'Company Update', type: 'Post', platform: 'linkedin', thumbnail: '/api/placeholder/200/200', createdAt: '2024-12-25', status: 'published' },
  { id: '4', name: 'Behind the Scenes', type: 'Reel', platform: 'instagram', thumbnail: '/api/placeholder/200/200', createdAt: '2024-12-24', status: 'draft' },
]

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

export default function SocialGraphicsPage() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [designs] = useState<Design[]>(DEMO_DESIGNS)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Grid },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'templates', label: 'Templates', icon: Layers },
    { id: 'calendar', label: 'Calendar', icon: Calendar, badge: 'NEW' },
    { id: 'optimizer', label: 'Optimizer', icon: Wand2, badge: 'NEW' },
    { id: 'hashtags', label: 'Hashtags', icon: Hash, badge: 'NEW' },
    { id: 'brand', label: 'Brand Kit', icon: Palette },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/20 text-green-400'
      case 'scheduled': return 'bg-blue-500/20 text-blue-400'
      case 'draft': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Social Graphics Creator
            </h1>
            <span className="hidden sm:inline px-2 py-1 bg-pink-500/20 text-pink-400 text-xs rounded-full">Pro</span>
          </div>
          <button onClick={() => setActiveView('create')} className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Design</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-56 bg-gray-900 border-r border-gray-800 fixed md:sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto z-30`}>
          <nav className="p-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id as ActiveView); setMobileMenuOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 ${
                  activeView === item.id ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3"><item.icon className="w-4 h-4" /><span className="text-sm">{item.label}</span></div>
                {item.badge && <span className="px-1.5 py-0.5 bg-purple-500 text-white text-xs rounded">{item.badge}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 min-h-[calc(100vh-57px)]">
          <div className="max-w-6xl mx-auto">
            {/* Dashboard */}
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2"><Image className="w-4 h-4" /><span className="text-sm">Total Designs</span></div>
                    <p className="text-2xl font-bold">{designs.length}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2"><Clock className="w-4 h-4" /><span className="text-sm">Scheduled</span></div>
                    <p className="text-2xl font-bold text-blue-400">{designs.filter(d => d.status === 'scheduled').length}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2"><Share2 className="w-4 h-4" /><span className="text-sm">Published</span></div>
                    <p className="text-2xl font-bold text-green-400">{designs.filter(d => d.status === 'published').length}</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-400 mb-2"><Edit3 className="w-4 h-4" /><span className="text-sm">Drafts</span></div>
                    <p className="text-2xl font-bold text-gray-400">{designs.filter(d => d.status === 'draft').length}</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={() => setActiveView('create')} className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-xl">
                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center"><Plus className="w-5 h-5 text-pink-400" /></div>
                    <div className="text-left"><p className="font-medium">New Design</p></div>
                  </button>
                  <button onClick={() => setActiveView('calendar')} className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center"><Calendar className="w-5 h-5 text-blue-400" /></div>
                    <div className="text-left"><p className="font-medium">Calendar</p></div>
                  </button>
                  <button onClick={() => setActiveView('optimizer')} className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-xl">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center"><Wand2 className="w-5 h-5 text-cyan-400" /></div>
                    <div className="text-left"><p className="font-medium">Optimizer</p></div>
                  </button>
                  <button onClick={() => setActiveView('hashtags')} className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-750 rounded-xl">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center"><Hash className="w-5 h-5 text-purple-400" /></div>
                    <div className="text-left"><p className="font-medium">Hashtags</p></div>
                  </button>
                </div>

                {/* Recent Designs */}
                <div className="bg-gray-800 rounded-xl">
                  <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="font-semibold">Recent Designs</h2>
                    <button className="text-sm text-pink-400">View All</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    {designs.map(design => (
                      <div key={design.id} className="bg-gray-900 rounded-lg overflow-hidden group cursor-pointer">
                        <div className="aspect-square bg-gradient-to-br from-pink-500/20 to-purple-500/20 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Image className="w-8 h-8 text-gray-600" />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><Eye className="w-4 h-4" /></button>
                            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><Edit3 className="w-4 h-4" /></button>
                            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30"><Download className="w-4 h-4" /></button>
                          </div>
                          <div className={`absolute top-2 left-2 w-6 h-6 rounded ${PLATFORM_COLORS[design.platform]} flex items-center justify-center`}>
                            {PLATFORM_ICONS[design.platform]}
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="font-medium text-sm truncate">{design.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">{design.type}</span>
                            <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(design.status)}`}>{design.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Create */}
            {activeView === 'create' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Create New Design</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Instagram Post', size: '1080 × 1080', icon: Instagram, color: 'from-purple-500 to-pink-500' },
                    { name: 'Instagram Story', size: '1080 × 1920', icon: Instagram, color: 'from-purple-500 to-pink-500' },
                    { name: 'Facebook Post', size: '1200 × 630', icon: Facebook, color: 'from-blue-600 to-blue-500' },
                    { name: 'Twitter Post', size: '1200 × 675', icon: Twitter, color: 'from-sky-500 to-sky-400' },
                    { name: 'LinkedIn Post', size: '1200 × 627', icon: Linkedin, color: 'from-blue-700 to-blue-600' },
                    { name: 'YouTube Thumbnail', size: '1280 × 720', icon: Youtube, color: 'from-red-600 to-red-500' },
                  ].map(format => (
                    <button key={format.name} className="p-4 bg-gray-800 hover:bg-gray-750 rounded-xl text-left transition-colors">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${format.color} flex items-center justify-center mb-3`}>
                        <format.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold">{format.name}</h3>
                      <p className="text-sm text-gray-400">{format.size}</p>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <AIImageGenerator />
                  <AICaptionGenerator />
                </div>
              </div>
            )}

            {activeView === 'templates' && <TemplateLibrary />}
            {activeView === 'calendar' && <ContentCalendar />}
            {activeView === 'optimizer' && <PlatformOptimizer />}
            {activeView === 'hashtags' && <HashtagAnalyzer />}
            {activeView === 'brand' && <BrandKitManager />}
            {activeView === 'team' && <TeamWorkspace />}
            {activeView === 'settings' && (
              <div className="bg-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Settings</h2>
                <p className="text-gray-400">Configure your workspace settings.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <CrossMarketingFooter />
      <JavariWidget />
    </div>
  )
}
