import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { M, useResolvedUrl } from "@/lib/media";

export type CarouselItem = { id: string; url: string; media_type?: string | null };

function isVideoUrl(url: string) {
  const clean = url.split("?")[0].toLowerCase();
  return /\.(mp4|webm|mov|m4v|ogg|ogv)$/.test(clean);
}

export function MediaCarousel({
  items,
  aspect = "aspect-video",
  intervalMs = 5000,
  alt = "",
  rounded = "",
}: {
  items: CarouselItem[];
  aspect?: string;
  intervalMs?: number;
  alt?: string;
  rounded?: string;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setI((prev) => (prev >= items.length ? 0 : prev));
  }, [items.length]);

  useEffect(() => {
    setPlayingVideo(false);
  }, [i]);

  useEffect(() => {
    if (items.length <= 1) return;
    if (paused || playingVideo) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), intervalMs);
    return () => clearInterval(t);
  }, [items.length, paused, playingVideo, intervalMs]);

  if (items.length === 0) {
    return <div className={`${aspect} bg-surface ${rounded}`} aria-hidden />;
  }

  const cur = items[i];
  const video = cur.media_type ? cur.media_type === "video" : isVideoUrl(cur.url);

  const go = (n: number) => setI((n + items.length) % items.length);

  return (
    <div
      className={`relative ${aspect} bg-ink overflow-hidden ${rounded}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {video ? (
        <>
          <V
            ref={videoRef as never}
            src={cur.url}
            className="size-full object-contain bg-black"
            controls={playingVideo}
            playsInline
            onPlay={() => setPlayingVideo(true)}
            onPause={() => setPlayingVideo(false)}
            onEnded={() => {
              setPlayingVideo(false);
              if (items.length > 1) go(i + 1);
            }}
          />
          {!playingVideo && (
            <button
              type="button"
              aria-label="Play video"
              onClick={() => {
                const el = videoRef.current;
                if (el) {
                  el.play().catch(() => {});
                }
              }}
              className="absolute inset-0 grid place-items-center bg-black/25 hover:bg-black/10 transition-colors"
            >
              <span className="size-16 md:size-20 rounded-full bg-white/90 grid place-items-center shadow-2xl">
                <Play className="size-7 md:size-8 text-brand-green translate-x-0.5" />
              </span>
            </button>
          )}
        </>
      ) : (
        <M src={cur.url} alt={alt} className="size-full object-cover" />
      )}

      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              go(i - 1);
            }}
            className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 size-9 md:size-10 bg-white/90 grid place-items-center hover:bg-white z-10"
          >
            <ChevronLeft className="size-4 md:size-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              go(i + 1);
            }}
            className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 size-9 md:size-10 bg-white/90 grid place-items-center hover:bg-white z-10"
          >
            <ChevronRight className="size-4 md:size-5" />
          </button>
          <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {items.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setI(idx);
                }}
                className={`size-2 rounded-full transition-colors ${idx === i ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
