'use client'

import { useState, useRef } from 'react'
import { 
  Download, CheckCircle, Circle, Loader2, 
  Instagram, Facebook, Twitter, Linkedin, Youtube,
  FolderArchive, FileImage, Settings2, Zap
} from 'lucide-react'

interface ExportSize {
  platform: string
  name: string
  width: number
  height: number
  icon: any
  selected: boolean
}

interface BatchExportProps {
  sourceImage: string | null
  onExportComplete: (files: { name: string; blob: Blob }[]) => void
}

const EXPORT_SIZES: ExportSize[] = [
  // Instagram
  { platform: 'Instagram', name: 'Post (Square)', width: 1080, height: 1080, icon: Instagram, selected: true },
  { platform: 'Instagram', name: 'Post (Portrait)', width: 1080, height: 1350, icon: Instagram, selected: false },
  { platform: 'Instagram', name: 'Story', width: 1080, height: 1920, icon: Instagram, selected: true },
  { platform: 'Instagram', name: 'Reel Cover', width: 1080, height: 1920, icon: Instagram, selected: false },
  // Facebook
  { platform: 'Facebook', name: 'Post', width: 1200, height: 630, icon: Facebook, selected: true },
  { platform: 'Facebook', name: 'Cover', width: 820, height: 312, icon: Facebook, selected: false },
  { platform: 'Facebook', name: 'Story', width: 1080, height: 1920, icon: Facebook, selected: false },
  { platform: 'Facebook', name: 'Ad', width: 1200, height: 628, icon: Facebook, selected: false },
  // Twitter
  { platform: 'Twitter', name: 'Post', width: 1200, height: 675, icon: Twitter, selected: true },
  { platform: 'Twitter', name: 'Header', width: 1500, height: 500, icon: Twitter, selected: false },
  // LinkedIn
  { platform: 'LinkedIn', name: 'Post', width: 1200, height: 627, icon: Linkedin, selected: true },
  { platform: 'LinkedIn', name: 'Cover', width: 1584, height: 396, icon: Linkedin, selected: false },
  // YouTube
  { platform: 'YouTube', name: 'Thumbnail', width: 1280, height: 720, icon: Youtube, selected: true },
  { platform: 'YouTube', name: 'Channel Art', width: 2560, height: 1440, icon: Youtube, selected: false },
  // Pinterest
  { platform: 'Pinterest', name: 'Standard Pin', width: 1000, height: 1500, icon: FileImage, selected: false },
  { platform: 'Pinterest', name: 'Square Pin', width: 1000, height: 1000, icon: FileImage, selected: false },
  // TikTok
  { platform: 'TikTok', name: 'Video Cover', width: 1080, height: 1920, icon: FileImage, selected: false },
]

