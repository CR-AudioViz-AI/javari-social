'use client'

import { useState, useCallback } from 'react'
import { 
  Eraser, Upload, Download, Loader2, RefreshCw,
  Image as ImageIcon, Wand2, CheckCircle, AlertCircle
} from 'lucide-react'

interface BackgroundRemoverProps {
  onImageProcessed: (imageUrl: string) => void
  creditsRemaining?: number
}

export default function BackgroundRemover({ onImageProcessed, creditsRemaining = 50 }: BackgroundRemoverProps) {
  const [sourceImage, setSourceImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFile(file)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleFile = (file: File) => {
    setError(null)
    setProcessedImage(null)
    
    // Check file size (max 12MB for remove.bg)
    if (file.size > 12 * 1024 * 1024) {
      setError('File size must be under 12MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setSourceImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeBackground = async () => {
    if (!sourceImage) return

    setIsProcessing(true)
    setError(null)

    try {
      // Convert base64 to blob
      const response = await fetch(sourceImage)
      const blob = await response.blob()

      // Create form data
      const formData = new FormData()
      formData.append('image_file', blob, 'image.png')
      formData.append('size', 'auto')

      // Call remove.bg API
      const apiResponse = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to remove background')
      }

      const resultBlob = await apiResponse.blob()
      const resultUrl = URL.createObjectURL(resultBlob)
      
      setProcessedImage(resultUrl)
      onImageProcessed(resultUrl)

    } catch (err: any) {
      setError(err.message || 'Failed to remove background')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedImage) return

    const link = document.createElement('a')
    link.download = 'background-removed.png'
    link.href = processedImage
    link.click()
  }

  const reset = () => {
    setSourceImage(null)
    setProcessedImage(null)
    setError(null)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eraser className="w-6 h-6" />
            <div>
              <h2 className="font-semibold text-lg">Background Remover</h2>
              <p className="text-white/80 text-sm">AI-powered background removal</p>
            </div>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {creditsRemaining} credits left
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Upload Area */}
        {!sourceImage ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-emerald-400'
            }`}
          >
            <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag & drop an image here, or
            </p>
            <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Choose File
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400 mt-3">
              Supports PNG, JPG, WEBP up to 12MB
            </p>
          </div>
        ) : (
          /* Image Comparison */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Original */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Original</p>
                <div className="aspect-square bg-[url('/checkerboard.svg')] bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
                  <img 
                    src={sourceImage} 
                    alt="Original" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Processed */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {isProcessing ? 'Processing...' : processedImage ? 'Background Removed' : 'Result'}
                </p>
                <div 
                  className="aspect-square rounded-xl overflow-hidden flex items-center justify-center relative"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                    backgroundColor: '#fff'
                  }}
                >
                  {isProcessing ? (
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Removing background...</p>
                    </div>
                  ) : processedImage ? (
                    <img 
                      src={processedImage} 
                      alt="Processed" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Wand2 className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">Click "Remove Background"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {processedImage && !error && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Background removed successfully!</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!processedImage ? (
                <button
                  onClick={removeBackground}
                  disabled={isProcessing || creditsRemaining <= 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Remove Background (1 credit)
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={downloadImage}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => onImageProcessed(processedImage)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
                  >
                    Use in Design
                  </button>
                </>
              )}
              
              <button
                onClick={reset}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 <strong>Tips:</strong> Works best with clear subjects, good lighting, and high contrast between subject and background. Human subjects, products, and animals work great!
          </p>
        </div>
      </div>
    </div>
  )
}
