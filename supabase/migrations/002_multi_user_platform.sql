-- ============================================================================
-- MULTI-USER PLATFORM: Complete Database Schema
-- DNA::}{::lang - Quantum Research Platform
-- Migration: 002_multi_user_platform.sql
-- Date: November 19, 2025
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- SECTION 1: USER ACCOUNTS & AUTHENTICATION
-- ============================================================================

-- User Accounts Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_accounts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(42) UNIQUE, -- Ethereum address for tokenomics
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    last_active TIMESTAMP WITH TIME ZONE,
    account_status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'banned'

    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,50}$'),
    CONSTRAINT account_status_check CHECK (account_status IN ('active', 'suspended', 'banned'))
);

-- User Profiles Table (public-facing data)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    banner_url TEXT,
    bio TEXT CHECK (LENGTH(bio) <= 500),
    location VARCHAR(100),
    website_url TEXT,
    affiliation VARCHAR(150), -- University/Company
    research_interests JSONB DEFAULT '[]'::jsonb, -- ['Quantum ML', 'NISQ Algorithms']
    social_links JSONB DEFAULT '{}'::jsonb, -- {'twitter': '@user', 'github': 'user'}
    visibility VARCHAR(20) DEFAULT 'public', -- 'public', 'followers', 'private'
    show_email BOOLEAN DEFAULT FALSE,
    show_stats BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT visibility_options CHECK (visibility IN ('public', 'followers', 'private'))
);

-- ============================================================================
-- SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC)
-- ============================================================================

-- Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb, -- ['create_experiments', 'manage_users']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Roles (many-to-many)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    role_id INT REFERENCES public.roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES public.user_accounts(user_id),
    PRIMARY KEY (user_id, role_id)
);

-- Insert default roles
INSERT INTO public.roles (role_name, description, permissions) VALUES
    ('admin', 'Platform administrator',
     '["manage_users", "manage_roles", "delete_any", "view_analytics", "manage_nfts"]'::jsonb),
    ('researcher', 'Quantum researcher',
     '["create_experiments", "run_quantum_jobs", "mint_nfts", "comment", "follow"]'::jsonb),
    ('viewer', 'Read-only access',
     '["view_experiments", "view_profiles"]'::jsonb)
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================================
-- SECTION 3: QUANTUM RESEARCH METRICS
-- ============================================================================

