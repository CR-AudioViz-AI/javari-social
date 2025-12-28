'use client'

import { useState, useEffect } from 'react'
import { 
  Palette, Type, Image as ImageIcon, Plus, Trash2, 
  Check, Edit2, Save, X, Star, StarOff, Upload,
  ChevronDown, ChevronRight, Loader2, Sparkles
} from 'lucide-react'

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
  logo_primary_url?: string
  logo_light_url?: string
  logo_dark_url?: string
  tagline?: string
  brand_voice?: string
}

const AVAILABLE_FONTS = [
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Roboto', category: 'sans-serif' },
  { name: 'Open Sans', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Poppins', category: 'sans-serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Merriweather', category: 'serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Georgia', category: 'serif' },
  { name: 'Bebas Neue', category: 'display' },
  { name: 'Oswald', category: 'display' },
  { name: 'Pacifico', category: 'handwriting' },
  { name: 'Dancing Script', category: 'handwriting' },
]

const DEFAULT_KIT: Omit<BrandKit, 'id'> = {
  name: 'New Brand Kit',
  is_default: false,
  primary_color: '#3B82F6',
  secondary_color: '#10B981',
  accent_color: '#F59E0B',
  background_color: '#FFFFFF',
  text_color: '#111827',
  additional_colors: [],
  heading_font: 'Montserrat',
  body_font: 'Inter',
  accent_font: 'Pacifico',
  tagline: '',
  brand_voice: '',
}

interface BrandKitManagerProps {
  onSelectKit: (kit: BrandKit) => void
  selectedKitId?: string
}

export default function BrandKitManager({ onSelectKit, selectedKitId }: BrandKitManagerProps) {
  const [brandKits, setBrandKits] = useState<BrandKit[]>([])
  const [editingKit, setEditingKit] = useState<BrandKit | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('colors')
  const [aiGenerating, setAiGenerating] = useState(false)

  useEffect(() => {
    loadBrandKits()
  }, [])

  const loadBrandKits = async () => {
    try {
      const response = await fetch('/api/brand-kit')
      if (response.ok) {
        const data = await response.json()
        setBrandKits(data.brand_kits || [])
      }
    } catch (error) {
      console.error('Failed to load brand kits:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveBrandKit = async (kit: BrandKit | Omit<BrandKit, 'id'>) => {
    setSaving(true)
    try {
      const method = 'id' in kit ? 'PUT' : 'POST'
      const response = await fetch('/api/brand-kit', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kit)
      })
      
      if (response.ok) {
        await loadBrandKits()
        setEditingKit(null)
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Failed to save brand kit:', error)
    } finally {
      setSaving(false)
    }
  }

  const deleteBrandKit = async (id: string) => {
    if (!confirm('Delete this brand kit?')) return
    
    try {
      await fetch(`/api/brand-kit?id=${id}`, { method: 'DELETE' })
      await loadBrandKits()
    } catch (error) {
      console.error('Failed to delete brand kit:', error)
    }
  }

  const setDefaultKit = async (kit: BrandKit) => {
    await saveBrandKit({ ...kit, is_default: true })
  }

  const generateAIColors = async () => {
    if (!editingKit) return
    setAiGenerating(true)
    
    try {
      // Generate complementary colors using AI
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_palette',
          base_color: editingKit.primary_color,
          style: 'modern'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setEditingKit({
          ...editingKit,
          secondary_color: data.secondary || editingKit.secondary_color,
          accent_color: data.accent || editingKit.accent_color,
          background_color: data.background || editingKit.background_color,
          text_color: data.text || editingKit.text_color,
        })
      }
    } catch (error) {
      console.error('Failed to generate colors:', error)
    } finally {
      setAiGenerating(false)
    }
  }

  const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0"
        />
        <input
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded font-mono"
        />
      </div>
    </div>
  )

  const Section = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {expandedSection === id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {expandedSection === id && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
          {children}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  // Editing/Creating Mode
  if (editingKit || isCreating) {
    const kit = editingKit || DEFAULT_KIT
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <input
            type="text"
            value={kit.name}
            onChange={(e) => editingKit 
              ? setEditingKit({ ...editingKit, name: e.target.value })
              : setIsCreating(true)
            }
            className="text-lg font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none"
            placeholder="Brand Kit Name"
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setEditingKit(null); setIsCreating(false) }}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => saveBrandKit(kit as any)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>

        <Section id="colors" title="Brand Colors" icon={Palette}>
          <ColorPicker 
            label="Primary" 
            value={kit.primary_color} 
            onChange={(v) => editingKit && setEditingKit({ ...editingKit, primary_color: v })} 
          />
          <ColorPicker 
            label="Secondary" 
            value={kit.secondary_color} 
            onChange={(v) => editingKit && setEditingKit({ ...editingKit, secondary_color: v })} 
          />
          <ColorPicker 
            label="Accent" 
            value={kit.accent_color} 
            onChange={(v) => editingKit && setEditingKit({ ...editingKit, accent_color: v })} 
          />
          <ColorPicker 
            label="Background" 
            value={kit.background_color} 
            onChange={(v) => editingKit && setEditingKit({ ...editingKit, background_color: v })} 
          />
          <ColorPicker 
            label="Text" 
            value={kit.text_color} 
            onChange={(v) => editingKit && setEditingKit({ ...editingKit, text_color: v })} 
          />
          
          <button
            onClick={generateAIColors}
            disabled={aiGenerating}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Complementary Colors
          </button>
        </Section>

        <Section id="typography" title="Typography" icon={Type}>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Heading Font</label>
              <select
                value={kit.heading_font}
                onChange={(e) => editingKit && setEditingKit({ ...editingKit, heading_font: e.target.value })}
                className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                {AVAILABLE_FONTS.map(font => (
                  <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-lg" style={{ fontFamily: kit.heading_font }}>
                The quick brown fox jumps
              </p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Body Font</label>
              <select
                value={kit.body_font}
                onChange={(e) => editingKit && setEditingKit({ ...editingKit, body_font: e.target.value })}
                className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                {AVAILABLE_FONTS.map(font => (
                  <option key={font.name} value={font.name}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm" style={{ fontFamily: kit.body_font }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </Section>

        <Section id="logos" title="Logos & Assets" icon={ImageIcon}>
          <div className="grid grid-cols-2 gap-4">
            {['Primary Logo', 'Light Version', 'Dark Version', 'Icon/Favicon'].map((label, i) => (
              <div key={i} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">{label}</p>
                <button className="mt-2 text-xs text-purple-500 hover:underline">
                  Upload
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section id="voice" title="Brand Voice" icon={Type}>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Tagline</label>
              <input
                type="text"
                value={kit.tagline || ''}
                onChange={(e) => editingKit && setEditingKit({ ...editingKit, tagline: e.target.value })}
                placeholder="Your Story. Our Design."
                className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Brand Voice Description</label>
              <textarea
                value={kit.brand_voice || ''}
                onChange={(e) => editingKit && setEditingKit({ ...editingKit, brand_voice: e.target.value })}
                placeholder="Describe your brand's tone: professional, friendly, bold, playful..."
                className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-lg h-24 resize-none"
              />
            </div>
          </div>
        </Section>
      </div>
    )
  }

  // List Mode
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Brand Kits</h3>
        <button
          onClick={() => { setIsCreating(true); setEditingKit({ ...DEFAULT_KIT, id: '' } as BrandKit) }}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          New Kit
        </button>
      </div>

      {brandKits.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
          <Palette className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No brand kits yet</p>
          <p className="text-sm text-gray-400 mt-1">Create one to keep your designs consistent</p>
        </div>
      ) : (
        <div className="space-y-2">
          {brandKits.map(kit => (
            <div
              key={kit.id}
              onClick={() => onSelectKit(kit)}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                selectedKitId === kit.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Color Preview */}
                  <div className="flex -space-x-1">
                    {[kit.primary_color, kit.secondary_color, kit.accent_color].map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{kit.name}</span>
                      {kit.is_default && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {kit.heading_font} / {kit.body_font}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  {!kit.is_default && (
                    <button
                      onClick={() => setDefaultKit(kit)}
                      className="p-1.5 text-gray-400 hover:text-yellow-500"
                      title="Set as default"
                    >
                      <StarOff className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingKit(kit)}
                    className="p-1.5 text-gray-400 hover:text-purple-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBrandKit(kit.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
