-- ==========================================
-- SQL Migration: Extend Orders Table for Web Ordering Models
-- Purpose: Add columns for rental periods, deposits, and service call fees.
-- ==========================================

-- 1. Add Support for Rental Period
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rental_start_date DATE,
ADD COLUMN IF NOT EXISTS rental_end_date DATE,
ADD COLUMN IF NOT EXISTS rental_days INTEGER;

-- 2. Add Support for Security Deposits
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS deposit_amount INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_status TEXT DEFAULT 'NONE'; -- NONE, HELD, RELEASED, FORFEITED

-- 3. Add Support for Service Call Fees (Quote & Call Model)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS service_call_fee INTEGER DEFAULT 0;

-- 4. Add Index for Date Searches (Optional but recommended)
CREATE INDEX IF NOT EXISTS idx_orders_rental_dates ON public.orders(rental_start_date, rental_end_date);

-- 5. Verification Query
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders' AND column_name IN ('rental_start_date', 'rental_end_date', 'deposit_amount', 'deposit_status', 'service_call_fee');
