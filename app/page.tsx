'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Image as ImageIcon, Type, Square, Circle, Download, Save, Palette,
  Upload, Layers, Trash2, Copy, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, ZoomIn, ZoomOut, Eye, Grid
} from 'lucide-react'
import { PLATFORM_SIZES, CanvasElement, TextElement, ImageElement, ShapeElement, SocialPlatform, Template } from '@/types/graphics'
import { TEMPLATE_LIBRARY, getTemplatesByPlatform } from '@/lib/templates'
import { supabase } from '@/lib/supabase'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'

export default function GraphicsCreator() {
  // State management
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('instagram-post')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [background, setBackground] = useState<Template['background']>({
    type: 'color',
    value: '#FFFFFF'
  })
  const [designName, setDesignName] = useState('Untitled Design')
  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'shape'>('select')
  const [zoom, setZoom] = useState(1)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get current platform dimensions
  const currentSize = PLATFORM_SIZES[selectedPlatform]

  // Load template when selected
  useEffect(() => {
    if (selectedTemplate) {
      setElements([...selectedTemplate.elements])
      setBackground(selectedTemplate.background)
      setDesignName(selectedTemplate.name)
    }
  }, [selectedTemplate])

  // Handle platform change
  function handlePlatformChange(platform: SocialPlatform) {
    setSelectedPlatform(platform)
    setSelectedTemplate(null)
    setElements([])
    setBackground({ type: 'color', value: '#FFFFFF' })
  }

  // Add text element
  function addText() {
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Double click to edit',
      x: currentSize.width / 2,
      y: currentSize.height / 2,
      fontSize: 48,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      color: '#000000',
      align: 'center'
    }
    setElements([...elements, newText])
    setSelectedElement(newText.id)
    setTool('select')
  }

  // Add image
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const newImage: ImageElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          src: event.target?.result as string,
          x: currentSize.width / 2,
          y: currentSize.height / 2,
          width: Math.min(img.width, currentSize.width * 0.8),
          height: Math.min(img.height, currentSize.height * 0.8),
          opacity: 1
        }
        setElements([...elements, newImage])
        setSelectedElement(newImage.id)
        setTool('select')
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  // Add shape
  function addShape(shapeType: 'rectangle' | 'circle') {
    const newShape: ShapeElement = {
      id: `shape-${Date.now()}`,
      type: shapeType,
      x: currentSize.width / 2,
      y: currentSize.height / 2,
      width: 200,
      height: 200,
      fill: '#00CED1',
      opacity: 1
    }
    setElements([...elements, newShape])
    setSelectedElement(newShape.id)
    setTool('select')
  }

  // Update element
  function updateElement(id: string, updates: Partial<CanvasElement>) {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ))
  }

  // Delete element
  function deleteElement(id: string) {
    setElements(elements.filter(el => el.id !== id))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  // Duplicate element
  function duplicateElement(id: string) {
    const element = elements.find(el => el.id === id)
    if (!element) return

    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      x: element.x + 20,
      y: element.y + 20
    }
    setElements([...elements, newElement])
    setSelectedElement(newElement.id)
  }

  // Move element up/down in layers
  function moveLayer(id: string, direction: 'up' | 'down') {
    const index = elements.findIndex(el => el.id === id)
    if (index === -1) return

    const newElements = [...elements]
    if (direction === 'up' && index < elements.length - 1) {
      [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]]
    } else if (direction === 'down' && index > 0) {
      [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]]
    }
    setElements(newElements)
  }

  // Export as image
  async function exportImage(format: 'png' | 'jpg' = 'png') {
    if (!canvasRef.current) return

    try {
      const dataUrl = await toPng(canvasRef.current, {
        quality: 1,
        pixelRatio: 2,
        width: currentSize.width,
        height: currentSize.height
      })

      const blob = await (await fetch(dataUrl)).blob()
      saveAs(blob, `${designName.replace(/\s+/g, '-').toLowerCase()}.${format}`)

      setMessage({ type: 'success', text: `Exported as ${format.toUpperCase()}!` })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Export failed. Please try again.' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  // Save design to database
  async function saveDesign() {
    setSaving(true)
    try {
      // Deduct credits (15 credits per save)
      const creditCost = 15

      const designData = {
        name: designName,
        platform: selectedPlatform,
        elements: JSON.stringify(elements),
        background: JSON.stringify(background),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('designs')
        .insert([designData])

      if (error) throw error

      setMessage({ type: 'success', text: 'Design saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save design' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  // Get selected element
  const selectedEl = selectedElement ? elements.find(el => el.id === selectedElement) : null

  // Render background
  function renderBackground() {
    if (background.type === 'color') {
      return { backgroundColor: background.value as string }
    } else if (background.type === 'gradient' && typeof background.value === 'object') {
      const grad = background.value as { start: string; end: string; direction: string }
      return { 
        backgroundImage: `linear-gradient(${grad.direction}, ${grad.start}, ${grad.end})`
      }
    }
    return {}
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary rounded-lg">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="text-xl font-bold text-gray-900 border-none outline-none focus:ring-2 focus:ring-primary rounded px-2"
              />
              <p className="text-sm text-gray-600">{currentSize.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => exportImage('png')} className="btn-outline flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export PNG
            </button>
            <button 
              onClick={saveDesign}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save (15 credits)'}
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Platform & Templates */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            {/* Platform Selection */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Platform</h3>
              <select
                value={selectedPlatform}
                onChange={(e) => handlePlatformChange(e.target.value as SocialPlatform)}
                className="input-field"
              >
                <optgroup label="Instagram">
                  <option value="instagram-post">Instagram Post (1:1)</option>
                  <option value="instagram-story">Instagram Story (9:16)</option>
                  <option value="instagram-reel">Instagram Reel (9:16)</option>
                </optgroup>
                <optgroup label="Facebook">
                  <option value="facebook-post">Facebook Post</option>
                  <option value="facebook-cover">Facebook Cover</option>
                </optgroup>
                <optgroup label="Twitter">
                  <option value="twitter-post">Twitter Post</option>
                  <option value="twitter-header">Twitter Header</option>
                </optgroup>
                <optgroup label="LinkedIn">
                  <option value="linkedin-post">LinkedIn Post</option>
                  <option value="linkedin-cover">LinkedIn Cover</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="youtube-thumbnail">YouTube Thumbnail</option>
                  <option value="pinterest-pin">Pinterest Pin</option>
                </optgroup>
              </select>
            </div>

            {/* Templates */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Templates</h3>
              <div className="grid grid-cols-2 gap-3">
                {getTemplatesByPlatform(selectedPlatform).map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`aspect-square rounded-lg border-2 transition-all ${
                      selectedTemplate?.id === template.id
                        ? 'border-primary shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      ...(template.background.type === 'color' 
                        ? { backgroundColor: template.background.value as string }
                        : { 
                            backgroundImage: `linear-gradient(135deg, ${
                              (template.background.value as any).start
                            }, ${(template.background.value as any).end})`
                          }
                      )
                    }}
                  >
                    <div className="p-2 text-center">
                      <p className="text-xs font-semibold text-white drop-shadow-lg">
                        {template.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-8 overflow-auto">
          <div 
            ref={canvasRef}
            className="canvas-container relative"
            style={{
              width: currentSize.width,
              height: currentSize.height,
              transform: `scale(${zoom})`,
              transformOrigin: 'center',
              ...renderBackground()
            }}
          >
            {/* Render elements */}
            {elements.map(element => {
              if (element.type === 'text') {
                const textEl = element as TextElement
                return (
                  <div
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    onDoubleClick={() => {
                      const newContent = prompt('Edit text:', textEl.content)
                      if (newContent) updateElement(element.id, { content: newContent })
                    }}
                    className={`absolute cursor-move ${
                      selectedElement === element.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      left: textEl.x,
                      top: textEl.y,
                      transform: 'translate(-50%, -50%)',
                      fontSize: textEl.fontSize,
                      fontFamily: textEl.fontFamily,
                      fontWeight: textEl.fontWeight,
                      color: textEl.color,
                      textAlign: textEl.align,
                      maxWidth: textEl.maxWidth,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word'
                    }}
                  >
                    {textEl.content}
                  </div>
                )
              }

              if (element.type === 'image') {
                const imgEl = element as ImageElement
                return (
                  <img
                    key={element.id}
                    src={imgEl.src}
                    onClick={() => setSelectedElement(element.id)}
                    className={`absolute cursor-move ${
                      selectedElement === element.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      left: imgEl.x,
                      top: imgEl.y,
                      width: imgEl.width,
                      height: imgEl.height,
                      transform: 'translate(-50%, -50%)',
                      opacity: imgEl.opacity
                    }}
                    alt="User uploaded"
                  />
                )
              }

              if (element.type === 'rectangle' || element.type === 'circle') {
                const shapeEl = element as ShapeElement
                return (
                  <div
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    className={`absolute cursor-move ${
                      selectedElement === element.id ? 'ring-2 ring-primary' : ''
                    }`}
                    style={{
                      left: shapeEl.x,
                      top: shapeEl.y,
                      width: shapeEl.width,
                      height: shapeEl.height,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: shapeEl.fill,
                      opacity: shapeEl.opacity,
                      borderRadius: element.type === 'circle' ? '50%' : '0'
                    }}
                  />
                )
              }

              return null
            })}
          </div>

          {/* Zoom controls */}
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
              className="tool-btn"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="tool-btn"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </main>

        {/* Right Sidebar - Tools & Properties */}
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            {/* Tools */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={addText}
                  className="tool-btn flex-col gap-1"
                >
                  <Type className="w-6 h-6" />
                  <span className="text-xs">Text</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="tool-btn flex-col gap-1"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-xs">Image</span>
                </button>

                <button
                  onClick={() => addShape('rectangle')}
                  className="tool-btn flex-col gap-1"
                >
                  <Square className="w-6 h-6" />
                  <span className="text-xs">Rectangle</span>
                </button>

                <button
                  onClick={() => addShape('circle')}
                  className="tool-btn flex-col gap-1"
                >
                  <Circle className="w-6 h-6" />
                  <span className="text-xs">Circle</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Element Properties */}
            {selectedEl && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Properties</h3>
                
                {/* Common actions */}
                <div className="space-y-2 mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => duplicateElement(selectedEl.id)}
                      className="flex-1 btn-outline flex items-center justify-center gap-2 py-2"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => deleteElement(selectedEl.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => moveLayer(selectedEl.id, 'up')}
                      className="flex-1 tool-btn"
                    >
                      ↑ Forward
                    </button>
                    <button
                      onClick={() => moveLayer(selectedEl.id, 'down')}
                      className="flex-1 tool-btn"
                    >
                      ↓ Back
                    </button>
                  </div>
                </div>

                {/* Text properties */}
                {selectedEl.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size
                      </label>
                      <input
                        type="number"
                        value={(selectedEl as TextElement).fontSize}
                        onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                        className="input-field"
                        min="8"
                        max="200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Weight
                      </label>
                      <select
                        value={(selectedEl as TextElement).fontWeight}
                        onChange={(e) => updateElement(selectedEl.id, { fontWeight: e.target.value })}
                        className="input-field"
                      >
                        <option value="normal">Normal</option>
                        <option value="600">Semi Bold</option>
                        <option value="bold">Bold</option>
                        <option value="800">Extra Bold</option>
                        <option value="900">Black</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <input
                        type="color"
                        value={(selectedEl as TextElement).color}
                        onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alignment
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateElement(selectedEl.id, { align: 'left' })}
                          className={
                            (selectedEl as TextElement).align === 'left'
                              ? 'tool-btn-active flex-1'
                              : 'tool-btn flex-1'
                          }
                        >
                          <AlignLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateElement(selectedEl.id, { align: 'center' })}
                          className={
                            (selectedEl as TextElement).align === 'center'
                              ? 'tool-btn-active flex-1'
                              : 'tool-btn flex-1'
                          }
                        >
                          <AlignCenter className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateElement(selectedEl.id, { align: 'right' })}
                          className={
                            (selectedEl as TextElement).align === 'right'
                              ? 'tool-btn-active flex-1'
                              : 'tool-btn flex-1'
                          }
                        >
                          <AlignRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image properties */}
                {selectedEl.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opacity
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={(selectedEl as ImageElement).opacity}
                        onChange={(e) => updateElement(selectedEl.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600 mt-1">
                        {Math.round((selectedEl as ImageElement).opacity * 100)}%
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        value={(selectedEl as ImageElement).width}
                        onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                        className="input-field"
                        min="50"
                        max={currentSize.width}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        value={(selectedEl as ImageElement).height}
                        onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                        className="input-field"
                        min="50"
                        max={currentSize.height}
                      />
                    </div>
                  </div>
                )}

                {/* Shape properties */}
                {(selectedEl.type === 'rectangle' || selectedEl.type === 'circle') && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fill Color
                      </label>
                      <input
                        type="color"
                        value={(selectedEl as ShapeElement).fill}
                        onChange={(e) => updateElement(selectedEl.id, { fill: e.target.value })}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opacity
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={(selectedEl as ShapeElement).opacity}
                        onChange={(e) => updateElement(selectedEl.id, { opacity: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600 mt-1">
                        {Math.round((selectedEl as ShapeElement).opacity * 100)}%
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        value={(selectedEl as ShapeElement).width}
                        onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                        className="input-field"
                        min="10"
                        max={currentSize.width}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        value={(selectedEl as ShapeElement).height}
                        onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                        className="input-field"
                        min="10"
                        max={currentSize.height}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Background Settings */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Background</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={background.type}
                    onChange={(e) => {
                      if (e.target.value === 'color') {
                        setBackground({ type: 'color', value: '#FFFFFF' })
                      } else {
                        setBackground({
                          type: 'gradient',
                          value: { start: '#667eea', end: '#764ba2', direction: '135deg' }
                        })
                      }
                    }}
                    className="input-field"
                  >
                    <option value="color">Solid Color</option>
                    <option value="gradient">Gradient</option>
                  </select>
                </div>

                {background.type === 'color' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={background.value as string}
                      onChange={(e) => setBackground({ type: 'color', value: e.target.value })}
                      className="w-full h-12 rounded-lg cursor-pointer"
                    />
                  </div>
                )}

                {background.type === 'gradient' && typeof background.value === 'object' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Color
                      </label>
                      <input
                        type="color"
                        value={(background.value as any).start}
                        onChange={(e) => setBackground({
                          type: 'gradient',
                          value: { ...(background.value as any), start: e.target.value }
                        })}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Color
                      </label>
                      <input
                        type="color"
                        value={(background.value as any).end}
                        onChange={(e) => setBackground({
                          type: 'gradient',
                          value: { ...(background.value as any), end: e.target.value }
                        })}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Layers */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Layers</h3>
              <div className="space-y-2">
                {elements.slice().reverse().map((element, index) => (
                  <button
                    key={element.id}
                    onClick={() => setSelectedElement(element.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedElement === element.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {element.type === 'text' && <Type className="w-4 h-4" />}
                      {element.type === 'image' && <ImageIcon className="w-4 h-4" />}
                      {(element.type === 'rectangle' || element.type === 'circle') && <Square className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {element.type.charAt(0).toUpperCase() + element.type.slice(1)} {elements.length - index}
                      </span>
                    </div>
                  </button>
                ))}
                {elements.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No elements yet. Add text, images, or shapes to get started!
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
