-- Create merchants table
CREATE TABLE public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT,
  business_phone TEXT,
  api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create merchant_payment_configs table
CREATE TABLE public.merchant_payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  
  -- M-Pesa fields
  mpesa_consumer_key TEXT,
  mpesa_consumer_secret TEXT,
  mpesa_shortcode TEXT,
  mpesa_passkey TEXT,
  mpesa_callback_url TEXT,
  
  -- Airtel Money fields
  airtel_client_id TEXT,
  airtel_client_secret TEXT,
  airtel_merchant_code TEXT,
  
  -- PayPal fields
  paypal_client_id TEXT,
  paypal_secret TEXT,
  
  -- Credit Card fields
  card_processor TEXT,
  card_api_key TEXT,
  card_secret_key TEXT,
  
  is_sandbox BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(merchant_id, payment_method)
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  session_id UUID,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_reference TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment_sessions table for tracking active payments
CREATE TABLE public.payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  description TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  checkout_url TEXT,
  callback_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for merchants table
CREATE POLICY "Users can view their own merchant profile"
  ON public.merchants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own merchant profile"
  ON public.merchants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own merchant profile"
  ON public.merchants FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for merchant_payment_configs table
CREATE POLICY "Merchants can view their own payment configs"
  ON public.merchant_payment_configs FOR SELECT
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can insert their own payment configs"
  ON public.merchant_payment_configs FOR INSERT
  WITH CHECK (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can update their own payment configs"
  ON public.merchant_payment_configs FOR UPDATE
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "Merchants can delete their own payment configs"
  ON public.merchant_payment_configs FOR DELETE
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- RLS Policies for transactions table
CREATE POLICY "Merchants can view their own transactions"
  ON public.transactions FOR SELECT
  USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "System can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update transactions"
  ON public.transactions FOR UPDATE
  USING (true);

-- RLS Policies for payment_sessions table (customers need to read their session)
CREATE POLICY "Anyone can view payment sessions"
  ON public.payment_sessions FOR SELECT
  USING (true);

CREATE POLICY "Merchants can create payment sessions"
  ON public.payment_sessions FOR INSERT
  WITH CHECK (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

CREATE POLICY "System can update payment sessions"
  ON public.payment_sessions FOR UPDATE
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_merchants_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_merchant_payment_configs_updated_at
  BEFORE UPDATE ON public.merchant_payment_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_sessions_updated_at
  BEFORE UPDATE ON public.payment_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create merchant profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.merchants (user_id, business_name, business_email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'business_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for transactions and payment_sessions
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.payment_sessions REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_sessions;

-- Create indexes for better performance
CREATE INDEX idx_transactions_merchant_id ON public.transactions(merchant_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_payment_sessions_merchant_id ON public.payment_sessions(merchant_id);
CREATE INDEX idx_payment_sessions_status ON public.payment_sessions(status);
CREATE INDEX idx_merchant_payment_configs_merchant_id ON public.merchant_payment_configs(merchant_id);