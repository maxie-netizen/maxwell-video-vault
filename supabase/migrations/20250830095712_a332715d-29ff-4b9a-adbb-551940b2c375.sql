-- Delete all users and create downloads table
TRUNCATE TABLE auth.users CASCADE;

-- Create downloads table to track user downloads
CREATE TABLE public.downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  format TEXT NOT NULL, -- 'video' or 'audio'
  download_url TEXT NOT NULL,
  file_size BIGINT,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for downloads
CREATE POLICY "Users can view their own downloads" 
ON public.downloads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" 
ON public.downloads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own downloads" 
ON public.downloads 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX idx_downloads_video_id ON public.downloads(video_id);

-- Fix profiles RLS policy recursion
DROP POLICY IF EXISTS "Admin can select all profiles" ON public.profiles;
CREATE POLICY "Admin can select all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = 'admin'
  )
);