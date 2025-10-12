-- Fix RLS issue by creating merchant records for existing users
INSERT INTO public.merchants (user_id, business_name, business_email)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'business_name', email) as business_name,
  email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.merchants)
ON CONFLICT (user_id) DO NOTHING;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_payment_sessions_merchant_status 
ON payment_sessions(merchant_id, status);

CREATE INDEX IF NOT EXISTS idx_transactions_merchant_created 
ON transactions(merchant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_merchants_user_id 
ON merchants(user_id);