export default function BatchExport({ sourceImage, onExportComplete }: BatchExportProps) {
  const [exportSizes, setExportSizes] = useState<ExportSize[]>(EXPORT_SIZES)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<Map<string, 'pending' | 'processing' | 'done' | 'error'>>(new Map())
  const [format, setFormat] = useState<'png' | 'jpg' | 'webp'>('png')
  const [quality, setQuality] = useState(90)
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill'>('cover')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const toggleSize = (index: number) => {
    setExportSizes(prev => prev.map((size, i) => 
      i === index ? { ...size, selected: !size.selected } : size
    ))
  }

  const selectAll = (platform?: string) => {
    setExportSizes(prev => prev.map(size => ({
      ...size,
      selected: platform ? (size.platform === platform ? true : size.selected) : true
    })))
  }

  const deselectAll = (platform?: string) => {
    setExportSizes(prev => prev.map(size => ({
      ...size,
      selected: platform ? (size.platform === platform ? false : size.selected) : false
    })))
  }

  const resizeImage = async (
    img: HTMLImageElement, 
    targetWidth: number, 
    targetHeight: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      // Fill background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, targetWidth, targetHeight)

      const imgRatio = img.width / img.height
      const targetRatio = targetWidth / targetHeight
      
      let drawWidth, drawHeight, drawX, drawY

      if (fitMode === 'cover') {
        if (imgRatio > targetRatio) {
          drawHeight = targetHeight
          drawWidth = img.width * (targetHeight / img.height)
          drawX = (targetWidth - drawWidth) / 2
          drawY = 0
        } else {
          drawWidth = targetWidth
          drawHeight = img.height * (targetWidth / img.width)
          drawX = 0
          drawY = (targetHeight - drawHeight) / 2
        }
      } else if (fitMode === 'contain') {
        if (imgRatio > targetRatio) {
          drawWidth = targetWidth
          drawHeight = img.height * (targetWidth / img.width)
          drawX = 0
          drawY = (targetHeight - drawHeight) / 2
        } else {
          drawHeight = targetHeight
          drawWidth = img.width * (targetHeight / img.height)
          drawX = (targetWidth - drawWidth) / 2
          drawY = 0
        }
      } else { // fill/stretch
        drawWidth = targetWidth
        drawHeight = targetHeight
        drawX = 0
        drawY = 0
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        `image/${format}`,
        quality / 100
      )
    })
  }

  const exportAll = async () => {
    if (!sourceImage) {
      alert('Please load an image first')
      return
    }

    const selectedSizes = exportSizes.filter(s => s.selected)
    if (selectedSizes.length === 0) {
      alert('Please select at least one size to export')
      return
    }

    setIsExporting(true)
    const progress = new Map<string, 'pending' | 'processing' | 'done' | 'error'>()
    selectedSizes.forEach(s => progress.set(`${s.platform}-${s.name}`, 'pending'))
    setExportProgress(progress)

    try {
      // Load source image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = reject
        img.src = sourceImage
      })

      const exportedFiles: { name: string; blob: Blob }[] = []

      for (const size of selectedSizes) {
        const key = `${size.platform}-${size.name}`
        setExportProgress(prev => new Map(prev).set(key, 'processing'))

        try {
          const blob = await resizeImage(img, size.width, size.height)
          const fileName = `${size.platform.toLowerCase()}-${size.name.toLowerCase().replace(/\s+/g, '-')}-${size.width}x${size.height}.${format}`
          exportedFiles.push({ name: fileName, blob })
          
          setExportProgress(prev => new Map(prev).set(key, 'done'))
        } catch (error) {
          console.error(`Failed to export ${key}:`, error)
          setExportProgress(prev => new Map(prev).set(key, 'error'))
        }
      }

      // Download as ZIP or individual files
      if (exportedFiles.length > 1) {
        await downloadAsZip(exportedFiles)
      } else if (exportedFiles.length === 1) {
        downloadFile(exportedFiles[0].name, exportedFiles[0].blob)
      }

      onExportComplete(exportedFiles)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadFile = (name: string, blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAsZip = async (files: { name: string; blob: Blob }[]) => {
    // Simple approach: download as individual files with slight delay
    // For proper ZIP, you'd use JSZip library
    for (const file of files) {
      downloadFile(file.name, file.blob)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const selectedCount = exportSizes.filter(s => s.selected).length
  const platforms = [...new Set(exportSizes.map(s => s.platform))]

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <Circle className="w-4 h-4 text-red-500" />
      default:
        return <Circle className="w-4 h-4 text-gray-300" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Batch Export</h2>
          <p className="text-sm text-gray-500">Export to multiple platforms at once</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-purple-600">{selectedCount}</span>
          <span className="text-gray-500 text-sm"> sizes selected</span>
        </div>
      </div>

      {/* Export Settings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="png">PNG (Best Quality)</option>
            <option value="jpg">JPG (Smaller Size)</option>
            <option value="webp">WebP (Modern)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Quality ({quality}%)</label>
          <input
            type="range"
            min="50"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Fit Mode</label>
          <select
            value={fitMode}
            onChange={(e) => setFitMode(e.target.value as any)}
            className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="cover">Cover (Crop to fit)</option>
            <option value="contain">Contain (Fit inside)</option>
            <option value="fill">Fill (Stretch)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Background</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-full h-9 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Size Selection by Platform */}
      <div className="space-y-4">
        {platforms.map(platform => {
          const platformSizes = exportSizes.filter(s => s.platform === platform)
          const selectedInPlatform = platformSizes.filter(s => s.selected).length
          const Icon = platformSizes[0]?.icon || FileImage

          return (
            <div key={platform} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{platform}</span>
                  <span className="text-xs text-gray-500">
                    ({selectedInPlatform}/{platformSizes.length})
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => selectAll(platform)}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => deselectAll(platform)}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="p-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {platformSizes.map((size, i) => {
                  const globalIndex = exportSizes.findIndex(s => 
                    s.platform === size.platform && s.name === size.name
                  )
                  const status = exportProgress.get(`${size.platform}-${size.name}`)
                  
                  return (
                    <button
                      key={size.name}
                      onClick={() => toggleSize(globalIndex)}
                      disabled={isExporting}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        size.selected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      } ${isExporting ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{size.name}</span>
                        {isExporting ? getStatusIcon(status) : (
                          size.selected ? (
                            <CheckCircle className="w-4 h-4 text-purple-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300" />
                          )
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{size.width} × {size.height}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => selectAll()}
          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Select All
        </button>
        <button
          onClick={() => deselectAll()}
          className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Clear All
        </button>
        <button
          onClick={() => {
            const popular = ['Instagram-Post (Square)', 'Instagram-Story', 'Facebook-Post', 'Twitter-Post', 'LinkedIn-Post']
            setExportSizes(prev => prev.map(s => ({
              ...s,
              selected: popular.includes(`${s.platform}-${s.name}`)
            })))
          }}
          className="px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200"
        >
          <Zap className="w-3 h-3 inline mr-1" />
          Select Popular
        </button>
      </div>

      {/* Export Button */}
      <button
        onClick={exportAll}
        disabled={isExporting || selectedCount === 0 || !sourceImage}
        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Exporting {selectedCount} sizes...
          </>
        ) : (
          <>
            <FolderArchive className="w-5 h-5" />
            Export {selectedCount} Sizes
          </>
        )}
      </button>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
