interface FeedbackDisplayProps {
  feedback: {
    effortDelivery: string;
    contentSignals: string;
    improvementHint: string;
    score?: number;
    feedbackMessage?: string;
  };
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const score = feedback.score ?? 0;
  const feedbackMessage = feedback.feedbackMessage ?? "";

  // Determine score color based on value
  const getScoreColor = () => {
    if (score >= 80) return "text-[#6FAF91]"; // success green
    if (score >= 60) return "text-[#4F7D6B]"; // primary
    if (score >= 40) return "text-[#E6B566]"; // warning
    return "text-[#E08A8A]"; // error red
  };

  return (
    <div className="bg-surface border border-border rounded-medium p-32 shadow-subtle">
      {/* Score and Feedback Message - Prominent Display */}
      <div className="text-center space-y-24 mb-32">
        <div className="space-y-8">
          <div className={`text-64 font-bold ${getScoreColor()}`}>
            {score}%
          </div>
          <div className="text-24 font-semibold text-text-primary">
            {feedbackMessage}
          </div>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="space-y-16 border-t border-border pt-24">
        <div>
          <h4 className="text-16 font-medium text-text-primary mb-8">
            Effort & Delivery
          </h4>
          <p className="text-14 text-text-secondary">{feedback.effortDelivery}</p>
        </div>

        <div>
          <h4 className="text-16 font-medium text-text-primary mb-8">
            Content Signals
          </h4>
          <p className="text-14 text-text-secondary">{feedback.contentSignals}</p>
        </div>

        <div>
          <h4 className="text-16 font-medium text-text-primary mb-8">
            Improvement Hint
          </h4>
          <p className="text-14 text-text-secondary">{feedback.improvementHint}</p>
        </div>
      </div>
    </div>
  );
}
