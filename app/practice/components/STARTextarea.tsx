"use client";

import { STARSectionLabel, type STARSectionType } from "./STARSectionLabel";
import { AutoResizeTextarea } from "./AutoResizeTextarea";

interface STARTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  showCharCount?: boolean;
  starType?: STARSectionType;
}

export function STARTextarea({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 150,
  showCharCount = false,
  starType,
}: STARTextareaProps) {
  return (
    <div className="space-y-8">
      <label className="block">
        {starType ? (
          <STARSectionLabel type={starType} />
        ) : (
          <span className="text-14 font-medium text-text-primary">{label}</span>
        )}
      </label>
      <AutoResizeTextarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minHeight={minHeight}
        buffer={8}
        className="text-16 text-[#6B7280] whitespace-pre-wrap bg-white shadow-medium rounded-medium p-16 w-full resize-none focus:outline-none focus:shadow-strong overflow-hidden leading-relaxed placeholder:text-[#6B7280]"
      />
      {showCharCount && (
        <p className="text-14 text-text-secondary">
          {value.length} characters
        </p>
      )}
    </div>
  );
}
