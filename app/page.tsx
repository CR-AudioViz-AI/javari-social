'use client'

import { useState, useRef } from 'react'
import { 
  Image, Upload, Download, Wand2, Layers, 
  Type, Palette, Grid, Maximize2, Eraser,
  Share2, Save, Undo, Redo, ZoomIn, ZoomOut,
  Calendar, Sparkles, FolderArchive, Menu, X
} from 'lucide-react'

// Import all components
import MagicResize from '@/components/MagicResize'
import TemplateLibrary from '@/components/TemplateLibrary'
import BackgroundRemover from '@/components/BackgroundRemover'
import BrandKitManager from '@/components/BrandKitManager'
import SocialScheduler from '@/components/SocialScheduler'
import AICaptionGenerator from '@/components/AICaptionGenerator'
import BatchExport from '@/components/BatchExport'
import CrossMarketingFooter from '@/components/CrossMarketingFooter'
import JavariWidget from '@/components/JavariWidget'

type ActiveTool = 'canvas' | 'templates' | 'resize' | 'background' | 'brandkit' | 'caption' | 'schedule' | 'batch-export'

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

  // Handle magic resize complete
  const handleResizeComplete = (images: any[]) => {
    console.log('Resized images:', images)
  }

  // Handle background removal
  const handleBackgroundRemoved = (imageUrl: string) => {
    setCanvasImage(imageUrl)
    setActiveTool('canvas')
  }

  // Handle brand kit selection
  const handleBrandKitSelect = (kit: BrandKit) => {
    setSelectedBrandKit(kit)
    // Apply brand colors to canvas if desired
  }

  // Handle caption selection from AI generator
  const handleCaptionSelect = (newCaption: string, newHashtags: string[]) => {
    setCaption(newCaption)
    setHashtags(newHashtags)
  }

  // Handle batch export complete
  const handleBatchExportComplete = (files: { name: string; blob: Blob }[]) => {
    console.log('Exported files:', files)
  }

  // Export canvas
  const exportCanvas = (format: 'png' | 'jpg' | 'webp') => {
    const canvas = canvasRef.current
    if (!canvas || !canvasImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.onload = () => {
      canvas.width = canvasSize.width
      canvas.height = canvasSize.height
      ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height)
      
      const link = document.createElement('a')
      link.download = `social-graphic-${Date.now()}.${format}`
      link.href = canvas.toDataURL(`image/${format}`, 0.95)
      link.click()
    }
    img.src = canvasImage
  }

  const tools = [
    { id: 'canvas', label: 'Canvas', icon: Layers },
    { id: 'templates', label: 'Templates', icon: Grid },
    { id: 'resize', label: 'Magic Resize', icon: Maximize2 },
    { id: 'background', label: 'Remove BG', icon: Eraser },
    { id: 'brandkit', label: 'Brand Kit', icon: Palette },
    { id: 'caption', label: 'AI Caption', icon: Sparkles },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'batch-export', label: 'Batch Export', icon: FolderArchive },
  ]

  const presetSizes = [
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'LinkedIn Post', width: 1200, height: 627 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Social Graphics Creator</h1>
                <p className="text-sm text-gray-500">Create stunning social media graphics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Zoom Controls - Desktop */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              
              {/* Save/Export */}
              <button 
                onClick={() => exportCanvas('png')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id as ActiveTool)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTool === tool.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <tool.icon className="w-5 h-5" />
                <span className="font-medium">{tool.label}</span>
              </button>
            ))}
          </nav>

          {/* Brand Kit Preview */}
          {selectedBrandKit && (
            <div className="mx-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Active Brand Kit</p>
              <p className="font-medium text-sm">{selectedBrandKit.name}</p>
              <div className="flex gap-1 mt-2">
                {[selectedBrandKit.primary_color, selectedBrandKit.secondary_color, selectedBrandKit.accent_color].map((color, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white dark:bg-gray-900 w-64 h-full" onClick={e => e.stopPropagation()}>
              <nav className="p-4 space-y-1">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => { setActiveTool(tool.id as ActiveTool); setMobileMenuOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                      activeTool === tool.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <tool.icon className="w-5 h-5" />
                    <span className="font-medium">{tool.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6">
          {/* Canvas Tool */}
          {activeTool === 'canvas' && (
            <div className="max-w-4xl mx-auto">
              {/* Canvas Size Presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {presetSizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setCanvasSize({ width: size.width, height: size.height })}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      canvasSize.width === size.width && canvasSize.height === size.height
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>

              {/* Canvas */}
              <div 
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden mx-auto"
                style={{ 
                  maxWidth: '100%',
                  aspectRatio: `${canvasSize.width}/${canvasSize.height}`
                }}
              >
                {canvasImage ? (
                  <img 
                    src={canvasImage} 
                    alt="Canvas" 
                    className="w-full h-full object-contain"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <Upload className="w-16 h-16 mb-4" />
                    <p className="text-lg font-medium">Drop image here or click to upload</p>
                    <p className="text-sm">{canvasSize.width} × {canvasSize.height}px</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Caption Preview */}
              {caption && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 mb-2">Caption Preview</p>
                  <p className="text-gray-800 dark:text-gray-200">{caption}</p>
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hashtags.map(tag => (
                        <span key={tag} className="text-sm text-purple-600">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Templates */}
          {activeTool === 'templates' && (
            <TemplateLibrary onSelectTemplate={handleTemplateSelect} />
          )}

          {/* Magic Resize */}
          {activeTool === 'resize' && (
            <MagicResize 
              sourceImage={canvasImage} 
              onResizeComplete={handleResizeComplete} 
            />
          )}

          {/* Background Remover */}
          {activeTool === 'background' && (
            <BackgroundRemover 
              sourceImage={canvasImage}
              onComplete={handleBackgroundRemoved}
            />
          )}

          {/* Brand Kit Manager */}
          {activeTool === 'brandkit' && (
            <div className="max-w-2xl mx-auto">
              <BrandKitManager 
                onSelectKit={handleBrandKitSelect}
                selectedKitId={selectedBrandKit?.id}
              />
            </div>
          )}

          {/* AI Caption Generator */}
          {activeTool === 'caption' && (
            <div className="max-w-2xl mx-auto">
              <AICaptionGenerator 
                onCaptionSelect={handleCaptionSelect}
                platform="instagram"
              />
            </div>
          )}

          {/* Social Scheduler */}
          {activeTool === 'schedule' && (
            <SocialScheduler 
              designId={canvasImage ? 'current-design' : undefined}
              designPreview={canvasImage || undefined}
            />
          )}

          {/* Batch Export */}
          {activeTool === 'batch-export' && (
            <div className="max-w-3xl mx-auto">
              <BatchExport 
                sourceImage={canvasImage}
                onExportComplete={handleBatchExportComplete}
              />
            </div>
          )}
        </main>
      </div>

      {/* Cross Marketing Footer */}
      <CrossMarketingFooter />

      {/* Javari Widget */}
      <JavariWidget />

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
