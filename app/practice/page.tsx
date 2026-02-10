"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { questions } from "@/data/questions";
import { FeedbackDisplay } from "./components/FeedbackDisplay";
import { AudioPlayer } from "./components/AudioPlayer";
import { Button } from "@/components/ui/button";
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bb2f5fb2-6d52-4f1d-90a7-7f662f7d7877',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'practice/page.tsx:54',message:'retrieving audio from sessionStorage',data:{hasAudioUrl:!!storedAudioUrl,audioUrlLength:storedAudioUrl?.length,audioUrlPrefix:storedAudioUrl?.substring(0,50)},timestamp:Date.now(),hypothesisId:'AUDIO3'})}).catch(()=>{});
      // #endregion
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
            <div className="flex gap-16 justify-center items-center flex-wrap">
              {audioUrl && (
                <AudioPlayer audioUrl={audioUrl} />
              )}
              {feedback.score !== undefined && feedback.score < 70 ? (
                // Score < 70%: Show only Practice Again as primary
                <Button
                  onClick={handlePracticeAgain}
                  className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
                >
                  Practice Again
                </Button>
              ) : (
                // Score >= 70%: Show both buttons
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
