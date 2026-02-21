"use client";

import { useRef, useEffect, useCallback } from "react";

interface AutoResizeTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "style"> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minHeight?: number;
  /** Extra pixels to add (helps last-line visibility on mobile) */
  buffer?: number;
}

/**
 * Textarea that auto-expands to fit content. Uses a mirror div for reliable
 * height measurement across browsers and mobile.
 */
export function AutoResizeTextarea({
  value,
  onChange,
  minHeight = 56,
  buffer = 4,
  className = "",
  ...props
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (!textarea || !mirror) return;

    // Copy styles that affect text layout
    const computed = getComputedStyle(textarea);
    mirror.style.width = "100%";
    mirror.style.padding = computed.padding;
    mirror.style.font = computed.font;
    mirror.style.lineHeight = computed.lineHeight;
    mirror.style.letterSpacing = computed.letterSpacing;
    mirror.style.wordSpacing = computed.wordSpacing;
    mirror.style.whiteSpace = computed.whiteSpace;
    mirror.style.boxSizing = computed.boxSizing;
    mirror.style.border = computed.border;

    // Use value; nbsp when empty so we get min height
    mirror.textContent = value || "\u00A0";

    const contentHeight = mirror.offsetHeight + buffer;
    const height = Math.max(minHeight, contentHeight);
    textarea.style.height = `${height}px`;
  }, [value, minHeight, buffer]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onInput={adjustHeight}
        className={className}
        {...props}
      />
      <div
        ref={mirrorRef}
        aria-hidden
        className="absolute left-0 top-0 w-full overflow-hidden whitespace-pre-wrap break-words pointer-events-none invisible"
        style={{
          visibility: "hidden",
          height: "auto",
          minHeight: 0,
        }}
      />
    </div>
  );
}
