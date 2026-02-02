import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  youtubeVideoId: string;
  title: string;
  isLocked?: boolean;
  thumbnailUrl?: string;
}

export const VideoPlayer = ({
  youtubeVideoId,
  title,
  isLocked = false,
  thumbnailUrl,
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate YouTube thumbnail if no custom one provided
  const thumbnail = thumbnailUrl || `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;

  if (isLocked) {
    return (
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${thumbnail})` }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/50 backdrop-blur-sm">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">Purchase course to unlock</p>
          <p className="text-sm text-muted-foreground">This lesson requires course access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted">
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div
            key="thumbnail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            {/* Thumbnail */}
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to hqdefault if maxresdefault doesn't exist
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-background/30 group-hover:bg-background/20 transition-colors" />
            
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center",
                  "bg-primary text-primary-foreground box-glow",
                  "group-hover:bg-primary/90 transition-colors"
                )}
              >
                <Play className="h-8 w-8 ml-1" fill="currentColor" />
              </motion.div>
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
              <p className="text-lg font-medium text-foreground line-clamp-1">{title}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            <iframe
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ border: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
