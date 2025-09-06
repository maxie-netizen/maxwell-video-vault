import React, { useState, useEffect } from "react";
import { Play, Download, Clock, Eye, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import DownloadQualityModal from "./DownloadQualityModal";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import LikeDislikeButtons from "./LikeDislikeButtons";
import SaveButton from "./SaveButton";
import { usePlayer } from "@/contexts/PlayerContext";

interface VideoCardProps {
  video: any;
  variant?: 'default' | 'compact' | 'large';
}

export default function VideoCard({ video, variant = 'default' }: VideoCardProps) {
  const { snippet, id } = video;
  const [modalOpen, setModalOpen] = useState(false);
  const [duration, setDuration] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  const { playVideo } = usePlayer();

  useEffect(() => {
    async function fetchVideoDetails() {
      if (!id?.videoId) return;
      const apiKey = "AIzaSyBXbToqkneqDmQv5r3EOxH58PzjygpHSlg";
      
      try {
        // Fetch duration and view count
        const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${id.videoId}&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.items && data.items[0]) {
          const item = data.items[0];
          
          // Parse duration
          const iso = item.contentDetails?.duration;
          if (iso) {
            const match = iso.match(/PT((\d+)H)?((\d+)M)?((\d+)S)?/);
            const hours = match?.[2] || "0";
            const minutes = match?.[4] || "0";
            const seconds = match?.[6] || "0";
            
            if (parseInt(hours) > 0) {
              setDuration(`${parseInt(hours)}:${parseInt(minutes).toString().padStart(2, '0')}:${parseInt(seconds).toString().padStart(2, '0')}`);
            } else {
              setDuration(`${parseInt(minutes)}:${parseInt(seconds).toString().padStart(2, '0')}`);
            }
          }
          
          // Parse view count
          const views = item.statistics?.viewCount;
          if (views) {
            const num = parseInt(views);
            if (num >= 1000000) {
              setViewCount(`${(num / 1000000).toFixed(1)}M views`);
            } else if (num >= 1000) {
              setViewCount(`${(num / 1000).toFixed(1)}K views`);
            } else {
              setViewCount(`${num} views`);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching video details:', error);
      }
    }
    
    fetchVideoDetails();
  }, [id.videoId]);

  function handleDownloadClick() {
    if (!user) {
      setTimeout(() => navigate("/auth"), 150);
      return;
    }
    setModalOpen(true);
  }

  const handlePlayVideo = () => {
    playVideo({
      id: id.videoId,
      title: snippet.title,
      thumbnail: snippet.thumbnails.high.url,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      viewCount: viewCount || '0',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const getCardClasses = () => {
    switch (variant) {
      case 'compact':
        return "flex gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer";
      case 'large':
        return "bg-card shadow-lg rounded-xl overflow-hidden border border-border animate-fade-in w-full relative z-10";
      default:
        return "bg-card shadow-lg rounded-xl overflow-hidden border border-border animate-fade-in w-full relative z-10";
    }
  };

  if (variant === 'compact') {
    return (
      <div 
        className={getCardClasses()}
        onClick={handlePlayVideo}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-32 flex-shrink-0">
          <img
            src={snippet.thumbnails.medium?.url || snippet.thumbnails.high.url}
            alt={snippet.title}
            className="w-full h-20 object-cover rounded-lg"
          />
          {duration && (
            <Badge 
              variant="secondary" 
              className="absolute bottom-1 right-1 text-xs px-1 py-0 bg-black/80 text-white"
            >
              {duration}
            </Badge>
          )}
          {isHovered && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
              <Play className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1">
            {snippet.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate mb-1">
            {snippet.channelTitle}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {viewCount && <span>{viewCount}</span>}
            <span>•</span>
            <span>{formatDate(snippet.publishedAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={getCardClasses()}>
      {/* Thumbnail */}
      <div 
        className="relative group cursor-pointer"
        onClick={handlePlayVideo}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img 
          src={snippet.thumbnails.high.url} 
          alt={snippet.title} 
          className="w-full h-44 sm:h-48 object-cover transition-transform duration-200 group-hover:scale-105" 
        />
        
        {/* Duration Badge */}
        {duration && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 right-2 text-xs px-2 py-1 bg-black/80 text-white"
          >
            {duration}
          </Badge>
        )}
        
        {/* Play Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-3">
              <Play className="h-6 w-6 text-black" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {/* Title */}
        <h3 className="font-semibold text-sm sm:text-base text-foreground mb-2 line-clamp-2 leading-tight">
          {snippet.title}
        </h3>

        {/* Channel Info */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${snippet.channelTitle}&background=random`} />
            <AvatarFallback className="text-xs">{snippet.channelTitle?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs sm:text-sm text-muted-foreground truncate">
            {snippet.channelTitle}
          </span>
        </div>

        {/* Video Stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          {viewCount && (
            <>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{viewCount}</span>
              </div>
              <span>•</span>
            </>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(snippet.publishedAt)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={handlePlayVideo}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 flex items-center font-semibold gap-1 sm:gap-2 transition-colors flex-1 text-xs sm:text-sm"
          >
            <Play size={14} />
            Play
          </Button>
          
          <Button
            variant="secondary"
            className="flex items-center gap-1 sm:gap-2 flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
            onClick={handleDownloadClick}
          >
            <Download size={14} />
            Download
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SaveButton videoId={id.videoId} />
            <LikeDislikeButtons videoId={id.videoId} />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownloadClick}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SaveButton videoId={id.videoId} />
              </DropdownMenuItem>
              <DropdownMenuItem>
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Modals */}
      <DownloadQualityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        video={{
          id: id.videoId,
          title: snippet.title,
          thumbnail: snippet.thumbnails.high.url
        }}
        videoUrl={`https://youtu.be/${id.videoId}`}
      />
    </div>
  );
}
