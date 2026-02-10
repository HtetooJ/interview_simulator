"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackPageView } from "@/lib/analytics";

export default function Home() {
  useEffect(() => {
    trackPageView();
  }, []);
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-16 md:p-24">
      <div className="max-w-2xl w-full space-y-24 md:space-y-32">
        <div className="space-y-16 text-center">
          <div className="space-y-8">
            <h1 className="text-40 font-semibold text-text-primary">
              Customer Service Interview Simulation
            </h1>
            <p className="text-20 text-text-secondary max-w-xl mx-auto">
              Practice speaking for your waiter interview in Dubai. Get helpful feedback on your answers and build confidence.
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Link href="/select">
            <Button 
              size="lg" 
              className="bg-[#4F7D6B] text-white hover:bg-[#4F7D6B]/90 h-48 px-32 text-16 rounded-medium font-medium"
            >
              Start Learning
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
