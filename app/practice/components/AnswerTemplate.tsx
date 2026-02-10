"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AnswerTemplateProps {
  template: string;
  onFilled: (filled: string) => void;
}

export function AnswerTemplate({ template, onFilled }: AnswerTemplateProps) {
  const [blanks, setBlanks] = useState<string[]>([]);
  const [values, setValues] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    // Split template by blanks (___)
    const parts = template.split("___");
    setBlanks(parts);
    // Initialize values object
    const initialValues: { [key: number]: string } = {};
    for (let i = 0; i < parts.length - 1; i++) {
      initialValues[i] = "";
    }
    setValues(initialValues);
  }, [template]);

  const handleChange = (index: number, value: string) => {
    setValues((prev) => ({ ...prev, [index]: value }));
  };

  const buildFilledTemplate = () => {
    let result = "";
    for (let i = 0; i < blanks.length; i++) {
      result += blanks[i];
      if (i < blanks.length - 1) {
        result += values[i] || "";
      }
    }
    return result;
  };

  const handleSubmit = () => {
    const filled = buildFilledTemplate();
    if (filled.trim()) {
      onFilled(filled);
    }
  };

  const allFilled = Object.values(values).every((v) => v.trim() !== "");

  return (
    <div className="bg-surface rounded-medium p-24 shadow-subtle space-y-16">
      <h3 className="text-16 font-medium text-text-primary">
        Fill in your answer:
      </h3>
      <div className="space-y-12">
        {blanks.map((part, index) => (
          <div key={index} className="flex flex-wrap items-center gap-8 break-words">
            <span className="text-16 text-text-primary">{part}</span>
            {index < blanks.length - 1 && (
              <input
                type="text"
                value={values[index] || ""}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder="..."
                className="rounded-small px-12 py-8 text-16 text-text-primary bg-[#4F7D6B]/10 border border-[#4F7D6B]/20 focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[120px] flex-1 max-w-full"
              />
            )}
          </div>
        ))}
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!allFilled}
        className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium disabled:opacity-50"
      >
        Continue to Recording
      </Button>
    </div>
  );
}
