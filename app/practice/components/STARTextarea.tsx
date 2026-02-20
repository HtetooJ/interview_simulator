"use client";

import { useRef, useEffect } from "react";

interface STARTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  showCharCount?: boolean;
}

export function STARTextarea({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 150,
  showCharCount = false,
}: STARTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(minHeight, textareaRef.current.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value, minHeight]);

  return (
    <div className="space-y-8">
      <label className="text-14 font-medium text-text-primary block">
        {label}
      </label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-16 text-[#6B7280] whitespace-pre-wrap bg-white shadow-medium rounded-medium p-16 w-full resize-none focus:outline-none focus:shadow-strong overflow-hidden placeholder:text-[#6B7280]"
        style={{ minHeight: `${minHeight}px` }}
      />
      {showCharCount && (
        <p className="text-14 text-text-secondary">
          {value.length} characters
        </p>
      )}
    </div>
  );
}
