'use client'

import { useState, useRef } from 'react'
import { 
  Image, Upload, Download, Wand2, Layers, 
  Type, Palette, Grid, Maximize2, Eraser,
  Share2, Save, Undo, Redo, ZoomIn, ZoomOut,
  Calendar, Sparkles, FolderArchive, Menu, X,
  Users, MessageSquare, History, Clock
} from 'lucide-react'

// Import all components
import MagicResize from '@/components/MagicResize'
import TemplateLibrary from '@/components/TemplateLibrary'
import BackgroundRemover from '@/components/BackgroundRemover'
import BrandKitManager from '@/components/BrandKitManager'
import SocialScheduler from '@/components/SocialScheduler'
import AICaptionGenerator from '@/components/AICaptionGenerator'
import BatchExport from '@/components/BatchExport'
import TeamWorkspace from '@/components/TeamWorkspace'
import CommentSystem from '@/components/CommentSystem'
import VersionHistory from '@/components/VersionHistory'
import CrossMarketingFooter from '@/components/CrossMarketingFooter'
import JavariWidget from '@/components/JavariWidget'

type ActiveTool = 'canvas' | 'templates' | 'resize' | 'background' | 'brandkit' | 'caption' | 'schedule' | 'batch-export' | 'team' | 'comments' | 'history'

interface CanvasElement {
  id: string
  type: 'text' | 'image' | 'shape'
  x: number
  y: number
  width: number
  height: number
  content: string
  style: Record<string, any>
}

interface BrandKit {
  id: string
  name: string
  is_default: boolean
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  additional_colors: string[]
  heading_font: string
  body_font: string
  accent_font: string
}

