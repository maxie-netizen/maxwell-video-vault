import { useState } from "react";
import Header from "@/components/Header";
import { Download, FileVideo, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Downloads() {
  const [downloads] = useState<any[]>([]); // Placeholder for future download history
  const [loading] = useState(false); // Set to true when implementing actual download history

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 flex-1 w-full pb-20 md:pb-4">
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Downloads</h1>
          
          {loading ? (
            <div className="grid gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-card shadow-lg rounded-2xl overflow-hidden border border-border">
                  <div className="w-full h-48 bg-muted animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-8 bg-muted rounded w-16 animate-pulse" />
                      <div className="h-8 bg-muted rounded w-20 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center text-muted-foreground mt-20">
              <Download className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg">No downloads yet.</p>
              <p className="text-sm mt-2">Downloaded videos will appear here.</p>
              
              <div className="mt-8 space-y-4">
                <h3 className="text-foreground font-semibold">Supported Formats:</h3>
                <div className="flex justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <FileVideo className="h-5 w-5 text-primary" />
                    <span className="text-sm">MP4 Video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    <span className="text-sm">MP3 Audio</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {downloads.map((download, index) => (
                <div key={index} className="bg-card shadow-lg rounded-2xl overflow-hidden border border-border">
                  {/* Download item content will be added when implementing download history */}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}