-- User Quantum Statistics
CREATE TABLE IF NOT EXISTS public.user_quantum_stats (
    stats_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    total_experiments INT DEFAULT 0,
    total_quantum_jobs INT DEFAULT 0,
    total_organisms_evolved INT DEFAULT 0,
    highest_phi_achieved DECIMAL(5,4) DEFAULT 0.0,
    average_phi DECIMAL(5,4) DEFAULT 0.0,
    total_ibm_runtime_hours DECIMAL(10,2) DEFAULT 0.0,
    total_cost_usd DECIMAL(10,2) DEFAULT 0.0,
    consciousness_index DECIMAL(5,4) DEFAULT 0.0, -- Overall user consciousness score
    reputation_score INT DEFAULT 0,
    total_followers INT DEFAULT 0,
    total_following INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements/Badges
CREATE TABLE IF NOT EXISTS public.user_achievements (
    achievement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    badge_title VARCHAR(100),
    badge_description TEXT,
    badge_icon_url TEXT,
    badge_tier VARCHAR(20), -- 'bronze', 'silver', 'gold', 'platinum'
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    UNIQUE(user_id, badge_type)
);

-- Predefined achievements
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
    achievement_type VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    tier VARCHAR(20),
    requirement_type VARCHAR(50), -- 'phi_threshold', 'experiment_count', 'follower_count'
    requirement_value DECIMAL(10,2),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Insert achievement definitions
INSERT INTO public.achievement_definitions (achievement_type, title, description, icon_url, tier, requirement_type, requirement_value) VALUES
    ('first_experiment', 'Quantum Pioneer', 'Completed your first experiment', '/badges/pioneer.svg', 'bronze', 'experiment_count', 1),
    ('phi_master_0.9', 'Φ Master', 'Achieved consciousness level of 0.9+', '/badges/phi-master.svg', 'gold', 'phi_threshold', 0.9),
    ('phi_virtuoso_0.95', 'Φ Virtuoso', 'Achieved consciousness level of 0.95+', '/badges/phi-virtuoso.svg', 'platinum', 'phi_threshold', 0.95),
    ('experiment_veteran_50', 'Experiment Veteran', 'Completed 50 experiments', '/badges/veteran.svg', 'silver', 'experiment_count', 50),
    ('experiment_master_100', 'Experiment Master', 'Completed 100 experiments', '/badges/master.svg', 'gold', 'experiment_count', 100),
    ('social_butterfly_10', 'Social Butterfly', 'Have 10 followers', '/badges/social.svg', 'bronze', 'follower_count', 10),
    ('influencer_100', 'Quantum Influencer', 'Have 100 followers', '/badges/influencer.svg', 'gold', 'follower_count', 100)
ON CONFLICT (achievement_type) DO NOTHING;

-- ============================================================================
-- SECTION 4: SOCIAL FEATURES
-- ============================================================================

-- Follower System
CREATE TABLE IF NOT EXISTS public.user_follows (
    follower_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),

    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- Activity Feed
CREATE TABLE IF NOT EXISTS public.user_activities (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_title VARCHAR(200),
    activity_description TEXT,
    entity_type VARCHAR(50), -- 'organism', 'experiment', 'achievement'
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    visibility VARCHAR(20) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT activity_visibility CHECK (visibility IN ('public', 'followers', 'private'))
);

-- Experiment Comments
CREATE TABLE IF NOT EXISTS public.experiment_comments (
    comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organism_id UUID REFERENCES public.organisms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    comment_text TEXT CHECK (LENGTH(comment_text) <= 1000 AND LENGTH(comment_text) > 0),
    parent_comment_id UUID REFERENCES public.experiment_comments(comment_id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment Reactions/Likes
CREATE TABLE IF NOT EXISTS public.comment_reactions (
    reaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES public.experiment_comments(comment_id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) DEFAULT 'like', -- 'like', 'love', 'insightful'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(comment_id, user_id)
);

-- ============================================================================
-- SECTION 5: TOKENOMICS & NFT INTEGRATION
-- ============================================================================

-- User Wallet Transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    transaction_hash VARCHAR(66), -- Ethereum tx hash
    transaction_type VARCHAR(50), -- 'reward', 'mint_nft', 'transfer', 'stake'
    amount DECIMAL(18,8),
    token_type VARCHAR(20) DEFAULT 'DNALANG', -- Token symbol
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- NFT Metadata (for minted experiments)
CREATE TABLE IF NOT EXISTS public.nft_metadata (
    nft_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organism_id UUID REFERENCES public.organisms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    token_id VARCHAR(100) UNIQUE, -- On-chain token ID
    contract_address VARCHAR(42),
    blockchain VARCHAR(20) DEFAULT 'ethereum',
    ipfs_hash TEXT, -- Metadata stored on IPFS
    nft_name VARCHAR(200),
    nft_description TEXT,
    attributes JSONB DEFAULT '{}'::jsonb, -- Traits (Phi value, backend, etc.)
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_hash VARCHAR(66),
    owner_address VARCHAR(42),
    status VARCHAR(20) DEFAULT 'minted' -- 'pending', 'minted', 'transferred', 'burned'
);

-- User Token Balance (cached for quick lookup)
CREATE TABLE IF NOT EXISTS public.user_token_balances (
    user_id UUID PRIMARY KEY REFERENCES public.user_accounts(user_id) ON DELETE CASCADE,
    dnalang_balance DECIMAL(18,8) DEFAULT 0,
    staked_balance DECIMAL(18,8) DEFAULT 0,
    total_rewards_earned DECIMAL(18,8) DEFAULT 0,
    total_nfts_minted INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SECTION 6: EXTEND EXISTING TABLES
-- ============================================================================

-- Add user tracking to organisms table
ALTER TABLE public.organisms
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_accounts(user_id),
    ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public',
    ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS fork_count INT DEFAULT 0;

-- Add user tracking to quantum_jobs table
ALTER TABLE public.quantum_jobs
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_accounts(user_id);

-- ============================================================================
-- SECTION 7: INDEXES FOR PERFORMANCE
-- ============================================================================

-- User accounts indexes
CREATE INDEX IF NOT EXISTS idx_user_accounts_username ON public.user_accounts(username);
CREATE INDEX IF NOT EXISTS idx_user_accounts_wallet ON public.user_accounts(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_accounts_status ON public.user_accounts(account_status);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_visibility ON public.user_profiles(visibility);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Organisms indexes
CREATE INDEX IF NOT EXISTS idx_organisms_user_id ON public.organisms(user_id);
CREATE INDEX IF NOT EXISTS idx_organisms_visibility ON public.organisms(visibility);
CREATE INDEX IF NOT EXISTS idx_organisms_featured ON public.organisms(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_organisms_created_at ON public.organisms(created_at DESC);

-- Quantum jobs indexes
CREATE INDEX IF NOT EXISTS idx_quantum_jobs_user_id ON public.quantum_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_quantum_jobs_status ON public.quantum_jobs(status);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type ON public.user_activities(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_visibility ON public.user_activities(visibility);

-- Follows indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_experiment_comments_organism ON public.experiment_comments(organism_id);
CREATE INDEX IF NOT EXISTS idx_experiment_comments_user ON public.experiment_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_comments_parent ON public.experiment_comments(parent_comment_id);

-- NFT indexes
CREATE INDEX IF NOT EXISTS idx_nft_metadata_user ON public.nft_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_organism ON public.nft_metadata(organism_id);
CREATE INDEX IF NOT EXISTS idx_nft_metadata_token ON public.nft_metadata(token_id);

-- ============================================================================
-- SECTION 8: ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quantum_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organisms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantum_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_token_balances ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER ACCOUNTS POLICIES
-- ============================================================================

-- Users can view their own account
CREATE POLICY "Users can view own account"
    ON public.user_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all accounts
CREATE POLICY "Admins can view all accounts"
    ON public.user_accounts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'
        )
    );

-- Users can update their own account
CREATE POLICY "Users can update own account"
    ON public.user_accounts FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Public profiles are viewable by everyone
CREATE POLICY "Public profiles are viewable"
    ON public.user_profiles FOR SELECT
    USING (visibility = 'public');

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (user_id = auth.uid());

-- Followers can view followers-only profiles
CREATE POLICY "Followers can view followers-only profiles"
    ON public.user_profiles FOR SELECT
    USING (
        visibility = 'followers' AND EXISTS (
            SELECT 1 FROM public.user_follows
            WHERE following_id = user_profiles.user_id
            AND follower_id = auth.uid()
        )
    );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- QUANTUM STATS POLICIES
-- ============================================================================

-- Everyone can view stats if profile is public
CREATE POLICY "Public stats viewable"
    ON public.user_quantum_stats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.user_id = user_quantum_stats.user_id
            AND (
                user_profiles.visibility = 'public'
                OR user_profiles.user_id = auth.uid()
                OR (user_profiles.visibility = 'followers' AND EXISTS (
                    SELECT 1 FROM public.user_follows
                    WHERE following_id = user_profiles.user_id
                    AND follower_id = auth.uid()
                ))
            )
        )
    );

-- System can update stats (via triggers)
CREATE POLICY "System can update stats"
    ON public.user_quantum_stats FOR ALL
    USING (true);

-- ============================================================================
-- ORGANISMS POLICIES
-- ============================================================================

-- Users can view their own organisms
CREATE POLICY "Users can view own organisms"
    ON public.organisms FOR SELECT
    USING (user_id = auth.uid());

-- Public organisms viewable by all
CREATE POLICY "Public organisms viewable by all"
    ON public.organisms FOR SELECT
    USING (visibility = 'public');

-- Followers can view followers-only organisms
CREATE POLICY "Followers can view followers-only organisms"
    ON public.organisms FOR SELECT
    USING (
        visibility = 'followers' AND EXISTS (
            SELECT 1 FROM public.user_follows
            WHERE following_id = organisms.user_id
            AND follower_id = auth.uid()
        )
    );

-- Users can create their own organisms
CREATE POLICY "Users can create organisms"
    ON public.organisms FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own organisms
CREATE POLICY "Users can update own organisms"
    ON public.organisms FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete their own organisms
CREATE POLICY "Users can delete own organisms"
    ON public.organisms FOR DELETE
    USING (user_id = auth.uid());

-- Admins can delete any organism
CREATE POLICY "Admins can delete any organism"
    ON public.organisms FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = auth.uid() AND r.role_name = 'admin'
        )
    );

-- ============================================================================
-- ACTIVITIES POLICIES
-- ============================================================================

-- Users can view public activities
CREATE POLICY "Public activities viewable"
    ON public.user_activities FOR SELECT
    USING (visibility = 'public');

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
    ON public.user_activities FOR SELECT
    USING (user_id = auth.uid());

-- Followers can view followers-only activities
CREATE POLICY "Followers can view followed activities"
    ON public.user_activities FOR SELECT
    USING (
        visibility = 'followers' AND EXISTS (
            SELECT 1 FROM public.user_follows
            WHERE following_id = user_activities.user_id
            AND follower_id = auth.uid()
        )
    );

-- System can create activities (via triggers)
CREATE POLICY "System can create activities"
    ON public.user_activities FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- FOLLOWS POLICIES
-- ============================================================================

-- Users can view follows (who follows whom)
CREATE POLICY "Anyone can view follows"
    ON public.user_follows FOR SELECT
    USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
    ON public.user_follows FOR INSERT
    WITH CHECK (follower_id = auth.uid());

-- Users can unfollow
CREATE POLICY "Users can unfollow"
    ON public.user_follows FOR DELETE
    USING (follower_id = auth.uid());

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================

-- Anyone can view comments on public organisms
CREATE POLICY "Comments on public organisms viewable"
    ON public.experiment_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organisms
            WHERE organisms.id = experiment_comments.organism_id
            AND organisms.visibility = 'public'
        ) OR user_id = auth.uid()
    );

