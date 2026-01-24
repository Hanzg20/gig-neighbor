-- Enable RLS on provider_profiles if not already enabled
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Public providers are viewable by everyone" ON public.provider_profiles;

-- Create policy to allow public read access
CREATE POLICY "Public providers are viewable by everyone" 
ON public.provider_profiles FOR SELECT 
USING (true);

-- Ensure users can update their own provider profiles
DROP POLICY IF EXISTS "Users can update own provider profile" ON public.provider_profiles;
CREATE POLICY "Users can update own provider profile" 
ON public.provider_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Ensure users can insert their own provider profiles
DROP POLICY IF EXISTS "Users can insert own provider profile" ON public.provider_profiles;
CREATE POLICY "Users can insert own provider profile" 
ON public.provider_profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- Also enable for professional_credentials (linked table)
-- =========================================================
ALTER TABLE public.professional_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public credentials are viewable by everyone" ON public.professional_credentials;
CREATE POLICY "Public credentials are viewable by everyone" 
ON public.professional_credentials FOR SELECT 
USING (true);
