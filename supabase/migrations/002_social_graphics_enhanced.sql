-- ═══════════════════════════════════════════════════════════════════════════
-- SOCIAL GRAPHICS CREATOR - ENHANCED SCHEMA v2.0
-- CR AudioViz AI - Fortune 50 Quality Standards
-- December 27, 2025
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- BRAND KITS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS brand_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#1E40AF',
    accent_color VARCHAR(7) DEFAULT '#F59E0B',
    background_color VARCHAR(7) DEFAULT '#FFFFFF',
    text_color VARCHAR(7) DEFAULT '#1F2937',
    additional_colors TEXT[],
    heading_font VARCHAR(100) DEFAULT 'Inter',
    body_font VARCHAR(100) DEFAULT 'Inter',
    accent_font VARCHAR(100),
    logo_primary_url TEXT,
    logo_light_url TEXT,
    logo_dark_url TEXT,
    logo_icon_url TEXT,
    favicon_url TEXT,
    tagline TEXT,
    brand_voice TEXT,
    usage_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_kits_user ON brand_kits(user_id);
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage brand kits" ON brand_kits;
CREATE POLICY "Users can manage brand kits" ON brand_kits FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- AI GENERATIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    enhanced_prompt TEXT,
    revised_prompt TEXT,
    style VARCHAR(50),
    size VARCHAR(20),
    platform VARCHAR(50),
    image_url TEXT NOT NULL,
    credits_used INTEGER DEFAULT 5,
    model VARCHAR(50) DEFAULT 'dall-e-3',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_generations_user ON ai_generations(user_id);
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own generations" ON ai_generations;
CREATE POLICY "Users can view own generations" ON ai_generations FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- MARKETPLACE TEMPLATES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS marketplace_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    thumbnail_url TEXT NOT NULL,
    preview_urls TEXT[],
    template_data JSONB NOT NULL,
    price_type VARCHAR(20) DEFAULT 'free' CHECK (price_type IN ('free', 'credits', 'premium')),
    price_credits INTEGER,
    downloads INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
    featured BOOLEAN DEFAULT false,
    platforms TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_creator ON marketplace_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_templates(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_templates(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_featured ON marketplace_templates(featured) WHERE featured = true;

ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published templates" ON marketplace_templates;
CREATE POLICY "Anyone can view published templates" ON marketplace_templates FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Creators can manage own templates" ON marketplace_templates;
CREATE POLICY "Creators can manage own templates" ON marketplace_templates FOR ALL USING (auth.uid() = creator_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TEMPLATE PURCHASES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS template_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES marketplace_templates(id),
    price_paid INTEGER DEFAULT 0,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON template_purchases(user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- TEMPLATE LIKES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS template_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES marketplace_templates(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- TEMPLATE RATINGS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES marketplace_templates(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- SOCIAL CONNECTIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS social_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    account_id VARCHAR(255),
    account_name VARCHAR(255),
    account_avatar TEXT,
    expires_at TIMESTAMPTZ,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_connections_user ON social_connections(user_id);
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own connections" ON social_connections;
CREATE POLICY "Users can manage own connections" ON social_connections FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEDULED POSTS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    design_id UUID,
    platform VARCHAR(50) NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    caption TEXT,
    hashtags TEXT[],
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'failed', 'cancelled')),
    posted_at TIMESTAMPTZ,
    post_id VARCHAR(255),
    post_url TEXT,
    error_message TEXT,
    recurring JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled ON scheduled_posts(scheduled_for) WHERE status = 'scheduled';

ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own scheduled posts" ON scheduled_posts;
CREATE POLICY "Users can manage own scheduled posts" ON scheduled_posts FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- DESIGNS TABLE ENHANCEMENT
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE designs ADD COLUMN IF NOT EXISTS brand_kit_id UUID REFERENCES brand_kits(id);
ALTER TABLE designs ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS ai_prompt TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_template_downloads(template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE marketplace_templates SET downloads = downloads + 1 WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_template_views(template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE marketplace_templates SET views = views + 1 WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_template_likes(template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE marketplace_templates SET likes = likes + 1 WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_template_likes(template_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE marketplace_templates SET likes = GREATEST(0, likes - 1) WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ═══════════════════════════════════════════════════════════════════════════

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

SELECT 'Social Graphics Creator Enhanced Schema Complete ✅' as status;
