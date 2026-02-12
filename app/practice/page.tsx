"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { questions } from "@/data/questions";
import { FeedbackDisplay } from "./components/FeedbackDisplay";
import { AudioPlayer } from "./components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { trackPageView } from "@/lib/analytics";

interface Feedback {
  effortDelivery: string;
  contentSignals: string;
  improvementHint: string;
  score?: number;
  feedbackMessage?: string;
}

function PracticePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionIds = searchParams.get("questions")?.split(",") || [];
  
  const [selectedQuestions] = useState(
    questions.filter((q) => questionIds.includes(q.id))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Check if returning from recording screen
  useEffect(() => {
    const completed = searchParams.get("completed");
    const indexParam = searchParams.get("index");
    if (completed === "true" && indexParam) {
      const idx = parseInt(indexParam);
      setCurrentIndex(idx);
      // Retrieve feedback from sessionStorage
      const feedbackData = sessionStorage.getItem(`feedback_${idx}`);
      if (feedbackData) {
        try {
          const parsedFeedback = JSON.parse(feedbackData);
          setFeedback(parsedFeedback);
          setShowFeedback(true);
          // Clean up sessionStorage
          sessionStorage.removeItem(`feedback_${idx}`);
        } catch (error) {
          console.error("Error parsing feedback:", error);
        }
      }
      
      // Retrieve audio URL from sessionStorage
      const storedAudioUrl = sessionStorage.getItem(`audio_${idx}`);
      if (storedAudioUrl) {
        setAudioUrl(storedAudioUrl);
        // Clean up sessionStorage
        sessionStorage.removeItem(`audio_${idx}`);
      }
    }
  }, [searchParams]);

  // Clean up audio URL when component unmounts
  // Note: Data URLs don't need to be revoked like blob URLs
  useEffect(() => {
    return () => {
      // Cleanup if needed (data URLs don't need revoking)
    };
  }, [audioUrl]);

  const resetQuestionState = () => {
    setFeedback(null);
    setShowFeedback(false);
  };

  const handlePracticeAgain = () => {
    const queryString = questionIds.join(",");
    router.push(`/practice/record?questions=${queryString}&index=${currentIndex}`);
  };

  const handleNextQuestion = () => {
    const queryString = questionIds.join(",");
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < selectedQuestions.length) {
      // Navigate to next question's example page
      router.push(`/practice/example?questions=${queryString}&index=${nextIndex}`);
    } else {
      // Navigate to complete page if it's the last question
      router.push("/complete");
    }
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
      <div className="max-w-3xl mx-auto space-y-16 md:space-y-24">
        {showFeedback && feedback && (
          <>
            <div className="text-center">
              <p className="text-14 text-text-secondary">
                Question {currentIndex + 1} of {selectedQuestions.length}
              </p>
            </div>
            <FeedbackDisplay feedback={feedback} />
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-16 justify-center items-center">
              {feedback.score !== undefined && feedback.score < 70 ? (
                <Button
                  onClick={handlePracticeAgain}
                  className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
                >
                  Practice Again
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handlePracticeAgain}
                    variant="secondary"
                    className="h-48 px-32 text-16 rounded-medium font-medium"
                    style={{ borderWidth: '1px', borderColor: 'var(--primary)', borderImage: 'none' }}
                  >
                    Practice Again
                  </Button>
                  <Button
                    onClick={handleNextQuestion}
                    className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
                  >
                    Next Question
                  </Button>
                </>
              )}
              {audioUrl ? (
                <AudioPlayer audioUrl={audioUrl} />
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex shrink-0 items-center justify-center h-48 px-32 rounded-medium bg-transparent border-2 border-[#4F7D6B]/50 !text-black/60 text-16 font-medium cursor-not-allowed relative z-10 opacity-60 [&_svg]:!text-black/60"
                  aria-label="Play recording (no audio available)"
                >
                  <Play className="mr-8 h-5 w-5" />
                  Listen.
                </button>
              )}
            </div>
          </>
        )}
        {!showFeedback && (
          <div className="text-center space-y-16">
            <p className="text-16 text-text-secondary">No feedback available.</p>
            <button
              onClick={() => router.push("/select")}
              className="text-primary underline"
            >
              Go back to select questions
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PracticePage() {
  useEffect(() => {
    trackPageView();
  }, []);

  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center p-16">
        <div className="text-center">
          <p className="text-16 text-text-secondary">Loading...</p>
        </div>
      </main>
    }>
      <PracticePageContent />
    </Suspense>
  );
}
