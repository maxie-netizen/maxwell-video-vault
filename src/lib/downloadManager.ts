import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface DownloadItem {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  format: 'video' | 'audio';
  download_url: string;
  file_size?: number;
  downloaded_at: string;
  expires_at?: string;
}

export class DownloadManager {
  static async saveDownload(download: Omit<DownloadItem, 'id' | 'downloaded_at'>, userId: string) {
    try {
      const { error } = await supabase
        .from('downloads')
        .insert([{
          user_id: userId,
          video_id: download.video_id,
          title: download.title,
          thumbnail: download.thumbnail,
          format: download.format,
          download_url: download.download_url,
          file_size: download.file_size,
          expires_at: download.expires_at
        }]);

      if (error) throw error;

      toast({
        title: "Download Saved",
        description: `${download.title} has been saved to your downloads.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error saving download:', error);
      toast({
        title: "Save Failed",
        description: "Could not save download to history.",
        variant: "destructive"
      });
    }
  }

  static async getUserDownloads(userId: string): Promise<DownloadItem[]> {
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .eq('user_id', userId)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        format: item.format as 'video' | 'audio'
      }));
    } catch (error) {
      console.error('Error fetching downloads:', error);
      return [];
    }
  }

  static async deleteDownload(downloadId: string) {
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', downloadId);

      if (error) throw error;

      toast({
        title: "Download Deleted",
        description: "Download removed from history.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting download:', error);
      toast({
        title: "Delete Failed",
        description: "Could not remove download from history.",
        variant: "destructive"
      });
    }
  }

  static async downloadVideo(videoId: string, title: string, thumbnail: string, format: 'video' | 'audio', userId?: string) {
    try {
      toast({
        title: "Starting Download",
        description: `Preparing ${format} download for ${title}...`,
        variant: "default"
      });

      const apiUrl = format === 'audio' 
        ? `https://apis-keith.vercel.app/download/audio?url=https://youtu.be/${videoId}`
        : `https://apis-keith.vercel.app/download/video?url=https://youtu.be/${videoId}`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.status || !data.result) {
        throw new Error('Failed to get download URL');
      }

      // Create a download link
      const link = document.createElement('a');
      link.href = data.result;
      link.download = `${title}.${format === 'audio' ? 'mp3' : 'mp4'}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Save to downloads history if user is logged in
      if (userId) {
        await this.saveDownload({
          video_id: videoId,
          title,
          thumbnail,
          format,
          download_url: data.result
        }, userId);
      }

      toast({
        title: "Download Started",
        description: `${format === 'audio' ? 'Audio' : 'Video'} download has started.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Could not download the video. Please try again.",
        variant: "destructive"
      });
    }
  }
}