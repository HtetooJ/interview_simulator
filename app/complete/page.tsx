"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function CompletePage() {
  const router = useRouter();

  useEffect(() => {
    // Track completion
    if (typeof window !== "undefined") {
      const attempts = localStorage.getItem("practiceAttempts");
      const newAttempts = attempts ? parseInt(attempts) + 1 : 1;
      localStorage.setItem("practiceAttempts", newAttempts.toString());
    }
  }, []);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-16 md:p-24">
      <div className="max-w-2xl w-full space-y-24 md:space-y-32 text-center">
        <div className="space-y-16">
          <h1 className="text-32 font-semibold text-text-primary">
            Great Job!
          </h1>
          <p className="text-20 text-text-secondary">
            You&apos;ve completed your practice session. Keep practicing to build more confidence for your interview.
          </p>
        </div>

        <div className="space-y-8">
          <p className="text-16 text-text-secondary">
            Remember: The more you practice, the more confident you&apos;ll feel. You&apos;re doing great!
          </p>
        </div>

        <div className="flex gap-16 justify-center">
          <Button
            onClick={() => router.push("/select")}
            className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
          >
            Practice Again
          </Button>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
          >
            Go Home
          </Button>
        </div>
      </div>
    </main>
  );
}
