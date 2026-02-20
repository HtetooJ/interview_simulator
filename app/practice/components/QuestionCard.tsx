"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const LINES_COLLAPSED = 2;

export function QuestionCard({
  question,
  questionNumber,
  collapsible = false,
}: {
  question: string;
  questionNumber?: number;
  collapsible?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxChars, setMaxChars] = useState(110);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const showExpandControl = collapsible;
  const isCollapsed = collapsible && !isExpanded;

  useEffect(() => {
    if (!containerRef.current || !isCollapsed) return;
    const el = containerRef.current;
    const updateMaxChars = () => {
      const width = el.offsetWidth;
      setMaxChars(Math.max(50, Math.floor((width / 9) * LINES_COLLAPSED)));
    };
    const resizeObserver = new ResizeObserver(updateMaxChars);
    resizeObserver.observe(el);
    updateMaxChars();
    return () => resizeObserver.disconnect();
  }, [isCollapsed]);

  const reserveForSeeMore = 12;
  const truncateAt = Math.max(0, maxChars - reserveForSeeMore);

  const truncatedQuestion =
    isCollapsed && question.length > truncateAt
      ? question.slice(0, truncateAt).trimEnd()
      : question;
  const needsTruncation = isCollapsed && question.length > truncateAt;

  return (
    <div className="bg-[#4F7D6B] rounded-medium p-32 shadow-medium">
      <div className="min-w-0">
        {questionNumber != null && (
          <p className="text-14 text-white/70 mb-8">
            Question {questionNumber}
          </p>
        )}
        <div ref={containerRef} className="text-16 font-normal text-white">
          {isCollapsed ? (
            <span>
              {truncatedQuestion}
              {needsTruncation && "..."}
              {showExpandControl && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="font-semibold text-white/80 hover:text-white hover:underline inline p-0 m-0 bg-transparent border-0 cursor-pointer"
                    aria-label="Expand question"
                  >
                    see more <ChevronDown className="inline-block ml-1 h-4 w-4 align-text-bottom" />
                  </button>
                </>
              )}
            </span>
          ) : (
            <>
              {question}
              {showExpandControl && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="font-semibold text-white/80 hover:text-white hover:underline inline p-0 m-0 bg-transparent border-0 cursor-pointer"
                    aria-label="Collapse question"
                  >
                    see less <ChevronUp className="inline-block ml-1 h-4 w-4 align-text-bottom" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
