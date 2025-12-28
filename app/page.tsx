'use client'

import { useState, useRef } from 'react'
import { 
  Image, Upload, Download, Wand2, Layers, 
  Type, Palette, Grid, Maximize2, Eraser,
  Share2, Save, Undo, Redo, ZoomIn, ZoomOut
} from 'lucide-react'

// Import all new components
import MagicResize from '@/components/MagicResize'
import TemplateLibrary from '@/components/TemplateLibrary'
import BackgroundRemover from '@/components/BackgroundRemover'

type ActiveTool = 'canvas' | 'templates' | 'resize' | 'background' | 'export'

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

export default function SocialGraphicsPage() {
  const [activeTool, setActiveTool] = useState<ActiveTool>('canvas')
  const [canvasImage, setCanvasImage] = useState<string | null>(null)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 })
  const [zoom, setZoom] = useState(100)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
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
    // Apply template colors and create base design
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
    // Images are ready for download
    console.log('Resized images:', images)
  }

  // Handle background removal
  const handleBackgroundRemoved = (imageUrl: string) => {
    setCanvasImage(imageUrl)
    setActiveTool('canvas')
  }

  // Export canvas
  const exportCanvas = (format: 'png' | 'jpg' | 'webp') => {
    const canvas = canvasRef.current
    if (!canvas || !canvasImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw current state
    const img = new window.Image()
    img.onload = () => {
      canvas.width = canvasSize.width
      canvas.height = canvasSize.height
      ctx.drawImage(img, 0, 0, canvasSize.width, canvasSize.height)
      
      // Download
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
    { id: 'export', label: 'Export', icon: Download },
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
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Social Graphics Creator</h1>
                <p className="text-sm text-gray-500">Create stunning social media graphics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              
              {/* Undo/Redo */}
              <div className="flex items-center gap-1">
                <button disabled={historyIndex <= 0} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50">
                  <Undo className="w-5 h-5" />
                </button>
                <button disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50">
                  <Redo className="w-5 h-5" />
                </button>
              </div>
              
              <button 
                onClick={() => exportCanvas('png')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col items-center py-4 gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ActiveTool)}
              className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-colors ${
                activeTool === tool.id
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={tool.label}
            >
              <tool.icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Canvas Tool */}
          {activeTool === 'canvas' && (
            <div className="flex gap-6">
              {/* Canvas Area */}
              <div className="flex-1 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-xl p-8 min-h-[600px]">
                {canvasImage ? (
                  <div 
                    className="relative bg-white shadow-xl"
                    style={{ 
                      width: canvasSize.width * (zoom / 100) / 2,
                      height: canvasSize.height * (zoom / 100) / 2
                    }}
                  >
                    <img 
                      src={canvasImage} 
                      alt="Canvas" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">Start with a template or upload an image</p>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => setActiveTool('templates')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
                      >
                        Browse Templates
                      </button>
                      <label className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
                        Upload Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Properties */}
              <div className="w-72 space-y-4">
                {/* Canvas Size */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Canvas Size</h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-xs text-gray-500">Width</label>
                      <input 
                        type="number" 
                        value={canvasSize.width}
                        onChange={(e) => setCanvasSize({...canvasSize, width: Number(e.target.value)})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Height</label>
                      <input 
                        type="number" 
                        value={canvasSize.height}
                        onChange={(e) => setCanvasSize({...canvasSize, height: Number(e.target.value)})}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {presetSizes.map(preset => (
                      <button
                        key={preset.name}
                        onClick={() => setCanvasSize({ width: preset.width, height: preset.height })}
                        className={`w-full text-left px-3 py-2 rounded text-sm ${
                          canvasSize.width === preset.width && canvasSize.height === preset.height
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {preset.name}
                        <span className="text-xs text-gray-400 ml-2">{preset.width}×{preset.height}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTool('resize')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Magic Resize to All Platforms
                    </button>
                    <button 
                      onClick={() => setActiveTool('background')}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
                    >
                      <Eraser className="w-4 h-4" />
                      Remove Background
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tool */}
          {activeTool === 'templates' && (
            <TemplateLibrary 
              onSelectTemplate={handleTemplateSelect}
              userPlan="pro"
            />
          )}

          {/* Magic Resize Tool */}
          {activeTool === 'resize' && (
            <MagicResize 
              sourceImage={canvasImage}
              onResizeComplete={handleResizeComplete}
            />
          )}

          {/* Background Remover Tool */}
          {activeTool === 'background' && (
            <BackgroundRemover 
              onImageProcessed={handleBackgroundRemoved}
              creditsRemaining={50}
            />
          )}

          {/* Export Tool */}
          {activeTool === 'export' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Export Your Design</h2>
                
                {canvasImage ? (
                  <>
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                      <img src={canvasImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => exportCanvas('png')}
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 transition-colors text-center"
                      >
                        <p className="font-bold text-lg">.PNG</p>
                        <p className="text-sm text-gray-500">Lossless, transparent</p>
                      </button>
                      <button 
                        onClick={() => exportCanvas('jpg')}
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 transition-colors text-center"
                      >
                        <p className="font-bold text-lg">.JPG</p>
                        <p className="text-sm text-gray-500">Smaller file size</p>
                      </button>
                      <button 
                        onClick={() => exportCanvas('webp')}
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 transition-colors text-center"
                      >
                        <p className="font-bold text-lg">.WEBP</p>
                        <p className="text-sm text-gray-500">Modern, optimized</p>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Create a design first to export</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
