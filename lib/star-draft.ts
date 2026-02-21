export interface STARDraft {
  questionId: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  lastModified: number;
}

const STORAGE_KEY_PREFIX = "star_draft_q";

export function saveDraft(draft: STARDraft): void {
  sessionStorage.setItem(
    `${STORAGE_KEY_PREFIX}${draft.questionId}`,
    JSON.stringify({ ...draft, lastModified: Date.now() })
  );
}

export function getDraft(questionId: string): STARDraft | null {
  const data = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${questionId}`);
  return data ? JSON.parse(data) : null;
}

export function clearDraft(questionId: string): void {
  sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${questionId}`);
}

export function hasDraft(questionId: string): boolean {
  return getDraft(questionId) !== null;
}
