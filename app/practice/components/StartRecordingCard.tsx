"use client";

import { Mic } from "lucide-react";

interface StartRecordingCardProps {
  onStartClick: () => void;
}

export function StartRecordingCard({ onStartClick }: StartRecordingCardProps) {
  return (
    <button
      type="button"
      onClick={onStartClick}
      className="flex items-center gap-16 bg-white rounded-medium px-16 py-12 shadow-medium w-full hover:bg-gray-50 transition-colors cursor-pointer"
      aria-label="Start recording"
    >
      <div className="w-10 h-10 shrink-0 rounded-full bg-[#4F7D6B]/20 flex items-center justify-center">
        <Mic className="h-5 w-5 text-[#4F7D6B]" aria-hidden />
      </div>
      <span className="flex-1 text-center text-18 font-semibold text-[#4F7D6B]">Start recording</span>
    </button>
  );
}
