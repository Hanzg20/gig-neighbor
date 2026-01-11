-- ==========================================
-- GIG NEIGHBOR UNIFIED SCHEMA & DOCUMENTATION v4.0
-- ==========================================
/*
  # Supabase Database Schema (Gig Neighbor)

  This document is the unified source of truth for the Gig Neighbor database architecture.
  It combines structural descriptions with SQL implementation details.

  ## 1. System Overview
  Gig Neighbor uses Supabase (PostgreSQL) as its primary backend. 
  The schema is designed for a master-detail listing system, multi-role RBAC, 
  and a transactional "JinBean" ledger.

  ## 2. Core Tables Overview
  - public.user_profiles: Extended user data (Email, Beans, Node, **Bio, Settings**).
  - public.user_addresses: Multi-node address book (Home, Office, etc.).
  - public.ref_codes: Global categories and community nodes.
  - public.listing_masters: Service and product catalog entries.
  - public.bean_transactions: Ledger for the JinBean ecosystem.
  - public.orders: Transactional state machine records.
*/

-- ==========================================
-- STEP 0: EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ==========================================
-- STEP 1: CUSTOM TYPES
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
    CREATE TYPE listing_type AS ENUM ('SERVICE', 'RENTAL', 'CONSULTATION', 'GOODS', 'TASK');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'PENDING_QUOTE', 'PENDING_DEPOSIT', 'WAITING_FOR_PRICE_APPROVAL',
      'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'ACCEPTED', 
      'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'provider_identity') THEN
    CREATE TYPE provider_identity AS ENUM ('NEIGHBOR', 'MERCHANT');
  END IF;
END $$;

-- ==========================================
-- STEP 2: BASE TABLES
-- ==========================================

