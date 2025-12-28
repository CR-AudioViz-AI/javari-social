/**
 * SOCIAL GRAPHICS CREATOR - ENHANCED AI IMAGE GENERATION API
 * Multi-provider AI image generation with Stability AI (primary) + DALL-E (fallback)
 * 
 * CR AudioViz AI - Fortune 50 Quality Standards
 * @version 3.0.0
 * @date December 27, 2025
 * 
 * Providers:
 * - Stability AI (Primary): $0.002-0.02/image - 10x cheaper
 * - OpenAI DALL-E 3 (Fallback): $0.04-0.12/image
 * 
 * Credits: 3 per Stability AI generation, 8 per DALL-E generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Credit costs by provider
const CREDIT_COSTS = {
  stability: 3,
  dalle: 8,
  upscale: 2,
  remove_bg: 2
};

// ============================================================================
// TYPES
// ============================================================================

interface GenerationRequest {
  prompt: string;
  provider?: 'stability' | 'dalle' | 'auto';
  model?: string;
  style?: string;
  size?: string;
  platform?: string;
  aspect_ratio?: string;
  negative_prompt?: string;
  seed?: number;
  cfg_scale?: number;
  steps?: number;
}

interface UpscaleRequest {
  image: string; // base64
  scale?: number; // 2x or 4x
}

interface RemoveBackgroundRequest {
  image: string; // base64
}

// Platform-specific aspect ratios for Stability AI
const PLATFORM_ASPECTS: Record<string, string> = {
  'instagram-post': '1:1',
  'instagram-story': '9:16',
  'instagram-reel': '9:16',
  'facebook-post': '1:1',
  'facebook-cover': '16:9',
  'facebook-story': '9:16',
  'twitter-post': '16:9',
  'twitter-header': '3:1',
  'linkedin-post': '1:1',
  'linkedin-cover': '4:1',
  'pinterest-pin': '2:3',
  'youtube-thumbnail': '16:9',
  'tiktok': '9:16',
};

// Style presets for enhanced prompts
const STYLE_PRESETS: Record<string, { prompt_suffix: string; negative: string }> = {
  'photorealistic': {
    prompt_suffix: 'photorealistic, ultra high definition, professional photography, 8k resolution, sharp focus, natural lighting',
    negative: 'cartoon, illustration, painting, drawing, art, anime, cgi, 3d render, blurry, low quality'
  },
  'digital-art': {
    prompt_suffix: 'digital art, trending on artstation, highly detailed, vibrant colors, concept art, illustration',
    negative: 'photo, photograph, realistic, blurry, low quality, watermark'
  },
  'anime': {
    prompt_suffix: 'anime style, manga, Japanese animation, cel shaded, vibrant colors, detailed',
    negative: 'photo, realistic, western cartoon, 3d, blurry, low quality'
  },
  'watercolor': {
    prompt_suffix: 'watercolor painting, soft colors, artistic, flowing textures, handpainted, fine art',
    negative: 'photo, digital, sharp edges, vector, 3d render'
  },
  'oil-painting': {
    prompt_suffix: 'oil painting, classical art style, rich colors, visible brush strokes, museum quality, masterpiece',
    negative: 'photo, digital, flat colors, cartoon, anime'
  },
  '3d-render': {
    prompt_suffix: '3D render, octane render, unreal engine 5, highly detailed, volumetric lighting, ray tracing, CGI',
    negative: 'photo, 2d, flat, drawing, painting, sketch'
  },
  'minimalist': {
    prompt_suffix: 'minimalist design, clean, simple, modern, lots of white space, elegant, flat design',
    negative: 'complex, detailed, realistic, cluttered, busy, ornate'
  },
  'vintage': {
    prompt_suffix: 'vintage style, retro, nostalgic, aged, film grain, muted colors, classic',
    negative: 'modern, digital, bright colors, clean, sharp'
  },
  'neon': {
    prompt_suffix: 'neon lights, cyberpunk, glowing, vibrant colors, dark background, futuristic, synthwave',
    negative: 'natural lighting, daylight, muted colors, vintage, classic'
  },
  'sketch': {
    prompt_suffix: 'pencil sketch, hand-drawn, detailed linework, artistic, black and white, illustration',
    negative: 'color, photo, digital, 3d, painting'
  },
  'pop-art': {
    prompt_suffix: 'pop art style, bold colors, comic book, Andy Warhol inspired, halftone dots, graphic',
    negative: 'realistic, photo, muted colors, subtle, detailed'
  },
  'fantasy': {
    prompt_suffix: 'fantasy art, magical, ethereal, dramatic lighting, epic, detailed, imaginative',
    negative: 'realistic, mundane, boring, simple, minimalist'
  }
};

// ============================================================================
// STABILITY AI GENERATION
// ============================================================================

async function generateWithStability(
  prompt: string,
  options: {
    aspect_ratio?: string;
    negative_prompt?: string;
    style?: string;
    seed?: number;
    model?: string;
  }
): Promise<{ image: string; seed: number }> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  
  if (!STABILITY_API_KEY) {
    throw new Error('Stability AI API key not configured');
  }

  // Apply style preset
  let finalPrompt = prompt;
  let finalNegative = options.negative_prompt || '';
  
  if (options.style && STYLE_PRESETS[options.style]) {
    const preset = STYLE_PRESETS[options.style];
    finalPrompt = `${prompt}, ${preset.prompt_suffix}`;
    finalNegative = finalNegative ? `${finalNegative}, ${preset.negative}` : preset.negative;
  }

  // Default negative prompt for quality
  if (!finalNegative) {
    finalNegative = 'blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, signature, text';
  }

  // Use Stable Image Core for best quality/speed balance
  const model = options.model || 'stable-image-core';
  
  const formData = new FormData();
  formData.append('prompt', finalPrompt);
  formData.append('negative_prompt', finalNegative);
  formData.append('aspect_ratio', options.aspect_ratio || '1:1');
  formData.append('output_format', 'png');
  
  if (options.seed) {
    formData.append('seed', options.seed.toString());
  }

  const response = await fetch(
    `https://api.stability.ai/v2beta/stable-image/generate/core`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'image/*'
      },
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Stability AI error:', error);
    throw new Error(`Stability AI error: ${response.status}`);
  }

  // Get image as base64
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const seed = parseInt(response.headers.get('x-seed') || '0');

  return {
    image: `data:image/png;base64,${base64}`,
    seed
  };
}

// ============================================================================
// DALL-E GENERATION (Fallback)
// ============================================================================

async function generateWithDalle(
  prompt: string,
  options: {
    size?: string;
    quality?: string;
    style?: string;
  }
): Promise<{ image: string }> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Apply style to prompt
  let finalPrompt = prompt;
  if (options.style && STYLE_PRESETS[options.style]) {
    finalPrompt = `${prompt}, ${STYLE_PRESETS[options.style].prompt_suffix}`;
  }

  // Map sizes to DALL-E supported sizes
  const sizeMap: Record<string, string> = {
    '1:1': '1024x1024',
    '16:9': '1792x1024',
    '9:16': '1024x1792',
  };

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: sizeMap[options.size || '1:1'] || '1024x1024',
      quality: options.quality || 'standard',
      response_format: 'b64_json'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'DALL-E generation failed');
  }

  const data = await response.json();
  return {
    image: `data:image/png;base64,${data.data[0].b64_json}`
  };
}

// ============================================================================
// IMAGE UPSCALING (Stability AI)
// ============================================================================

async function upscaleImage(
  imageBase64: string,
  scale: number = 2
): Promise<{ image: string }> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  
  if (!STABILITY_API_KEY) {
    throw new Error('Stability AI API key not configured');
  }

  // Convert base64 to buffer
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const blob = new Blob([imageBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append('image', blob, 'image.png');
  formData.append('output_format', 'png');

  // Use conservative upscale for best quality
  const endpoint = scale >= 4 
    ? 'https://api.stability.ai/v2beta/stable-image/upscale/creative'
    : 'https://api.stability.ai/v2beta/stable-image/upscale/conservative';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STABILITY_API_KEY}`,
      'Accept': 'image/*'
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upscale failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return {
    image: `data:image/png;base64,${base64}`
  };
}

// ============================================================================
// BACKGROUND REMOVAL (Stability AI)
// ============================================================================

async function removeBackground(imageBase64: string): Promise<{ image: string }> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  
  if (!STABILITY_API_KEY) {
    throw new Error('Stability AI API key not configured');
  }

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const blob = new Blob([imageBuffer], { type: 'image/png' });

  const formData = new FormData();
  formData.append('image', blob, 'image.png');
  formData.append('output_format', 'png');

  const response = await fetch(
    'https://api.stability.ai/v2beta/stable-image/edit/remove-background',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'image/*'
      },
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error(`Background removal failed: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  return {
    image: `data:image/png;base64,${base64}`
  };
}

// ============================================================================
// CREDIT CHECK & DEDUCTION
// ============================================================================

async function checkAndDeductCredits(userId: string, cost: number): Promise<boolean> {
  // Get current balance
  const { data: balance } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single();

  const currentBalance = balance?.balance || 0;
  
  if (currentBalance < cost) {
    return false;
  }

  // Deduct credits
  await supabase
    .from('credits')
    .update({ 
      balance: currentBalance - cost,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  // Log transaction
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: -cost,
      type: 'debit',
      description: 'AI Image Generation',
      created_at: new Date().toISOString()
    });

  return true;
}

// ============================================================================
// POST - Main Generation Endpoint
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'generate' } = body;

    // Route to appropriate handler
    switch (action) {
      case 'generate': {
        const { 
          prompt, 
          provider = 'auto',
          style,
          platform,
          aspect_ratio,
          negative_prompt,
          seed
        } = body as GenerationRequest;

        if (!prompt) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Determine provider (prefer Stability for cost savings)
        const useProvider = provider === 'auto' ? 'stability' : provider;
        const creditCost = CREDIT_COSTS[useProvider as keyof typeof CREDIT_COSTS] || 3;

        // Check credits
        const hasCredits = await checkAndDeductCredits(user.id, creditCost);
        if (!hasCredits) {
          return NextResponse.json({ 
            error: 'Insufficient credits',
            required: creditCost
          }, { status: 402 });
        }

        // Get aspect ratio from platform if not specified
        const finalAspect = aspect_ratio || (platform ? PLATFORM_ASPECTS[platform] : '1:1');

        try {
          let result;
          
          if (useProvider === 'stability') {
            result = await generateWithStability(prompt, {
              aspect_ratio: finalAspect,
              negative_prompt,
              style,
              seed
            });
          } else {
            result = await generateWithDalle(prompt, {
              size: finalAspect,
              style
            });
          }

          return NextResponse.json({
            success: true,
            image: result.image,
            seed: (result as any).seed,
            provider: useProvider,
            credits_used: creditCost
          });

        } catch (genError: any) {
          // If Stability fails, try DALL-E as fallback
          if (useProvider === 'stability' && provider === 'auto') {
            console.log('Stability AI failed, falling back to DALL-E');
            const result = await generateWithDalle(prompt, { style });
            return NextResponse.json({
              success: true,
              image: result.image,
              provider: 'dalle',
              fallback: true,
              credits_used: creditCost
            });
          }
          throw genError;
        }
      }

      case 'upscale': {
        const { image, scale = 2 } = body as UpscaleRequest;
        
        if (!image) {
          return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const hasCredits = await checkAndDeductCredits(user.id, CREDIT_COSTS.upscale);
        if (!hasCredits) {
          return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }

        const result = await upscaleImage(image, scale);
        return NextResponse.json({
          success: true,
          image: result.image,
          credits_used: CREDIT_COSTS.upscale
        });
      }

      case 'remove-background': {
        const { image } = body as RemoveBackgroundRequest;
        
        if (!image) {
          return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const hasCredits = await checkAndDeductCredits(user.id, CREDIT_COSTS.remove_bg);
        if (!hasCredits) {
          return NextResponse.json({ error: 'Insufficient credits' }, { status: 402 });
        }

        const result = await removeBackground(image);
        return NextResponse.json({
          success: true,
          image: result.image,
          credits_used: CREDIT_COSTS.remove_bg
        });
      }

      case 'styles': {
        // Return available styles
        return NextResponse.json({
          styles: Object.keys(STYLE_PRESETS).map(key => ({
            id: key,
            name: key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            preview: STYLE_PRESETS[key].prompt_suffix.substring(0, 50) + '...'
          })),
          platforms: Object.keys(PLATFORM_ASPECTS).map(key => ({
            id: key,
            aspect_ratio: PLATFORM_ASPECTS[key]
          }))
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Get available styles and platforms
// ============================================================================

export async function GET() {
  return NextResponse.json({
    providers: ['stability', 'dalle'],
    default_provider: 'stability',
    styles: Object.keys(STYLE_PRESETS),
    platforms: PLATFORM_ASPECTS,
    credits: CREDIT_COSTS
  });
}