export default function SocialGraphicsPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('canvas')
  const [canvasImage, setCanvasImage] = useState<string | null>(null)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 })
  const [zoom, setZoom] = useState(100)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [selectedBrandKit, setSelectedBrandKit] = useState<BrandKit | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCanvasImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle template selection
  const handleTemplateSelect = (template: any) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Create gradient background from template
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, template.colors[0])
    gradient.addColorStop(1, template.colors[1])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    setCanvasImage(canvas.toDataURL())
    setActiveTool('canvas')
  }

  // Handle canvas click for comments
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'comments') {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.round(((e.clientX - rect.left) / rect.width) * canvasSize.width)
      const y = Math.round(((e.clientY - rect.top) / rect.height) * canvasSize.height)
      setCommentPosition({ x, y })
    }
  }

  // Tools definition with new collaboration tools
  const tools = [
    { id: 'canvas', icon: Layers, label: 'Canvas', color: 'text-blue-400' },
    { id: 'templates', icon: Grid, label: 'Templates', color: 'text-purple-400' },
    { id: 'resize', icon: Maximize2, label: 'Magic Resize', color: 'text-green-400' },
    { id: 'background', icon: Eraser, label: 'Remove BG', color: 'text-pink-400' },
    { id: 'brandkit', icon: Palette, label: 'Brand Kit', color: 'text-orange-400' },
    { id: 'caption', icon: Sparkles, label: 'AI Caption', color: 'text-cyan-400' },
    { id: 'schedule', icon: Calendar, label: 'Schedule', color: 'text-yellow-400' },
    { id: 'batch-export', icon: FolderArchive, label: 'Batch Export', color: 'text-red-400' },
    { id: 'team', icon: Users, label: 'Team', color: 'text-indigo-400', badge: 'NEW' },
    { id: 'comments', icon: MessageSquare, label: 'Comments', color: 'text-emerald-400', badge: '3' },
    { id: 'history', icon: History, label: 'History', color: 'text-amber-400' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Social Graphics Creator
            </h1>
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
              Pro
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-400">Canvas:</span>
              <span className="text-sm font-medium">{canvasSize.width} × {canvasSize.height}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Tools */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-20 bg-gray-900 border-r border-gray-800 p-2`}>
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id as ActiveTool)
                  setMobileMenuOpen(false)
                }}
                className={`relative flex flex-col items-center justify-center p-3 rounded-xl transition-all min-w-[70px] ${
                  activeTool === tool.id
                    ? 'bg-gray-800 ring-2 ring-purple-500'
                    : 'hover:bg-gray-800'
                }`}
              >
                <tool.icon className={`w-5 h-5 ${tool.color}`} />
                <span className="text-xs mt-1 text-gray-400">{tool.label}</span>
                {tool.badge && (
                  <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full ${
                    tool.badge === 'NEW' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {tool.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Canvas View */}
            {activeTool === 'canvas' && (
              <div className="space-y-4">
                <div 
                  className="relative bg-gray-800 rounded-xl overflow-hidden mx-auto"
                  style={{ 
                    width: '100%', 
                    maxWidth: `${Math.min(800, canvasSize.width * (zoom / 100))}px`,
                    aspectRatio: `${canvasSize.width} / ${canvasSize.height}`
                  }}
                  onClick={handleCanvasClick}
                >
                  {canvasImage ? (
                    <img 
                      src={canvasImage} 
                      alt="Canvas" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Upload className="w-12 h-12 text-gray-600 mb-4" />
                      <p className="text-gray-400 mb-2">Drop an image here or</p>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      >
                        Upload Image
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                  
                  {/* Comment indicator */}
                  {commentPosition && activeTool === 'comments' && (
                    <div 
                      className="absolute w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ 
                        left: `${(commentPosition.x / canvasSize.width) * 100}%`,
                        top: `${(commentPosition.y / canvasSize.height) * 100}%`
                      }}
                    >
                      <MessageSquare className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap justify-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                    <Type className="w-4 h-4" />
                    Add Text
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                    <Image className="w-4 h-4" />
                    Add Image
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                    <Wand2 className="w-4 h-4" />
                    AI Generate
                  </button>
                  <button 
                    onClick={() => setActiveTool('templates')}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                  >
                    <Grid className="w-4 h-4" />
                    Templates
                  </button>
                </div>
              </div>
            )}

            {/* Templates */}
            {activeTool === 'templates' && (
              <TemplateLibrary 
                onSelectTemplate={handleTemplateSelect}
                userPlan="pro"
              />
            )}

            {/* Magic Resize */}
            {activeTool === 'resize' && (
              <MagicResize 
                originalImage={canvasImage}
                onResize={(newImage, newSize) => {
                  setCanvasImage(newImage)
                  setCanvasSize(newSize)
                  setActiveTool('canvas')
                }}
              />
            )}

            {/* Background Remover */}
            {activeTool === 'background' && (
              <BackgroundRemover 
                image={canvasImage}
                onComplete={(newImage) => {
                  setCanvasImage(newImage)
                  setActiveTool('canvas')
                }}
              />
            )}

            {/* Brand Kit */}
            {activeTool === 'brandkit' && (
              <BrandKitManager 
                onSelectBrandKit={(kit) => {
                  setSelectedBrandKit(kit)
                }}
                selectedBrandKit={selectedBrandKit}
              />
            )}

            {/* AI Caption Generator */}
            {activeTool === 'caption' && (
              <AICaptionGenerator 
                image={canvasImage}
                onCaptionGenerated={(newCaption, newHashtags) => {
                  setCaption(newCaption)
                  setHashtags(newHashtags)
                }}
              />
            )}

            {/* Social Scheduler */}
            {activeTool === 'schedule' && (
              <SocialScheduler 
                design={{
                  id: 'current',
                  image: canvasImage,
                  caption,
                  hashtags
                }}
              />
            )}

            {/* Batch Export */}
            {activeTool === 'batch-export' && (
              <BatchExport 
                design={{
                  id: 'current',
                  image: canvasImage,
                  size: canvasSize
                }}
              />
            )}

            {/* Team Workspace - NEW */}
            {activeTool === 'team' && (
              <TeamWorkspace 
                onClose={() => setActiveTool('canvas')}
                onSelectFolder={(folder) => {
                  console.log('Selected folder:', folder)
                }}
              />
            )}

            {/* Comments - NEW */}
            {activeTool === 'comments' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Canvas with comment markers */}
                <div 
                  className="relative bg-gray-800 rounded-xl overflow-hidden cursor-crosshair"
                  style={{ aspectRatio: `${canvasSize.width} / ${canvasSize.height}` }}
                  onClick={handleCanvasClick}
                >
                  {canvasImage ? (
                    <img src={canvasImage} alt="Canvas" className="w-full h-full object-contain" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500">
                      <span className="text-white/50">Click to add comments</span>
                    </div>
                  )}
                  
                  {commentPosition && (
                    <div 
                      className="absolute w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                      style={{ 
                        left: `${(commentPosition.x / canvasSize.width) * 100}%`,
                        top: `${(commentPosition.y / canvasSize.height) * 100}%`
                      }}
                    >
                      <MessageSquare className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Comment System */}
                <CommentSystem 
                  designId="current-design"
                  selectedPosition={commentPosition}
                  onPositionClick={(pos) => setCommentPosition(pos)}
                />
              </div>
            )}

            {/* Version History - NEW */}
            {activeTool === 'history' && (
              <VersionHistory 
                designId="current-design"
                onRestoreVersion={(version) => {
                  console.log('Restoring version:', version)
                  setActiveTool('canvas')
                }}
                onPreviewVersion={(version) => {
                  console.log('Previewing version:', version)
                }}
              />
            )}
          </div>
        </main>

        {/* Right Sidebar - Properties */}
        {activeTool === 'canvas' && canvasImage && (
          <aside className="hidden lg:block w-64 bg-gray-900 border-l border-gray-800 p-4">
            <h3 className="font-semibold mb-4">Properties</h3>
            
            {/* Canvas Size */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Canvas Size</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Width</label>
                  <input
                    type="number"
                    value={canvasSize.width}
                    onChange={(e) => setCanvasSize({ ...canvasSize, width: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Height</label>
                  <input
                    type="number"
                    value={canvasSize.height}
                    onChange={(e) => setCanvasSize({ ...canvasSize, height: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Quick Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Square', w: 1080, h: 1080 },
                  { name: 'Portrait', w: 1080, h: 1350 },
                  { name: 'Story', w: 1080, h: 1920 },
                  { name: 'Landscape', w: 1200, h: 628 },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setCanvasSize({ width: preset.w, height: preset.h })}
                    className="px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Collaboration Status */}
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Team Collaboration</span>
              </div>
              <p className="text-xs text-gray-400 mb-2">3 team members have access</p>
              <button 
                onClick={() => setActiveTool('team')}
                className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
              >
                Manage Team
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Cross Marketing Footer */}
      <CrossMarketingFooter currentApp="social-graphics" />
      
      {/* Javari AI Widget */}
      <JavariWidget />
    </div>
  )
}
