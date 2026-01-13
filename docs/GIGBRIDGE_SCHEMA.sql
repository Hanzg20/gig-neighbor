-- ==========================================
-- GigBridge Atomic Fulfillment Schema
-- ==========================================

-- 1. Ensure tables exist (listing_inventory is already present but let's ensure indices)
CREATE INDEX IF NOT EXISTS idx_inventory_listing_item_status ON public.listing_inventory (listing_item_id, status);

-- 2. Atomic Allocation RPC Function
-- This uses FOR UPDATE SKIP LOCKED to prevent double-allocation
CREATE OR REPLACE FUNCTION public.allocate_inventory_item(
    p_listing_item_id UUID,
    p_order_id TEXT,
    p_buyer_id TEXT DEFAULT NULL
)
RETURNS public.listing_inventory
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_allocated_item public.listing_inventory;
BEGIN
    -- Atomic update with concurrency protection
    UPDATE public.listing_inventory
    SET 
        status = 'sold',
        order_id = p_order_id,
        buyer_id = p_buyer_id,
        updated_at = NOW()
    WHERE id = (
        SELECT id 
        FROM public.listing_inventory
        WHERE listing_item_id = p_listing_item_id 
          AND status = 'available'
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING * INTO v_allocated_item;

    -- Guard: Throw explicit error if no items available
    IF v_allocated_item IS NULL THEN
        RAISE EXCEPTION 'NO_AVAILABLE_INVENTORY' USING ERRCODE = 'P0002';
    END IF;

    RETURN v_allocated_item;
END;
$$;

-- 3. Fulfillment Post-Processing Hook (Optional but recommended)
-- This can be used to trigger SMS/Rewards from DB layer if needed
CREATE OR REPLACE FUNCTION public.handle_order_fulfillment()
RETURNS TRIGGER AS $$
BEGIN
    -- If order is paid and is SCAN_TO_BUY, ensure it has inventory
    IF (NEW.status = 'COMPLETED' AND NEW.actual_transaction_model = 'SCAN_TO_BUY') THEN
        -- Link inventory if not already linked (though usually handled by webhook)
        NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
