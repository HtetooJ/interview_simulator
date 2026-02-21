export const STAR_GUIDES = {
  situation: {
    title: "Set the scene",
    bullets: [
      "Where were you? When did this happen?",
      "What was the initial challenge or context?",
      "Keep it brief (2-3 sentences), focus on setting not actions",
    ],
  },
  task: {
    title: "Your specific responsibility",
    bullets: [
      "What was YOUR goal? What did you need to accomplish?",
      "Why was it important?",
      "Use 'I' statements, be clear about your personal responsibility",
    ],
  },
  action: {
    title: "What YOU did (the most important part!)",
    bullets: [
      "What specific steps did you take? Why those actions?",
      "Use 'I' not 'we' - this showcases your abilities",
      "List your actions in order with details",
    ],
  },
  result: {
    title: "The positive outcome",
    bullets: [
      "What happened because of your actions?",
      "Include numbers, feedback, or measurements",
      "Mention emotional responses and recognition received",
    ],
  },
} as const;

export type STARStep = keyof typeof STAR_GUIDES;

export const STAR_STEPS: STARStep[] = ["situation", "task", "action", "result"];
