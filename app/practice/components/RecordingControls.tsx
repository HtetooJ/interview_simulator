"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";
import { InterviewQuestion } from "@/data/questions";
import { startSpeechRecognition } from "@/lib/speech-analysis";
import { generateFeedback } from "@/lib/feedback-generator";

type ProcessingStage = "analyzing_audio" | "analyzing_audio_exiting" | "analyzing_by_experts" | "concluding" | null;

interface FeedbackResult {
  effortDelivery: string;
  contentSignals: string;
  improvementHint: string;
  score?: number;
  feedbackMessage?: string;
}

interface RecordingControlsProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  onComplete: (blob: Blob) => void;
  onTimeUpdate: (seconds: number) => void;
  onFeedback: (feedback: {
    effortDelivery: string;
    contentSignals: string;
    improvementHint: string;
    score?: number;
    feedbackMessage?: string;
  }) => void;
  question: InterviewQuestion;
  showText?: boolean;
}

export function RecordingControls({
  isRecording,
  onStart,
  onStop,
  onComplete,
  onTimeUpdate,
  onFeedback,
  question,
  showText = false,
}: RecordingControlsProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const transcriptRef = useRef<string>("");
  const recordingDurationRef = useRef(0);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const [time, setTime] = useState(0);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const feedbackRef = useRef<FeedbackResult | null>(null);
  const [feedbackReady, setFeedbackReady] = useState(false);
  const stageTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Keep the callback ref updated
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          const next = prev + 1;
          recordingDurationRef.current = next;
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (time > 0) {
        setTime(0);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  // Separate effect to notify parent of time changes
  // This runs after state updates, avoiding render-time state updates
  useEffect(() => {
    onTimeUpdateRef.current(time);
  }, [time]);

  // Clear stage timeouts on unmount
  useEffect(() => {
    return () => {
      stageTimeoutsRef.current.forEach(clearTimeout);
      stageTimeoutsRef.current = [];
    };
  }, []);

  // Call onFeedback when concluding stage is reached and feedback is ready (min 0.5s for stage 3)
  const concludingStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (processingStage !== "concluding" || !feedbackReady) return;

    const minStage3Ms = 500;
    const elapsed = concludingStartRef.current ? Date.now() - concludingStartRef.current : 0;
    const remaining = Math.max(0, minStage3Ms - elapsed);

    const t = setTimeout(() => {
      const feedback = feedbackRef.current;
      if (feedback) {
        onFeedback(feedback);
        feedbackRef.current = null;
      }
      setProcessingStage(null);
      setFeedbackReady(false);
      transcriptRef.current = "";
      recordingDurationRef.current = 0;
    }, remaining);

    return () => clearTimeout(t);
  }, [processingStage, feedbackReady, onFeedback]);

  const startRecording = async () => {
    try {
      // Clear any previous permission errors
      setPermissionError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick a MIME type the browser actually supports
      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ];
      const supportedMimeType =
        preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) || "";

      const mediaRecorder = supportedMimeType
        ? new MediaRecorder(stream, { mimeType: supportedMimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Use the actual mimeType the recorder is using (may differ from what we requested)
      const actualMimeType = mediaRecorder.mimeType;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: actualMimeType || "audio/webm" });
        onComplete(blob);

        // Stop speech recognition
        if (stopRecognitionRef.current) {
          stopRecognitionRef.current();
          stopRecognitionRef.current = null;
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        // Start staged processing animation
        feedbackRef.current = null;
        setProcessingStage("analyzing_audio");

        // Stage timing: 1s -> exiting (0.3s) -> analyzing_by_experts, 0.5s more -> concluding
        const t1 = setTimeout(() => setProcessingStage("analyzing_audio_exiting"), 1000);
        const t2 = setTimeout(() => setProcessingStage("analyzing_by_experts"), 1300);
        const t3 = setTimeout(() => {
          concludingStartRef.current = Date.now();
          setProcessingStage("concluding");
        }, 1800);
        stageTimeoutsRef.current = [t1, t2, t3];

        // Run analysis in parallel - store result in ref, onFeedback called by effect when concluding
        (async () => {
          try {
            let transcription = transcriptRef.current;

            try {
              const response = await fetch("/api/speech", {
                method: "POST",
                body: blob,
              });
              let data: { transcript?: string } = {};
              try {
                data = await response.json();
              } catch {
                console.warn("Azure Speech API returned invalid JSON");
              }
              if (data.transcript && data.transcript.trim()) {
                transcription = data.transcript;
              } else if (!response.ok) {
                console.warn("Azure Speech API error:", response.status, data);
              }
            } catch (azureError) {
              console.warn("Azure Speech API failed, using browser transcription:", azureError);
            }

            const durationSeconds = recordingDurationRef.current;
            const feedback = generateFeedback(
              transcription,
              question.keyContentSignals,
              durationSeconds
            );
            feedbackRef.current = feedback;
            setFeedbackReady(true);
          } catch (error) {
            console.error("Error analyzing speech:", error);
            feedbackRef.current = {
              effortDelivery: "Thank you for recording your answer.",
              contentSignals: "I'm processing your response.",
              improvementHint: "Try to speak clearly and include your experience.",
              score: 0,
              feedbackMessage: "Sounds not detected",
            };
            setFeedbackReady(true);
          }
        })();
      };

      mediaRecorder.start();
      recordingDurationRef.current = 0;

      // Start speech recognition
      const stopRecognition = startSpeechRecognition(
        (text) => {
          transcriptRef.current = text;
        },
        (error) => {
          console.error("Speech recognition error:", error);
        }
      );
      stopRecognitionRef.current = stopRecognition;
      
      onStart();
      setTime(0);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      
      // Handle different types of permission errors
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            setPermissionError("permission-denied");
            break;
          case "NotFoundError":
          case "DevicesNotFoundError":
            setPermissionError("no-device");
            break;
          case "NotReadableError":
          case "TrackStartError":
            setPermissionError("device-in-use");
            break;
          default:
            setPermissionError("unknown");
        }
      } else {
        setPermissionError("unknown");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
        stopRecognitionRef.current = null;
      }
      onStop();
    }
  };

  const handleRetryPermission = () => {
    setPermissionError(null);
    startRecording();
  };

  if (processingStage) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[2rem] overflow-hidden">
        <div className="relative min-h-12 flex items-center justify-center w-full max-w-full">
          {(processingStage === "analyzing_audio" || processingStage === "analyzing_audio_exiting") && (
            <p
              className={`text-16 text-[#4F7D6B] whitespace-nowrap ${
                processingStage === "analyzing_audio" ? "animate-text-shimmer" : "animate-slide-out-down"
              }`}
            >
              Analyzing audio
            </p>
          )}
          {processingStage === "analyzing_by_experts" && (
            <div className="flex items-center justify-center gap-8 whitespace-nowrap animate-slide-in-from-above">
              <span className="text-16 animate-text-shimmer inline-block">
                LinkedIn
              </span>
              <img
                src="/linkedin-logo.png"
                alt="LinkedIn"
                className="h-5 w-5 shrink-0"
                width={20}
                height={20}
              />
              <span className="text-16 animate-text-shimmer inline-block">
                Analyzing by experts
              </span>
            </div>
          )}
          {processingStage === "concluding" && (
            <p className="text-16 text-[#4F7D6B] whitespace-nowrap animate-text-shimmer">
              Concluding your audio
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show permission error UI
  if (permissionError) {
    const getErrorMessage = () => {
      switch (permissionError) {
        case "permission-denied":
          return {
            title: "Microphone Access Denied",
            message: "We need microphone permission to record your answer.",
            instructions: [
              "1. Click the lock icon in your browser's address bar",
              "2. Allow microphone access for this site",
              "3. On Mac: Also check System Settings > Privacy & Security > Microphone",
              "4. Make sure your browser (Chrome/Safari/etc.) is enabled"
            ]
          };
        case "no-device":
          return {
            title: "No Microphone Found",
            message: "We couldn't find a microphone connected to your device.",
            instructions: [
              "1. Check that a microphone is connected",
              "2. Make sure it's not being used by another app",
              "3. Try refreshing the page"
            ]
          };
        case "device-in-use":
          return {
            title: "Microphone In Use",
            message: "Your microphone is being used by another application.",
            instructions: [
              "1. Close other apps using the microphone",
              "2. Try refreshing the page",
              "3. Restart your browser if the issue persists"
            ]
          };
        default:
          return {
            title: "Recording Error",
            message: "Something went wrong accessing your microphone.",
            instructions: [
              "1. Check browser permissions",
              "2. Make sure you're using HTTPS or localhost",
              "3. Try refreshing the page"
            ]
          };
      }
    };

    const errorInfo = getErrorMessage();

    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-16">
        <div className="space-y-8">
          <p className="text-18 font-semibold text-text-primary">{errorInfo.title}</p>
          <p className="text-16 text-text-secondary">{errorInfo.message}</p>
        </div>
        
        <div className="bg-surface border border-border rounded-medium p-16 text-left space-y-8">
          <p className="text-14 font-medium text-text-primary">How to fix:</p>
          <ul className="space-y-4 text-14 text-text-secondary list-disc list-inside">
            {errorInfo.instructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ul>
        </div>

        <Button
          onClick={handleRetryPermission}
          className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // New UI for recording screen
  if (showText) {
    return (
      <div className="flex flex-col items-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-40 h-40 rounded-full bg-[#4F7D6B] hover:bg-[#4F7D6B]/90 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Start recording"
          >
            <Mic className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-40 h-40 rounded-full bg-[#4F7D6B] hover:bg-[#4F7D6B]/90 text-white flex items-center justify-center shadow-lg transition-all duration-200 relative"
            aria-label="Stop recording"
          >
            {/* Outer pulsing animation ring */}
            <div className="absolute inset-0 rounded-full bg-[#4F7D6B] animate-ping opacity-75"></div>
            {/* Middle pulsing ring */}
            <div className="absolute inset-2 rounded-full bg-[#4F7D6B] animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
            {/* Inner pulsing border */}
            <div className="absolute inset-3 rounded-full border-2 border-white animate-pulse"></div>
            <Square className="h-5 w-5 relative z-10" />
          </button>
        )}
      </div>
    );
  }

  // Original UI for practice page
  return (
    <div className="flex justify-center">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
        >
          <Mic className="mr-8 h-5 w-5" />
          Start Recording
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
        >
          <Square className="mr-8 h-5 w-5" />
          Stop Recording
        </Button>
      )}
    </div>
  );
}
