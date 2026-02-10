"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { questions } from "@/data/questions";
import { trackPageView } from "@/lib/analytics";

export default function SelectPage() {
  useEffect(() => {
    trackPageView();
  }, []);
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    questions.map((q) => q.id)
  );

  const toggleQuestion = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleStartPractice = () => {
    if (selectedIds.length > 0) {
      const queryString = selectedIds.join(",");
      router.push(`/practice/record?questions=${queryString}&index=0`);
    }
  };

  const handleLearnExample = () => {
    if (selectedIds.length > 0) {
      const queryString = selectedIds.join(",");
      router.push(`/practice/example?questions=${queryString}&index=0`);
    }
  };

  return (
    <main className="min-h-screen bg-background p-16 md:p-24">
      <div className="max-w-3xl mx-auto space-y-24 md:space-y-32">
        <div className="space-y-8 text-center">
          <h1 className="text-32 font-semibold text-text-primary">
            Choose Questions to Practice
          </h1>
          <p className="text-16 text-text-secondary">
            All questions are selected by default. Uncheck any you don't want to practice.
          </p>
        </div>

        <div className="space-y-16">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-surface border-[0.5px] border-border rounded-medium p-24 shadow-subtle"
            >
              <div className="flex items-start gap-16">
                <Checkbox
                  id={question.id}
                  checked={selectedIds.includes(question.id)}
                  onCheckedChange={() => toggleQuestion(question.id)}
                  className="mt-4"
                />
                <label
                  htmlFor={question.id}
                  className="flex-1 cursor-pointer space-y-4"
                >
                  <p className="text-14 text-text-secondary">
                    Question {index + 1}
                  </p>
                  <p className="text-16 font-normal text-text-primary">
                    {question.category}
                  </p>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-16 justify-center">
          <Button
            onClick={handleLearnExample}
            disabled={selectedIds.length === 0}
            className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium disabled:opacity-50"
          >
            Learn Example
          </Button>
          <Button
            onClick={handleStartPractice}
            disabled={selectedIds.length === 0}
            variant="secondary"
            className="h-48 px-32 text-16 rounded-medium font-medium disabled:opacity-50"
            style={{ borderWidth: '1px', borderColor: 'var(--primary)', borderImage: 'none' }}
          >
            Start Practice
          </Button>
        </div>
      </div>
    </main>
  );
}
