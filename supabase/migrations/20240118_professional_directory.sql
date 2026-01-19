-- 🎓 Professional Directory Verification Table
-- Supports Lawyers, Real Estate Agents, Electricians, etc.

CREATE TABLE IF NOT EXISTS public.professional_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'LAWYER', 'REAL_ESTATE_AGENT', 'HVAC', 'ELECTRICIAN', etc.
  license_number TEXT NOT NULL,
  jurisdiction TEXT DEFAULT 'ONTARIO',
  extra_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'VERIFIED', -- 'VERIFIED', 'PENDING', 'EXPIRED', 'REJECTED'
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS credentials_provider_id_idx ON public.professional_credentials(provider_id);

-- Enable RLS
ALTER TABLE public.professional_credentials ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Professional credentials are viewable by everyone'
    ) THEN
        CREATE POLICY "Professional credentials are viewable by everyone"
          ON public.professional_credentials FOR SELECT
          USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Providers can manage their own credentials'
    ) THEN
        CREATE POLICY "Providers can manage their own credentials"
          ON public.professional_credentials FOR ALL
          USING (
            provider_id IN (
              SELECT id FROM public.provider_profiles WHERE user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_credentials'
    ) THEN
        CREATE TRIGGER set_updated_at_credentials
        BEFORE UPDATE ON public.professional_credentials
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
