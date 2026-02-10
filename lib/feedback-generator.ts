export function generateFeedback(
  transcription: string,
  keyContentSignals: string[],
  durationSeconds: number
): {
  effortDelivery: string;
  contentSignals: string;
  improvementHint: string;
  score: number;
  feedbackMessage: string;
} {
  const lowerTranscription = transcription.toLowerCase();
  const duration = durationSeconds;

  // Effort & Delivery feedback
  let effortDelivery = "";
  if (duration === 0 || transcription.trim() === "") {
    effortDelivery = "I didn't catch your answer. Please try recording again.";
  } else if (duration < 10) {
    effortDelivery = `You spoke for about ${duration} seconds. Try to speak a bit longer to give a complete answer.`;
  } else if (duration < 20) {
    effortDelivery = `You spoke for about ${duration} seconds. Good length for your answer.`;
  } else {
    effortDelivery = `You spoke clearly for about ${duration} seconds. Well done on the length of your answer.`;
  }

  // Content Signals feedback
  let contentSignals = "";
  const foundSignals: string[] = [];
  
  // Check for key content signals
  keyContentSignals.forEach((signal) => {
    const signalLower = signal.toLowerCase();
    // Check for the signal word or related words
    if (
      lowerTranscription.includes(signalLower) ||
      lowerTranscription.includes(signalLower + "s") ||
      lowerTranscription.includes(signalLower + "ed")
    ) {
      foundSignals.push(signal);
    }
  });

  // Also check for common interview answer elements
  const commonElements = {
    name: ["my name", "i'm", "i am", "call me"],
    experience: ["experience", "worked", "years", "worked as"],
    skills: ["good at", "skilled", "ability", "can"],
    motivation: ["want", "like", "enjoy", "interested", "because"],
  };

  Object.entries(commonElements).forEach(([element, keywords]) => {
    if (keywords.some((keyword) => lowerTranscription.includes(keyword))) {
      if (!foundSignals.includes(element)) {
        foundSignals.push(element);
      }
    }
  });

  if (foundSignals.length === 0) {
    contentSignals =
      "I'm listening to your answer. Try to include your name, experience, or why you want this job.";
  } else if (foundSignals.length === 1) {
    contentSignals = `I heard you mention ${foundSignals[0]}. Good start! Try adding more details about your experience or motivation.`;
  } else if (foundSignals.length === 2) {
    contentSignals = `I heard you mention ${foundSignals.join(" and ")}. That's good!`;
  } else {
    contentSignals = `I heard you mention ${foundSignals.slice(0, -1).join(", ")}, and ${foundSignals[foundSignals.length - 1]}. Great job covering the important points!`;
  }

  // Improvement Hint
  let improvementHint = "";
  const missingSignals = keyContentSignals.filter(
    (signal) => !foundSignals.includes(signal.toLowerCase())
  );

  if (missingSignals.length > 0 && foundSignals.length < 2) {
    improvementHint = `Try adding more about ${missingSignals[0]} to make your answer stronger.`;
  } else if (duration < 15) {
    improvementHint = "You can add more details or examples to make your answer longer and more complete.";
  } else if (foundSignals.length >= keyContentSignals.length - 1) {
    improvementHint = "Your answer covers the important points well. Keep practicing to feel more confident!";
  } else {
    improvementHint = "Your answer is good. Try to speak a bit slower and clearer next time.";
  }

  // Calculate score (0-100)
  let score = 0;
  
  // Base score for having any content
  if (transcription.trim() !== "" && duration > 0) {
    score = 30; // Base score
    
    // Duration score (max 30 points)
    if (duration >= 20) {
      score += 30;
    } else if (duration >= 15) {
      score += 25;
    } else if (duration >= 10) {
      score += 20;
    } else if (duration >= 5) {
      score += 10;
    }
    
    // Content signals score (max 40 points)
    const signalScore = (foundSignals.length / Math.max(keyContentSignals.length, 1)) * 40;
    score += signalScore;
  }
  
  score = Math.min(100, Math.round(score));

  // Generate feedback message based on score
  let feedbackMessage = "";
  if (score === 0 || transcription.trim() === "" || duration === 0) {
    feedbackMessage = "Sounds not detected";
  } else if (score >= 80) {
    feedbackMessage = "Good Answer";
  } else if (score >= 60) {
    feedbackMessage = "Clarity will make you win";
  } else if (score >= 40) {
    feedbackMessage = "Keep practicing";
  } else {
    feedbackMessage = "Try again";
  }

  return {
    effortDelivery,
    contentSignals,
    improvementHint,
    score,
    feedbackMessage,
  };
}
