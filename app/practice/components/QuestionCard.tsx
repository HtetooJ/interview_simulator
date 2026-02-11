export function QuestionCard({
  question,
  questionNumber,
}: {
  question: string;
  questionNumber?: number;
}) {
  return (
    <div className="bg-surface rounded-medium p-32 shadow-subtle">
      {questionNumber != null && (
        <p className="text-14 text-text-secondary mb-8">
          Question {questionNumber}
        </p>
      )}
      <h2 className="text-16 font-normal text-text-primary">{question}</h2>
    </div>
  );
}