/*
  ### 2.1 Global References (public.ref_codes)
  The "Categorization System" for Nodes, Industries, and Categories.
*/
CREATE TABLE IF NOT EXISTS public.ref_codes (
  code_id TEXT PRIMARY KEY,
  parent_id TEXT,
  type TEXT NOT NULL, -- 'NODE', 'CATEGORY', 'UNIT'
  zh_name TEXT NOT NULL,
  en_name TEXT,
  extra_data JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.2 RBAC: Roles & Permissions
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ==========================================
-- STEP 3: USER PROFILES
-- ==========================================

/*
  ### 3.1 User & Identity (public.user_profiles)
  Extends Supabase Auth with application-specific metadata.

  | Column | Description |
  |--------|-------------|
  | id | References auth.users(id) |
  | email | User's email (redundant for performance) |
  | name | Display name / Nickname |
  | bio | Personal/Professional introduction |
  | settings | JSONB for language and notification preferences |
  | beans_balance | Current JinBean balance |
  | roles | Array of roles (e.g., 'BUYER', 'PROVIDER') |
*/
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar TEXT,
  phone TEXT,
  bio TEXT,
  settings JSONB DEFAULT '{"language": "en", "notifications": {"email": true, "push": true}}'::jsonb,
  node_id TEXT REFERENCES public.ref_codes(code_id),
  beans_balance INTEGER DEFAULT 0,
  verification_level INTEGER DEFAULT 1,
  roles TEXT[] DEFAULT ARRAY['BUYER']::TEXT[],
  permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
  provider_profile_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 Address Book (public.user_addresses)
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  label TEXT, -- e.g., 'Home', 'Office'
  address_text TEXT,
  geom GEOMETRY(Point, 4326),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

/*
  ### 3.2 Transactional Ledger (public.bean_transactions)
  Records every change to a user's JinBean balance.
*/
CREATE TABLE IF NOT EXISTS public.bean_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive (Earned) or Negative (Spent)
  type TEXT NOT NULL, -- 'EARNED', 'SPENT', 'REFUNDED'
  reason TEXT,
  related_order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- STEP 4: PROVIDER PROFILES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  business_name_zh TEXT NOT NULL,
  business_name_en TEXT,
  description_zh TEXT,
  description_en TEXT,
  identity provider_identity DEFAULT 'NEIGHBOR',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_level INTEGER DEFAULT 1,
  badges TEXT[],
  stats JSONB DEFAULT '{"total_orders": 0, "average_rating": 0}'::jsonb,
  insurance_summary_zh TEXT,
  insurance_summary_en TEXT,
  license_info TEXT,
  location_address TEXT,
  verification_status TEXT DEFAULT 'PENDING',
  is_tax_registered BOOLEAN DEFAULT FALSE,
  tax_number TEXT,
  service_radius_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- STEP 5: LISTINGS (Master-Detail)
-- ==========================================

/*
  ### 5.1 Listings (public.listing_masters & public.listing_items)
  A two-tier model supporting complex services with variants.
  - Master: The overall service catalog entry.
  - Item: The specific SKU or variant.
*/
CREATE TABLE IF NOT EXISTS public.listing_masters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  title_zh TEXT NOT NULL,
  title_en TEXT,
  description_zh TEXT,
  description_en TEXT,
  images TEXT[],
  type listing_type NOT NULL,
  category_id TEXT REFERENCES public.ref_codes(code_id),
  node_id TEXT REFERENCES public.ref_codes(code_id),
  tags TEXT[],
  status TEXT DEFAULT 'PUBLISHED',
  location_address TEXT,
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_promoted BOOLEAN DEFAULT FALSE,
  preferred_transaction_model TEXT DEFAULT 'INSTANT_PAY',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.listing_masters
  ADD COLUMN location jsonb,
  ADD COLUMN latitude double precision,
  ADD COLUMN longitude double precision;


CREATE TABLE IF NOT EXISTS public.listing_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id UUID REFERENCES public.listing_masters(id) ON DELETE CASCADE,
  name_zh TEXT NOT NULL,
  name_en TEXT,
  description_zh TEXT,
  description_en TEXT,
  images TEXT[],
  price_amount INTEGER NOT NULL,
  price_currency TEXT DEFAULT 'CAD',
  price_unit TEXT,
  deposit_amount INTEGER DEFAULT 0,
  pricing_model TEXT DEFAULT 'FIXED',
  status TEXT DEFAULT 'AVAILABLE',
  sort_order INTEGER DEFAULT 0,
  attributes JSONB DEFAULT '{}'::jsonb,
  transaction_model_override TEXT,
  parent_item_id UUID REFERENCES public.listing_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- STEP 6: ORDERS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_id UUID REFERENCES public.listing_masters(id) ON DELETE SET NULL,
  item_id UUID REFERENCES public.listing_items(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.user_profiles(id),
  provider_id UUID REFERENCES public.provider_profiles(id),
  node_id TEXT,
  status order_status DEFAULT 'PENDING_PAYMENT',
  amount_base INTEGER NOT NULL,
  amount_tax INTEGER DEFAULT 0,
  amount_fee_platform INTEGER DEFAULT 0,
  amount_total INTEGER NOT NULL,
  currency TEXT DEFAULT 'CAD',
  snapshot JSONB NOT NULL,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'UNPAID',
  actual_transaction_model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add FK to bean_transactions after orders table exists
ALTER TABLE public.bean_transactions 
DROP CONSTRAINT IF EXISTS bean_transactions_related_order_id_fkey;

ALTER TABLE public.bean_transactions 
ADD CONSTRAINT bean_transactions_related_order_id_fkey 
FOREIGN KEY (related_order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- FIX (v4.1): Ensure Foreign Key relationship exists for proper joining
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_provider_id_fkey') THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_provider_id_fkey 
        FOREIGN KEY (provider_id) 
        REFERENCES public.provider_profiles(id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- ==========================================
-- STEP 7: REVIEWS & TRUST
-- ==========================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.listing_masters(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  rating DECIMAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rating_dimensions JSONB DEFAULT '{}'::jsonb, -- e.g., { quality: 5, punctuality: 4, value: 5 }
  content TEXT,
  media TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_neighbor_story BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.review_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- 'HELPFUL', 'WARMTH', 'FUNNY'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS public.review_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id)
);

-- ==========================================
-- STEP 12: ROW LEVEL SECURITY (RLS)
-- ==========================================

/*
  ### 12.1 Security (RLS Policies)
  - Profiles: Publicly viewable for basic info.
  - Listings: Viewable only if status = 'PUBLISHED'.
  - Private Data: Restricted to the resource owner.
*/
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Public profiles viewable" ON public.user_profiles;
CREATE POLICY "Public profiles viewable" 
ON public.user_profiles FOR SELECT USING (true);

-- FIX (v4.1): Allow everyone to read provider profiles explicitly
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.provider_profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.provider_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Masters viewable if published" ON public.listing_masters;
CREATE POLICY "Masters viewable if published" 
ON public.listing_masters FOR SELECT USING (status = 'PUBLISHED');

-- REVIEWS RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (status = 'PUBLISHED' OR true); -- Everyone can read reviews

DROP POLICY IF EXISTS "Buyers can manage own reviews" ON public.reviews;
CREATE POLICY "Buyers can manage own reviews" ON public.reviews 
FOR ALL USING (auth.uid() = buyer_id);

ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reactions are viewable by everyone" ON public.review_reactions;
CREATE POLICY "Reactions are viewable by everyone" ON public.review_reactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own reactions" ON public.review_reactions;
CREATE POLICY "Users can manage own reactions" ON public.review_reactions 
FOR ALL USING (auth.uid() = user_id);

ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Replies are viewable by everyone" ON public.review_replies;
CREATE POLICY "Replies are viewable by everyone" ON public.review_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Providers can manage own replies" ON public.review_replies;
CREATE POLICY "Providers can manage own replies" ON public.review_replies 
FOR ALL USING (EXISTS (
    SELECT 1 FROM public.provider_profiles p 
    WHERE p.id = provider_id AND p.user_id = auth.uid()
));

DROP POLICY IF EXISTS "Items viewable if master published" ON public.listing_items;
CREATE POLICY "Items viewable if master published" 
ON public.listing_items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.listing_masters m 
        WHERE m.id = public.listing_items.master_id 
        AND m.status = 'PUBLISHED'
    )
);

-- ==========================================
-- STEP 13: TRIGGERS & AUTOMATION
-- ==========================================

/*
  ### 13.1 Auto-Profile Sync
  Automatically creates a user_profiles entry on signup.
*/
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, node_id)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Neighbor'), 'NODE_LEES');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_masters ON public.listing_masters;
CREATE TRIGGER set_timestamp_masters 
BEFORE UPDATE ON public.listing_masters 
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_items ON public.listing_items;
CREATE TRIGGER set_timestamp_items 
BEFORE UPDATE ON public.listing_items 
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_providers ON public.provider_profiles;
CREATE TRIGGER set_timestamp_providers 
BEFORE UPDATE ON public.provider_profiles 
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_users ON public.user_profiles;
CREATE TRIGGER set_timestamp_users 
BEFORE UPDATE ON public.user_profiles 
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

