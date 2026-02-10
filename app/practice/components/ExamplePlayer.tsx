"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { parseAnswerWithHighlights } from "@/lib/answer-highlighter";

interface ExamplePlayerProps {
  exampleAnswer: string;
  keyContentSignals: string[];
  onPlayed: () => void;
}

export function ExamplePlayer({ exampleAnswer, keyContentSignals, onPlayed }: ExamplePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if ("speechSynthesis" in window) {
      if (isPaused) {
        // Resume playback
        window.speechSynthesis.resume();
        setIsPlaying(true);
        setIsPaused(false);
      } else {
        // Start new playback
        const utterance = new SpeechSynthesisUtterance(exampleAnswer);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setHasFinished(true);
          utteranceRef.current = null;
        };
        
        utterance.onerror = () => {
          setIsPlaying(false);
          setIsPaused(false);
          setHasFinished(true);
          utteranceRef.current = null;
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsPaused(false);
        setHasFinished(false); // Reset finished state when starting new playback
      }
    } else {
      // Fallback: mark as finished
      setHasFinished(true);
    }
  };

  const handlePause = () => {
    if ("speechSynthesis" in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStartPractice = () => {
    onPlayed();
  };

  const segments = parseAnswerWithHighlights(exampleAnswer, keyContentSignals);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

  return (
    <div className="bg-surface rounded-medium p-24 shadow-subtle space-y-16">
      <div>
        <h3 className="text-16 font-medium text-text-primary mb-8">
          Example Answer:
        </h3>
        <div className="text-16 text-text-secondary whitespace-pre-wrap relative">
          {segments.map((segment, index) => {
            if (segment.isHighlighted) {
              return (
                <span
                  key={index}
                  className="bg-primary/10 rounded-small px-4 py-1 relative cursor-help transition-colors hover:bg-primary/20"
                  onMouseEnter={() => setHoveredSegment(index)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  {segment.text}
                  {hoveredSegment === index && segment.description && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 px-12 py-8 bg-[#1F2933] text-white text-12 rounded-small whitespace-nowrap z-10 shadow-medium">
                      {segment.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-4">
                        <div className="border-4 border-transparent border-t-[#1F2933]"></div>
                      </div>
                    </div>
                  )}
                </span>
              );
            }
            return <span key={index}>{segment.text}</span>;
          })}
        </div>
      </div>
      <div className="flex gap-16">
        {isPlaying ? (
          <Button
            onClick={handlePause}
            className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
          >
            <Pause className="mr-8 h-5 w-5" />
            Pause
          </Button>
        ) : (
          <Button
            onClick={handlePlay}
            className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
          >
            <Play className="mr-8 h-5 w-5" />
            {isPaused ? "Resume" : "Play Example"}
          </Button>
        )}
        <Button
          onClick={handleStartPractice}
          variant="secondary"
          className="h-48 px-32 text-16 rounded-medium font-medium"
          style={{ borderWidth: '1px', borderColor: 'var(--primary)', borderImage: 'none' }}
        >
          Start Practice
        </Button>
      </div>
    </div>
  );
}
