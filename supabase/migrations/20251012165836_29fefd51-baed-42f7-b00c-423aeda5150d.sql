-- Add redirect URLs to payment_sessions table
ALTER TABLE public.payment_sessions
ADD COLUMN IF NOT EXISTS success_redirect_url text,
ADD COLUMN IF NOT EXISTS failure_redirect_url text,
ADD COLUMN IF NOT EXISTS cancel_redirect_url text;

-- Create payment_links table for reusable payment links
CREATE TABLE IF NOT EXISTS public.payment_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  title text NOT NULL,
  amount numeric,
  currency text NOT NULL DEFAULT 'KES',
  description text,
  is_active boolean DEFAULT true,
  max_uses integer,
  current_uses integer DEFAULT 0,
  expires_at timestamp with time zone,
  success_redirect_url text,
  failure_redirect_url text,
  cancel_redirect_url text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on payment_links
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for payment_links
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_links' AND policyname = 'Merchants can view their own payment links'
  ) THEN
    CREATE POLICY "Merchants can view their own payment links"
    ON public.payment_links
    FOR SELECT
    USING (merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_links' AND policyname = 'Merchants can insert their own payment links'
  ) THEN
    CREATE POLICY "Merchants can insert their own payment links"
    ON public.payment_links
    FOR INSERT
    WITH CHECK (merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_links' AND policyname = 'Merchants can update their own payment links'
  ) THEN
    CREATE POLICY "Merchants can update their own payment links"
    ON public.payment_links
    FOR UPDATE
    USING (merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payment_links' AND policyname = 'Merchants can delete their own payment links'
  ) THEN
    CREATE POLICY "Merchants can delete their own payment links"
    ON public.payment_links
    FOR DELETE
    USING (merchant_id IN (
      SELECT id FROM public.merchants WHERE user_id = auth.uid()
    ));
  END IF;
END $$;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_payment_links_updated_at ON public.payment_links;
CREATE TRIGGER update_payment_links_updated_at
BEFORE UPDATE ON public.payment_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance (skip if exists)
CREATE INDEX IF NOT EXISTS idx_payment_links_merchant_id ON public.payment_links(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_is_active ON public.payment_links(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_sessions_status ON public.payment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);