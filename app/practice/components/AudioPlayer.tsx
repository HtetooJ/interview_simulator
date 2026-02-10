"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
}

/**
 * Convert a base64 data URL to a Blob Object URL.
 * Data URLs are unreliable for HTMLAudioElement playback (especially large ones),
 * so we convert them back to a Blob and create a proper Object URL.
 */
function dataUrlToBlobUrl(dataUrl: string): string {
  const [header, base64Data] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "audio/webm";
  const byteString = atob(base64Data);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([uint8Array], { type: mime });
  return URL.createObjectURL(blob);
}

export function AudioPlayer({ audioUrl }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Convert data URLs to blob URLs for reliable audio playback
    let resolvedUrl = audioUrl;
    if (audioUrl.startsWith("data:")) {
      try {
        resolvedUrl = dataUrlToBlobUrl(audioUrl);
        blobUrlRef.current = resolvedUrl;
      } catch {
        console.error("Failed to convert data URL to blob URL");
        setIsLoading(false);
        return;
      }
    }

    // Create audio element with a proper blob URL
    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;

    // Set up event listeners
    const updateTime = () => setCurrentTime(audio.currentTime);
    const trySetDuration = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        setIsLoading(false);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // Some formats only report correct duration after full playback
      trySetDuration();
    };
    const handleError = () => {
      setIsLoading(false);
      console.error("Error loading audio");
    };

    audio.addEventListener("timeupdate", updateTime);
    // loadedmetadata is the standard event, but some formats (webm blobs)
    // may not fire it reliably — listen to multiple events as fallback
    audio.addEventListener("loadedmetadata", trySetDuration);
    audio.addEventListener("canplaythrough", trySetDuration);
    audio.addEventListener("durationchange", trySetDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    // Cleanup
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", trySetDuration);
      audio.removeEventListener("canplaythrough", trySetDuration);
      audio.removeEventListener("durationchange", trySetDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
      // Revoke the blob URL to free memory
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <button
      onClick={togglePlayPause}
      disabled={isLoading}
      className="relative flex items-center justify-center w-[88px] h-[88px] rounded-full bg-[#7A9C8B] hover:bg-[#7A9C8B]/90 text-white shadow-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors overflow-hidden disabled:opacity-50"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {duration > 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-[#4F7D6B] transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center">
        {isPlaying ? (
          <Pause className="h-12 w-12" />
        ) : (
          <Play className="h-12 w-12 ml-0.5" />
        )}
      </span>
    </button>
  );
}
