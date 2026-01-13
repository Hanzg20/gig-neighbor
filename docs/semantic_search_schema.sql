-- ==========================================
-- SEMANTIC SEARCH (AI DISCOVERY) MIGRATION v1.0
-- ==========================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to listing_masters
-- We use 384 dimensions to match OpenAI text-embedding-3-small (optimized)
ALTER TABLE public.listing_masters 
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Create a function to search for listings using vector similarity
-- We use cosine distance (<=>) for similarity
CREATE OR REPLACE FUNCTION public.match_listings (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_node_id text DEFAULT NULL,
  filter_category_id text DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  provider_id UUID,
  title_zh TEXT,
  title_en TEXT,
  description_zh TEXT,
  description_en TEXT,
  images TEXT[],
  type public.listing_type,
  category_id TEXT,
  node_id TEXT,
  tags TEXT[],
  status TEXT,
  location_address TEXT,
  rating DECIMAL,
  review_count INTEGER,
  similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.provider_id,
    m.title_zh,
    m.title_en,
    m.description_zh,
    m.description_en,
    m.images,
    m.type,
    m.category_id,
    m.node_id,
    m.tags,
    m.status,
    m.location_address,
    m.rating,
    m.review_count,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.listing_masters m
  WHERE m.status = 'PUBLISHED'
    AND (filter_node_id IS NULL OR m.node_id = filter_node_id)
    AND (filter_category_id IS NULL OR m.category_id = filter_category_id)
    AND (1 - (m.embedding <=> query_embedding) > match_threshold)
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Create an index for faster similarity search
-- HNSW index is generally faster for large datasets
CREATE INDEX IF NOT EXISTS idx_listing_masters_embedding ON public.listing_masters 
USING hnsw (embedding vector_cosine_ops);
