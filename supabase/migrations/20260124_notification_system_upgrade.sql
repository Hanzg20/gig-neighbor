-- ==========================================
-- DYNAMIC NOTIFICATION & RESTOCK AUTOMATION
-- ==========================================

-- 1. Create Communication Templates Table
CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    content TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(slug, language)
);

-- Enable RLS (Optional, usually managed by Service Role)
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- 2. Seed Initial Templates (English)
INSERT INTO public.communication_templates (slug, language, content, description)
VALUES 
('restock-alert', 'en', '[JWD Alert] Merchant Restock Needed: "${itemName}" is out of stock. Update inventory now to resume Scan-to-Buy services.', 'Variables: ${itemName}'),
('purchase-success', 'en', '[JWD] Purchase Successful! Card: ${serialNumber}. PIN: ${secretCode}. Use this at the merchant terminal. Thanks for using JUSTWEDO.com!', 'Variables: ${serialNumber}, ${secretCode}')
ON CONFLICT (slug, language) DO UPDATE 
SET content = EXCLUDED.content;

-- 3. Create Automation Trigger: Reset restock timer on new inventory
CREATE OR REPLACE FUNCTION public.fn_on_restock_reset_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act if the parent item exists and we are adding available stock
    IF NEW.listing_item_id IS NOT NULL THEN
        UPDATE public.listing_items
        SET attributes = (COALESCE(attributes, '{}'::jsonb) - 'lastRestockNotifiedAt')
        WHERE id = NEW.listing_item_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS tr_on_restock_reset ON public.listing_inventory;

-- Create trigger
CREATE TRIGGER tr_on_restock_reset
AFTER INSERT ON public.listing_inventory
FOR EACH ROW
WHEN (NEW.status = 'available')
EXECUTE FUNCTION public.fn_on_restock_reset_alert();

COMMENT ON TABLE public.communication_templates IS 'Managed SMS and notification templates with variable support.';
COMMENT ON FUNCTION public.fn_on_restock_reset_alert() IS 'Automatically clears the lastRestockNotifiedAt flag when new stock is added.';