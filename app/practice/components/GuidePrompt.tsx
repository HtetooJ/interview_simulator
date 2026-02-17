"use client";

import { Lamp } from "lucide-react";

interface GuidePromptProps {
  title: string;
  bullets: readonly string[];
}

export function GuidePrompt({ title, bullets }: GuidePromptProps) {
  return (
    <div className="space-y-12">
      <div className="flex items-center gap-8">
        <Lamp className="h-7 w-7 text-[#4F7D6B] shrink-0" />
        <p className="text-16 font-semibold text-[#4F7D6B]">
          {title}
        </p>
      </div>
      <ul className="space-y-6">
        {bullets.map((bullet, index) => (
          <li key={index} className="text-14 text-[#4F7D6B] flex items-center gap-8">
            <span className="text-[#4F7D6B]">•</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
