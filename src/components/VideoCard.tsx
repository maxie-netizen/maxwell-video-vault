
import { Play } from "lucide-react";

interface VideoCardProps {
  video: any;
}
export default function VideoCard({ video }: VideoCardProps) {
  const { snippet, id } = video;
  return (
    <div className="bg-neutral-900 shadow-lg rounded-2xl mb-6 overflow-hidden border border-neutral-800 animate-fade-in">
      <img src={snippet.thumbnails.high.url} alt={snippet.title} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col gap-2">
        <div className="font-semibold text-base text-white mb-1">{snippet.title}</div>
        <div className="text-sm text-gray-400">{snippet.channelTitle}</div>
        <div className="flex gap-2 mt-3">
          <a
            href={`https://www.youtube.com/watch?v=${id.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 flex items-center font-semibold gap-2 transition-colors"
          >
            <Play size={16} />
            Play
          </a>
          <a
            href={`https://www.youtube.com/watch?v=${id.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center font-semibold gap-2 transition-colors"
          >
            🎵 Audio
          </a>
          <a
            href={`https://www.youtube.com/watch?v=${id.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center font-semibold gap-2 transition-colors"
          >
            🎬 Video
          </a>
        </div>
      </div>
    </div>
  );
}
