-- Create user_mode_settings table for user preferences and subscription management
CREATE TABLE IF NOT EXISTS public.user_mode_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  active_mode text NOT NULL DEFAULT 'work',
  student_mode_enabled boolean DEFAULT false,
  work_mode_enabled boolean DEFAULT true,
  onboarding_completed boolean DEFAULT false,
  plan_type text DEFAULT 'free',
  subscription_status text DEFAULT 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_mode_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own settings
CREATE POLICY "Users can view own mode settings"
ON public.user_mode_settings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own settings
CREATE POLICY "Users can insert own mode settings"
ON public.user_mode_settings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own mode settings"
ON public.user_mode_settings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own settings
CREATE POLICY "Users can delete own mode settings"
ON public.user_mode_settings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_mode_settings_user_id ON public.user_mode_settings(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_user_mode_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_mode_settings_updated_at
BEFORE UPDATE ON public.user_mode_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_user_mode_settings_updated_at();
