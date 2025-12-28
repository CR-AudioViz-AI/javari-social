'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Maximize2, Download, Check, Copy, Loader2, 
  Instagram, Twitter, Facebook, Linkedin, Youtube,
  Image as ImageIcon, Smartphone, Monitor, Square,
  ChevronDown, ChevronUp, Zap, RefreshCw
} from 'lucide-react'

// Platform size presets
const PLATFORM_SIZES = {
  instagram: [
    { name: 'Post (Square)', width: 1080, height: 1080, icon: Square },
    { name: 'Post (Portrait)', width: 1080, height: 1350, icon: Smartphone },
    { name: 'Post (Landscape)', width: 1080, height: 566, icon: Monitor },
    { name: 'Story', width: 1080, height: 1920, icon: Smartphone },
    { name: 'Reel Cover', width: 1080, height: 1920, icon: Smartphone },
  ],
  facebook: [
    { name: 'Post', width: 1200, height: 630, icon: Monitor },
    { name: 'Cover', width: 820, height: 312, icon: Monitor },
    { name: 'Event Cover', width: 1920, height: 1005, icon: Monitor },
    { name: 'Story', width: 1080, height: 1920, icon: Smartphone },
    { name: 'Ad', width: 1200, height: 628, icon: Monitor },
  ],
  twitter: [
    { name: 'Post', width: 1200, height: 675, icon: Monitor },
    { name: 'Header', width: 1500, height: 500, icon: Monitor },
    { name: 'Card', width: 800, height: 418, icon: Monitor },
  ],
  linkedin: [
    { name: 'Post', width: 1200, height: 627, icon: Monitor },
    { name: 'Cover', width: 1584, height: 396, icon: Monitor },
    { name: 'Story', width: 1080, height: 1920, icon: Smartphone },
  ],
  youtube: [
    { name: 'Thumbnail', width: 1280, height: 720, icon: Monitor },
    { name: 'Channel Art', width: 2560, height: 1440, icon: Monitor },
    { name: 'Shorts', width: 1080, height: 1920, icon: Smartphone },
  ],
  pinterest: [
    { name: 'Standard Pin', width: 1000, height: 1500, icon: Smartphone },
    { name: 'Square Pin', width: 1000, height: 1000, icon: Square },
    { name: 'Long Pin', width: 1000, height: 2100, icon: Smartphone },
  ],
  tiktok: [
    { name: 'Video', width: 1080, height: 1920, icon: Smartphone },
  ],
  custom: []
}

type Platform = keyof typeof PLATFORM_SIZES

interface ResizedImage {
  platform: string
  size: string
  width: number
  height: number
  dataUrl: string
  blob?: Blob
}

interface MagicResizeProps {
  sourceImage: string | null
  onResizeComplete: (images: ResizedImage[]) => void
}

