"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  labels: string[];
}

export function ProgressBar({ current, total, labels }: ProgressBarProps) {
  const percent = (current / total) * 100;

  return (
    <div className="space-y-8">
      <div className="flex justify-between text-14 text-text-secondary">
        <span>Step {current} of {total}: {labels[current - 1]}</span>
      </div>
      <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4F7D6B] transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
