/**
 * AI IMAGE GENERATOR COMPONENT
 * Integrated AI image generation panel for Social Graphics Creator
 * 
 * Features:
 * - Text-to-image with Stability AI / DALL-E
 * - Style presets (12 options)
 * - Platform-optimized aspect ratios
 * - Image upscaling
 * - Background removal
 * 
 * @version 1.0.0
 * @date December 27, 2025
 */

'use client';

import { useState } from 'react';
import { 
  Sparkles, Wand2, Image, Loader2, Download, Plus,
  ZoomIn, Scissors, RefreshCw, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle, CreditCard
} from 'lucide-react';

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  currentPlatform?: string;
  authToken?: string;
}

const STYLE_OPTIONS = [
  { id: 'photorealistic', name: 'Photorealistic', emoji: '📷', description: 'Ultra-realistic photography style' },
  { id: 'digital-art', name: 'Digital Art', emoji: '🎨', description: 'Trending artistic style' },
  { id: 'anime', name: 'Anime', emoji: '🎌', description: 'Japanese animation style' },
  { id: 'watercolor', name: 'Watercolor', emoji: '💧', description: 'Soft, flowing paint style' },
  { id: 'oil-painting', name: 'Oil Painting', emoji: '🖼️', description: 'Classical fine art style' },
  { id: '3d-render', name: '3D Render', emoji: '🎮', description: 'CGI and game-ready style' },
  { id: 'minimalist', name: 'Minimalist', emoji: '⬜', description: 'Clean and simple design' },
  { id: 'vintage', name: 'Vintage', emoji: '📻', description: 'Retro nostalgic style' },
  { id: 'neon', name: 'Neon/Cyberpunk', emoji: '🌃', description: 'Glowing futuristic style' },
  { id: 'sketch', name: 'Sketch', emoji: '✏️', description: 'Hand-drawn pencil style' },
  { id: 'pop-art', name: 'Pop Art', emoji: '🎪', description: 'Bold comic book style' },
  { id: 'fantasy', name: 'Fantasy', emoji: '🧙', description: 'Magical and ethereal style' },
];

const PLATFORM_ASPECTS = [
  { id: 'instagram-post', name: 'Instagram Post', aspect: '1:1' },
  { id: 'instagram-story', name: 'Instagram Story', aspect: '9:16' },
  { id: 'facebook-post', name: 'Facebook Post', aspect: '1:1' },
  { id: 'facebook-cover', name: 'Facebook Cover', aspect: '16:9' },
  { id: 'twitter-post', name: 'Twitter/X Post', aspect: '16:9' },
  { id: 'linkedin-post', name: 'LinkedIn Post', aspect: '1:1' },
  { id: 'pinterest-pin', name: 'Pinterest Pin', aspect: '2:3' },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', aspect: '16:9' },
  { id: 'tiktok', name: 'TikTok', aspect: '9:16' },
];

export default function AIImageGenerator({ 
  onImageGenerated, 
  currentPlatform,
  authToken 
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [selectedPlatform, setSelectedPlatform] = useState(currentPlatform || 'instagram-post');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [upscaling, setUpscaling] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsUsed, setCreditsUsed] = useState(0);

  // Prompt suggestions
  const promptSuggestions = [
    'A serene mountain landscape at golden hour',
    'Professional business team collaborating',
    'Delicious gourmet food photography',
    'Modern minimalist product showcase',
    'Vibrant abstract background pattern',
    'Cozy coffee shop interior',
    'Fitness motivation workout scene',
    'Tropical beach paradise sunset',
  ];

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          action: 'generate',
          prompt: prompt.trim(),
          style: selectedStyle,
          platform: selectedPlatform,
          negative_prompt: negativePrompt.trim() || undefined,
          provider: 'auto'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedImage(data.image);
      setCreditsUsed(data.credits_used || 3);

    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setGenerating(false);
    }
  }

  async function handleUpscale() {
    if (!generatedImage) return;

    setUpscaling(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          action: 'upscale',
          image: generatedImage,
          scale: 2
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upscale failed');
      }

      setGeneratedImage(data.image);
      setCreditsUsed(prev => prev + (data.credits_used || 2));

    } catch (err: any) {
      setError(err.message || 'Failed to upscale image');
    } finally {
      setUpscaling(false);
    }
  }

  async function handleRemoveBackground() {
    if (!generatedImage) return;

    setRemovingBg(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken || localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify({
          action: 'remove-background',
          image: generatedImage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Background removal failed');
      }

      setGeneratedImage(data.image);
      setCreditsUsed(prev => prev + (data.credits_used || 2));

    } catch (err: any) {
      setError(err.message || 'Failed to remove background');
    } finally {
      setRemovingBg(false);
    }
  }

  function handleAddToCanvas() {
    if (generatedImage) {
      onImageGenerated(generatedImage);
    }
  }

  function handleDownload() {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    link.click();
  }

  function handleSuggestionClick(suggestion: string) {
    setPrompt(suggestion);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">AI Image Generator</h3>
          <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
            Powered by Stability AI
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your image
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A professional business team working in a modern office with natural lighting..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
          />
          
          {/* Quick Suggestions */}
          <div className="mt-2 flex flex-wrap gap-2">
            {promptSuggestions.slice(0, 4).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-full transition-colors truncate max-w-[200px]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {STYLE_OPTIONS.slice(0, 6).map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-2 rounded-lg border-2 transition-all text-center ${
                  selectedStyle === style.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <span className="text-lg">{style.emoji}</span>
                <span className="block text-xs mt-1 font-medium truncate">{style.name}</span>
              </button>
            ))}
          </div>
          
          {/* More Styles Dropdown */}
          <details className="mt-2">
            <summary className="text-xs text-purple-600 cursor-pointer hover:text-purple-800">
              More styles...
            </summary>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {STYLE_OPTIONS.slice(6).map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-2 rounded-lg border-2 transition-all text-center ${
                    selectedStyle === style.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-lg">{style.emoji}</span>
                  <span className="block text-xs mt-1 font-medium truncate">{style.name}</span>
                </button>
              ))}
            </div>
          </details>
        </div>

        {/* Platform / Aspect Ratio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Size / Platform
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
          >
            {PLATFORM_ASPECTS.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name} ({platform.aspect})
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Options
          </button>
          
          {showAdvanced && (
            <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Negative Prompt (what to avoid)
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="blurry, low quality, watermark..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Image
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500">
          <CreditCard className="w-3 h-3 inline mr-1" />
          3 credits per generation
        </p>

        {/* Generated Image Preview */}
        {generatedImage && (
          <div className="border-t pt-4 mt-4">
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full h-auto"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={handleAddToCanvas}
                  className="p-2 bg-white rounded-lg text-gray-800 hover:bg-purple-100 transition-colors"
                  title="Add to Canvas"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 bg-white rounded-lg text-gray-800 hover:bg-purple-100 transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddToCanvas}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-1 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add to Canvas
              </button>
              <button
                onClick={handleUpscale}
                disabled={upscaling}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50"
                title="Upscale 2x"
              >
                {upscaling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ZoomIn className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRemoveBackground}
                disabled={removingBg}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50"
                title="Remove Background"
              >
                {removingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {creditsUsed > 0 && (
              <p className="text-xs text-center text-gray-500 mt-2">
                <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />
                {creditsUsed} credits used this session
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
