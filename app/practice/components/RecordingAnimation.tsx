"use client";

import { Mic } from "lucide-react";

const BAR_COUNT = 14;

export function RecordingAnimation({ seconds }: { seconds: number }) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${minutes}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-16 bg-white rounded-medium px-16 py-12 shadow-medium">
      <div className="w-10 h-10 shrink-0 rounded-full bg-[#4F7D6B]/20 flex items-center justify-center">
        <Mic className="h-5 w-5 text-[#4F7D6B]" aria-hidden />
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
    </div>
  );
}
