"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { questions } from "@/data/questions";
import { QuestionCard } from "../../components/QuestionCard";
import { ProgressBar } from "../../components/ProgressBar";
import { GuidePrompt } from "../../components/GuidePrompt";
import { STARTextarea } from "../../components/STARTextarea";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { saveDraft, getDraft } from "@/lib/star-draft";
import { STAR_GUIDES, STAR_STEPS } from "../star-guides";
import { trackPageView } from "@/lib/analytics";

function ResultPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionIds = searchParams.get("questions")?.split(",") || [];
  const currentIndex = parseInt(searchParams.get("index") || "0");

  const selectedQuestions = questions.filter((q) => questionIds.includes(q.id));
  const currentQuestion = selectedQuestions[currentIndex];
  const queryString = questionIds.join(",");

  const [result, setResult] = useState("");

  const saveToDraft = useCallback(() => {
    if (!currentQuestion) return;
    const draft = getDraft(currentQuestion.id) || {
      questionId: currentQuestion.id,
      situation: currentQuestion.situation,
      task: currentQuestion.task,
      action: currentQuestion.action,
      result: currentQuestion.result,
      lastModified: 0,
    };
    saveDraft({
      ...draft,
      result,
      lastModified: Date.now(),
    });
  }, [currentQuestion, result]);

  useEffect(() => {
    if (currentQuestion) {
      const draft = getDraft(currentQuestion.id);
      if (draft && draft.result) {
        setResult(draft.result);
      } else {
        setResult(currentQuestion.result);
      }
    }
  }, [currentQuestion]);

  useEffect(() => {
    const t = setTimeout(saveToDraft, 2000);
    return () => clearTimeout(t);
  }, [result, saveToDraft]);

  useEffect(() => {
    trackPageView();
  }, []);

  const handlePracticeAudio = () => {
    saveToDraft();
    router.push(`/practice/audio?questions=${queryString}&index=${currentIndex}`);
  };

  const handleBack = () => {
    saveToDraft();
    router.push(`/practice/build/action?questions=${queryString}&index=${currentIndex}`);
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

  const guide = STAR_GUIDES.result;

  return (
    <main className="min-h-screen bg-background p-16 md:p-24">
      <div className="max-w-3xl mx-auto space-y-24">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-6 text-14 text-text-secondary hover:text-primary transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="h-16 w-16" />
            Back
          </button>
        </div>

        <ProgressBar current={4} total={4} labels={STAR_STEPS.map((s) => s.charAt(0).toUpperCase() + s.slice(1))} />

        <QuestionCard
          question={currentQuestion.question}
          questionNumber={currentIndex + 1}
          collapsible={true}
        />

        <GuidePrompt title={guide.title} bullets={guide.bullets} />

        <STARTextarea
          starType="result"
          label="Result"
          value={result}
          onChange={setResult}
          placeholder="What was the outcome?"
          minHeight={200}
        />

        <div className="flex justify-between">
          <Button
            onClick={handleBack}
            variant="secondary"
            className="h-48 px-32 text-16 rounded-medium font-medium"
            style={{ borderWidth: "1px", borderColor: "var(--primary)", borderImage: "none" }}
          >
            Previous
          </Button>
          <Button
            onClick={handlePracticeAudio}
            className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
          >
            Practice Audio
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
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
      <ResultPageContent />
    </Suspense>
  );
}
