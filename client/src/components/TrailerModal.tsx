import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Play } from 'lucide-react';

interface TrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filmTitle: string;
  trailerUrl?: string;
}

export function TrailerModal({ open, onOpenChange, filmTitle, trailerUrl }: TrailerModalProps) {
  // Default demo trailer URLs (in production these would come from the database)
  const demoTrailers: Record<string, string> = {
    "Neon Dreams": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "Ocean's Edge": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "Mind Palace": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "Crimson Sky": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "Silent Echo": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "Digital Horizon": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  };

  const videoUrl = trailerUrl || demoTrailers[filmTitle] || "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-card border-border p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Play className="h-5 w-5 text-primary" />
            {filmTitle} - Trailer
          </DialogTitle>
        </DialogHeader>
        
        <div className="aspect-video w-full">
          <iframe
            src={videoUrl}
            title={`${filmTitle} Trailer`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
