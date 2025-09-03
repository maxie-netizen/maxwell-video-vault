-- Fix the recursive RLS policy issue and add username uniqueness
DROP POLICY IF EXISTS "User can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "User can view own profile" ON public.profiles;

-- Create non-recursive policies
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add unique constraint for usernames
ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Create table for video watch history with progress tracking
CREATE TABLE public.video_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT NOT NULL,
  video_thumbnail TEXT,
  channel_title TEXT,
  duration INTEGER, -- in seconds
  watch_progress INTEGER DEFAULT 0, -- in seconds
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_history ENABLE ROW LEVEL SECURITY;

-- Create policies for video_history
CREATE POLICY "Users can view their own video history" 
ON public.video_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video history" 
ON public.video_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video history" 
ON public.video_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_video_history_user_video ON public.video_history(user_id, video_id);
CREATE INDEX idx_video_history_last_watched ON public.video_history(user_id, last_watched_at DESC);

-- Create function to check username availability
CREATE OR REPLACE FUNCTION public.check_username_availability(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if username already exists (case insensitive)
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE LOWER(username) = LOWER(username_to_check)
  );
END;
$$;