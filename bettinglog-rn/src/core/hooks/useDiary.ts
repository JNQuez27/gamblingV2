import { useAppContext } from '../providers/app-provider';

// Diary slice of the app state.
export function useDiary() {
  const { diaryEntries, addDiaryEntry } = useAppContext();
  return { diaryEntries, addDiaryEntry };
}
