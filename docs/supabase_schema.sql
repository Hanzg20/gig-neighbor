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
- -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 - -   G I G B R I D G E   ( S C A N - T O - B U Y )   I N F R A S T R U C T U R E   M I G R A T I O N  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 - -   1 .   E x t e n d   L i s t i n g   M a s t e r s   f o r   S e r i a l i z a t i o n  
 A L T E R   T A B L E   p u b l i c . l i s t i n g _ m a s t e r s    
 A D D   C O L U M N   I F   N O T   E X I S T S   i s _ s e r i a l i z e d   B O O L E A N   D E F A U L T   F A L S E ,  
 A D D   C O L U M N   I F   N O T   E X I S T S   f u l f i l l m e n t _ c o n f i g   J S O N B   D E F A U L T   ' { } ' : : j s o n b ;  
  
 - -   2 .   C r e a t e   L i s t i n g   I n v e n t o r y   T a b l e   ( U n i v e r s a l   A s s e t   P o o l )  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . l i s t i n g _ i n v e n t o r y   (  
         i d   U U I D   P R I M A R Y   K E Y   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( ) ,  
         l i s t i n g _ i t e m _ i d   U U I D   N O T   N U L L   R E F E R E N C E S   p u b l i c . l i s t i n g _ i t e m s ( i d )   O N   D E L E T E   C A S C A D E ,  
         p r o v i d e r _ i d   U U I D   R E F E R E N C E S   p u b l i c . p r o v i d e r _ p r o f i l e s ( i d )   O N   D E L E T E   S E T   N U L L ,  
         s e r i a l _ n u m b e r   T E X T   N O T   N U L L ,  
         s e c r e t _ c o d e   T E X T ,   - -   E n c r y p t e d   o r   p l a i n   s e c r e t   ( e . g . ,   P I N )  
         s t a t u s   T E X T   N O T   N U L L   D E F A U L T   ' a v a i l a b l e '   C H E C K   ( s t a t u s   I N   ( ' a v a i l a b l e ' ,   ' r e s e r v e d ' ,   ' s o l d ' ,   ' d e f e c t i v e ' ,   ' e x p i r e d ' ,   ' a r c h i v e d ' ) ) ,  
         v a l i d _ f r o m   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( ) ,  
         v a l i d _ u n t i l   T I M E S T A M P   W I T H   T I M E   Z O N E ,  
         m e t a d a t a   J S O N B   D E F A U L T   ' { } ' : : j s o n b ,  
         o r d e r _ i d   U U I D   R E F E R E N C E S   p u b l i c . o r d e r s ( i d )   O N   D E L E T E   S E T   N U L L ,  
         b u y e r _ i d   U U I D   R E F E R E N C E S   p u b l i c . u s e r _ p r o f i l e s ( i d )   O N   D E L E T E   S E T   N U L L ,  
         c r e a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( ) ,  
         u p d a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( ) ,  
         U N I Q U E ( l i s t i n g _ i t e m _ i d ,   s e r i a l _ n u m b e r )  
 ) ;  
  
 - -   3 .   C r e a t e   I n v e n t o r y   U s a g e   L o g s   ( F o r   m u l t i - u s e   a s s e t s )  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . i n v e n t o r y _ u s a g e _ l o g s   (  
         i d   U U I D   P R I M A R Y   K E Y   D E F A U L T   u u i d _ g e n e r a t e _ v 4 ( ) ,  
         i n v e n t o r y _ i d   U U I D   N O T   N U L L   R E F E R E N C E S   p u b l i c . l i s t i n g _ i n v e n t o r y ( i d )   O N   D E L E T E   C A S C A D E ,  
         a c t i o n _ t y p e   T E X T   N O T   N U L L   C H E C K   ( a c t i o n _ t y p e   I N   ( ' U S E ' ,   ' R E C H A R G E ' ,   ' V O I D ' ) ) ,  
         a m o u n t   I N T E G E R   D E F A U L T   - 1 ,  
         l o c a t i o n _ i d   T E X T ,  
         m e t a d a t a   J S O N B   D E F A U L T   ' { } ' : : j s o n b ,  
         c r e a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   N O W ( )  
 ) ;  
  
 - -   4 .   E n a b l e   R L S  
 A L T E R   T A B L E   p u b l i c . l i s t i n g _ i n v e n t o r y   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
 A L T E R   T A B L E   p u b l i c . i n v e n t o r y _ u s a g e _ l o g s   E N A B L E   R O W   L E V E L   S E C U R I T Y ;  
  
 - -   5 .   B a s i c   R L S   P o l i c i e s  
 - -   P r o v i d e r s   c a n   m a n a g e   t h e i r   o w n   i n v e n t o r y  
 C R E A T E   P O L I C Y   " P r o v i d e r s   c a n   m a n a g e   o w n   i n v e n t o r y "   O N   p u b l i c . l i s t i n g _ i n v e n t o r y  
         F O R   A L L   T O   a u t h e n t i c a t e d  
         U S I N G   ( E X I S T S   (  
                 S E L E C T   1   F R O M   p u b l i c . p r o v i d e r _ p r o f i l e s   p    
                 W H E R E   p . i d   =   p r o v i d e r _ i d   A N D   p . o w n e r _ i d   =   a u t h . u i d ( )  
         ) ) ;  
  
 - -   B u y e r s   c a n   s e e   t h e i r   p u r c h a s e d   a s s e t s  
 C R E A T E   P O L I C Y   " B u y e r s   c a n   v i e w   t h e i r   o w n e d   a s s e t s "   O N   p u b l i c . l i s t i n g _ i n v e n t o r y  
         F O R   S E L E C T   T O   a u t h e n t i c a t e d  
         U S I N G   ( b u y e r _ i d   =   a u t h . u i d ( ) ) ;  
  
 - -   6 .   T r i g g e r s   f o r   u p d a t e d _ a t  
 C R E A T E   T R I G G E R   s e t _ t i m e s t a m p _ i n v e n t o r y  
 B E F O R E   U P D A T E   O N   p u b l i c . l i s t i n g _ i n v e n t o r y  
 F O R   E A C H   R O W   E X E C U T E   F U N C T I O N   t r i g g e r _ s e t _ t i m e s t a m p ( ) ;  
  
 - -   7 .   A d d   I n d e x   f o r   h i g h - p e r f o r m a n c e   a t o m i c   a l l o c a t i o n  
 C R E A T E   I N D E X   I F   N O T   E X I S T S   i d x _ i n v e n t o r y _ a l l o c   O N   p u b l i c . l i s t i n g _ i n v e n t o r y   ( l i s t i n g _ i t e m _ i d ,   s t a t u s )   W H E R E   ( s t a t u s   =   ' a v a i l a b l e ' ) ;  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 - -   G I G B R I D G E :   A T O M I C   I N V E N T O R Y   A L L O C A T I O N   R P C  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 C R E A T E   O R   R E P L A C E   F U N C T I O N   p u b l i c . a l l o c a t e _ i n v e n t o r y _ i t e m (  
         p _ l i s t i n g _ i t e m _ i d   U U I D ,  
         p _ o r d e r _ i d   U U I D ,  
         p _ b u y e r _ i d   U U I D  
 )  
 R E T U R N S   p u b l i c . l i s t i n g _ i n v e n t o r y   A S   $ $  
 D E C L A R E  
         v _ i t e m   p u b l i c . l i s t i n g _ i n v e n t o r y ;  
 B E G I N  
         - -   1 .   T r y   t o   f i n d   a n d   l o c k   o n e   a v a i l a b l e   i t e m  
         - -   S K I P   L O C K E D   e n s u r e s   w e   d o n ' t   w a i t   f o r   o t h e r   t r a n s a c t i o n s   a n d   d o n ' t   d o u b l e - a l l o c a t e  
         S E L E C T   *   I N T O   v _ i t e m  
         F R O M   p u b l i c . l i s t i n g _ i n v e n t o r y  
         W H E R E   l i s t i n g _ i t e m _ i d   =   p _ l i s t i n g _ i t e m _ i d  
             A N D   s t a t u s   =   ' a v a i l a b l e '  
         L I M I T   1  
         F O R   U P D A T E   S K I P   L O C K E D ;  
  
         - -   2 .   C h e c k   i f   w e   f o u n d   a n   i t e m  
         I F   v _ i t e m . i d   I S   N U L L   T H E N  
                 R A I S E   E X C E P T I O N   ' N O _ A V A I L A B L E _ I N V E N T O R Y '   U S I N G   E R R C O D E   =   ' P 0 0 0 2 ' ;  
         E N D   I F ;  
  
         - -   3 .   U p d a t e   t h e   i t e m  
         U P D A T E   p u b l i c . l i s t i n g _ i n v e n t o r y  
         S E T    
                 s t a t u s   =   ' s o l d ' ,  
                 o r d e r _ i d   =   p _ o r d e r _ i d ,  
                 b u y e r _ i d   =   p _ b u y e r _ i d ,  
                 u p d a t e d _ a t   =   N O W ( )  
         W H E R E   i d   =   v _ i t e m . i d  
         R E T U R N I N G   *   I N T O   v _ i t e m ;  
  
         R E T U R N   v _ i t e m ;  
 E N D ;  
 $ $   L A N G U A G E   p l p g s q l   S E C U R I T Y   D E F I N E R ;  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 - -   G I G B R I D G E :   A U T O M A T E D   F U L F I L L M E N T   T R I G G E R  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 C R E A T E   O R   R E P L A C E   F U N C T I O N   p u b l i c . h a n d l e _ o r d e r _ f u l f i l l m e n t ( )  
 R E T U R N S   T R I G G E R   A S   $ $  
 D E C L A R E  
         v _ i s _ s e r i a l i z e d   B O O L E A N ;  
         v _ i t e m   p u b l i c . l i s t i n g _ i n v e n t o r y ;  
 B E G I N  
         - -   1 .   O n l y   p r o c e e d   i f   p a y m e n t _ s t a t u s   c h a n g e d   t o   ' P A I D '  
         I F   N E W . p a y m e n t _ s t a t u s   =   ' P A I D '   A N D   ( O L D . p a y m e n t _ s t a t u s   I S   N U L L   O R   O L D . p a y m e n t _ s t a t u s   ! =   ' P A I D ' )   T H E N  
                  
                 - -   2 .   C h e c k   i f   t h e   m a s t e r   l i s t i n g   i s   s e r i a l i z e d  
                 S E L E C T   i s _ s e r i a l i z e d   I N T O   v _ i s _ s e r i a l i z e d  
                 F R O M   p u b l i c . l i s t i n g _ m a s t e r s  
                 W H E R E   i d   =   N E W . m a s t e r _ i d ;  
  
                 I F   v _ i s _ s e r i a l i z e d   T H E N  
                         - -   3 .   A t t e m p t   t o   a l l o c a t e   a n   i t e m  
                         - -   U s e   t h e   R P C   l o g i c   t o   e n s u r e   a t o m i c i t y  
                         B E G I N  
                                 v _ i t e m   : =   p u b l i c . a l l o c a t e _ i n v e n t o r y _ i t e m ( N E W . i t e m _ i d ,   N E W . i d ,   N E W . b u y e r _ i d ) ;  
                                  
                                 - -   O p t i o n a l :   L o g   s u c c e s s   o r   u p d a t e   o r d e r   w i t h   a   f u l f i l l m e n t   f l a g  
                                 - -   R A I S E   N O T I C E   ' A l l o c a t e d   s e r i a l   %   f o r   o r d e r   % ' ,   v _ i t e m . s e r i a l _ n u m b e r ,   N E W . i d ;  
                         E X C E P T I O N   W H E N   O T H E R S   T H E N  
                                 - -   I f   a l l o c a t i o n   f a i l s   ( e . g . ,   N O _ A V A I L A B L E _ I N V E N T O R Y ) ,    
                                 - -   w e   m i g h t   w a n t   t o   f l a g   t h e   o r d e r   f o r   m a n u a l   i n t e r v e n t i o n  
                                 - -   F o r   n o w ,   w e   j u s t   l e t   t h e   e r r o r   b e   l o g g e d .  
                                 R A I S E   W A R N I N G   ' F u l f i l l m e n t   f a i l e d   f o r   o r d e r   % :   % ' ,   N E W . i d ,   S Q L E R R M ;  
                         E N D ;  
                 E N D   I F ;  
         E N D   I F ;  
  
         R E T U R N   N E W ;  
 E N D ;  
 $ $   L A N G U A G E   p l p g s q l   S E C U R I T Y   D E F I N E R ;  
  
 - -   C r e a t e   t h e   t r i g g e r  
 D R O P   T R I G G E R   I F   E X I S T S   o n _ o r d e r _ f u l f i l l m e n t   O N   p u b l i c . o r d e r s ;  
 C R E A T E   T R I G G E R   o n _ o r d e r _ f u l f i l l m e n t  
         A F T E R   U P D A T E   O N   p u b l i c . o r d e r s  
         F O R   E A C H   R O W  
         E X E C U T E   F U N C T I O N   p u b l i c . h a n d l e _ o r d e r _ f u l f i l l m e n t ( ) ;  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 - -   G I G B R I D G E :   F I R S T   P U R C H A S E   R E W A R D   T R I G G E R  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 C R E A T E   O R   R E P L A C E   F U N C T I O N   p u b l i c . h a n d l e _ f i r s t _ p u r c h a s e _ r e w a r d ( )  
 R E T U R N S   T R I G G E R   A S   $ $  
 D E C L A R E  
         v _ o r d e r _ c o u n t   I N T E G E R ;  
         v _ r e w a r d _ a m o u n t   I N T E G E R   : =   5 ;   - -   5   J i n B e a n s  
 B E G I N  
         - -   1 .   O n l y   p r o c e e d   i f   p a y m e n t _ s t a t u s   c h a n g e d   t o   ' P A I D '  
         I F   N E W . p a y m e n t _ s t a t u s   =   ' P A I D '   A N D   ( O L D . p a y m e n t _ s t a t u s   I S   N U L L   O R   O L D . p a y m e n t _ s t a t u s   ! =   ' P A I D ' )   T H E N  
                  
                 - -   2 .   C h e c k   i f   t h i s   i s   t h e   u s e r ' s   F I R S T   p a i d   o r d e r  
                 S E L E C T   C O U N T ( * )   I N T O   v _ o r d e r _ c o u n t  
                 F R O M   p u b l i c . o r d e r s  
                 W H E R E   b u y e r _ i d   =   N E W . b u y e r _ i d    
                     A N D   p a y m e n t _ s t a t u s   =   ' P A I D ' ;  
  
                 - -   I f   c o u n t   i s   1 ,   i t   m e a n s   T H I S   i s   t h e   f i r s t   o n e  
                 I F   v _ o r d e r _ c o u n t   =   1   T H E N  
                         - -   3 .   A w a r d   J i n B e a n s  
                         U P D A T E   p u b l i c . u s e r _ p r o f i l e s  
                         S E T   b e a n s _ b a l a n c e   =   b e a n s _ b a l a n c e   +   v _ r e w a r d _ a m o u n t  
                         W H E R E   i d   =   N E W . b u y e r _ i d ;  
  
                         - -   4 .   L o g   t r a n s a c t i o n  
                         I N S E R T   I N T O   p u b l i c . b e a n _ t r a n s a c t i o n s   ( u s e r _ i d ,   a m o u n t ,   t y p e ,   r e a s o n ,   r e l a t e d _ o r d e r _ i d )  
                         V A L U E S   ( N E W . b u y e r _ i d ,   v _ r e w a r d _ a m o u n t ,   ' E A R N E D ' ,   ' G i g B r i d g e   F i r s t   P u r c h a s e   B o n u s ' ,   N E W . i d ) ;  
                          
                         - -   R A I S E   N O T I C E   ' A w a r d e d   %   b e a n s   t o   u s e r   %   f o r   f i r s t   p u r c h a s e ' ,   v _ r e w a r d _ a m o u n t ,   N E W . b u y e r _ i d ;  
                 E N D   I F ;  
         E N D   I F ;  
  
         R E T U R N   N E W ;  
 E N D ;  
 $ $   L A N G U A G E   p l p g s q l   S E C U R I T Y   D E F I N E R ;  
  
 - -   C r e a t e   t h e   t r i g g e r  
 D R O P   T R I G G E R   I F   E X I S T S   o n _ f i r s t _ p u r c h a s e _ r e w a r d   O N   p u b l i c . o r d e r s ;  
 C R E A T E   T R I G G E R   o n _ f i r s t _ p u r c h a s e _ r e w a r d  
         A F T E R   U P D A T E   O N   p u b l i c . o r d e r s  
         F O R   E A C H   R O W  
         E X E C U T E   F U N C T I O N   p u b l i c . h a n d l e _ f i r s t _ p u r c h a s e _ r e w a r d ( ) ;  
 