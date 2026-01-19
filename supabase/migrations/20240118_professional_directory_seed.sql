-- 🎓 Professional Directory Seed Data
-- Adds credentials for mock providers in seed_data.sql

INSERT INTO public.professional_credentials (provider_id, type, license_number, jurisdiction, status)
VALUES 
('777b3240-3506-47ba-856e-c97f97687e49', 'ELECTRICIAN', 'ESA-7012345', 'ONTARIO', 'VERIFIED'),
('e3cb8bb8-31e9-4a3f-954f-a6139f878404', 'REAL_ESTATE_AGENT', 'RECO-998877', 'ONTARIO', 'VERIFIED')
ON CONFLICT DO NOTHING;
