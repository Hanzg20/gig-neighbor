-- ==========================================
-- PGVECTOR SETUP (Optional - Run after enabling pgvector)
-- ==========================================
-- This script adds vector embedding columns for AI search
-- Only run this after you've enabled pgvector extension in Supabase
-- Dashboard > Database > Extensions > search "vector" > Enable

-- ==========================================
-- STEP 1: Enable pgvector extension
-- ==========================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- STEP 2: Add embedding columns to existing tables
-- ==========================================

-- 2.1 Add embedding to listing_masters (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listing_masters' 
    AND column_name = 'embedding'
  ) THEN
    ALTER TABLE public.listing_masters 
    ADD COLUMN embedding vector(384);
    
    RAISE NOTICE 'Added embedding column to listing_masters';
  ELSE
    RAISE NOTICE 'Embedding column already exists in listing_masters';
  END IF;
END $$;

-- 2.2 Add embedding to reviews (for story carousel)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reviews' 
    AND column_name = 'embedding'
  ) THEN
    ALTER TABLE public.reviews 
    ADD COLUMN embedding vector(384);
    
    RAISE NOTICE 'Added embedding column to reviews';
  ELSE
    RAISE NOTICE 'Embedding column already exists in reviews';
  END IF;
END $$;

-- ==========================================
-- STEP 3: Create indexes for vector similarity search
-- ==========================================

-- Index for listing_masters embeddings (using HNSW algorithm)
CREATE INDEX IF NOT EXISTS listing_masters_embedding_idx 
ON public.listing_masters 
USING hnsw (embedding vector_cosine_ops);

-- Index for reviews embeddings
CREATE INDEX IF NOT EXISTS reviews_embedding_idx 
ON public.reviews 
USING hnsw (embedding vector_cosine_ops);

-- ==========================================
-- STEP 4: Verify setup
-- ==========================================

-- Check that vector extension is available
SELECT 
  extname AS extension_name,
  extversion AS version
FROM pg_extension 
WHERE extname = 'vector';

-- Check that embedding columns exist
SELECT 
  table_name,
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE column_name = 'embedding'
AND table_schema = 'public';

-- ==========================================
-- SUCCESS!
-- ==========================================
-- Next steps:
-- 1. Deploy the Edge Function: supabase functions deploy generate-embedding
-- 2. Set OpenAI API key: supabase secrets set OPENAI_API_KEY=sk-...
-- 3. Test semantic search in your app
