-- Add M-Pesa customization fields to merchant_payment_configs
ALTER TABLE merchant_payment_configs
ADD COLUMN IF NOT EXISTS mpesa_account_reference_template TEXT DEFAULT '{transaction_id}',
ADD COLUMN IF NOT EXISTS mpesa_transaction_desc_template TEXT DEFAULT '{description}';

-- Add enhanced transaction fields
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS receipt_number TEXT,
ADD COLUMN IF NOT EXISTS transaction_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS balance_before NUMERIC,
ADD COLUMN IF NOT EXISTS balance_after NUMERIC,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS webhook_delivered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS webhook_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS webhook_last_attempt TIMESTAMPTZ;

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  webhook_url TEXT NOT NULL,
  request_payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on webhook_logs
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for webhook_logs
CREATE POLICY "Merchants can view their own webhook logs"
ON webhook_logs FOR SELECT
USING (merchant_id IN (
  SELECT id FROM merchants WHERE user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_number ON transactions(receipt_number);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_phone ON transactions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id ON webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_merchant_id ON webhook_logs(merchant_id);

-- Create trigger for webhook_logs updated_at
CREATE TRIGGER update_webhook_logs_updated_at
BEFORE UPDATE ON webhook_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();