/**
 * Maps content signals to user-friendly descriptions
 */
function getSignalDescription(signal: string): string {
  const descriptions: Record<string, string> = {
    name: "your name",
    experience: "years of experience",
    skills: "your skills",
    motivation: "why you want this job",
    personality: "your personality",
    enjoyment: "what you enjoy",
    strengths: "your strengths",
    reliability: "your reliability",
    teamwork: "working in a team",
    calm: "staying calm",
    listening: "listening skills",
    "problem-solving": "problem-solving",
    professional: "being professional",
    learning: "learning opportunities",
    opportunities: "opportunities",
    family: "your family",
  };

  return descriptions[signal.toLowerCase()] || `your ${signal}`;
}

/**
 * Finds text portions in the example answer that correspond to content signals
 */
export function findCustomizableParts(
  exampleAnswer: string,
  keyContentSignals: string[]
): Array<{
  text: string;
  startIndex: number;
  endIndex: number;
  description: string;
  signal: string;
}> {
  const parts: Array<{
    text: string;
    startIndex: number;
    endIndex: number;
    description: string;
    signal: string;
  }> = [];

  const lowerAnswer = exampleAnswer.toLowerCase();

  // Keywords/phrases that indicate where customizable content might be
  const signalKeywords: Record<string, string[]> = {
    name: ["my name is", "i'm", "i am", "call me"],
    experience: ["years of experience", "years", "experience", "worked"],
    skills: ["good at", "skilled", "ability", "can", "skills"],
    motivation: ["want to", "because", "like to", "interested"],
    personality: ["personality", "i'm", "i am"],
    enjoyment: ["enjoy", "like", "love"],
    strengths: ["strengths", "strong"],
    reliability: ["reliable", "on time", "always"],
    teamwork: ["team", "together", "help"],
    calm: ["calm", "stay calm"],
    listening: ["listen", "listening"],
    "problem-solving": ["solution", "solve", "find"],
    professional: ["professional", "polite"],
    learning: ["learn", "learning", "improve"],
    opportunities: ["opportunities", "chance"],
    family: ["family", "help my"],
  };

  // For each signal, find matching text portions
  keyContentSignals.forEach((signal) => {
    const keywords = signalKeywords[signal.toLowerCase()] || [signal.toLowerCase()];
    const description = getSignalDescription(signal);

    // Find all occurrences of keywords
    keywords.forEach((keyword) => {
      let searchIndex = 0;
      while (true) {
        const index = lowerAnswer.indexOf(keyword.toLowerCase(), searchIndex);
        if (index === -1) break;

        let start = index;
        let end = index + keyword.length;

        // Special handling for different signal types
        if (signal.toLowerCase() === "name") {
          // For name: "My name is Aung Min" -> highlight "Aung Min"
          // Look for the name after "is" or "am"
          const afterKeyword = exampleAnswer.substring(end).trim();
          const nameMatch = afterKeyword.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
          if (nameMatch) {
            start = end + afterKeyword.indexOf(nameMatch[1]);
            end = start + nameMatch[1].length;
          } else {
            // Fallback: highlight a short phrase after keyword
            end = Math.min(exampleAnswer.length, end + 15);
          }
        } else if (signal.toLowerCase() === "experience") {
          // For experience: "3 years of experience" -> highlight "3 years"
          const afterKeyword = exampleAnswer.substring(Math.max(0, start - 10), end + 20);
          const expMatch = afterKeyword.match(/(\d+\s+years?)/i);
          if (expMatch) {
            const matchStart = Math.max(0, start - 10) + afterKeyword.indexOf(expMatch[1]);
            start = matchStart;
            end = matchStart + expMatch[1].length;
          } else {
            // Fallback: highlight short phrase around keyword
            start = Math.max(0, start - 5);
            end = Math.min(exampleAnswer.length, end + 10);
          }
        } else if (signal.toLowerCase() === "skills") {
          // For skills: "good at customer service" -> highlight "customer service"
          const afterKeyword = exampleAnswer.substring(end).trim();
          // Look for phrase after "at" or "in"
          const skillMatch = afterKeyword.match(/^(?:at|in)\s+([^.,]+?)(?:\.|,|$)/i);
          if (skillMatch) {
            start = end + afterKeyword.indexOf(skillMatch[1]);
            end = start + skillMatch[1].trim().length;
          } else {
            // Fallback: highlight short phrase after keyword
            end = Math.min(exampleAnswer.length, end + 20);
          }
        } else {
          // For other signals, capture a reasonable phrase (up to 20 chars or until comma/period)
          const maxLength = 25;
          let charCount = 0;
          while (end < exampleAnswer.length && charCount < maxLength) {
            const char = exampleAnswer[end];
            if (char === "." || char === "!" || char === "?") {
              break;
            }
            if (char === "," && charCount > 5) {
              break;
            }
            end++;
            if (char !== " ") charCount++;
          }
        }

        // Extract the text
        const text = exampleAnswer.substring(start, end).trim();

        // Avoid duplicates and very short matches
        if (
          text.length > 2 &&
          !parts.some(
            (p) =>
              p.startIndex === start &&
              p.endIndex === end &&
              p.signal === signal
          )
        ) {
          parts.push({
            text,
            startIndex: start,
            endIndex: end,
            description,
            signal,
          });
        }

        searchIndex = index + 1;
      }
    });
  });

  // Sort by start index
  parts.sort((a, b) => a.startIndex - b.startIndex);

  // Merge overlapping parts
  const merged: typeof parts = [];
  parts.forEach((part) => {
    const last = merged[merged.length - 1];
    if (last && part.startIndex < last.endIndex) {
      // Overlapping - merge them
      last.endIndex = Math.max(last.endIndex, part.endIndex);
      last.text = exampleAnswer.substring(last.startIndex, last.endIndex).trim();
      // Combine descriptions
      if (!last.description.includes(part.description)) {
        last.description = `${last.description}, ${part.description}`;
      }
    } else {
      merged.push({ ...part });
    }
  });

  return merged;
}

/**
 * Parses example answer into segments (normal text and highlighted customizable parts)
 */
export function parseAnswerWithHighlights(
  exampleAnswer: string,
  keyContentSignals: string[]
): Array<{
  text: string;
  isHighlighted: boolean;
  description?: string;
  signal?: string;
}> {
  const customizableParts = findCustomizableParts(exampleAnswer, keyContentSignals);
  const segments: Array<{
    text: string;
    isHighlighted: boolean;
    description?: string;
    signal?: string;
  }> = [];

  let currentIndex = 0;

  customizableParts.forEach((part) => {
    // Add normal text before this part
    if (part.startIndex > currentIndex) {
      segments.push({
        text: exampleAnswer.substring(currentIndex, part.startIndex),
        isHighlighted: false,
      });
    }

    // Add highlighted part
    segments.push({
      text: part.text,
      isHighlighted: true,
      description: part.description,
      signal: part.signal,
    });

    currentIndex = part.endIndex;
  });

  // Add remaining text
  if (currentIndex < exampleAnswer.length) {
    segments.push({
      text: exampleAnswer.substring(currentIndex),
      isHighlighted: false,
    });
  }

  // If no highlights found, return the whole text as normal
  if (segments.length === 0) {
    segments.push({
      text: exampleAnswer,
      isHighlighted: false,
    });
  }

  return segments;
}