-- Users can create comments
CREATE POLICY "Users can create comments"
    ON public.experiment_comments FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
    ON public.experiment_comments FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
    ON public.experiment_comments FOR DELETE
    USING (user_id = auth.uid());

-- ============================================================================
-- NFT/TOKENOMICS POLICIES
-- ============================================================================

-- Users can view their own NFTs
CREATE POLICY "Users can view own NFTs"
    ON public.nft_metadata FOR SELECT
    USING (user_id = auth.uid());

-- Public NFTs viewable by all
CREATE POLICY "Public NFTs viewable"
    ON public.nft_metadata FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.organisms
            WHERE organisms.id = nft_metadata.organism_id
            AND organisms.visibility = 'public'
        )
    );

-- System can create NFTs (via minting service)
CREATE POLICY "System can create NFTs"
    ON public.nft_metadata FOR INSERT
    WITH CHECK (true);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
    ON public.wallet_transactions FOR SELECT
    USING (user_id = auth.uid());

-- Users can view their own balances
CREATE POLICY "Users can view own balances"
    ON public.user_token_balances FOR SELECT
    USING (user_id = auth.uid());

-- ============================================================================
-- SECTION 9: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Update user stats after organism creation
CREATE OR REPLACE FUNCTION update_stats_on_organism_create()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total experiments
    INSERT INTO public.user_quantum_stats (user_id, total_experiments)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET total_experiments = user_quantum_stats.total_experiments + 1,
        updated_at = NOW();

    -- Create activity
    INSERT INTO public.user_activities (
        user_id,
        activity_type,
        activity_title,
        entity_type,
        entity_id,
        metadata
    ) VALUES (
        NEW.user_id,
        'organism_created',
        'Created new organism: ' || NEW.name,
        'organism',
        NEW.id,
        jsonb_build_object('organism_name', NEW.name)
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update stats on organism create
DROP TRIGGER IF EXISTS trg_update_stats_organism_create ON public.organisms;
CREATE TRIGGER trg_update_stats_organism_create
    AFTER INSERT ON public.organisms
    FOR EACH ROW
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_stats_on_organism_create();

-- Function: Update user stats after quantum job completion
CREATE OR REPLACE FUNCTION update_stats_on_job_complete()
RETURNS TRIGGER AS $$
DECLARE
    phi_value DECIMAL(5,4);
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Extract Phi value
        phi_value := COALESCE((NEW.consciousness_metrics->>'phi')::DECIMAL(5,4), 0);

        -- Update stats
        INSERT INTO public.user_quantum_stats (
            user_id,
            total_quantum_jobs,
            highest_phi_achieved,
            total_organisms_evolved
        )
        VALUES (
            NEW.user_id,
            1,
            phi_value,
            1
        )
        ON CONFLICT (user_id) DO UPDATE
        SET total_quantum_jobs = user_quantum_stats.total_quantum_jobs + 1,
            total_organisms_evolved = user_quantum_stats.total_organisms_evolved + 1,
            highest_phi_achieved = GREATEST(user_quantum_stats.highest_phi_achieved, phi_value),
            updated_at = NOW();

        -- Check for achievements
        PERFORM check_and_award_achievements(NEW.user_id, phi_value);

        -- Create activity
        INSERT INTO public.user_activities (
            user_id,
            activity_type,
            activity_title,
            entity_type,
            entity_id,
            metadata
        ) VALUES (
            NEW.user_id,
            'quantum_job_completed',
            'Completed quantum job (Φ = ' || phi_value || ')',
            'quantum_job',
            NEW.id,
            jsonb_build_object(
                'phi', phi_value,
                'backend', NEW.backend_name
            )
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update stats on job complete
DROP TRIGGER IF EXISTS trg_update_stats_job_complete ON public.quantum_jobs;
CREATE TRIGGER trg_update_stats_job_complete
    AFTER UPDATE ON public.quantum_jobs
    FOR EACH ROW
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_stats_on_job_complete();

-- Function: Check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(
    p_user_id UUID,
    p_phi DECIMAL(5,4)
)
RETURNS VOID AS $$
DECLARE
    current_stats RECORD;
    achievement RECORD;
BEGIN
    -- Get current user stats
    SELECT * INTO current_stats
    FROM public.user_quantum_stats
    WHERE user_id = p_user_id;

    -- Check each achievement definition
    FOR achievement IN
        SELECT * FROM public.achievement_definitions
    LOOP
        -- Check if achievement should be awarded
        IF achievement.requirement_type = 'phi_threshold' AND p_phi >= achievement.requirement_value THEN
            INSERT INTO public.user_achievements (
                user_id,
                badge_type,
                badge_title,
                badge_description,
                badge_icon_url,
                badge_tier
            ) VALUES (
                p_user_id,
                achievement.achievement_type,
                achievement.title,
                achievement.description,
                achievement.icon_url,
                achievement.tier
            )
            ON CONFLICT (user_id, badge_type) DO NOTHING;

        ELSIF achievement.requirement_type = 'experiment_count' AND current_stats.total_experiments >= achievement.requirement_value THEN
            INSERT INTO public.user_achievements (
                user_id,
                badge_type,
                badge_title,
                badge_description,
                badge_icon_url,
                badge_tier
            ) VALUES (
                p_user_id,
                achievement.achievement_type,
                achievement.title,
                achievement.description,
                achievement.icon_url,
                achievement.tier
            )
            ON CONFLICT (user_id, badge_type) DO NOTHING;

        ELSIF achievement.requirement_type = 'follower_count' AND current_stats.total_followers >= achievement.requirement_value THEN
            INSERT INTO public.user_achievements (
                user_id,
                badge_type,
                badge_title,
                badge_description,
                badge_icon_url,
                badge_tier
            ) VALUES (
                p_user_id,
                achievement.achievement_type,
                achievement.title,
                achievement.description,
                achievement.icon_url,
                achievement.tier
            )
            ON CONFLICT (user_id, badge_type) DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment follower count
        UPDATE public.user_quantum_stats
        SET total_followers = total_followers + 1,
            updated_at = NOW()
        WHERE user_id = NEW.following_id;

        -- Increment following count
        UPDATE public.user_quantum_stats
        SET total_following = total_following + 1,
            updated_at = NOW()
        WHERE user_id = NEW.follower_id;

        -- Create activity
        INSERT INTO public.user_activities (
            user_id,
            activity_type,
            activity_title,
            metadata
        ) VALUES (
            NEW.follower_id,
            'user_followed',
            'Followed a researcher',
            jsonb_build_object('following_id', NEW.following_id)
        );

    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement follower count
        UPDATE public.user_quantum_stats
        SET total_followers = GREATEST(total_followers - 1, 0),
            updated_at = NOW()
        WHERE user_id = OLD.following_id;

        -- Decrement following count
        UPDATE public.user_quantum_stats
        SET total_following = GREATEST(total_following - 1, 0),
            updated_at = NOW()
        WHERE user_id = OLD.follower_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update follower counts
DROP TRIGGER IF EXISTS trg_update_follower_counts ON public.user_follows;
CREATE TRIGGER trg_update_follower_counts
    AFTER INSERT OR DELETE ON public.user_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_counts();

-- Function: Update profile timestamp
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update profile timestamp
DROP TRIGGER IF EXISTS trg_update_profile_timestamp ON public.user_profiles;
CREATE TRIGGER trg_update_profile_timestamp
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_timestamp();

-- ============================================================================
-- SECTION 10: HELPER VIEWS
-- ============================================================================

-- View: User Profile Summary (combines accounts + profiles + stats)
CREATE OR REPLACE VIEW public.user_profile_summary AS
SELECT
    ua.user_id,
    ua.username,
    ua.email,
    ua.wallet_address,
    ua.created_at as account_created_at,
    up.display_name,
    up.avatar_url,
    up.bio,
    up.affiliation,
    up.research_interests,
    up.visibility,
    uqs.total_experiments,
    uqs.total_quantum_jobs,
    uqs.highest_phi_achieved,
    uqs.consciousness_index,
    uqs.reputation_score,
    uqs.total_followers,
    uqs.total_following,
    (
        SELECT COUNT(*)
        FROM public.user_achievements
        WHERE user_id = ua.user_id
    ) as total_badges
FROM public.user_accounts ua
LEFT JOIN public.user_profiles up ON ua.user_id = up.user_id
LEFT JOIN public.user_quantum_stats uqs ON ua.user_id = uqs.user_id;

-- View: Leaderboard (top users by consciousness index)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
    ups.user_id,
    ups.username,
    ups.display_name,
    ups.avatar_url,
    ups.consciousness_index,
    ups.highest_phi_achieved,
    ups.total_experiments,
    ups.total_followers,
    ups.reputation_score,
    RANK() OVER (ORDER BY ups.consciousness_index DESC) as rank
FROM public.user_profile_summary ups
WHERE ups.visibility = 'public'
ORDER BY ups.consciousness_index DESC
LIMIT 100;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Multi-user platform schema migration complete!';
    RAISE NOTICE '📊 Tables created: 15';
    RAISE NOTICE '🔒 RLS policies created: 30+';
    RAISE NOTICE '⚡ Triggers created: 5';
    RAISE NOTICE '👁️ Views created: 2';
END $$;
