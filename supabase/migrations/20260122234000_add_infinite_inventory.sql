-- ==========================================
-- INFINITE INVENTORY MIGRATION
-- Purpose: Redefine allocate_inventory_item to support 'UNLIMITED' stock mode
-- Fix: Drop old signatures to prevent overloading ambiguity (PGRST203)
-- ==========================================

-- Clean up all potential signatures
DROP FUNCTION IF EXISTS public.allocate_inventory_item(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.allocate_inventory_item(UUID, UUID, UUID);
DROP FUNCTION IF EXISTS public.allocate_inventory_item(UUID, TEXT);
DROP FUNCTION IF EXISTS public.allocate_inventory_item(UUID, UUID);

CREATE OR REPLACE FUNCTION allocate_inventory_item(
  p_listing_item_id UUID,
  p_order_id UUID,
  p_buyer_id UUID DEFAULT NULL
) RETURNS TABLE (
  o_id UUID,
  o_serial_number TEXT,
  o_secret_code TEXT,
  o_provider_id UUID
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_stock_mode TEXT;
  v_inventory_row public.listing_inventory%ROWTYPE;
BEGIN
  -- 1. Check Stock Mode
  SELECT attributes->>'stockMode' INTO v_stock_mode
  FROM public.listing_items
  WHERE public.listing_items.id = p_listing_item_id;

  -- 2. Logic Branch
  IF v_stock_mode = 'UNLIMITED' THEN
    SELECT * INTO v_inventory_row
    FROM public.listing_inventory
    WHERE listing_item_id = p_listing_item_id
      AND status = 'available'
      AND (valid_from IS NULL OR valid_from <= now())
      AND (valid_until IS NULL OR valid_until >= now())
    ORDER BY valid_from ASC
    LIMIT 1;
    
    IF FOUND THEN
      RETURN QUERY SELECT 
        v_inventory_row.id, 
        v_inventory_row.serial_number, 
        v_inventory_row.secret_code, 
        v_inventory_row.provider_id;
      RETURN;
    END IF;

  ELSE
    -- Standard Mode (UNIQUE): Lock and Update
    UPDATE public.listing_inventory
    SET 
      status = 'sold',
      order_id = p_order_id,
      buyer_id = p_buyer_id,
      updated_at = now()
    WHERE public.listing_inventory.id = (
      SELECT li.id
      FROM public.listing_inventory li
      WHERE li.listing_item_id = p_listing_item_id
        AND li.status = 'available'
        AND (li.valid_from IS NULL OR li.valid_from <= now())
        AND (li.valid_until IS NULL OR li.valid_until >= now())
      ORDER BY li.valid_from ASC
      LIMIT 1
      FOR UPDATE SKIP LOCKED
    )
    RETURNING * INTO v_inventory_row;

    IF FOUND THEN
      RETURN QUERY SELECT 
        v_inventory_row.id, 
        v_inventory_row.serial_number, 
        v_inventory_row.secret_code, 
        v_inventory_row.provider_id;
      RETURN;
    END IF;
  END IF;

  -- If we get here, no inventory found
  RETURN;
END;
$$;
