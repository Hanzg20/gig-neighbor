-- Add rental-specific fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rental_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rental_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deposit_amount INTEGER DEFAULT 0;

-- Update OrderStatus check constraint (if exists)
-- Note: Some environments might use a text check constraint for status
DO $$ 
BEGIN
    ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
    ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN (
        'DRAFT', 
        'PENDING_PAYMENT', 
        'PENDING_CONFIRMATION', 
        'CONFIRMED', 
        'IN_PROGRESS', 
        'COMPLETED', 
        'CANCELLED', 
        'REFUNDED',
        'PICKED_UP',
        'RETURNED'
    ));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