/*
  ### 13.2 Review Automations
  Aggregates ratings and rewards neighbors.
*/
CREATE OR REPLACE FUNCTION public.update_listing_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.listing_masters
  SET 
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id)),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE listing_id = COALESCE(NEW.listing_id, OLD.listing_id))
  WHERE id = COALESCE(NEW.listing_id, OLD.listing_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;
CREATE TRIGGER on_review_change
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_listing_rating();

CREATE OR REPLACE FUNCTION public.reward_beans_for_review()
RETURNS TRIGGER AS $$
DECLARE
  reward_amount INTEGER := 50; 
BEGIN
  IF NEW.is_neighbor_story THEN
    UPDATE public.user_profiles
    SET beans_balance = beans_balance + reward_amount
    WHERE id = NEW.buyer_id;

    INSERT INTO public.bean_transactions (user_id, amount, type, reason, related_order_id)
    VALUES (NEW.buyer_id, reward_amount, 'EARNED', 'Neighbor Story Review Reward', NEW.order_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_review_reward ON public.reviews;
CREATE TRIGGER on_review_reward
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.reward_beans_for_review();

-- ✅ SCHEMA DEPLOYMENT COMPLETE


-- ==========================================
-- MESSAGING SCHEMA MIGRATION v1.1
-- ==========================================
-- Run this migration to add real-time messaging support
-- SAFE FOR RE-RUNS: Uses DROP IF EXISTS where needed

-- ==========================================
-- PART 1: TABLES (Run first)
-- ==========================================
DROP VIEW IF EXISTS conversation_unread_counts;
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.conversations;

-- 1. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_a UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_b UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant_a, participant_b)
);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    message_type TEXT DEFAULT 'TEXT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_a, participant_b);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- ==========================================
-- PART 2: RLS POLICIES (Run second)
-- ==========================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations they are part of" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update read status of messages sent to them" ON public.messages;

-- Conversations policies
CREATE POLICY "Users can view their conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create conversations they are part of"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (auth.uid() = c.participant_a OR auth.uid() = c.participant_b)
        )
    );

