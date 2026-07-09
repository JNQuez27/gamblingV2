import { useAppContext } from '../providers/app-provider';

// Gambling-usage slice: the top-3 ranked apps and the "log an open" action.
export function useUsage() {
  const { topGamblingApps, logGamblingOpen } = useAppContext();
  return { topGamblingApps, logGamblingOpen };
}
