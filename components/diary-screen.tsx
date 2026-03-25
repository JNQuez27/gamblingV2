'use client';
import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/app-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Gem, Trophy, Lock, Star, X, ChevronDown } from 'lucide-react';

const TOTAL_LEVELS = 30;

const MOOD_MAP: Record<string, { emoji: string; label: string; color: string }> = {
  calm: { emoji: '😌', label: 'Calm', color: 'text-blue-400' },
  anxious: { emoji: '😟', label: 'Anxious', color: 'text-yellow-400' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'text-gray-400' },
  'in-control': { emoji: '🎉', label: 'In Control', color: 'text-green-400' },
};

function getPos(level: number): 'left' | 'center' | 'right' {
  const mod = (level - 1) % 4;
  if (mod === 0) return 'left';
  if (mod === 1) return 'center';
  if (mod === 2) return 'right';
  return 'center';
}

/** Maps a level number to a calendar date string.
 *  Level `currentLevel` = today, level `currentLevel - N` = N days ago. */
function dateForLevel(level: number, currentLevel: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (currentLevel - level));
  return d.toISOString().split('T')[0];
}

// ─── Connector ────────────────────────────────────────────────────────────────
const Connector = ({
  fromPos,
  toPos,
  unlocked,
}: {
  fromPos: 'left' | 'center' | 'right';
  toPos: 'left' | 'center' | 'right';
  unlocked: boolean;
}) => {
  const xOf = (p: 'left' | 'center' | 'right') => (p === 'left' ? 22 : p === 'right' ? 78 : 50);

  return (
    <div className="w-full" style={{ height: 48 }}>
      <svg width="100%" height="48" viewBox="0 0 100 48" preserveAspectRatio="none">
        <path
          d={`M ${xOf(fromPos)} 0 C ${xOf(fromPos)} 24, ${xOf(toPos)} 24, ${xOf(toPos)} 48`}
          stroke={unlocked ? '#F59E0B' : '#374151'}
          strokeWidth={unlocked ? '2.5' : '1.5'}
          strokeDasharray={unlocked ? 'none' : '4 5'}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// ─── Level node ───────────────────────────────────────────────────────────────
const LevelNode = ({
  level,
  isCurrent,
  isCompleted,
  isUnlocked,
  isMilestone,
  position,
  moodEmoji,
  hasEntry,
  onSelect,
  nodeRef,
}: {
  level: number;
  isCurrent: boolean;
  isCompleted: boolean;
  isUnlocked: boolean;
  isMilestone: boolean;
  position: 'left' | 'center' | 'right';
  moodEmoji: string | null; // emoji from diary entry, if any
  hasEntry: boolean;
  onSelect: () => void;
  nodeRef?: React.Ref<HTMLDivElement>;
}) => {
  const alignClass =
    position === 'left'
      ? 'self-start pl-8'
      : position === 'right'
        ? 'self-end pr-8'
        : 'self-center';

  const nodeBase =
    'relative flex items-center justify-center rounded-2xl border transition-all duration-200 select-none';

  const nodeStyle = isCurrent
    ? 'w-16 h-16 bg-white dark:bg-gray-900 border-2 border-sky-400 text-sky-500 ring-4 ring-sky-400/20 cursor-default'
    : isCompleted
      ? 'w-14 h-14 bg-amber-400/20 border border-amber-400 text-amber-500 cursor-pointer hover:scale-105 active:scale-95'
      : isUnlocked
        ? 'w-14 h-14 bg-gray-800 border border-gray-700 text-white cursor-pointer hover:scale-105 active:scale-95'
        : 'w-14 h-14 bg-gray-900 border border-gray-800 text-gray-600 cursor-not-allowed opacity-50';

  const milestoneExtra = isMilestone && !isCurrent ? 'border-dashed' : '';

  // What to render inside the node
  const nodeInner = () => {
    if (!isUnlocked) {
      return isMilestone ? <Star className="w-5 h-5" /> : <Lock className="w-4 h-4" />;
    }
    if (isCurrent) {
      // current node: show emoji if today already has an entry, else level number
      return moodEmoji ? (
        <span className="text-2xl leading-none">{moodEmoji}</span>
      ) : (
        <span className="text-base font-semibold">{level}</span>
      );
    }
    // completed: emoji takes priority over check / milestone star
    if (moodEmoji) {
      return <span className="text-2xl leading-none">{moodEmoji}</span>;
    }
    if (isMilestone) return <Star className="w-5 h-5 text-amber-400" />;
    return <span className="text-base font-semibold">{level}</span>;
  };

  return (
    <motion.div
      ref={nodeRef}
      className={`flex flex-col items-center gap-1.5 ${alignClass}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (TOTAL_LEVELS - level) * 0.03, duration: 0.3, ease: 'easeOut' }}
    >
      {/* "You are here" badge */}
      {isCurrent && (
        <span className="text-[10px] font-semibold tracking-widest uppercase bg-sky-500 text-white px-2.5 py-0.5 rounded-full">
          You are here
        </span>
      )}

      <button
        onClick={onSelect}
        disabled={!isUnlocked}
        className={`${nodeBase} ${nodeStyle} ${milestoneExtra}`}
      >
        {isCurrent && (
          <span className="absolute inset-0 rounded-2xl ring-2 ring-sky-400 animate-ping opacity-30" />
        )}

        {/* diary-entry dot indicator (only when emoji isn't shown) */}
        {hasEntry && !moodEmoji && isCompleted && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-400 rounded-full border-2 border-gray-950" />
        )}

        {nodeInner()}
      </button>

      {/* Label below */}
      {!isCurrent && (
        <span
          className={`text-[10px] font-medium tracking-widest uppercase ${
            isCompleted ? 'text-amber-500' : isUnlocked ? 'text-gray-400' : 'text-gray-700'
          }`}
        >
          {isCompleted
            ? moodEmoji
              ? (MOOD_MAP[Object.keys(MOOD_MAP).find((k) => MOOD_MAP[k].emoji === moodEmoji) ?? '']
                  ?.label ?? 'done')
              : 'done'
            : isMilestone
              ? 'milestone'
              : `lv ${level}`}
        </span>
      )}
    </motion.div>
  );
};

// ─── Entry detail panel ───────────────────────────────────────────────────────
const EntryPanel = ({
  level,
  dateStr,
  entry,
  onClose,
}: {
  level: number;
  dateStr: string;
  entry: { mood: string; note: string; timestamp: string } | null;
  onClose: () => void;
}) => {
  const mood = entry ? MOOD_MAP[entry.mood] : null;
  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute bottom-0 left-0 right-0 z-20 bg-gray-900 border-t border-gray-800 rounded-t-2xl px-5 pt-5 pb-8 shadow-2xl"
    >
      {/* drag handle */}
      <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

      {/* header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-0.5">
            Day {level}
          </p>
          <h3 className="text-base font-semibold text-white">{dateLabel}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {entry && mood ? (
        <>
          {/* mood chip */}
          <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3 mb-4">
            <span className="text-3xl">{mood.emoji}</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Mood</p>
              <p className={`text-sm font-semibold ${mood.color}`}>{mood.label}</p>
            </div>
          </div>

          {/* note */}
          {entry.note ? (
            <div className="bg-gray-800/60 border border-gray-700/60 rounded-xl px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Note</p>
              <p className="text-sm text-gray-200 leading-relaxed">"{entry.note}"</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic text-center py-2">No note written.</p>
          )}

          <p className="text-[10px] text-gray-700 text-center mt-4">
            {new Date(entry.timestamp).toLocaleTimeString('en-PH', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 gap-2 text-gray-600">
          <ChevronDown className="w-8 h-8 opacity-30" />
          <p className="text-sm">No diary entry for this day.</p>
        </div>
      )}
    </motion.div>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
export function DiaryScreen() {
  const { user, streak, diaryEntries } = useAppContext();
  const currentLevel = streak;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  // which level's panel is open
  const [openLevel, setOpenLevel] = useState<number | null>(null);

  // instant center-on-current on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      const node = currentNodeRef.current;
      if (!container || !node) return;
      const containerTop = container.getBoundingClientRect().top;
      const nodeTop = node.getBoundingClientRect().top;
      container.scrollTop =
        container.scrollTop +
        (nodeTop - containerTop) -
        container.clientHeight / 2 +
        node.offsetHeight / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => TOTAL_LEVELS - i);

  const handleNodeSelect = (level: number, isUnlocked: boolean) => {
    if (!isUnlocked) return;
    setOpenLevel((prev) => (prev === level ? null : level));
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-gray-950 text-white"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <div className="shrink-0 bg-gray-950 border-b border-gray-800/60 px-5 py-4">
        <h1 className="text-lg font-semibold tracking-tight">Journey</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {currentLevel > 0 ? `${currentLevel}-day streak · keep going` : 'Start your streak today'}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="shrink-0 grid grid-cols-3 gap-2.5 px-5 py-4 bg-gray-950 border-b border-gray-800/40">
        {[
          { icon: <Flame className="w-4 h-4 text-orange-400" />, value: streak, label: 'Streak' },
          {
            icon: <Gem className="w-4 h-4 text-cyan-400" />,
            value: user?.gems ?? 0,
            label: 'Gems',
          },
          {
            icon: <Trophy className="w-4 h-4 text-amber-400" />,
            value: `${Math.min(currentLevel, TOTAL_LEVELS)}/${TOTAL_LEVELS}`,
            label: 'Days',
          },
        ].map(({ icon, value, label }) => (
          <div
            key={label}
            className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-3 flex flex-col items-center gap-1"
          >
            {icon}
            <span className="text-base font-semibold">{value}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Path guide (scrollable area) ── */}
      <div className="relative flex-1 overflow-hidden">
        {/* fade top */}
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{ height: 48, background: 'linear-gradient(to bottom, #030712, transparent)' }}
        />
        {/* fade bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
          style={{ height: 80, background: 'linear-gradient(to top, #030712, transparent)' }}
        />

        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto pb-24 pt-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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

              // look up diary entry for this level's date
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

        {/* ── Entry detail panel (overlays the path guide) ── */}
        <AnimatePresence>
          {openLevel !== null && (
            <>
              {/* scrim */}
              <motion.div
                key="scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
      </div>
    </div>
  );
}
