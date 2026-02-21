# Speech Analysis & Feedback Improvements

> **Status:** Backlog — to implement after UI tweaks  
> **Last updated:** Feb 2025  
> **Related files:** `lib/feedback-generator.ts`, `data/questions.ts`

---

## Overview

This document outlines planned improvements to the speech analysis and feedback system. Each interview question is different and can benefit from more tailored content signals, feedback messages, and scoring.

---

## 1. Question-Specific Feedback Messages

**Current:** Same feedback pattern for all questions (e.g., "I heard you mention X", "Try adding more about [missing signal]").

**Proposed:** Add question-specific feedback logic so each question type gets more relevant guidance.

| Question Type | Example Tailored Feedback |
|---------------|---------------------------|
| Empathy (Q2) | Emphasize "listen" and "understand" — e.g., "For empathy questions, showing you listened is key." |
| Ethics/Safety (Q3) | Emphasize "safety" and "protocol" — e.g., "Safety questions benefit from mentioning specific protocols." |
| Adaptability (Q1) | Emphasize "prioritize" and "adjust" — e.g., "Strong adaptability answers show how you reprioritized." |

**Implementation idea:** Add optional `feedbackGuidance` or `improvementTemplates` per question in `data/questions.ts`, and use them in `generateFeedback()`.

---

## 2. Synonyms & Verb Variants

**Current:** Only checks base word, +s, +ed (e.g., "adjust", "adjusts", "adjusted").

**Proposed:** Support more forms and synonyms so answers like "I was adjusting my approach" or "I prioritized" are recognized.

| Signal | Add Variants |
|--------|--------------|
| adjust | adjusting, adapted, adaptation |
| prioritize | prioritizing, prioritized, priorities |
| empathy | empathetic, empathize |
| listen | listened, listening |
| de-escalate | calm, defuse, de-escalated |
| apologize | apologized, apology |
| initiative | took initiative, proactive |

**Implementation idea:** Extend `keyContentSignals` to support synonyms:

```typescript
// Option A: Array of alternatives per signal
keyContentSignals: [
  { word: "adjust", variants: ["adjusting", "adjusted", "adapt", "adapted"] },
  { word: "prioritize", variants: ["prioritized", "priorities", "prioritizing"] },
  // ...
]

// Option B: Flat list with expanded matching in feedback-generator
```

---

## 3. Question-Specific Criteria & Weights

**Current:** All signals weighted equally; same scoring formula for every question.

**Proposed:** Allow some signals to be more important for certain questions.

| Question | Higher-Weight Signals | Rationale |
|----------|------------------------|------------|
| Empathy (Q2) | listen, understand | Core to empathy |
| Ethics (Q3) | safety, protocol | Core to compliance |
| Adaptability (Q1) | prioritize, adjust | Core to adaptability |

**Implementation idea:** Add optional `weight` per signal, or mark some as `required` vs `optional`.

---

## 4. STAR Structure Detection (Optional)

**Current:** No check for STAR format (Situation, Task, Action, Result).

**Proposed:** Optionally detect STAR elements and give feedback like "Your answer could better follow the STAR format (Situation, Task, Action, Result)."

**Implementation idea:** Add phrase patterns for situation/task/action/result and score completeness of structure.

---

## 5. Revisit Generic Common Elements

**Current:** Same `commonElements` (name, experience, skills, motivation) for all questions.

**Issue:** Behavioral STAR questions ("tell me about a time when…") may not need "my name" or "why you want this job."

**Proposed:** Either remove for behavioral questions, or make them question-type specific (e.g., only for intro/“tell me about yourself” questions).

---

## Implementation Checklist

- [ ] Add synonyms/variants to `keyContentSignals` (or new structure)
- [ ] Update `generateFeedback()` to use variants in matching
- [ ] Add question-specific feedback guidance to `data/questions.ts`
- [ ] Update improvement hints to use question-specific templates
- [ ] (Optional) Add signal weights or required/optional flags
- [ ] (Optional) Add STAR structure detection
- [ ] Revisit or remove generic `commonElements` for behavioral questions

---

## File References

| File | Purpose |
|------|---------|
| `lib/feedback-generator.ts` | Main feedback logic; will need updates for synonyms, weights, question-specific messages |
| `data/questions.ts` | Question data; will need extended `keyContentSignals` and optional guidance fields |
| `app/practice/components/RecordingControls.tsx` | Calls `generateFeedback()` with question and transcription |
