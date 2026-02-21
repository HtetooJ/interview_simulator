"use client";

import { useState, useRef } from "react";
import { Mic } from "lucide-react";

const BAR_COUNT = 14;
const MAX_TILT = 50;

interface RecordingAnimationProps {
  seconds: number;
  onStopClick?: () => void;
}

export function RecordingAnimation({ seconds, onStopClick }: RecordingAnimationProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLButtonElement>(null);

  const updateTilt = (clientX: number, clientY: number) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const relX = (clientX - centerX) / Math.max(1, rect.width / 2);
    const relY = (clientY - centerY) / Math.max(1, rect.height / 2);
    const clampedX = Math.max(-1, Math.min(1, relX));
    const clampedY = Math.max(-1, Math.min(1, relY));
    // rotateX = tilt when cursor moves up/down, rotateY = tilt when cursor moves left/right
    setTilt({ x: clampedY * MAX_TILT, y: clampedX * MAX_TILT });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    updateTilt(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length > 0) {
      updateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });
  const handleTouchEnd = () => setTilt({ x: 0, y: 0 });

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={onStopClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="flex items-center gap-16 bg-white rounded-medium px-16 py-12 shadow-medium w-full hover:bg-gray-50 transition-colors cursor-pointer text-left"
      aria-label="Stop recording"
    >
      <div
        className="w-10 h-10 shrink-0 rounded-full bg-[#4F7D6B]/20 flex items-center justify-center"
        style={{ perspective: "250px", transformStyle: "preserve-3d" }}
      >
        <span
          className="inline-block transition-transform duration-150 ease-out"
          style={{
            transform: `perspective(250px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
          }}
        >
          <Mic className="h-5 w-5 text-[#4F7D6B] block" aria-hidden />
        </span>
      </div>
      <div className="flex-1 min-w-0 flex items-end justify-between gap-2 h-8">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <div
            key={i}
            className="flex-1 min-w-[3px] h-full rounded-full bg-[#4F7D6B] animate-wave-bar"
            style={{ animationDelay: `${(i / (BAR_COUNT - 1)) * 800}ms` }}
          />
        ))}
      </div>
      <span className="text-14 font-medium text-[#4F7D6B] tabular-nums shrink-0">
        {formatted}
      </span>
    </button>
  );
}
