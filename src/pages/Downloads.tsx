import { useState } from "react";
import Header from "@/components/Header";
import { Download, FileVideo, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Downloads() {
  const [downloads] = useState<any[]>([]); // Placeholder for future download history

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="max-w-2xl mx-auto px-4 flex-1 w-full pb-20 md:pb-4">
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">Downloads</h1>
          
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
        </div>
      </main>
    </div>
  );
}