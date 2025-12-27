/**
 * SOCIAL GRAPHICS CREATOR - BRAND KIT API
 * Save and manage brand assets (colors, fonts, logos)
 * 
 * CR AudioViz AI - Fortune 50 Quality Standards
 * @version 2.0.0
 * @date December 27, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// TYPES
// ============================================================================

interface BrandKit {
  id?: string;
  user_id: string;
  name: string;
  is_default: boolean;
  
  // Colors
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  additional_colors?: string[];
  
  // Typography
  heading_font: string;
  body_font: string;
  accent_font?: string;
  
  // Logos
  logo_primary_url?: string;
  logo_light_url?: string;
  logo_dark_url?: string;
  logo_icon_url?: string;
  favicon_url?: string;
  
  // Brand assets
  patterns?: string[];
  icons?: string[];
  
  // Brand guidelines
  tagline?: string;
  brand_voice?: string;
  usage_notes?: string;
  
  created_at?: string;
  updated_at?: string;
}

// Default fonts available
const AVAILABLE_FONTS = [
  { name: 'Inter', category: 'sans-serif', google: true },
  { name: 'Roboto', category: 'sans-serif', google: true },
  { name: 'Open Sans', category: 'sans-serif', google: true },
  { name: 'Lato', category: 'sans-serif', google: true },
  { name: 'Montserrat', category: 'sans-serif', google: true },
  { name: 'Poppins', category: 'sans-serif', google: true },
  { name: 'Raleway', category: 'sans-serif', google: true },
  { name: 'Nunito', category: 'sans-serif', google: true },
  { name: 'Playfair Display', category: 'serif', google: true },
  { name: 'Merriweather', category: 'serif', google: true },
  { name: 'Lora', category: 'serif', google: true },
  { name: 'Georgia', category: 'serif', google: false },
  { name: 'Bebas Neue', category: 'display', google: true },
  { name: 'Oswald', category: 'display', google: true },
  { name: 'Pacifico', category: 'handwriting', google: true },
  { name: 'Dancing Script', category: 'handwriting', google: true },
  { name: 'Fira Code', category: 'monospace', google: true },
  { name: 'JetBrains Mono', category: 'monospace', google: true },
];

// ============================================================================
// GET - List brand kits or get single kit
// ============================================================================

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const kitId = searchParams.get('id');
    const action = searchParams.get('action');

    // Return available fonts
    if (action === 'fonts') {
      return NextResponse.json({ fonts: AVAILABLE_FONTS });
    }

    // Get single kit
    if (kitId) {
      const { data, error } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('id', kitId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Brand kit not found' }, { status: 404 });
      }

      return NextResponse.json({ brand_kit: data });
    }

    // List all kits
    const { data, error } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      brand_kits: data || [],
      total: data?.length || 0,
    });

  } catch (error: any) {
    console.error('Error fetching brand kits:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST - Create brand kit
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

    const body = await request.json();
    const { action } = body;

    // Handle logo upload
    if (action === 'upload_logo') {
      return await handleLogoUpload(request, user.id, body);
    }

    const {
      name,
      primary_color,
      secondary_color,
      accent_color,
      background_color,
      text_color,
      additional_colors,
      heading_font,
      body_font,
      accent_font,
      logo_primary_url,
      logo_light_url,
      logo_dark_url,
      logo_icon_url,
      tagline,
      brand_voice,
      usage_notes,
      is_default,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await supabase
        .from('brand_kits')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const brandKit: BrandKit = {
      user_id: user.id,
      name,
      is_default: is_default || false,
      primary_color: primary_color || '#3B82F6',
      secondary_color: secondary_color || '#1E40AF',
      accent_color: accent_color || '#F59E0B',
      background_color: background_color || '#FFFFFF',
      text_color: text_color || '#1F2937',
      additional_colors,
      heading_font: heading_font || 'Inter',
      body_font: body_font || 'Inter',
      accent_font,
      logo_primary_url,
      logo_light_url,
      logo_dark_url,
      logo_icon_url,
      tagline,
      brand_voice,
      usage_notes,
    };

    const { data, error } = await supabase
      .from('brand_kits')
      .insert(brandKit)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      brand_kit: data,
      message: 'Brand kit created',
    });

  } catch (error: any) {
    console.error('Error creating brand kit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// PATCH - Update brand kit
// ============================================================================

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Brand kit ID required' }, { status: 400 });
    }

    // If setting as default, unset other defaults
    if (updates.is_default) {
      await supabase
        .from('brand_kits')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('brand_kits')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      brand_kit: data,
      message: 'Brand kit updated',
    });

  } catch (error: any) {
    console.error('Error updating brand kit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Delete brand kit
// ============================================================================

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Brand kit ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('brand_kits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Brand kit deleted',
    });

  } catch (error: any) {
    console.error('Error deleting brand kit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// LOGO UPLOAD HANDLER
// ============================================================================

async function handleLogoUpload(request: NextRequest, userId: string, body: any) {
  const { kit_id, logo_type, file_data, file_name } = body;

  if (!kit_id || !logo_type || !file_data) {
    return NextResponse.json({
      error: 'kit_id, logo_type, and file_data required'
    }, { status: 400 });
  }

  const validTypes = ['primary', 'light', 'dark', 'icon', 'favicon'];
  if (!validTypes.includes(logo_type)) {
    return NextResponse.json({
      error: `Invalid logo_type. Must be one of: ${validTypes.join(', ')}`
    }, { status: 400 });
  }

  // Decode base64
  const base64Data = file_data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Upload to storage
  const fileName = `brand-kits/${userId}/${kit_id}/${logo_type}_${Date.now()}.png`;
  
  const { error: uploadError } = await supabase.storage
    .from('graphics')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const logoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/graphics/${fileName}`;

  // Update brand kit
  const updateField = `logo_${logo_type}_url`;
  const { error: updateError } = await supabase
    .from('brand_kits')
    .update({ [updateField]: logoUrl, updated_at: new Date().toISOString() })
    .eq('id', kit_id)
    .eq('user_id', userId);

  if (updateError) throw updateError;

  return NextResponse.json({
    success: true,
    logo_url: logoUrl,
    logo_type,
    message: `${logo_type} logo uploaded`,
  });
}
