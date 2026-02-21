"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { questions } from "@/data/questions";
import { QuestionCard } from "../components/QuestionCard";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { trackPageView } from "@/lib/analytics";
import { STARSectionLabel } from "../components/STARSectionLabel";

const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Microsoft Zira",
  "Samantha",
  "Google UK English Female",
  "Microsoft Aria",
];

function getPreferredVoice(): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const enVoices = voices.filter((v) => v.lang.startsWith("en"));
  for (const name of PREFERRED_VOICE_NAMES) {
    const found = enVoices.find((v) => v.name.includes(name));
    if (found) return found;
  }
  return enVoices[0] ?? voices[0] ?? null;
}

function ExamplePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionIds = searchParams.get("questions")?.split(",") || [];
  const currentIndex = parseInt(searchParams.get("index") || "0");
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const [selectedQuestions] = useState(
    questions.filter((q) => questionIds.includes(q.id))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const currentQuestion = selectedQuestions[currentIndex];

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    const loadVoice = () => {
      voiceRef.current = getPreferredVoice();
    };
    if ("speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) loadVoice();
      window.speechSynthesis.onvoiceschanged = loadVoice;
    }
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handlePlay = () => {
    if ("speechSynthesis" in window && currentQuestion) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        setIsPaused(false);
      } else {
        const fullAnswer = [
          currentQuestion.situation,
          currentQuestion.task,
          currentQuestion.action,
          currentQuestion.result,
        ].join(" ");
        const utterance = new SpeechSynthesisUtterance(fullAnswer);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        const voice = voiceRef.current ?? getPreferredVoice();
        if (voice) utterance.voice = voice;

        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsPaused(false);
      }
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
    const queryString = questionIds.join(",");
    router.push(`/practice/mode?questions=${queryString}&index=${currentIndex}`);
  };

  if (!currentQuestion) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-16">
        <div className="text-center space-y-16">
          <p className="text-16 text-text-secondary">Question not found.</p>
          <button
            onClick={() => router.push("/select")}
            className="text-primary underline"
          >
            Go back to select questions
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-16 md:p-24">
      <div className="max-w-3xl mx-auto space-y-24">
        <button
          onClick={() => router.push(`/select`)}
          className="flex items-center gap-6 text-14 text-text-secondary hover:text-primary transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="h-16 w-16" />
          Back
        </button>
        <div className="text-center">
          <p className="text-14 text-text-secondary">
            Question {currentIndex + 1} of {selectedQuestions.length}
          </p>
        </div>

        <QuestionCard
          question={currentQuestion.question}
          questionNumber={currentIndex + 1}
          collapsible={false}
        />

        {/* Example Answer - STAR Components */}
        <div className="space-y-12">
          <h3 className="text-16 font-medium text-text-primary mb-8">
            Example Answer:
          </h3>
          <div className="bg-[#4F7D6B]/10 rounded-medium p-16 border border-[#4F7D6B]/20">
            <label className="mb-8 block">
              <STARSectionLabel type="situation" />
            </label>
            <p className="text-16 text-text-secondary whitespace-pre-wrap">
              {currentQuestion.situation}
            </p>
          </div>
          <div className="bg-[#4F7D6B]/10 rounded-medium p-16 border border-[#4F7D6B]/20">
            <label className="mb-8 block">
              <STARSectionLabel type="task" />
            </label>
            <p className="text-16 text-text-secondary whitespace-pre-wrap">
              {currentQuestion.task}
            </p>
          </div>
          <div className="bg-[#4F7D6B]/10 rounded-medium p-16 border border-[#4F7D6B]/20">
            <label className="mb-8 block">
              <STARSectionLabel type="action" />
            </label>
            <p className="text-16 text-text-secondary whitespace-pre-wrap">
              {currentQuestion.action}
            </p>
          </div>
          <div className="bg-[#4F7D6B]/10 rounded-medium p-16 border border-[#4F7D6B]/20">
            <label className="mb-8 block">
              <STARSectionLabel type="result" />
            </label>
            <p className="text-16 text-text-secondary whitespace-pre-wrap">
              {currentQuestion.result}
            </p>
          </div>
        </div>

        {/* Audio and Start Practice Buttons */}
        <div className="flex flex-wrap gap-16 justify-center items-center">
          <button
            type="button"
            onClick={isPlaying ? handlePause : handlePlay}
            className="flex shrink-0 items-center justify-center gap-12 h-48 w-[180px] min-w-[180px] min-h-48 px-32 rounded-medium bg-[#4F7D6B] hover:bg-[#4F7D6B]/90 text-white shadow-medium border-2 border-[#4F7D6B] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors relative z-10 text-16 font-medium"
            aria-label={isPlaying ? "Pause" : "Play Example"}
          >
            {isPlaying ? (
              <Pause className="h-[16px] w-[16px] shrink-0" />
            ) : (
              <Play className="h-[16px] w-[16px] ml-0.5 shrink-0" />
            )}
            <span className="whitespace-nowrap">{isPlaying ? "Pause" : "Play Example"}</span>
          </button>
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
    </main>
  );
}

export default function ExamplePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center p-16">
        <div className="text-center">
          <p className="text-16 text-text-secondary">Loading...</p>
        </div>
      </main>
    }>
      <ExamplePageContent />
    </Suspense>
  );
}
