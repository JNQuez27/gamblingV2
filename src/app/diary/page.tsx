"use client";

import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/app-context';
import BottomNav from '@/components/ui/navigation/BottomNav';
import Header from './components/layout/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { styles } from './styles';
import { TOTAL_LEVELS, MOOD_MAP } from './constants';
import { getPos, dateForLevel } from './utils';
import Connector from './components/map/Connector';
import LevelNode from './components/map/LevelNode';
import EntryPanel from './components/map/EntryPanel';
import NotesList from './components/notes/NotesList';

// ─── DiaryScreen ──────────────────────────────────────────────────────────────

export default function DiaryScreen() {
  const { streak, streakMarked, diaryEntries } = useAppContext();
  const currentLevel = streak;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  const [openLevel, setOpenLevel] = useState<number | null>(null);
  const [view, setView] = useState<'map' | 'notes'>('map');

  function computedStreak(): number {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (diaryEntries[dateStr]) {
        count++;
      } else {
        if (i === 0 && streakMarked) {
          count++;
        }
        break;
      }
    }
    return count;
  }

  const streakCount = computedStreak();

  // scroll to current node on mount
  useEffect(() => {
    if (view !== 'map') return;
    const frame = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      const node = currentNodeRef.current;
      if (!container || !node) return;
      const containerTop = container.getBoundingClientRect().top;
      const nodeTop = node.getBoundingClientRect().top;
      container.scrollTop =
        container.scrollTop + (nodeTop - containerTop) - container.clientHeight / 2 + node.offsetHeight / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => TOTAL_LEVELS - i);

  function handleNodeSelect(level: number, isUnlocked: boolean) {
    if (!isUnlocked) return;
    setOpenLevel((prev) => (prev === level ? null : level));
  }

  return (
    <div style={{ ...styles.appShell, height: '100dvh', overflow: 'hidden' }}>
      <Header onNewEntry={() => {}} view={view} onViewChange={setView} />
      {typeof streakCount === 'number' && (
        <div style={styles.floatingStreak}>
          <span>🔥</span>
          <span>{streakCount}</span>
        </div>
      )}

      {/* ── Map View ── */}
      <AnimatePresence mode="wait">
        {view === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex-1 overflow-hidden"
            style={{
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #eef6ff 0%, #eaf4fb 45%, #dff0f4 100%)',
            }}
          >
            {/* fade top */}
            <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
              style={{ height: 48, background: 'linear-gradient(to bottom, #e6f1fb, transparent)' }} />
            {/* fade bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
              style={{ height: 80, background: 'linear-gradient(to top, #d9edf2, transparent)' }} />

            <div
              ref={scrollContainerRef}
              className="h-full overflow-y-auto pb-24 pt-2 text-white"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', height: '100%', overflowY: 'auto' }}
            >
              <div className="flex flex-col w-full max-w-xs mx-auto px-4">
                {levels.map((level) => {
                  const pos = getPos(level);
                  const nextLevel = level - 1;
                  const nextPos = nextLevel >= 1 ? getPos(nextLevel) : pos;
                  const isCompleted = level < currentLevel;
                  const isCurrent = level === currentLevel;
                  const isUnlocked = level <= currentLevel;
                  const isMilestone = level % 5 === 0;

                  const dateStr = dateForLevel(level, currentLevel);
                  const entry = diaryEntries?.[dateStr] ?? null;
                  const moodEmoji = entry ? (MOOD_MAP[entry.mood]?.emoji ?? null) : null;

                  return (
                    <div key={level} className="flex flex-col">
                      <LevelNode
                        level={level}
                        isCurrent={isCurrent}
                        isCompleted={isCompleted}
                        isUnlocked={isUnlocked}
                        isMilestone={isMilestone}
                        position={pos}
                        moodEmoji={moodEmoji}
                        hasEntry={!!entry}
                        onSelect={() => handleNodeSelect(level, isUnlocked)}
                        nodeRef={isCurrent ? currentNodeRef : undefined}
                      />
                      {nextLevel >= 1 && (
                        <Connector fromPos={pos} toPos={nextPos} unlocked={isCompleted} />
                      )}
                    </div>
                  );
                })}

                <div className="flex flex-col items-center gap-1 mt-3 mb-8 opacity-30">
                  <div className="w-px h-5 bg-gray-700" />
                  <span className="text-[10px] text-gray-600 uppercase tracking-widest">Start</span>
                </div>
              </div>
            </div>

            {/* Entry detail panel */}
            <AnimatePresence>
              {openLevel !== null && (
                <>
                  <motion.div
                    key="scrim"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 bg-black/50"
                    onClick={() => setOpenLevel(null)}
                  />
                  <EntryPanel
                    key="panel"
                    level={openLevel}
                    dateStr={dateForLevel(openLevel, currentLevel)}
                    entry={diaryEntries?.[dateForLevel(openLevel, currentLevel)] ?? null}
                    onClose={() => setOpenLevel(null)}
                  />
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Notes View ── */}
        {view === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, overflowY: 'auto', paddingBottom: 100, background: 'var(--color-bg)' }}
          >
            <NotesList diaryEntries={diaryEntries} streakCount={streakCount} />
          </motion.div>
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  );
}
