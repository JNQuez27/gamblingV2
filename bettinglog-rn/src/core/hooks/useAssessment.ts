import { useAppContext } from '../providers/app-provider';

// Assessment slice: past results and the most recent one.
export function useAssessment() {
  const { assessmentResults, latestAssessment } = useAppContext();
  return { assessmentResults, latestAssessment };
}
