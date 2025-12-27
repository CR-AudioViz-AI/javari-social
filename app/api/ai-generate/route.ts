/**
 * SOCIAL GRAPHICS CREATOR - AI IMAGE GENERATION API
 * Generate images using DALL-E 3 and Stable Diffusion
 * 
 * CR AudioViz AI - Fortune 50 Quality Standards
 * @version 2.0.0
 * @date December 27, 2025
 * 
 * Credits: 5 per AI image generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CREDIT_COST = 5;

// ============================================================================
// TYPES
// ============================================================================

interface GenerationRequest {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'minimalist' | '3d' | 'watercolor' | 'sketch';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'pinterest' | 'youtube';
  quality?: 'standard' | 'hd';
  negative_prompt?: string;
}

// Platform-specific sizes
const PLATFORM_SIZES: Record<string, { size: string; aspect: string }> = {
  instagram_post: { size: '1024x1024', aspect: '1:1' },
  instagram_story: { size: '1024x1792', aspect: '9:16' },
  facebook_post: { size: '1792x1024', aspect: '16:9' },
  facebook_cover: { size: '1792x1024', aspect: '16:9' },
  twitter_post: { size: '1792x1024', aspect: '16:9' },
  linkedin_post: { size: '1792x1024', aspect: '16:9' },
  pinterest: { size: '1024x1792', aspect: '2:3' },
  youtube_thumbnail: { size: '1792x1024', aspect: '16:9' },
};

// Style prompts to enhance generation
const STYLE_PROMPTS: Record<string, string> = {
  realistic: 'photorealistic, ultra detailed, professional photography, 8k resolution',
  artistic: 'artistic, creative, vibrant colors, expressive brush strokes, fine art style',
  cartoon: 'cartoon style, animated, bright colors, clean lines, fun and playful',
  minimalist: 'minimalist, clean, simple, modern, lots of white space, elegant',
  '3d': '3D render, CGI, octane render, highly detailed, volumetric lighting',
  watercolor: 'watercolor painting, soft colors, artistic, flowing textures, handpainted feel',
  sketch: 'pencil sketch, hand-drawn, artistic, detailed linework, illustration style',
};

// ============================================================================
// POST - Generate AI Image
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check credits
    const { data: creditData } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    const balance = creditData?.balance || 0;
    if (balance < CREDIT_COST) {
      return NextResponse.json({
        error: 'Insufficient credits',
        required: CREDIT_COST,
        available: balance
      }, { status: 402 });
    }

    const body: GenerationRequest = await request.json();
    const { prompt, style, size, platform, quality, negative_prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Build enhanced prompt
    let enhancedPrompt = prompt;
    
    if (style && STYLE_PROMPTS[style]) {
      enhancedPrompt += `, ${STYLE_PROMPTS[style]}`;
    }

    // Add quality enhancers
    enhancedPrompt += ', high quality, professional';

    // Handle negative prompt
    if (negative_prompt) {
      enhancedPrompt += `. Avoid: ${negative_prompt}`;
    }

    // Determine size
    let imageSize: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
    if (size) {
      imageSize = size;
    } else if (platform && PLATFORM_SIZES[platform]) {
      imageSize = PLATFORM_SIZES[platform].size as any;
    }

    // Generate image with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1,
      size: imageSize,
      quality: quality || 'standard',
      response_format: 'url',
    });

    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt;

    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }

    // Download and store in Supabase Storage
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    
    const fileName = `ai-generated/${user.id}/${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('graphics')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Continue with OpenAI URL if upload fails
    }

    const storedUrl = uploadData 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/graphics/${fileName}`
      : imageUrl;

    // Deduct credits
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: CREDIT_COST,
      p_reason: 'AI Image Generation'
    });

    // Log generation
    await supabase.from('ai_generations').insert({
      user_id: user.id,
      prompt,
      enhanced_prompt: enhancedPrompt,
      revised_prompt: revisedPrompt,
      style,
      size: imageSize,
      platform,
      image_url: storedUrl,
      credits_used: CREDIT_COST,
      model: 'dall-e-3',
    });

    return NextResponse.json({
      success: true,
      image_url: storedUrl,
      original_url: imageUrl,
      revised_prompt: revisedPrompt,
      size: imageSize,
      credits_used: CREDIT_COST,
      credits_remaining: balance - CREDIT_COST,
    });

  } catch (error: any) {
    console.error('AI generation error:', error);
    
    // Handle OpenAI specific errors
    if (error.code === 'content_policy_violation') {
      return NextResponse.json({
        error: 'Your prompt was rejected due to content policy. Please try a different prompt.',
        code: 'content_policy'
      }, { status: 400 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// GET - Get generation history and styles
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'history';

    if (action === 'styles') {
      return NextResponse.json({
        styles: Object.entries(STYLE_PROMPTS).map(([id, description]) => ({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          description: description.split(',')[0],
        })),
        platforms: Object.entries(PLATFORM_SIZES).map(([id, info]) => ({
          id,
          name: id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          ...info,
        })),
        credit_cost: CREDIT_COST,
      });
    }

    // Get generation history
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('ai_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      generations: data || [],
      total: data?.length || 0,
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
