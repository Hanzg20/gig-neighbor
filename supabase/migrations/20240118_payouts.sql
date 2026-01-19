-- Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES public.provider_profiles(id) NOT NULL,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    currency TEXT DEFAULT 'CAD',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'REJECTED')),
    method TEXT NOT NULL DEFAULT 'INTERAC_ETRANSFER',
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Providers can view their own payout requests"
    ON public.payout_requests FOR SELECT
    USING (auth.uid() IN (
        SELECT user_id FROM public.provider_profiles WHERE id = provider_id
    ));

CREATE POLICY "Providers can create their own payout requests"
    ON public.payout_requests FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT user_id FROM public.provider_profiles WHERE id = provider_id
    ));

-- Update updated_at trigger
CREATE TRIGGER update_payout_requests_updated_at
    BEFORE UPDATE ON public.payout_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
