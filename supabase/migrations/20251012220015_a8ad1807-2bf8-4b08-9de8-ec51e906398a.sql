-- Enable pg_cron and pg_net extensions for scheduled tasks
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Add RLS policy to allow users to delete their project transactions
CREATE POLICY "Users can delete their project transactions" 
ON public.transactions 
FOR DELETE 
USING (project_id IN (
  SELECT id FROM public.projects WHERE user_id = auth.uid()
));

-- Create a simple function that can be called by cron to keep database active
CREATE OR REPLACE FUNCTION public.keep_database_active()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple query to keep database active
  PERFORM COUNT(*) FROM public.projects;
END;
$$;

-- Schedule cron job to run daily to prevent database pause
SELECT cron.schedule(
  'keep-database-active',
  '0 0 * * *', -- Run daily at midnight
  $$
  SELECT public.keep_database_active();
  $$
);