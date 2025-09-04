-- Fix video_history table constraint for ON CONFLICT
ALTER TABLE public.video_history 
ADD CONSTRAINT video_history_user_video_unique UNIQUE (user_id, video_id);