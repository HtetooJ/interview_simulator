export function trackPageView() {
  if (typeof window !== "undefined") {
    const views = localStorage.getItem("pageViews");
    const newViews = views ? parseInt(views) + 1 : 1;
    localStorage.setItem("pageViews", newViews.toString());
  }
}

export function trackAttempt() {
  if (typeof window !== "undefined") {
    const attempts = localStorage.getItem("practiceAttempts");
    const newAttempts = attempts ? parseInt(attempts) + 1 : 1;
    localStorage.setItem("practiceAttempts", newAttempts.toString());
  }
}

export function getAnalytics() {
  if (typeof window !== "undefined") {
    return {
      pageViews: parseInt(localStorage.getItem("pageViews") || "0"),
      attempts: parseInt(localStorage.getItem("practiceAttempts") || "0"),
    };
  }
  return { pageViews: 0, attempts: 0 };
}
