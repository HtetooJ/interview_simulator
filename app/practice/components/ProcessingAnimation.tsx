"use client";

export type ProcessingStage =
  | "analyzing_audio"
  | "analyzing_audio_exiting"
  | "analyzing_by_experts"
  | "concluding"
  | null;

interface ProcessingAnimationProps {
  stage: ProcessingStage;
  /** When true, uses card styling to match RecordingAnimation (for progress bar area) */
  cardStyle?: boolean;
}

export function ProcessingAnimation({ stage, cardStyle = false }: ProcessingAnimationProps) {
  if (!stage) return null;

  const content = (
    <>
      {(stage === "analyzing_audio" || stage === "analyzing_audio_exiting") && (
        <p
          className={`text-16 text-[#4F7D6B] whitespace-nowrap ${
            stage === "analyzing_audio" ? "animate-text-shimmer" : "animate-slide-out-down"
          }`}
        >
          Analyzing audio
        </p>
      )}
      {stage === "analyzing_by_experts" && (
        <div className="flex items-center justify-center gap-8 whitespace-nowrap animate-slide-in-from-above">
          <span className="text-16 animate-text-shimmer inline-block">LinkedIn</span>
          <img
            src="/linkedin-logo.png"
            alt="LinkedIn"
            className="h-5 w-5 shrink-0"
            width={20}
            height={20}
          />
          <span className="text-16 animate-text-shimmer inline-block">Analyzing by experts</span>
        </div>
      )}
      {stage === "concluding" && (
        <p className="text-16 text-[#4F7D6B] whitespace-nowrap animate-text-shimmer">
          Concluding your audio
        </p>
      )}
    </>
  );

  if (cardStyle) {
    return (
      <div className="flex items-center justify-center gap-16 bg-white rounded-medium px-16 py-12 shadow-medium min-h-[52px]">
        <div className="relative min-h-12 flex items-center justify-center w-full max-w-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 min-h-[2rem] overflow-hidden">
      <div className="relative min-h-12 flex items-center justify-center w-full max-w-full">
        {content}
      </div>
    </div>
  );
}