CREATE POLICY "Users can send messages to their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (auth.uid() = c.participant_a OR auth.uid() = c.participant_b)
        )
    );

CREATE POLICY "Users can update read status of messages sent to them"
    ON public.messages FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations c
            WHERE c.id = conversation_id
            AND (auth.uid() = c.participant_a OR auth.uid() = c.participant_b)
        )
    );

-- ==========================================
-- PART 3: REALTIME & TRIGGERS (Run third)
-- ==========================================

-- Enable Realtime (may error if already added, that's OK)
DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION WHEN duplicate_object THEN
    NULL; -- Already exists, ignore
END $$;

-- Trigger function
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- ==========================================
-- PART 4: VIEWS (Run last)
-- ==========================================

-- Drop and recreate view
DROP VIEW IF EXISTS conversation_unread_counts;
CREATE VIEW conversation_unread_counts AS
SELECT 
    c.id as conversation_id,
    c.participant_a,
    c.participant_b,
    COUNT(CASE WHEN m.is_read = FALSE AND m.sender_id != c.participant_a THEN 1 END) as unread_for_a,
    COUNT(CASE WHEN m.is_read = FALSE AND m.sender_id != c.participant_b THEN 1 END) as unread_for_b
FROM public.conversations c
LEFT JOIN public.messages m ON m.conversation_id = c.id
GROUP BY c.id, c.participant_a, c.participant_b;



-- Storage Configuration
INSERT INTO storage.buckets (id, name, public) VALUES ('review-media', 'review-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-media', 'listing-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Review" ON storage.objects;
CREATE POLICY "Public Read Review" ON storage.objects FOR SELECT TO public USING (bucket_id = 'review-media');
DROP POLICY IF EXISTS "Auth Upload Review" ON storage.objects;
CREATE POLICY "Auth Upload Review" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Read Listing" ON storage.objects;
CREATE POLICY "Public Read Listing" ON storage.objects FOR SELECT TO public USING (bucket_id = 'listing-media');
DROP POLICY IF EXISTS "Auth Upload Listing" ON storage.objects;
CREATE POLICY "Auth Upload Listing" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-media' AND auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Owner Delete Listing" ON storage.objects;
CREATE POLICY "Owner Delete Listing" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'listing-media' AND owner = auth.uid());

-- 4. Avatars Policies
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
CREATE POLICY "Auth Update Avatars" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid());

DROP POLICY IF EXISTS "Auth Delete Avatars" ON storage.objects;
CREATE POLICY "Auth Delete Avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND owner = auth.uid());

-- ==========================================
-- USER PROFILE POLICIES
-- ==========================================

ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.user_profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.user_profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- ==========================================
-- GIGBRIDGE (SCAN-TO-BUY) INFRASTRUCTURE MIGRATION
-- ==========================================

-- 1. Extend Listing Masters for Serialization
ALTER TABLE public.listing_masters 
ADD COLUMN IF NOT EXISTS is_serialized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fulfillment_config JSONB DEFAULT '{}'::jsonb;

-- 2. Create Listing Inventory Table (Universal Asset Pool)
CREATE TABLE IF NOT EXISTS public.listing_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_item_id UUID NOT NULL REFERENCES public.listing_items(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE SET NULL,
    serial_number TEXT NOT NULL,
    secret_code TEXT, -- Encrypted or plain secret (e.g., PIN)
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'defective', 'expired', 'archived')),
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(listing_item_id, serial_number)
);

-- 3. Create Inventory Usage Logs (For multi-use assets)
CREATE TABLE IF NOT EXISTS public.inventory_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES public.listing_inventory(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('USE', 'RECHARGE', 'VOID')),
    amount INTEGER DEFAULT -1,
    location_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.listing_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_usage_logs ENABLE ROW LEVEL SECURITY;

-- 5. Basic RLS Policies
-- Providers can manage their own inventory
CREATE POLICY "Providers can manage own inventory" ON public.listing_inventory
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.provider_profiles p 
        WHERE p.id = provider_id AND p.user_id = auth.uid()
    ));

-- Buyers can see their purchased assets
CREATE POLICY "Buyers can view their owned assets" ON public.listing_inventory
    FOR SELECT TO authenticated
    USING (buyer_id = auth.uid());

