"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { questions } from "@/data/questions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Star, Mic } from "lucide-react";
import { trackPageView } from "@/lib/analytics";

const PRACTICE_MODE_KEY = "practice_mode";

export type PracticeMode = "guided" | "audio";

function ModePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    trackPageView();
  }, []);
  const questionIds = searchParams.get("questions")?.split(",") || [];
  const currentIndex = parseInt(searchParams.get("index") || "0");

  const selectedQuestions = questions.filter((q) => questionIds.includes(q.id));
  const queryString = questionIds.join(",");

  const handleModeSelect = (mode: PracticeMode) => {
    sessionStorage.setItem(PRACTICE_MODE_KEY, mode);
    if (mode === "guided") {
      router.push(`/practice/build/situation?questions=${queryString}&index=${currentIndex}`);
    } else {
      router.push(`/practice/audio?questions=${queryString}&index=${currentIndex}`);
    }
  };

  const handleBack = () => {
    router.push(`/select`);
  };

  const handleViewExample = () => {
    router.push(`/practice/example?questions=${queryString}&index=${currentIndex}`);
  };

  if (selectedQuestions.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-16">
        <div className="text-center space-y-16">
          <p className="text-16 text-text-secondary">No questions selected.</p>
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
      <div className="max-w-3xl mx-auto space-y-24 md:space-y-32">
        <button
          onClick={handleBack}
          className="flex items-center gap-6 text-14 text-text-secondary hover:text-primary transition-colors"
          aria-label="Back to select"
        >
          <ChevronLeft className="h-16 w-16" />
          Back
        </button>

        <div className="text-center space-y-8">
          <h1 className="text-32 font-semibold text-text-primary">
            How would you like to practice?
          </h1>
          <p className="text-16 text-text-secondary">
            Question {currentIndex + 1} of {selectedQuestions.length}
          </p>
        </div>

        <div className="space-y-16">
          <button
            onClick={() => handleModeSelect("guided")}
            className="w-full text-left bg-surface rounded-medium p-24 shadow-medium hover:shadow-strong transition-all group"
          >
            <div className="flex items-start gap-16">
              <div className="flex-shrink-0 w-48 h-48 rounded-full bg-[#4F7D6B]/20 flex items-center justify-center group-hover:bg-[#4F7D6B]/30 transition-colors">
                <Star className="h-24 w-24 text-[#4F7D6B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-8 mb-8">
                  <h2 className="text-18 font-semibold text-text-primary">
                    Guided STAR Builder
                  </h2>
                  <span className="text-12 font-medium px-8 py-2 rounded-full bg-[#4F7D6B] text-black">
                    Recommended
                  </span>
                </div>
                <p className="text-14 text-text-secondary mb-12">
                  Perfect for learning and preparation
                </p>
                <p className="text-14 text-text-secondary">
                  Step-by-step prompts for each part (Situation, Task, Action, Result), then practice audio delivery.
                </p>
                <div className="mt-16">
                  <span className="text-14 font-medium text-[#4F7D6B] group-hover:underline">
                    Start Guided Practice →
                  </span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeSelect("audio")}
            className="w-full text-left bg-surface rounded-medium p-24 shadow-medium hover:shadow-strong transition-all group"
          >
            <div className="flex items-start gap-16">
              <div className="flex-shrink-0 w-48 h-48 rounded-full bg-[#4F7D6B]/20 flex items-center justify-center group-hover:bg-[#4F7D6B]/30 transition-colors">
                <Mic className="h-24 w-24 text-[#4F7D6B]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-18 font-semibold text-text-primary mb-8">
                  Audio Focus Practice
                </h2>
                <p className="text-14 text-text-secondary mb-12">
                  Focus purely on delivery
                </p>
                <p className="text-14 text-text-secondary">
                  One text box for reference with emphasis on recording.
                </p>
                <div className="mt-16">
                  <span className="text-14 font-medium text-[#4F7D6B] group-hover:underline">
                    Start Audio Focus Practice →
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={handleViewExample}
            className="text-16 text-text-secondary hover:text-primary underline"
          >
            View Example First
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ModePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center p-16">
          <div className="text-center">
            <p className="text-16 text-text-secondary">Loading...</p>
          </div>
        </main>
      }
    >
      <ModePageContent />
    </Suspense>
  );
}
