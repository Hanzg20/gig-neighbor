-- ==========================================
-- FAILED FULFILLMENT TRACKING TABLE
-- ==========================================
-- Purpose: Track orders where payment succeeded but inventory allocation failed
-- Use Case: Manual intervention, support tickets, automated retries

CREATE TABLE IF NOT EXISTS public.failed_fulfillments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    error_message TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.user_profiles(id)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_failed_fulfillments_order ON public.failed_fulfillments(order_id);
CREATE INDEX IF NOT EXISTS idx_failed_fulfillments_unresolved ON public.failed_fulfillments(resolved_at) WHERE resolved_at IS NULL;

-- Enable RLS
ALTER TABLE public.failed_fulfillments ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins/support can view (you can customize this based on your role system)
CREATE POLICY "System and admins can view failed fulfillments" 
ON public.failed_fulfillments FOR SELECT 
USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- Policy: Only service role can insert (webhook)
CREATE POLICY "Service role can insert failed fulfillments" 
ON public.failed_fulfillments FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.failed_fulfillments IS 'Tracks orders where payment succeeded but inventory allocation failed, enabling manual intervention.';