-- 6. Triggers for updated_at
CREATE TRIGGER set_timestamp_inventory
BEFORE UPDATE ON public.listing_inventory
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- 7. Add Index for high-performance atomic allocation
CREATE INDEX IF NOT EXISTS idx_inventory_alloc ON public.listing_inventory (listing_item_id, status) WHERE (status = 'available');

-- ==========================================
-- GIGBRIDGE: ATOMIC INVENTORY ALLOCATION RPC
-- ==========================================

CREATE OR REPLACE FUNCTION public.allocate_inventory_item(
    p_listing_item_id UUID,
    p_order_id UUID,
    p_buyer_id UUID
)
RETURNS public.listing_inventory AS $$
DECLARE
    v_item public.listing_inventory;
BEGIN
    -- 1. Try to find and lock one available item
    -- SKIP LOCKED ensures we don't wait for other transactions and don't double-allocate
    SELECT * INTO v_item
    FROM public.listing_inventory
    WHERE listing_item_id = p_listing_item_id
      AND status = 'available'
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    -- 2. Check if we found an item
    IF v_item.id IS NULL THEN
        RAISE EXCEPTION 'NO_AVAILABLE_INVENTORY' USING ERRCODE = 'P0002';
    END IF;

    -- 3. Update the item
    UPDATE public.listing_inventory
    SET 
        status = 'sold',
        order_id = p_order_id,
        buyer_id = p_buyer_id,
        updated_at = NOW()
    WHERE id = v_item.id
    RETURNING * INTO v_item;

    RETURN v_item;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- GIGBRIDGE: AUTOMATED FULFILLMENT TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_order_fulfillment()
RETURNS TRIGGER AS $$
DECLARE
    v_is_serialized BOOLEAN;
    v_item public.listing_inventory;
BEGIN
    -- 1. Only proceed if payment_status changed to 'PAID'
    IF NEW.payment_status = 'PAID' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'PAID') THEN
        
        -- 2. Check if the master listing is serialized
        SELECT is_serialized INTO v_is_serialized
        FROM public.listing_masters
        WHERE id = NEW.master_id;

        IF v_is_serialized THEN
            -- 3. Attempt to allocate an item
            -- Use the RPC logic to ensure atomicity
            BEGIN
                v_item := public.allocate_inventory_item(NEW.item_id, NEW.id, NEW.buyer_id);
                
                -- Optional: Log success or update order with a fulfillment flag
                -- RAISE NOTICE 'Allocated serial % for order %', v_item.serial_number, NEW.id;
            EXCEPTION WHEN OTHERS THEN
                -- If allocation fails (e.g., NO_AVAILABLE_INVENTORY), 
                -- we might want to flag the order for manual intervention
                -- For now, we just let the error be logged.
                RAISE WARNING 'Fulfillment failed for order %: %', NEW.id, SQLERRM;
            END;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_order_fulfillment ON public.orders;
CREATE TRIGGER on_order_fulfillment
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_order_fulfillment();

-- ==========================================
-- GIGBRIDGE: FIRST PURCHASE REWARD TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_first_purchase_reward()
RETURNS TRIGGER AS $$
DECLARE
    v_order_count INTEGER;
    v_reward_amount INTEGER := 5; -- 5 JinBeans
BEGIN
    -- 1. Only proceed if payment_status changed to 'PAID'
    IF NEW.payment_status = 'PAID' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'PAID') THEN
        
        -- 2. Check if this is the user's FIRST paid order
        SELECT COUNT(*) INTO v_order_count
        FROM public.orders
        WHERE buyer_id = NEW.buyer_id 
          AND payment_status = 'PAID';

        -- If count is 1, it means THIS is the first one
        IF v_order_count = 1 THEN
            -- 3. Award JinBeans
            UPDATE public.user_profiles
            SET beans_balance = beans_balance + v_reward_amount
            WHERE id = NEW.buyer_id;

            -- 4. Log transaction
            INSERT INTO public.bean_transactions (user_id, amount, type, reason, related_order_id)
            VALUES (NEW.buyer_id, v_reward_amount, 'EARNED', 'GigBridge First Purchase Bonus', NEW.id);
            
            -- RAISE NOTICE 'Awarded % beans to user % for first purchase', v_reward_amount, NEW.buyer_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_first_purchase_reward ON public.orders;
CREATE TRIGGER on_first_purchase_reward
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_first_purchase_reward();