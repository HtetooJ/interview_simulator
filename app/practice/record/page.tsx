"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { questions } from "@/data/questions";
import { RecordingControls } from "../components/RecordingControls";
import { Timer } from "../components/Timer";
import { QuestionCard } from "../components/QuestionCard";
import { trackPageView } from "@/lib/analytics";

function RecordPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionIds = searchParams.get("questions")?.split(",") || [];
  const currentIndex = parseInt(searchParams.get("index") || "0");
  
  const [selectedQuestions] = useState(
    questions.filter((q) => questionIds.includes(q.id))
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const audioBlobRef = useRef<Blob | null>(null);

  const currentQuestion = selectedQuestions[currentIndex];

  // Initialize STAR fields with example content
  useEffect(() => {
    if (currentQuestion) {
      setSituation(currentQuestion.situation);
      setTask(currentQuestion.task);
      setAction(currentQuestion.action);
      setResult(currentQuestion.result);
    }
  }, [currentQuestion]);

  useEffect(() => {
    trackPageView();
  }, []);

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    audioBlobRef.current = blob; // Store in ref for immediate access
    setIsRecording(false);
  };

  const handleFeedbackReceived = async (feedback: {
    effortDelivery: string;
    contentSignals: string;
    improvementHint: string;
    score?: number;
    feedbackMessage?: string;
  }) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/bb2f5fb2-6d52-4f1d-90a7-7f662f7d7877',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'record/page.tsx:58',message:'handleFeedbackReceived entry',data:{hasAudioBlob:!!(audioBlobRef.current||audioBlob),blobSize:(audioBlobRef.current||audioBlob)?.size},timestamp:Date.now(),hypothesisId:'AUDIO1'})}).catch(()=>{});
    // #endregion
    
    // Store feedback in sessionStorage to pass back to practice page
    sessionStorage.setItem(
      `feedback_${currentIndex}`,
      JSON.stringify(feedback)
    );
    
    // Store audio blob as data URL in sessionStorage (blob URLs don't work across page navigation)
    // Use ref to ensure we have the latest blob even if state hasn't updated
    const blobToStore = audioBlobRef.current || audioBlob;
    if (blobToStore) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bb2f5fb2-6d52-4f1d-90a7-7f662f7d7877',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'record/page.tsx:74',message:'starting blob conversion',data:{blobType:blobToStore.type,blobSize:blobToStore.size},timestamp:Date.now(),hypothesisId:'AUDIO2'})}).catch(()=>{});
      // #endregion
      
      // Convert blob to data URL so it works across page navigations
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bb2f5fb2-6d52-4f1d-90a7-7f662f7d7877',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'record/page.tsx:82',message:'blob converted to dataURL',data:{dataUrlLength:dataUrl?.length,dataUrlPrefix:dataUrl?.substring(0,50)},timestamp:Date.now(),hypothesisId:'AUDIO2'})}).catch(()=>{});
        // #endregion
        sessionStorage.setItem(`audio_${currentIndex}`, dataUrl);
        
        // Navigate back to practice page after audio is stored
        const queryString = questionIds.join(",");
        router.push(`/practice?questions=${queryString}&index=${currentIndex}&completed=true`);
      };
      reader.onerror = () => {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/bb2f5fb2-6d52-4f1d-90a7-7f662f7d7877',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'record/page.tsx:90',message:'FileReader error',data:{error:reader.error},timestamp:Date.now(),hypothesisId:'AUDIO2'})}).catch(()=>{});
        // #endregion
      };
      reader.readAsDataURL(blobToStore);
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/bb2f5fb2-6d52-4f1d-90a7-7f662f7d7877',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'record/page.tsx:96',message:'no audio blob',data:{},timestamp:Date.now(),hypothesisId:'AUDIO1'})}).catch(()=>{});
      // #endregion
      // No audio blob, navigate anyway
      const queryString = questionIds.join(",");
      router.push(`/practice?questions=${queryString}&index=${currentIndex}&completed=true`);
    }
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
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col gap-32">
        <QuestionCard
          question={currentQuestion.question}
          questionNumber={currentIndex + 1}
        />

        {isRecording && (
          <div className="text-center">
            <Timer seconds={recordingTime} />
          </div>
        )}

        {/* STAR Answer Boxes */}
        <div className="space-y-12 mb-32">
          <div className="bg-[#4F7D6B]/10 rounded-medium p-16 border border-[#4F7D6B]/20">
            <label className="text-14 font-medium text-text-primary mb-8 block">
              Situation
            </label>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="text-16 text-text-secondary whitespace-pre-wrap bg-[#4F7D6B]/10 border border-[#4F7D6B]/20 rounded-medium p-16 w-full resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 overflow-y-auto min-h-[80px]"
              placeholder="Describe the situation..."
            />
          </div>
          <div className="bg-[#4F7D6B]/10 rounded-medium p-16 border border-[#4F7D6B]/20">
            <label className="text-14 font-medium text-text-primary mb-8 block">
              Task
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="text-16 text-text-secondary whitespace-pre-wrap bg-[#4F7D6B]/10 border border-[#4F7D6B]/20 rounded-medium p-16 w-full resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 overflow-y-auto min-h-[80px]"
              placeholder="What was your goal or responsibility?"
            />
          </div>
          <div className="bg-[#4F7D6B]/10 rounded-medium p-16 border border-[#4F7D6B]/20">
            <label className="text-14 font-medium text-text-primary mb-8 block">
              Action
            </label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="text-16 text-text-secondary whitespace-pre-wrap bg-[#4F7D6B]/10 border border-[#4F7D6B]/20 rounded-medium p-16 w-full resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 overflow-y-auto min-h-[80px]"
              placeholder="What did you do?"
            />
          </div>
          <div className="bg-[#4F7D6B]/10 rounded-medium p-16 border border-[#4F7D6B]/20">
            <label className="text-14 font-medium text-text-primary mb-8 block">
              Result
            </label>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="text-16 text-text-secondary whitespace-pre-wrap bg-[#4F7D6B]/10 border border-[#4F7D6B]/20 rounded-medium p-16 w-full resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 overflow-y-auto min-h-[80px]"
              placeholder="What was the outcome?"
            />
          </div>
        </div>

        {/* Recording Controls - Centered in middle of screen */}
        <div className="flex flex-col items-center justify-center space-y-16 flex-shrink-0">
          {!isRecording && (
            <p className="text-18 text-text-primary font-medium">
              Tap to record
            </p>
          )}

          <RecordingControls
            isRecording={isRecording}
            onStart={() => setIsRecording(true)}
            onStop={() => setIsRecording(false)}
            onComplete={handleRecordingComplete}
            onTimeUpdate={setRecordingTime}
            onFeedback={handleFeedbackReceived}
            question={currentQuestion}
            showText={true}
          />

          {isRecording && (
            <p className="text-16 text-text-secondary animate-pulse">
              recording
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center p-16">
        <div className="text-center">
          <p className="text-16 text-text-secondary">Loading...</p>
        </div>
      </main>
    }>
      <RecordPageContent />
    </Suspense>
  );
}
