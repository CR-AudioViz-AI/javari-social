/**
 * SOCIAL GRAPHICS CREATOR - TEMPLATE MARKETPLACE API
 * Share, sell, and discover user-created templates
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

interface MarketplaceTemplate {
  id?: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail_url: string;
  preview_urls?: string[];
  template_data: any;
  
  // Pricing
  price_type: 'free' | 'credits' | 'premium';
  price_credits?: number;
  
  // Stats
  downloads: number;
  likes: number;
  rating: number;
  rating_count: number;
  
  // Status
  status: 'draft' | 'pending' | 'published' | 'rejected';
  featured: boolean;
  
  // Platforms
  platforms: string[];
  
  created_at?: string;
  updated_at?: string;
}

const CATEGORIES = [
  { id: 'social', name: 'Social Media', icon: '📱' },
  { id: 'marketing', name: 'Marketing', icon: '📣' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'event', name: 'Events', icon: '🎉' },
  { id: 'holiday', name: 'Holidays', icon: '🎄' },
  { id: 'sale', name: 'Sales & Promos', icon: '🏷️' },
  { id: 'quote', name: 'Quotes', icon: '💬' },
  { id: 'announcement', name: 'Announcements', icon: '📢' },
  { id: 'infographic', name: 'Infographics', icon: '📊' },
  { id: 'other', name: 'Other', icon: '📁' },
];

// ============================================================================
// GET - Browse marketplace
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'browse';
    const category = searchParams.get('category');
    const platform = searchParams.get('platform');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular'; // popular, new, top-rated
    const priceType = searchParams.get('price_type');
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Return categories
    if (action === 'categories') {
      return NextResponse.json({ categories: CATEGORIES });
    }

    // Get user's own templates
    if (action === 'my-templates') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const { data, error } = await supabase
        .from('marketplace_templates')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        templates: data || [],
        total: data?.length || 0,
      });
    }

    // Get single template
    const templateId = searchParams.get('id');
    if (templateId) {
      const { data, error } = await supabase
        .from('marketplace_templates')
        .select(`
          *,
          creator:users(id, full_name, avatar_url)
        `)
        .eq('id', templateId)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      // Increment view count
      await supabase.rpc('increment_template_views', { template_id: templateId });

      return NextResponse.json({ template: data });
    }

    // Browse marketplace
    let query = supabase
      .from('marketplace_templates')
      .select(`
        id, title, description, category, tags, thumbnail_url,
        price_type, price_credits, downloads, likes, rating, rating_count,
        platforms, featured, created_at,
        creator:users(id, full_name, avatar_url)
      `, { count: 'exact' })
      .eq('status', 'published');

    if (category) {
      query = query.eq('category', category);
    }
    if (platform) {
      query = query.contains('platforms', [platform]);
    }
    if (priceType) {
      query = query.eq('price_type', priceType);
    }
    if (featured) {
      query = query.eq('featured', true);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    // Sorting
    switch (sort) {
      case 'new':
        query = query.order('created_at', { ascending: false });
        break;
      case 'top-rated':
        query = query.order('rating', { ascending: false });
        break;
      case 'popular':
      default:
        query = query.order('downloads', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      templates: data || [],
      total: count || 0,
      offset,
      limit,
      has_more: (count || 0) > offset + limit,
    });

  } catch (error: any) {
    console.error('Marketplace error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST - Create or purchase template
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

    switch (action) {
      case 'create':
        return await createTemplate(user.id, body);
      case 'purchase':
        return await purchaseTemplate(user.id, body);
      case 'like':
        return await likeTemplate(user.id, body);
      case 'rate':
        return await rateTemplate(user.id, body);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Marketplace POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// CREATE TEMPLATE
// ============================================================================

async function createTemplate(userId: string, body: any) {
  const {
    title,
    description,
    category,
    tags,
    thumbnail_url,
    preview_urls,
    template_data,
    price_type,
    price_credits,
    platforms,
  } = body;

  if (!title || !category || !thumbnail_url || !template_data) {
    return NextResponse.json({
      error: 'title, category, thumbnail_url, and template_data required'
    }, { status: 400 });
  }

  const template: MarketplaceTemplate = {
    creator_id: userId,
    title,
    description: description || '',
    category,
    tags: tags || [],
    thumbnail_url,
    preview_urls,
    template_data,
    price_type: price_type || 'free',
    price_credits: price_type === 'credits' ? (price_credits || 5) : undefined,
    downloads: 0,
    likes: 0,
    rating: 0,
    rating_count: 0,
    status: 'pending', // Requires review
    featured: false,
    platforms: platforms || [],
  };

  const { data, error } = await supabase
    .from('marketplace_templates')
    .insert(template)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({
    success: true,
    template: data,
    message: 'Template submitted for review',
  });
}

// ============================================================================
// PURCHASE TEMPLATE
// ============================================================================

async function purchaseTemplate(userId: string, body: any) {
  const { template_id } = body;

  if (!template_id) {
    return NextResponse.json({ error: 'template_id required' }, { status: 400 });
  }

  // Get template
  const { data: template, error: templateError } = await supabase
    .from('marketplace_templates')
    .select('*')
    .eq('id', template_id)
    .eq('status', 'published')
    .single();

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  // Check if already purchased
  const { data: existing } = await supabase
    .from('template_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('template_id', template_id)
    .single();

  if (existing) {
    return NextResponse.json({
      success: true,
      template_data: template.template_data,
      message: 'Template already in your library',
    });
  }

  // Handle payment based on price type
  if (template.price_type === 'credits' && template.price_credits > 0) {
    // Check credits
    const { data: creditData } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();

    const balance = creditData?.balance || 0;
    if (balance < template.price_credits) {
      return NextResponse.json({
        error: 'Insufficient credits',
        required: template.price_credits,
        available: balance
      }, { status: 402 });
    }

    // Deduct credits
    await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: template.price_credits,
      p_reason: `Template purchase: ${template.title}`
    });

    // Credit the creator (80% goes to creator)
    const creatorShare = Math.floor(template.price_credits * 0.8);
    await supabase.rpc('add_credits', {
      p_user_id: template.creator_id,
      p_amount: creatorShare,
      p_reason: `Template sale: ${template.title}`
    });
  }

  // Record purchase
  await supabase.from('template_purchases').insert({
    user_id: userId,
    template_id,
    price_paid: template.price_credits || 0,
  });

  // Increment downloads
  await supabase.rpc('increment_template_downloads', { template_id });

  return NextResponse.json({
    success: true,
    template_data: template.template_data,
    message: 'Template added to your library',
  });
}

// ============================================================================
// LIKE TEMPLATE
// ============================================================================

async function likeTemplate(userId: string, body: any) {
  const { template_id } = body;

  if (!template_id) {
    return NextResponse.json({ error: 'template_id required' }, { status: 400 });
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('template_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('template_id', template_id)
    .single();

  if (existing) {
    // Unlike
    await supabase
      .from('template_likes')
      .delete()
      .eq('user_id', userId)
      .eq('template_id', template_id);

    await supabase.rpc('decrement_template_likes', { template_id });

    return NextResponse.json({
      success: true,
      liked: false,
      message: 'Template unliked',
    });
  }

  // Like
  await supabase.from('template_likes').insert({
    user_id: userId,
    template_id,
  });

  await supabase.rpc('increment_template_likes', { template_id });

  return NextResponse.json({
    success: true,
    liked: true,
    message: 'Template liked',
  });
}

// ============================================================================
// RATE TEMPLATE
// ============================================================================

async function rateTemplate(userId: string, body: any) {
  const { template_id, rating } = body;

  if (!template_id || !rating) {
    return NextResponse.json({ error: 'template_id and rating required' }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  // Check if already rated
  const { data: existing } = await supabase
    .from('template_ratings')
    .select('id, rating')
    .eq('user_id', userId)
    .eq('template_id', template_id)
    .single();

  if (existing) {
    // Update rating
    await supabase
      .from('template_ratings')
      .update({ rating, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    // New rating
    await supabase.from('template_ratings').insert({
      user_id: userId,
      template_id,
      rating,
    });
  }

  // Recalculate average rating
  const { data: ratings } = await supabase
    .from('template_ratings')
    .select('rating')
    .eq('template_id', template_id);

  const avgRating = ratings?.reduce((sum, r) => sum + r.rating, 0) / (ratings?.length || 1);

  await supabase
    .from('marketplace_templates')
    .update({
      rating: Math.round(avgRating * 10) / 10,
      rating_count: ratings?.length || 0,
    })
    .eq('id', template_id);

  return NextResponse.json({
    success: true,
    rating,
    average_rating: avgRating,
    message: 'Rating submitted',
  });
}
