-- Rename merchants table to projects for clarity
ALTER TABLE public.merchants RENAME TO projects;

-- Update foreign key columns in related tables to use project_id naming
ALTER TABLE public.merchant_payment_configs RENAME COLUMN merchant_id TO project_id;
ALTER TABLE public.payment_links RENAME COLUMN merchant_id TO project_id;
ALTER TABLE public.payment_sessions RENAME COLUMN merchant_id TO project_id;
ALTER TABLE public.transactions RENAME COLUMN merchant_id TO project_id;
ALTER TABLE public.webhook_logs RENAME COLUMN merchant_id TO project_id;

-- Update the handle_new_user trigger to NOT auto-create a project
-- Users will manually create their first project
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- No longer auto-creating a project
  -- Users will create projects manually
  RETURN NEW;
END;
$function$;

-- Update RLS policies for projects table
DROP POLICY IF EXISTS "Users can view their own merchant profile" ON public.projects;
DROP POLICY IF EXISTS "Users can insert their own merchant profile" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own merchant profile" ON public.projects;

CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
ON public.projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
USING (auth.uid() = user_id);

-- Update RLS policies for merchant_payment_configs
DROP POLICY IF EXISTS "Merchants can view their own payment configs" ON public.merchant_payment_configs;
DROP POLICY IF EXISTS "Merchants can insert their own payment configs" ON public.merchant_payment_configs;
DROP POLICY IF EXISTS "Merchants can update their own payment configs" ON public.merchant_payment_configs;
DROP POLICY IF EXISTS "Merchants can delete their own payment configs" ON public.merchant_payment_configs;

CREATE POLICY "Users can view their project payment configs"
ON public.merchant_payment_configs
FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their project payment configs"
ON public.merchant_payment_configs
FOR INSERT
WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their project payment configs"
ON public.merchant_payment_configs
FOR UPDATE
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their project payment configs"
ON public.merchant_payment_configs
FOR DELETE
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Update RLS policies for payment_links
DROP POLICY IF EXISTS "Merchants can view their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can insert their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can update their own payment links" ON public.payment_links;
DROP POLICY IF EXISTS "Merchants can delete their own payment links" ON public.payment_links;

CREATE POLICY "Users can view their project payment links"
ON public.payment_links
FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their project payment links"
ON public.payment_links
FOR INSERT
WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their project payment links"
ON public.payment_links
FOR UPDATE
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their project payment links"
ON public.payment_links
FOR DELETE
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Update RLS policies for payment_sessions
DROP POLICY IF EXISTS "Merchants can create payment sessions" ON public.payment_sessions;

CREATE POLICY "Users can create payment sessions for their projects"
ON public.payment_sessions
FOR INSERT
WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Update RLS policies for transactions
DROP POLICY IF EXISTS "Merchants can view their own transactions" ON public.transactions;

CREATE POLICY "Users can view their project transactions"
ON public.transactions
FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Update RLS policies for webhook_logs
DROP POLICY IF EXISTS "Merchants can view their own webhook logs" ON public.webhook_logs;

CREATE POLICY "Users can view their project webhook logs"
ON public.webhook_logs
FOR SELECT
USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));