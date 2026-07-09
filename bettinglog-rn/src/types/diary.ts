export interface Mood {
  emoji: string;
  label: string;
  color: string;
}

export interface DiaryEntry {
  id: string;
  mood: string;        // mood key or emoji
  note: string;
  date: string;        // "YYYY-MM-DD"
  createdAt: string;   // ISO timestamp
}

// Entries grouped by their date string, newest date first.
export type DiaryEntriesByDate = Record<string, DiaryEntry[]>;
