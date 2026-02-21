"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { questions } from "@/data/questions";
import { QuestionCard } from "../components/QuestionCard";
import { RecordingControls, type RecordingControlsHandle } from "../components/RecordingControls";
import { ProcessingAnimation, type ProcessingStage } from "../components/ProcessingAnimation";
import { StartRecordingCard } from "../components/StartRecordingCard";
import { getDraft, saveDraft } from "@/lib/star-draft";
import { trackPageView } from "@/lib/analytics";
import { ChevronLeft } from "lucide-react";
import { RecordingAnimation } from "../components/RecordingAnimation";
import { STARSectionLabel } from "../components/STARSectionLabel";
import { AutoResizeTextarea } from "../components/AutoResizeTextarea";


function AudioPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionIds = searchParams.get("questions")?.split(",") || [];
  const currentIndex = parseInt(searchParams.get("index") || "0");

  const selectedQuestions = questions.filter((q) => questionIds.includes(q.id));
  const currentQuestion = selectedQuestions[currentIndex];
  const queryString = questionIds.join(",");

  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const recordingControlsRef = useRef<RecordingControlsHandle>(null);

  const saveToDraft = useCallback(() => {
    if (currentQuestion) {
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
        situation,
        task,
        action,
        result,
        lastModified: Date.now(),
      });
    }
  }, [currentQuestion, situation, task, action, result]);

  useEffect(() => {
    if (currentQuestion) {
      const draft = getDraft(currentQuestion.id);
      if (draft) {
        setSituation(draft.situation);
        setTask(draft.task);
        setAction(draft.action);
        setResult(draft.result);
      } else {
        setSituation(currentQuestion.situation);
        setTask(currentQuestion.task);
        setAction(currentQuestion.action);
        setResult(currentQuestion.result);
      }
    }
  }, [currentQuestion]);

  useEffect(() => {
    const t = setTimeout(saveToDraft, 2000);
    return () => clearTimeout(t);
  }, [situation, task, action, result, saveToDraft]);

  useEffect(() => {
    trackPageView();
  }, []);


  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    audioBlobRef.current = blob;
    setIsRecording(false);
  };

  const handleFeedbackReceived = useCallback(
    (feedback: {
      effortDelivery: string;
      contentSignals: string;
      improvementHint: string;
      score?: number;
      feedbackMessage?: string;
    }) => {
      sessionStorage.setItem(`feedback_${currentIndex}`, JSON.stringify(feedback));

      const blobToStore = audioBlobRef.current || audioBlob;
      if (blobToStore) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          sessionStorage.setItem(`audio_${currentIndex}`, dataUrl);
          router.push(`/practice?questions=${queryString}&index=${currentIndex}&completed=true`);
        };
        reader.onerror = () => {};
        reader.readAsDataURL(blobToStore);
      } else {
        router.push(`/practice?questions=${queryString}&index=${currentIndex}&completed=true`);
      }
    },
    [currentIndex, queryString, audioBlob, router]
  );

  const handleBack = () => {
    saveToDraft();
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
    <main className="min-h-screen bg-background flex flex-col p-16 md:p-24">
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col gap-24">
        <button
          onClick={handleBack}
          className="flex items-center gap-6 text-14 text-text-secondary hover:text-primary transition-colors self-start"
          aria-label="Back"
        >
          <ChevronLeft className="h-16 w-16" />
          Back
        </button>

        <QuestionCard
          question={currentQuestion.question}
          questionNumber={currentIndex + 1}
          collapsible={true}
        />

        <RecordingControls
          ref={recordingControlsRef}
          isRecording={isRecording}
          onStart={() => setIsRecording(true)}
          onStop={() => setIsRecording(false)}
          onProcessingStageChange={setProcessingStage}
          onPermissionError={setPermissionError}
          onComplete={handleRecordingComplete}
          onTimeUpdate={setRecordingTime}
          onFeedback={handleFeedbackReceived}
          question={currentQuestion}
          headless
        />
        {!permissionError && isRecording && (
          <RecordingAnimation
            seconds={recordingTime}
            onStopClick={() => recordingControlsRef.current?.stopRecording()}
          />
        )}
        {!permissionError && processingStage && !isRecording && (
          <ProcessingAnimation stage={processingStage} cardStyle />
        )}
        {!permissionError && !isRecording && !processingStage && (
          <StartRecordingCard
            onStartClick={() => recordingControlsRef.current?.startRecording()}
          />
        )}

        <div className="space-y-12">
          <div className="space-y-8">
            <label className="block">
              <STARSectionLabel type="situation" />
            </label>
            <AutoResizeTextarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="Describe the situation..."
              className="text-16 text-[#6B7280] whitespace-pre-wrap bg-white shadow-medium rounded-medium p-16 w-full resize-none focus:outline-none focus:shadow-strong overflow-hidden leading-relaxed placeholder:text-[#6B7280]"
              minHeight={56}
              buffer={8}
            />
          </div>
          <div className="space-y-8">
            <label className="block">
              <STARSectionLabel type="task" />
            </label>
            <AutoResizeTextarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What was your goal or responsibility?"
              className="text-16 text-[#6B7280] whitespace-pre-wrap bg-white shadow-medium rounded-medium p-16 w-full resize-none focus:outline-none focus:shadow-strong overflow-hidden leading-relaxed placeholder:text-[#6B7280]"
              minHeight={56}
              buffer={8}
            />
          </div>
          <div className="space-y-8">
            <label className="block">
              <STARSectionLabel type="action" />
            </label>
            <AutoResizeTextarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="What did you do?"
              className="text-16 text-[#6B7280] whitespace-pre-wrap bg-white shadow-medium rounded-medium p-16 w-full resize-none focus:outline-none focus:shadow-strong overflow-hidden leading-relaxed placeholder:text-[#6B7280]"
              minHeight={56}
              buffer={8}
            />
          </div>
          <div className="space-y-8">
            <label className="block">
              <STARSectionLabel type="result" />
            </label>
            <AutoResizeTextarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="What was the outcome?"
              className="text-16 text-[#6B7280] whitespace-pre-wrap bg-white shadow-medium rounded-medium p-16 w-full resize-none focus:outline-none focus:shadow-strong overflow-hidden leading-relaxed placeholder:text-[#6B7280]"
              minHeight={56}
              buffer={8}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AudioPage() {
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
      <AudioPageContent />
    </Suspense>
  );
}