export default function MagicResize({ sourceImage, onResizeComplete }: MagicResizeProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(['instagram', 'facebook']))
  const [selectedSizes, setSelectedSizes] = useState<Map<string, boolean>>(new Map())
  const [resizedImages, setResizedImages] = useState<ResizedImage[]>([])
  const [isResizing, setIsResizing] = useState(false)
  const [expandedPlatform, setExpandedPlatform] = useState<Platform | null>('instagram')
  const [customWidth, setCustomWidth] = useState(1200)
  const [customHeight, setCustomHeight] = useState(630)
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'stretch'>('cover')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize default selections
  useEffect(() => {
    const defaults = new Map<string, boolean>()
    defaults.set('instagram-Post (Square)', true)
    defaults.set('instagram-Story', true)
    defaults.set('facebook-Post', true)
    setSelectedSizes(defaults)
  }, [])

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev => {
      const next = new Set(prev)
      if (next.has(platform)) {
        next.delete(platform)
      } else {
        next.add(platform)
      }
      return next
    })
  }

  const toggleSize = (platform: string, sizeName: string) => {
    const key = `${platform}-${sizeName}`
    setSelectedSizes(prev => {
      const next = new Map(prev)
      next.set(key, !prev.get(key))
      return next
    })
  }

  const selectAllForPlatform = (platform: Platform) => {
    const sizes = PLATFORM_SIZES[platform]
    setSelectedSizes(prev => {
      const next = new Map(prev)
      sizes.forEach(size => {
        next.set(`${platform}-${size.name}`, true)
      })
      return next
    })
  }

  const resizeImage = async (
    img: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
  ): Promise<string> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    
    canvas.width = targetWidth
    canvas.height = targetHeight
    
    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, targetWidth, targetHeight)
    
    // Calculate dimensions based on fit mode
    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height
    let dx = 0, dy = 0, dWidth = targetWidth, dHeight = targetHeight
    
    const sourceAspect = img.width / img.height
    const targetAspect = targetWidth / targetHeight
    
    if (fitMode === 'cover') {
      // Cover: fill entire canvas, crop excess
      if (sourceAspect > targetAspect) {
        sWidth = img.height * targetAspect
        sx = (img.width - sWidth) / 2
      } else {
        sHeight = img.width / targetAspect
        sy = (img.height - sHeight) / 2
      }
    } else if (fitMode === 'contain') {
      // Contain: fit entire image, add padding
      if (sourceAspect > targetAspect) {
        dHeight = targetWidth / sourceAspect
        dy = (targetHeight - dHeight) / 2
      } else {
        dWidth = targetHeight * sourceAspect
        dx = (targetWidth - dWidth) / 2
      }
    }
    // Stretch: use full canvas (default values work)
    
    ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    
    return canvas.toDataURL('image/png', 0.95)
  }

  const handleResize = async () => {
    if (!sourceImage) return
    
    setIsResizing(true)
    const results: ResizedImage[] = []
    
    try {
      // Load source image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = sourceImage
      })
      
      // Process each selected size
      for (const [key, isSelected] of selectedSizes.entries()) {
        if (!isSelected) continue
        
        const [platform, sizeName] = key.split('-')
        const sizes = PLATFORM_SIZES[platform as Platform]
        const sizeConfig = sizes?.find(s => s.name === sizeName)
        
        if (sizeConfig) {
          const dataUrl = await resizeImage(img, sizeConfig.width, sizeConfig.height)
          results.push({
            platform,
            size: sizeName,
            width: sizeConfig.width,
            height: sizeConfig.height,
            dataUrl
          })
        }
      }
      
      // Add custom size if specified
      if (customWidth > 0 && customHeight > 0 && selectedSizes.get('custom-Custom')) {
        const dataUrl = await resizeImage(img, customWidth, customHeight)
        results.push({
          platform: 'custom',
          size: 'Custom',
          width: customWidth,
          height: customHeight,
          dataUrl
        })
      }
      
      setResizedImages(results)
      onResizeComplete(results)
      
    } catch (error) {
      console.error('Resize error:', error)
    } finally {
      setIsResizing(false)
    }
  }

  const downloadImage = (image: ResizedImage) => {
    const link = document.createElement('a')
    link.download = `${image.platform}-${image.size.replace(/\s+/g, '-').toLowerCase()}-${image.width}x${image.height}.png`
    link.href = image.dataUrl
    link.click()
  }

  const downloadAll = () => {
    resizedImages.forEach((img, index) => {
      setTimeout(() => downloadImage(img), index * 200) // Stagger downloads
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />
      case 'facebook': return <Facebook className="w-4 h-4" />
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      case 'youtube': return <Youtube className="w-4 h-4" />
      default: return <ImageIcon className="w-4 h-4" />
    }
  }

  const selectedCount = Array.from(selectedSizes.values()).filter(Boolean).length

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <Maximize2 className="w-6 h-6" />
          <div>
            <h2 className="font-semibold text-lg">Magic Resize</h2>
            <p className="text-white/80 text-sm">One-click resize for all platforms</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Source Preview */}
        {sourceImage ? (
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-2 aspect-video flex items-center justify-center">
            <img 
              src={sourceImage} 
              alt="Source" 
              className="max-h-full max-w-full object-contain rounded"
            />
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Source Image
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Upload an image to resize</p>
          </div>
        )}

        {/* Fit Mode & Background */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fit Mode
            </label>
            <select
              value={fitMode}
              onChange={(e) => setFitMode(e.target.value as any)}
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              <option value="cover">Cover (crop to fill)</option>
              <option value="contain">Contain (fit with padding)</option>
              <option value="stretch">Stretch (distort to fit)</option>
            </select>
          </div>
          
          {fitMode === 'contain' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Background
              </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-20 h-9 rounded cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 dark:text-white">Select Platforms & Sizes</h3>
          
          {(Object.keys(PLATFORM_SIZES) as Platform[]).filter(p => p !== 'custom').map(platform => (
            <div key={platform} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedPlatform(expandedPlatform === platform ? null : platform)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                    platform === 'facebook' ? 'bg-blue-600' :
                    platform === 'twitter' ? 'bg-black' :
                    platform === 'linkedin' ? 'bg-blue-700' :
                    platform === 'youtube' ? 'bg-red-600' :
                    platform === 'pinterest' ? 'bg-red-500' :
                    'bg-gray-500'
                  } text-white`}>
                    {getPlatformIcon(platform)}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{platform}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {PLATFORM_SIZES[platform].filter(s => selectedSizes.get(`${platform}-${s.name}`)).length} selected
                  </span>
                  {expandedPlatform === platform ? 
                    <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </button>
              
              {expandedPlatform === platform && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => selectAllForPlatform(platform)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Select All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PLATFORM_SIZES[platform].map(size => {
                      const key = `${platform}-${size.name}`
                      const isSelected = selectedSizes.get(key) || false
                      return (
                        <button
                          key={key}
                          onClick={() => toggleSize(platform, size.name)}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{size.name}</p>
                            <p className="text-xs text-gray-500">{size.width}×{size.height}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Custom Size */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <label className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                checked={selectedSizes.get('custom-Custom') || false}
                onChange={() => toggleSize('custom', 'Custom')}
                className="rounded"
              />
              <span className="font-medium text-gray-900 dark:text-white">Custom Size</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="w-24 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                placeholder="Width"
              />
              <span className="text-gray-500">×</span>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                className="w-24 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-sm"
                placeholder="Height"
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>
        </div>

        {/* Resize Button */}
        <button
          onClick={handleResize}
          disabled={!sourceImage || selectedCount === 0 || isResizing}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
        >
          {isResizing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Resizing...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Resize to {selectedCount} Size{selectedCount !== 1 ? 's' : ''}
            </>
          )}
        </button>

        {/* Results */}
        {resizedImages.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Resized Images ({resizedImages.length})
              </h3>
              <button
                onClick={downloadAll}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {resizedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src={img.dataUrl} 
                      alt={`${img.platform} ${img.size}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => downloadImage(img)}
                      className="bg-white text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-1 text-center">
                    <p className="text-xs font-medium text-gray-900 dark:text-white capitalize">
                      {img.platform}
                    </p>
                    <p className="text-xs text-gray-500">
                      {img.size} • {img.width}×{img.height}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
